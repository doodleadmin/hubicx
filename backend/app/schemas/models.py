from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


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
