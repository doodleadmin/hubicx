from typing import Any, AsyncGenerator

import httpx

from backend.app.config import settings
from backend.app.providers.base import BaseProvider, ProviderResult, provider_model_configured


class OpenRouterProvider(BaseProvider):
    base_url = "https://openrouter.ai/api/v1"

    def _auth_headers(self) -> dict:
        return {
            "Authorization": f"Bearer {settings.openrouter_api_key}",
            "HTTP-Referer": settings.webapp_url,
            "X-Title": "Telegram AI Aggregator",
        }

    async def generate_chat(
        self,
        model_id: str,
        messages: list[dict],
        params: dict[str, Any] | None = None,
    ) -> ProviderResult:
        """Send a structured messages[] array to OpenRouter chat completions."""
        if not settings.openrouter_api_key:
            return ProviderResult(False, error="API key is missing: OPENROUTER_API_KEY")
        if not provider_model_configured(model_id):
            return ProviderResult(False, error="Model provider ID is not configured")
        payload = {
            "model": model_id,
            "messages": messages,
            "temperature": (params or {}).get("temperature", 0.7),
        }
        try:
            async with httpx.AsyncClient(timeout=60, proxy=settings.proxy_url or None) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self._auth_headers(),
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

    async def stream_chat(
        self,
        model_id: str,
        messages: list[dict],
        params: dict[str, Any] | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream chat response, yielding text chunks as they arrive."""
        if not settings.openrouter_api_key:
            raise RuntimeError("API key is missing: OPENROUTER_API_KEY")
        if not provider_model_configured(model_id):
            raise RuntimeError("Model provider ID is not configured")
        payload = {
            "model": model_id,
            "messages": messages,
            "temperature": (params or {}).get("temperature", 0.7),
            "stream": True,
        }
        async with httpx.AsyncClient(timeout=120, proxy=settings.proxy_url or None) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers=self._auth_headers(),
                json=payload,
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    raw = line[6:].strip()
                    if raw == "[DONE]":
                        break
                    try:
                        import json as _json
                        chunk = _json.loads(raw)
                        delta = chunk.get("choices", [{}])[0].get("delta", {})
                        text = delta.get("content")
                        if text:
                            yield text
                    except Exception:
                        continue

    async def generate_text(self, model_id: str, prompt: str, params: dict[str, Any] | None = None) -> ProviderResult:
        return await self.generate_chat(model_id, [{"role": "user", "content": prompt or ""}], params)

    async def generate_image(self, model_id: str, prompt: str | None, input_file_url: str | None, params: dict[str, Any] | None = None) -> ProviderResult:
        if not settings.openrouter_api_key:
            return ProviderResult(False, error="API key is missing: OPENROUTER_API_KEY")
        if not provider_model_configured(model_id):
            return ProviderResult(False, error="Model provider ID is not configured")
        return ProviderResult(False, error="OpenRouter image adapter is prepared but not enabled for this model")

    async def generate_video(self, model_id: str, prompt: str | None, input_file_url: str | None, params: dict[str, Any] | None = None) -> ProviderResult:
        return ProviderResult(False, error="OpenRouter video generation is not supported")
