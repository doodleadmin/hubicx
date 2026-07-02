import unittest

from backend.app.services.safety import is_safety_rejection


class SafetyClassificationTests(unittest.TestCase):
    def test_detects_provider_moderation_rejections(self):
        examples = [
            "Provider HTTP 422: content moderation rejected the image",
            "Input blocked by safety policy: explicit adult content",
            "Изображение отклонено модерацией из-за 18+ контента",
        ]

        for error in examples:
            with self.subTest(error=error):
                self.assertTrue(is_safety_rejection(error))

    def test_ignores_regular_technical_failures(self):
        examples = [
            "Provider timeout",
            "Provider response has no output URL",
            "Превышено время ожидания генерации",
        ]

        for error in examples:
            with self.subTest(error=error):
                self.assertFalse(is_safety_rejection(error))


if __name__ == "__main__":
    unittest.main()
