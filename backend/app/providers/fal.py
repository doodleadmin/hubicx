from typing import Any
import asyncio

import httpx

from backend.app.config import settings
from backend.app.providers.base import BaseProvider, ProviderResult, provider_model_configured


class FalProvider(BaseProvider):
    base_url = "https://queue.fal.run"

    async def _submit(self, model_id: str, payload: dict[str, Any]) -> ProviderResult:
        if not settings.fal_key:
            return ProviderResult(False, error="API key is missing: FAL_KEY")
        if not provider_model_configured(model_id):
            return ProviderResult(False, error="Model provider ID is not configured")
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.post(f"{self.base_url}/{model_id}", headers={"Authorization": f"Key {settings.fal_key}"}, json=payload)
                response.raise_for_status()
                data = response.json()
                data = await self._wait_for_result(client, data)
            output_url = self._extract_output_url(data)
            if not output_url:
                return ProviderResult(False, error="Provider response has no output URL")
            return ProviderResult(True, provider_task_id=data.get("request_id") or data.get("id"), output_url=output_url)
        except httpx.TimeoutException:
            return ProviderResult(False, error="Provider timeout")
        except httpx.HTTPStatusError as exc:
            return ProviderResult(False, error=f"Provider HTTP {exc.response.status_code}: {exc.response.text[:300]}")
        except Exception as exc:
            return ProviderResult(False, error=f"Provider error: {exc}")

    async def _wait_for_result(self, client: httpx.AsyncClient, data: dict[str, Any]) -> dict[str, Any]:
        response_url = data.get("response_url")
        if not response_url or self._extract_output_url(data):
            return data

        for _ in range(30):
            await asyncio.sleep(2)
            response = await client.get(response_url, headers={"Authorization": f"Key {settings.fal_key}"})
            if response.status_code in {200, 201}:
                result = response.json()
                if isinstance(result, dict):
                    result.setdefault("request_id", data.get("request_id"))
                    return result
            if response.status_code == 400 and "still in progress" in response.text.lower():
                continue
            if response.status_code not in {202, 404}:
                response.raise_for_status()
        raise TimeoutError("Fal result timeout")

    async def generate_image(self, model_id: str, prompt: str | None, input_file_url: str | None, params: dict[str, Any] | None = None) -> ProviderResult:
        payload = {"prompt": prompt or ""}
        if params:
            payload.update(params)
        if input_file_url and "image_url" not in payload and "image_urls" not in payload:
            payload["image_url"] = input_file_url
        return await self._submit(model_id, payload)

    async def generate_image_v2(self, model_id: str, provider_input: dict[str, Any]) -> ProviderResult:
        return await self._submit(model_id, provider_input)

    async def generate_video(self, model_id: str, prompt: str | None, input_file_url: str | None, params: dict[str, Any] | None = None) -> ProviderResult:
        payload = {"prompt": prompt or "", **(params or {})}
        if input_file_url:
            payload["image_url"] = input_file_url
        return await self._submit(model_id, payload)

    async def get_status(self, provider_task_id: str) -> ProviderResult:
        if not settings.fal_key:
            return ProviderResult(False, error="API key is missing: FAL_KEY")
        return ProviderResult(True, provider_task_id=provider_task_id)

    def _extract_output_url(self, data: dict[str, Any]) -> str | None:
        for key in ("image", "video", "audio"):
            value = data.get(key)
            if isinstance(value, dict) and value.get("url"):
                return value["url"]
        for key in ("images", "videos"):
            value = data.get(key)
            if isinstance(value, list) and value and isinstance(value[0], dict):
                return value[0].get("url")
            if isinstance(value, list) and value and isinstance(value[0], str):
                return value[0]
        output = data.get("output")
        if isinstance(output, dict):
            return self._extract_output_url(output)
        if isinstance(output, list) and output:
            first = output[0]
            if isinstance(first, dict):
                return first.get("url")
            if isinstance(first, str):
                return first
        return data.get("url") or data.get("output_url")
