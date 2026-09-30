import unittest
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch

from backend.app.services.business import PARTNER_COMMISSION_PERCENT
from backend.app.services.partner_program import (
    compute_balance,
    mask_payout_details,
    parse_ref_payload,
    validate_payout_details,
)
from backend.app.services.referral import calculate_commission
from backend.app.utils.errors import AppError


class ParseRefPayloadTests(unittest.TestCase):
    def test_strips_prefix(self):
        self.assertEqual(parse_ref_payload("ref_Ab3_x-9"), "Ab3_x-9")

    def test_plain_code_is_accepted(self):
        self.assertEqual(parse_ref_payload("Ab3x9"), "Ab3x9")

    def test_rejects_garbage(self):
        for raw in (None, "", "ref_", "ref_a b", "ref_<script>", "x" * 65):
            self.assertIsNone(parse_ref_payload(raw), raw)


class ComputeBalanceTests(unittest.TestCase):
    def test_available_excludes_hold_and_debits(self):
        balance = compute_balance(
            earned=Decimal("1200"),
            matured=Decimal("1000"),
            debits={
                ("withdrawal", "paid"): Decimal("300"),
                ("withdrawal", "requested"): Decimal("100"),
                ("withdrawal", "rejected"): Decimal("500"),
                ("purchase", "paid"): Decimal("250"),
            },
        )
        self.assertEqual(balance["available_rub"], 350.0)
        self.assertEqual(balance["hold_rub"], 200.0)
        self.assertEqual(balance["earned_total_rub"], 1200.0)
        self.assertEqual(balance["withdrawn_rub"], 300.0)
        self.assertEqual(balance["withdrawal_processing_rub"], 100.0)
        self.assertEqual(balance["spent_rub"], 250.0)

    def test_available_never_negative_after_refunds(self):
        balance = compute_balance(Decimal("100"), Decimal("100"), {("withdrawal", "paid"): Decimal("500")})
        self.assertEqual(balance["available_rub"], 0.0)


class PayoutDetailsTests(unittest.TestCase):
    def test_card_is_normalised(self):
        details = validate_payout_details("card", {"card": "4242 4242 4242 4242", "holder": "Иван Петров"})
        self.assertEqual(details, {"method": "card", "card": "4242424242424242", "holder": "Иван Петров"})
        self.assertEqual(mask_payout_details(details), "Карта •• 4242")

    def test_card_with_bad_checksum_is_rejected(self):
        with self.assertRaises(AppError):
            validate_payout_details("card", {"card": "4242 4242 4242 4241", "holder": "Иван"})

    def test_sbp_phone_is_normalised(self):
        details = validate_payout_details("sbp", {"phone": "8 (900) 123-45-67", "bank": "Т-Банк", "holder": "Иван"})
        self.assertEqual(details["phone"], "+79001234567")

    def test_unknown_method_and_missing_holder(self):
        with self.assertRaises(AppError):
            validate_payout_details("crypto", {"holder": "Иван"})
        with self.assertRaises(AppError):
            validate_payout_details("sbp", {"phone": "+79001234567", "bank": "Т-Банк"})


class WithdrawalSwitchTests(unittest.IsolatedAsyncioTestCase):
    async def test_withdrawals_are_refused_while_switched_off(self):
        from backend.app.services import partner_program

        with patch.object(partner_program, "PARTNER_WITHDRAWALS_ENABLED", False):
            with self.assertRaises(AppError) as ctx:
                await partner_program.request_withdrawal(Mock(), Mock(), 1000, "card", {})
        self.assertEqual(ctx.exception.code, "withdrawals_disabled")


class UserPartnerCommissionTests(unittest.IsolatedAsyncioTestCase):
    def session(self, partner):
        return SimpleNamespace(scalar=AsyncMock(return_value=None), get=AsyncMock(return_value=partner), add=Mock(), flush=AsyncMock())

    async def test_user_partner_gets_flat_rate_on_any_category(self):
        payment = SimpleNamespace(id=5, referral_partner_id=7, amount_rub=1490, user_id=42)
        session = self.session(SimpleNamespace(id=7, status="active", user_id=11))
        with patch("backend.app.services.referral.get_commission_rate", new=AsyncMock()) as get_rate:
            commission = await calculate_commission(session, payment, "token_topup")
        get_rate.assert_not_awaited()
        self.assertEqual(float(commission.rate_percent), PARTNER_COMMISSION_PERCENT)
        self.assertEqual(commission.commission_rub, round(1490 * PARTNER_COMMISSION_PERCENT / 100, 2))

    async def test_no_commission_on_own_purchases(self):
        payment = SimpleNamespace(id=6, referral_partner_id=7, amount_rub=790, user_id=11)
        session = self.session(SimpleNamespace(id=7, status="active", user_id=11))
        self.assertIsNone(await calculate_commission(session, payment, "token_topup"))
        session.add.assert_not_called()


if __name__ == "__main__":
    unittest.main()
