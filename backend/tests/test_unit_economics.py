import unittest

from backend.app.services.unit_economics import UnitEconomicsInput, calculate_unit_economics, fal_per_second_cost


class UnitEconomicsTests(unittest.TestCase):
    def test_seedance_720p_15s_price_with_30_percent_margin(self):
        provider_cost_usd = fal_per_second_cost(seconds=15, usd_per_second=0.3034)

        result = calculate_unit_economics(
            UnitEconomicsInput(
                provider_cost_usd=provider_cost_usd,
                usd_rub=78.2652,
                tax_rate=0.06,
                acquiring_rate=0.025,
                acquiring_vat_rate=0.22,
                target_net_margin_rate=0.30,
                partner_share_from_profit_rate=0.25,
                token_floor_rub=0.55,
                token_round_to=10,
            )
        )

        self.assertEqual(result["provider_cost_rub"], 356.18)
        self.assertEqual(result["recommended_price_rub"], 584.39)
        self.assertEqual(result["recommended_tokens"], 1070)
        self.assertEqual(result["partner_payout_rub"], 43.83)
        self.assertEqual(result["owner_profit_after_partner_rub"], 131.49)

    def test_invalid_rates_are_rejected(self):
        with self.assertRaises(ValueError):
            calculate_unit_economics(UnitEconomicsInput(provider_cost_usd=1, tax_rate=0.8, target_net_margin_rate=0.3))


if __name__ == "__main__":
    unittest.main()
