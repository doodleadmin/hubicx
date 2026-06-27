from datetime import datetime
from typing import Any
import json

from pydantic import BaseModel, ConfigDict, Field, model_validator


MAX_PROMPT_LENGTH = 8000
MAX_URL_LENGTH = 2048
MAX_INPUT_JSON_LENGTH = 30000
MAX_INPUT_KEYS = 80


def _validate_payload_object(value: dict[str, Any] | None, label: str) -> dict[str, Any] | None:
    if value is None:
        return None
    if len(value) > MAX_INPUT_KEYS:
        raise ValueError(f"{label} has too many keys")
    try:
        size = len(json.dumps(value, ensure_ascii=False, separators=(",", ":")))
    except (TypeError, ValueError):
        raise ValueError(f"{label} must be JSON serializable")
    if size > MAX_INPUT_JSON_LENGTH:
        raise ValueError(f"{label} is too large")
    return value


class GenerationCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_code: str | None = Field(default=None, min_length=1, max_length=80, pattern=r"^[A-Za-z0-9_.:-]+$")
    template_code: str | None = Field(default=None, min_length=1, max_length=120, pattern=r"^[A-Za-z0-9_.:-]+$")
    prompt: str | None = Field(default=None, max_length=MAX_PROMPT_LENGTH)
    input_file_url: str | None = Field(default=None, max_length=MAX_URL_LENGTH)
    params: dict[str, Any] | None = None
    inputs: dict[str, Any] | None = None

    @model_validator(mode="after")
    def validate_target(self):
        if not self.model_code and not self.template_code:
            raise ValueError("model_code or template_code is required")
        if self.model_code and self.template_code:
            raise ValueError("Use either model_code or template_code")
        self.params = _validate_payload_object(self.params, "params")
        self.inputs = _validate_payload_object(self.inputs, "inputs")
        return self


class FileUploadOut(BaseModel):
    file_id: int
    url: str


class GenerationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: int
    status: str
    task_type: str
    prompt: str | None
    input_file_url: str | None
    output_file_url: str | None
    output_text: str | None
    params: dict[str, Any] | None
    error_message: str | None
    cost_credits: int
    created_at: datetime
    completed_at: datetime | None
    model_code: str | None = None
    template_code: str | None = None
    title: str | None = None


class GenerationQueued(BaseModel):
    task_id: int
    status: str
