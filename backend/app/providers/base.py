from dataclasses import dataclass
from typing import Any


@dataclass
class ProviderResult:
    success: bool
    provider_task_id: str | None = None
    output_url: str | None = None
    output_text: str | None = None
    error: str | None = None

    def as_dict(self) -> dict[str, Any]:
        return {
            "success": self.success,
            "provider_task_id": self.provider_task_id,
            "output_url": self.output_url,
            "output_text": self.output_text,
            "error": self.error,
        }


class BaseProvider:
    async def generate_text(self, model_id: str, prompt: str, params: dict[str, Any] | None = None) -> ProviderResult:
        return ProviderResult(False, error="Text generation is not supported by this provider")

    async def generate_image(self, model_id: str, prompt: str | None, input_file_url: str | None, params: dict[str, Any] | None = None) -> ProviderResult:
        return ProviderResult(False, error="Image generation is not supported by this provider")

    async def generate_video(self, model_id: str, prompt: str | None, input_file_url: str | None, params: dict[str, Any] | None = None) -> ProviderResult:
        return ProviderResult(False, error="Video generation is not supported by this provider")

    async def get_status(self, provider_task_id: str) -> ProviderResult:
        return ProviderResult(False, error="Status polling is not supported by this provider")


def provider_model_configured(model_id: str) -> bool:
    return bool(model_id) and not model_id.startswith("placeholder/")
