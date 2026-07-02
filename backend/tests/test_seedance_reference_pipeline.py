import unittest
from types import SimpleNamespace

from backend.app.providers.base import ProviderResult
from backend.app.services.pricing import SEEDANCE_REFERENCE_PIPELINE
from worker.generation_worker import PIPELINE_STATE_KEY, _start_seedance_reference_pipeline, advance_seedance_reference_pipeline


class FakeFalProvider:
    def __init__(self):
        self.submissions = []
        self.results = {}

    async def submit_async(self, model_id, payload):
        self.submissions.append((model_id, payload))
        request_id = f"req-{len(self.submissions)}"
        return ProviderResult(True, provider_task_id=request_id, response_url=f"https://queue/{request_id}")

    async def fetch_result(self, response_url):
        return self.results.get(response_url)


class SeedanceReferencePipelineTests(unittest.IsolatedAsyncioTestCase):
    async def test_submits_each_reference_separately_then_starts_seedance(self):
        provider = FakeFalProvider()
        initial, state = await _start_seedance_reference_pipeline(
            provider,
            {
                "template_pipeline": SEEDANCE_REFERENCE_PIPELINE,
                "__reference_preprocess_count": 2,
                "image_urls": ["https://img/one.jpg", "https://img/two.jpg"],
                "prompt": "video prompt",
                "duration": "15",
            },
        )

        self.assertTrue(initial.success)
        self.assertEqual([item[0] for item in provider.submissions], ["openai/gpt-image-2/edit"] * 2)
        self.assertEqual(provider.submissions[0][1]["quality"], "low")

        provider.results = {
            "https://queue/req-1": ProviderResult(True, output_url="https://refs/one.png"),
            "https://queue/req-2": ProviderResult(True, output_url="https://refs/two.png"),
        }
        task = SimpleNamespace(
            params={PIPELINE_STATE_KEY: state},
            model=SimpleNamespace(provider_model_id="bytedance/seedance-2.0/reference-to-video"),
            provider_response_url=initial.response_url,
            provider_task_id=initial.provider_task_id,
            started_at=None,
        )

        action, result = await advance_seedance_reference_pipeline(provider, task)

        self.assertEqual(action, "transitioned")
        self.assertIsNone(result)
        self.assertEqual(provider.submissions[-1][0], "bytedance/seedance-2.0/reference-to-video")
        self.assertEqual(provider.submissions[-1][1]["image_urls"], ["https://refs/one.png", "https://refs/two.png"])
        self.assertNotIn("template_pipeline", provider.submissions[-1][1])
        self.assertEqual(task.params[PIPELINE_STATE_KEY]["stage"], "video")


if __name__ == "__main__":
    unittest.main()
