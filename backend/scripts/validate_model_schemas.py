"""Validate AI model form schemas against internal registry rules."""

import asyncio
from collections import Counter
from typing import Any

from sqlalchemy import select

from backend.app.db.models import AIModel
from backend.app.db.session import async_session
from backend.seed_models import AI_MODELS_CATALOG

ALLOWED_FIELD_TYPES = {"textarea", "text", "select", "number", "switch", "file", "files", "hidden"}
PLACEHOLDER_PREFIX = "placeholder/"
ALLOWED_PRICE_ROUNDING = {"ceil", "floor", "round"}


def fail(errors: list[str], code: str, message: str) -> None:
    errors.append(f"{code}: {message}")


def validate_field(model: AIModel, field: dict[str, Any], errors: list[str]) -> None:
    prefix = f"{model.code}.{field.get('name', '<missing>')}"
    field_type = field.get("type")
    if not field.get("name"):
        fail(errors, prefix, "field name is required")
    if not field.get("label"):
        fail(errors, prefix, "field label is required")
    if field_type not in ALLOWED_FIELD_TYPES:
        fail(errors, prefix, f"unsupported field type {field_type!r}")
    if not field.get("provider_key"):
        fail(errors, prefix, "provider_key is required")
    if field_type == "select":
        options = field.get("options") or []
        if not options:
            fail(errors, prefix, "select field must have options")
        if "default" in field and field.get("default") not in options:
            fail(errors, prefix, f"default {field.get('default')!r} is not in options")
    if field_type == "number":
        minimum = field.get("min")
        maximum = field.get("max")
        default = field.get("default")
        if minimum is not None and maximum is not None and minimum > maximum:
            fail(errors, prefix, "min cannot be greater than max")
        if default is not None:
            if minimum is not None and default < minimum:
                fail(errors, prefix, "default is below min")
            if maximum is not None and default > maximum:
                fail(errors, prefix, "default is above max")
    if field_type in {"file", "files"}:
        if not field.get("accept"):
            fail(errors, prefix, "file fields must declare accept")
        if field_type == "files" and (field.get("max_files") or 0) <= 0:
            fail(errors, prefix, "files field must declare positive max_files")


def _is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def validate_price_rules(model: AIModel, schema: dict[str, Any], errors: list[str]) -> None:
    rules = schema.get("price_rules")
    if not rules:
        return
    if not isinstance(rules, dict):
        fail(errors, model.code, "price_rules must be an object")
        return

    fields = schema.get("fields") or []
    field_map = {field.get("name"): field for field in fields if field.get("name")}

    base = rules.get("base")
    if base is not None and (not _is_number(base) or base <= 0):
        fail(errors, model.code, "price_rules.base must be a positive number")

    minimum = rules.get("min")
    if minimum is not None and (not _is_number(minimum) or minimum <= 0):
        fail(errors, model.code, "price_rules.min must be a positive number")

    rounding = rules.get("round")
    if rounding is not None and rounding not in ALLOWED_PRICE_ROUNDING:
        fail(errors, model.code, f"price_rules.round must be one of {sorted(ALLOWED_PRICE_ROUNDING)}")

    multipliers = rules.get("multipliers", [])
    if not isinstance(multipliers, list):
        fail(errors, model.code, "price_rules.multipliers must be a list")
    else:
        for index, multiplier in enumerate(multipliers):
            prefix = f"{model.code}.price_rules.multipliers[{index}]"
            if not isinstance(multiplier, dict):
                fail(errors, prefix, "multiplier must be an object")
                continue
            field_name = multiplier.get("field")
            if not field_name:
                fail(errors, prefix, "field is required")
            field = field_map.get(field_name)
            if field_name and not field:
                fail(errors, prefix, f"field {field_name!r} does not exist in schema")
            mode = multiplier.get("mode")
            if mode is not None and mode != "multiply_by_value":
                fail(errors, prefix, f"unsupported mode {mode!r}")
            if mode == "multiply_by_value" and field and field.get("type") != "number":
                fail(errors, prefix, "multiply_by_value can only be used with number fields")
            values = multiplier.get("values")
            if values is not None:
                if not isinstance(values, dict):
                    fail(errors, prefix, "values must be an object")
                else:
                    for value_key, value in values.items():
                        if not _is_number(value):
                            fail(errors, prefix, f"values[{value_key!r}] must be a number")
            if mode is None and values is None:
                fail(errors, prefix, "either values or mode is required")

    additions = rules.get("additions", [])
    if not isinstance(additions, list):
        fail(errors, model.code, "price_rules.additions must be a list")
    else:
        for index, addition in enumerate(additions):
            prefix = f"{model.code}.price_rules.additions[{index}]"
            if not isinstance(addition, dict):
                fail(errors, prefix, "addition must be an object")
                continue
            field_name = addition.get("field")
            if not field_name:
                fail(errors, prefix, "field is required")
            elif field_name not in field_map:
                fail(errors, prefix, f"field {field_name!r} does not exist in schema")
            values = addition.get("values")
            if not isinstance(values, dict):
                fail(errors, prefix, "values must be an object")
            else:
                for value_key, value in values.items():
                    if not _is_number(value):
                        fail(errors, prefix, f"values[{value_key!r}] must be a number")


def validate_model(model: AIModel) -> list[str]:
    errors: list[str] = []
    if model.price_credits <= 0:
        fail(errors, model.code, "price_credits must be positive")
    if model.provider_model_id.startswith(PLACEHOLDER_PREFIX):
        fail(errors, model.code, "active model cannot use placeholder provider_model_id")
    schema = model.form_schema or {}
    fields = schema.get("fields") or []
    if not fields:
        fail(errors, model.code, "active model must have non-empty form_schema.fields")
        return errors
    if not schema.get("schema_source"):
        fail(errors, model.code, "schema_source is required")
    names = [field.get("name") for field in fields]
    for name, count in Counter(names).items():
        if name and count > 1:
            fail(errors, model.code, f"duplicate field name {name!r}")
    for field in fields:
        validate_field(model, field, errors)
    field_types = {field.get("type") for field in fields}
    field_names = {field.get("name") for field in fields}
    if model.task_type in {"text", "image", "video"} and "prompt" not in field_names and not (field_types & {"file", "files"}):
        fail(errors, model.code, "active generative model must include prompt or file input")
    validate_price_rules(model, schema, errors)
    return errors


async def main() -> None:
    try:
        async with async_session() as session:
            result = await session.execute(select(AIModel).where(AIModel.is_active.is_(True)).order_by(AIModel.category, AIModel.sort_order, AIModel.code))
            models = list(result.scalars().all())
    except Exception as exc:
        print(f"Database unavailable, validating seed catalog fallback: {exc.__class__.__name__}")
        models = [
            AIModel(
                code=item["code"],
                provider_model_id=item["provider_model_id"],
                task_type=item["task_type"],
                price_credits=item["price_credits"],
                form_schema=item.get("form_schema") or {},
            )
            for item in AI_MODELS_CATALOG
            if item.get("is_active", True)
        ]
    errors: list[str] = []
    for model in models:
        errors.extend(validate_model(model))
    if errors:
        print("Model schema validation failed:")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)
    print(f"Model schema validation passed: {len(models)} active models")


if __name__ == "__main__":
    asyncio.run(main())
