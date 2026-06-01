from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, model_validator


class GenerationCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_code: str | None = None
    template_code: str | None = None
    prompt: str | None = None
    input_file_url: str | None = None
    params: dict[str, Any] | None = None

    @model_validator(mode="after")
    def validate_target(self):
        if not self.model_code and not self.template_code:
            raise ValueError("model_code or template_code is required")
        if self.model_code and self.template_code:
            raise ValueError("Use either model_code or template_code")
        return self


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
