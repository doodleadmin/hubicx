import unittest

from backend.app.services.business import SUBSCRIPTION_PLANS_V2, TOKEN_PACKAGES_V2
from backend.app.services.model_pricing_catalog import MODEL_PRICING
from backend.app.services.pricing import resolve_price_from_rules
from backend.seed_models import AI_MODELS_CATALOG


class ModelPricingCatalogTests(unittest.TestCase):
    def test_catalog_covers_active_media_models(self):
        missing = [
            m["code"] for m in AI_MODELS_CATALOG
            if m.get("is_active", True) and m.get("category") in {"photo", "video"} and m["code"] not in MODEL_PRICING
        ]
        self.assertEqual(missing, [])

    def test_catalog_prices_resolve(self):
        for code, data in MODEL_PRICING.items():
            price, _, _ = resolve_price_from_rules(data["price_rules"], {}, data["price_tokens"])
            self.assertGreaterEqual(price, 1, code)
            self.assertEqual(price, data["price_tokens"], code)

    def test_plans_are_eight_times_smaller_than_before(self):
        old = {"templates_mini": 800, "templates_plus": 3500, "creator": 1800, "creator_pro": 6500, "studio": 18000,
               "topup_300": 300, "topup_1000": 1000, "topup_3000": 3000, "topup_10000": 10000}
        for item in SUBSCRIPTION_PLANS_V2 + TOKEN_PACKAGES_V2:
            tokens = item.get("tokens_per_month") or item["total_tokens"]
            self.assertAlmostEqual(tokens, old[item["code"]] / 8, delta=0.5, msg=item["code"])


if __name__ == "__main__":
    unittest.main()
