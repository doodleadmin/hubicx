import math
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import AIModel, ModelPricing
from backend.app.utils.errors import AppError


def _as_number(value: Any, default: float = 0) -> float:
    try:
        if isinstance(value, bool):
            return 1 if value else 0
        return float(value)
    except (TypeError, ValueError):
        return default


def _mapped_number(mapping: dict[str, Any], value: Any, default: float) -> float:
    key = str(value).lower() if isinstance(value, bool) else str(value)
    return _as_number(mapping.get(key, mapping.get(str(value), default)), default)


def calculate_generation_cost_breakdown(model: AIModel, validated_inputs: dict[str, Any], base_price_override: int | None = None) -> tuple[int, list[dict[str, Any]]]:
    rules = (model.form_schema or {}).get("price_rules") or {}
    model_base_price = int(base_price_override if base_price_override is not None else model.price_credits)
    if not isinstance(rules, dict) or not rules:
        return model_base_price, [{"type": "base", "label": "base", "amount": model_base_price}]

    base = float(model_base_price) if base_price_override is not None else _as_number(rules.get("base"), float(model.price_credits))
    total = base
    breakdown: list[dict[str, Any]] = [{"type": "base", "label": "base", "amount": base}]

    for rule in rules.get("multipliers") or []:
        if not isinstance(rule, dict):
            continue
        field = rule.get("field")
        if not field or field not in validated_inputs:
            continue
        value = validated_inputs.get(field)
        multiplier = 1.0
        if rule.get("mode") == "multiply_by_value":
            multiplier = _as_number(value, 1)
        elif isinstance(rule.get("values"), dict):
            multiplier = _mapped_number(rule["values"], value, 1)
        total *= multiplier
        breakdown.append({"type": "multiplier", "field": field, "value": value, "multiplier": multiplier})

    for rule in rules.get("additions") or []:
        if not isinstance(rule, dict):
            continue
        field = rule.get("field")
        if not field or field not in validated_inputs:
            continue
        value = validated_inputs.get(field)
        addition = 0.0
        if isinstance(rule.get("values"), dict):
            addition = _mapped_number(rule["values"], value, 0)
        total += addition
        breakdown.append({"type": "addition", "field": field, "value": value, "amount": addition})

    minimum = int(_as_number(rules.get("min"), 1))
    rounding = rules.get("round", "ceil")
    if rounding == "floor":
        final = math.floor(total)
    elif rounding == "round":
        final = round(total)
    else:
        final = math.ceil(total)

    final = max(minimum, int(final))
    breakdown.append({"type": "total", "label": "final", "amount": final})
    return final, breakdown


def calculate_generation_cost(model: AIModel, validated_inputs: dict[str, Any]) -> int:
    final_cost, _ = calculate_generation_cost_breakdown(model, validated_inputs)
    return final_cost


async def get_model_pricing(session: AsyncSession, model_code: str) -> ModelPricing | None:
    return await session.scalar(select(ModelPricing).where(ModelPricing.model_code == model_code))


async def effective_model_base_price(session: AsyncSession, model: AIModel) -> int:
    pricing = await get_model_pricing(session, model.code)
    if pricing:
        if not pricing.is_enabled:
            raise AppError("model_inactive", "Модель временно отключена")
        return int(pricing.price_tokens)
    return int(model.price_credits)


async def calculate_generation_cost_breakdown_from_db(session: AsyncSession, model: AIModel, validated_inputs: dict[str, Any]) -> tuple[int, list[dict[str, Any]]]:
    return calculate_generation_cost_breakdown(model, validated_inputs, await effective_model_base_price(session, model))


async def calculate_generation_cost_from_db(session: AsyncSession, model: AIModel, validated_inputs: dict[str, Any]) -> int:
    final_cost, _ = await calculate_generation_cost_breakdown_from_db(session, model, validated_inputs)
    return final_cost
