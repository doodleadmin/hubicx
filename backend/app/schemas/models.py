from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class FormField(BaseModel):
    name: str
    provider_key: str | None = None
    label: str
    type: str
    required: bool = False
    default: Any = None
    options: list[str] | None = None
    min: float | None = None
    max: float | None = None
    step: float | None = None
    placeholder: str | None = None
    helper_text: str | None = None
    accept: str | None = None
    max_files: int | None = None
    advanced: bool = False


class FormSchema(BaseModel):
    version: int = 1
    fields: list[FormField] = []
    submit_label: str = "Сгенерировать"
    result_type: str = "image"
    helper_text: str | None = None
    schema_source: dict[str, Any] | None = None
    price_rules: dict[str, Any] | None = None


class AIModelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    title: str
    description: str | None
    category: str
    provider: str
    task_type: str
    input_type: str
    price_credits: int
    default_params: dict[str, Any]
    form_schema: dict[str, Any] | None = None
    is_active: bool
    sort_order: int


class TemplateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    title: str
    description: str | None
    template_type: str
    required_inputs: dict[str, Any]
    default_params: dict[str, Any]
    price_credits: int
    is_active: bool
    sort_order: int
