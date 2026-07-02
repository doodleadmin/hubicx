import unittest
from unittest.mock import patch

from backend.app.providers.fal import FalProvider


class FakeResponse:
    def __init__(self, status_code=200, data=None, text=""):
        self.status_code = status_code
        self._data = data or {}
        self.text = text

    def json(self):
        return self._data

    def raise_for_status(self):
        if self.status_code >= 400:
            raise AssertionError(f"unexpected status {self.status_code}")


class FakeAsyncClient:
    def __init__(self, *args, **kwargs):
        self.post_response = FakeResponse(
            data={"request_id": "req-1", "response_url": "https://queue.fal.run/result/req-1"}
        )
        self.get_response = FakeResponse(status_code=400, text="Still in progress")

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def post(self, *args, **kwargs):
        return self.post_response

    async def get(self, *args, **kwargs):
        return self.get_response


class FalProviderAsyncTests(unittest.IsolatedAsyncioTestCase):
    async def test_submit_async_returns_response_url(self):
        with patch("backend.app.providers.fal.settings.fal_key", "test-key"), patch(
            "backend.app.providers.fal.httpx.AsyncClient",
            FakeAsyncClient,
        ):
            result = await FalProvider().submit_async("fal-ai/test-model", {"prompt": "hello"})

        self.assertTrue(result.success)
        self.assertEqual(result.provider_task_id, "req-1")
        self.assertEqual(result.response_url, "https://queue.fal.run/result/req-1")

    async def test_fetch_result_returns_none_while_in_progress(self):
        with patch("backend.app.providers.fal.settings.fal_key", "test-key"), patch(
            "backend.app.providers.fal.httpx.AsyncClient",
            FakeAsyncClient,
        ):
            result = await FalProvider().fetch_result("https://queue.fal.run/result/req-1")

        self.assertIsNone(result)


if __name__ == "__main__":
    unittest.main()
