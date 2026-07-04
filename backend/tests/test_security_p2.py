import hashlib
import hmac
import json
import time
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch
from urllib.parse import quote

from sqlalchemy.exc import IntegrityError

from backend.app.services import rate_limit, telegram_auth
from backend.app.services.payments import process_webhook
from backend.app.utils.errors import AppError
from backend.app.utils.safe_logging import safe_context
from backend.app.utils.security import create_jwt


def _signed_init_data(bot_token: str, payload: dict) -> str:
    pairs = []
    for key, value in payload.items():
        raw = json.dumps(value, separators=(",", ":")) if isinstance(value, dict) else str(value)
        pairs.append((key, raw))
    data_check_string = "\n".join(f"{key}={value}" for key, value in sorted(pairs))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    signature = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return "&".join(f"{key}={quote(value)}" for key, value in pairs) + f"&hash={signature}"


class TelegramInitDataSecurityTests(unittest.TestCase):
    def test_validate_init_data_rejects_expired_auth_date(self):
        bot_token = "test-bot-token"
        init_data = _signed_init_data(
            bot_token,
            {
                "auth_date": int(time.time()) - telegram_auth.INIT_DATA_MAX_AGE_SECONDS - 1,
                "query_id": "q1",
                "user": {"id": 123, "first_name": "Test"},
            },
        )

        with patch.object(telegram_auth.settings, "bot_token", bot_token):
            with self.assertRaises(AppError) as ctx:
                telegram_auth.validate_init_data(init_data)

        self.assertEqual(ctx.exception.code, "init_data_expired")
        self.assertEqual(ctx.exception.status_code, 401)

    def test_validate_init_data_rejects_tampered_signature(self):
        bot_token = "test-bot-token"
        init_data = _signed_init_data(
            bot_token,
            {
                "auth_date": int(time.time()),
                "query_id": "q1",
                "user": {"id": 123, "first_name": "Test"},
            },
        ).replace("first_name%22%3A%22Test", "first_name%22%3A%22Evil")

        with patch.object(telegram_auth.settings, "bot_token", bot_token):
            with self.assertRaises(AppError) as ctx:
                telegram_auth.validate_init_data(init_data)

        self.assertEqual(ctx.exception.code, "invalid_init_data")
        self.assertEqual(ctx.exception.status_code, 401)


class JwtTokenVersionTests(unittest.IsolatedAsyncioTestCase):
    async def test_get_current_user_rejects_stale_token_version(self):
        with patch("backend.app.utils.security._jwt_key", return_value=b"x" * 40):
            token = create_jwt(10, token_version=1)
            session = SimpleNamespace(get=AsyncMock(return_value=SimpleNamespace(id=10, token_version=2)))

            with self.assertRaises(AppError) as ctx:
                await telegram_auth.get_current_user(session, authorization=f"Bearer {token}")

        self.assertEqual(ctx.exception.code, "token_revoked")
        self.assertEqual(ctx.exception.status_code, 401)


class RateLimitFailClosedTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        rate_limit._local_buckets.clear()

    async def test_fail_closed_uses_local_fallback_when_redis_fails(self):
        broken_client = SimpleNamespace(incr=AsyncMock(side_effect=RuntimeError("redis down")))

        with patch.object(rate_limit, "_get_client", return_value=broken_client):
            await rate_limit.check_rate_limit("auth:test", 1, 60, fail_closed=True)
            with self.assertRaises(AppError) as ctx:
                await rate_limit.check_rate_limit("auth:test", 1, 60, fail_closed=True)

        self.assertEqual(ctx.exception.code, "rate_limited")
        self.assertEqual(ctx.exception.status_code, 429)

    async def test_non_critical_scope_fails_open_when_redis_fails(self):
        broken_client = SimpleNamespace(incr=AsyncMock(side_effect=RuntimeError("redis down")))

        with patch.object(rate_limit, "_get_client", return_value=broken_client):
            await rate_limit.check_rate_limit("chat:test", 1, 60, fail_closed=False)
            await rate_limit.check_rate_limit("chat:test", 1, 60, fail_closed=False)


class PaymentWebhookIdempotencyTests(unittest.IsolatedAsyncioTestCase):
    async def test_duplicate_integrity_error_is_treated_as_processed(self):
        payment = SimpleNamespace(
            id=55,
            user_id=10,
            credits=300,
            status="created",
            external_payment_id="order-55",
            package_code=None,
            referral_partner_id=None,
        )
        session = SimpleNamespace(
            scalar=AsyncMock(return_value=payment),
            add=Mock(),
            commit=AsyncMock(side_effect=IntegrityError("duplicate", {}, Exception("unique"))),
            rollback=AsyncMock(),
        )
        event = {
            "TerminalKey": "terminal",
            "OrderId": "order-55",
            "Status": "CONFIRMED",
            "PaymentId": "tb-55",
            "Token": "valid",
        }

        with patch("backend.app.services.tbank.verify_notification", return_value=True):
            with patch("backend.app.services.balance.apply_balance_operation", new=AsyncMock()):
                await process_webhook(session, event)

        session.rollback.assert_awaited_once()


class SafeLoggingTests(unittest.TestCase):
    def test_safe_context_redacts_secret_like_fields(self):
        context = safe_context(
            user_id=1,
            token="abc",
            nested={"password": "secret", "ok": "visible"},
            authorization_header="Bearer secret",
        )

        self.assertEqual(context["user_id"], 1)
        self.assertEqual(context["token"], "<redacted>")
        self.assertEqual(context["authorization_header"], "<redacted>")
        self.assertEqual(context["nested"]["password"], "<redacted>")
        self.assertEqual(context["nested"]["ok"], "visible")


if __name__ == "__main__":
    unittest.main()
