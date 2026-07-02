import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from backend.app.services.referral import calculate_commission


def payment(partner_id=7):
    return SimpleNamespace(
        id=101,
        referral_partner_id=partner_id,
        amount_rub=1000,
        user_id=42,
    )


class ReferralCommissionStatusTests(unittest.IsolatedAsyncioTestCase):
    async def test_inactive_partner_does_not_receive_new_commission(self):
        session = SimpleNamespace(
            scalar=AsyncMock(return_value=None),
            get=AsyncMock(return_value=SimpleNamespace(id=7, status="blocked")),
            add=AsyncMock(),
            flush=AsyncMock(),
        )

        with patch("backend.app.services.referral.get_commission_rate", new=AsyncMock()) as get_rate:
            result = await calculate_commission(session, payment(), "token_topup")

        self.assertIsNone(result)
        get_rate.assert_not_awaited()
        session.flush.assert_not_awaited()

    async def test_active_partner_receives_commission(self):
        session = SimpleNamespace(
            scalar=AsyncMock(return_value=None),
            get=AsyncMock(return_value=SimpleNamespace(id=7, status="active")),
            add=unittest.mock.Mock(),
            flush=AsyncMock(),
        )

        with patch("backend.app.services.referral.get_commission_rate", new=AsyncMock(return_value=25)):
            result = await calculate_commission(session, payment(), "token_topup")

        self.assertIsNotNone(result)
        self.assertEqual(float(result.commission_rub), 250.0)
        session.add.assert_called_once()
        session.flush.assert_awaited_once()

    async def test_existing_commission_remains_idempotent_after_deactivation(self):
        existing = SimpleNamespace(id=55, commission_rub=250)
        session = SimpleNamespace(
            scalar=AsyncMock(return_value=existing),
            get=AsyncMock(),
        )

        result = await calculate_commission(session, payment(), "token_topup")

        self.assertIs(result, existing)
        session.get.assert_not_awaited()


if __name__ == "__main__":
    unittest.main()
