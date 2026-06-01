from typing import Any

import httpx

from backend.app.config import settings
from backend.app.providers.base import BaseProvider, ProviderResult, provider_model_configured


class OpenRouterProvider(BaseProvider):
    base_url = "https://openrouter.ai/api/v1"

    async def generate_text(self, model_id: str, prompt: str, params: dict[str, Any] | None = None) -> ProviderResult:
        if not settings.openrouter_api_key:
            return ProviderResult(False, error="API key is missing: OPENROUTER_API_KEY")
        if not provider_model_configured(model_id):
            return ProviderResult(False, error="Model provider ID is not configured")
        payload = {
            "model": model_id,
            "messages": [{"role": "user", "content": prompt or ""}],
            "temperature": (params or {}).get("temperature", 0.7),
        }
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {settings.openrouter_api_key}", "HTTP-Referer": settings.webapp_url, "X-Title": "Telegram AI Aggregator"},
                    json=payload,
                )
            response.raise_for_status()
            data = response.json()
            text = data.get("choices", [{}])[0].get("message", {}).get("content")
            return ProviderResult(True, provider_task_id=data.get("id"), output_text=text)
        except httpx.TimeoutException:
            return ProviderResult(False, error="Provider timeout")
        except httpx.HTTPStatusError as exc:
            return ProviderResult(False, error=f"Provider HTTP {exc.response.status_code}: {exc.response.text[:300]}")
        except Exception as exc:
            return ProviderResult(False, error=f"Provider error: {exc}")

    async def generate_image(self, model_id: str, prompt: str | None, input_file_url: str | None, params: dict[str, Any] | None = None) -> ProviderResult:
        if not settings.openrouter_api_key:
            return ProviderResult(False, error="API key is missing: OPENROUTER_API_KEY")
        if not provider_model_configured(model_id):
            return ProviderResult(False, error="Model provider ID is not configured")
        return ProviderResult(False, error="OpenRouter image adapter is prepared but not enabled for this model")

    async def generate_video(self, model_id: str, prompt: str | None, input_file_url: str | None, params: dict[str, Any] | None = None) -> ProviderResult:
        return ProviderResult(False, error="OpenRouter video generation is not supported")
