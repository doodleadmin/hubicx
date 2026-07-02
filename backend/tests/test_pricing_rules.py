import unittest

from backend.app.services.pricing import resolve_price_from_rules


class PricingRulesTests(unittest.TestCase):
    def test_generic_multipliers_are_supported_in_db_rules(self):
        price, source, summary = resolve_price_from_rules(
            {
                "multipliers": [
                    {"field": "quality", "values": {"low": 0.7, "medium": 1, "high": 1.4}},
                    {"field": "num_images", "mode": "multiply_by_value"},
                ],
                "min": 1,
                "round": "ceil",
            },
            {"quality": "high", "num_images": 2},
            90,
        )

        self.assertEqual(price, 252)
        self.assertEqual(source, "db_rules")
        self.assertIn("quality=high", summary)


if __name__ == "__main__":
    unittest.main()
