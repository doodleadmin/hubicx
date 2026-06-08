import json
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


# ── старый движок (form_schema.price_rules) ────────────────────────────
def calculate_generation_cost_breakdown(model: AIModel, validated_inputs: dict[str, Any], base_price_override: int | None = None) -> tuple[int, list[dict[str, Any]]]:
    """Старая логика через form_schema.price_rules (multipliers / additions)."""
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


# ── новый движок (model_pricing.price_rules) ───────────────────────────
def _normalize_resolution(res: str) -> str:
    return res.upper().replace("K", "K") if res else res


def _normalize_duration(dur: Any) -> str:
    return str(dur)


def resolve_price_from_rules(price_rules: dict | None, validated_inputs: dict[str, Any], base_price_tokens: int) -> tuple[int, str, str]:
    """Вычисляет цену по новым price_rules из model_pricing.
    Возвращает: (price_tokens, pricing_source, applied_rules_summary)
    """
    if not price_rules or not isinstance(price_rules, dict):
        return base_price_tokens, "db_fixed", f"flat {base_price_tokens}"

    # ── resolution_duration_prices (Seedance Standard) ──
    if "resolution_duration_prices" in price_rules:
        resolution_prices = price_rules["resolution_duration_prices"]
        resolution = _normalize_resolution(str(validated_inputs.get("resolution") or price_rules.get("default_resolution", "720p")))
        duration = _normalize_duration(validated_inputs.get("duration") or price_rules.get("default_duration", "5"))

        if resolution not in resolution_prices:
            allowed = list(resolution_prices.keys())
            raise AppError("invalid_resolution", f"Разрешение {resolution} не поддерживается. Доступно: {', '.join(allowed)}", 422)

        dur_prices = resolution_prices[resolution]
        if not isinstance(dur_prices, dict):
            raise AppError("invalid_price_rules", "Некорректная структура price_rules")

        if duration not in dur_prices:
            allowed_dur = list(dur_prices.keys())
            raise AppError("invalid_duration", f"Длительность {duration}с не поддерживается для {resolution}. Доступно: {', '.join(allowed_dur)}с", 422)

        price = int(dur_prices[duration])
        summary = f"{resolution} {duration}s"
        return price, "db_rules", summary

    # ── duration_prices (Kling, Seedance Fast) ──
    if "duration_prices" in price_rules:
        duration_prices = price_rules["duration_prices"]
        duration = _normalize_duration(validated_inputs.get("duration") or price_rules.get("default_duration", "5"))

        if duration not in duration_prices:
            allowed = list(duration_prices.keys())
            raise AppError("invalid_duration", f"Длительность {duration}с не поддерживается. Доступно: {', '.join(allowed)}с", 422)

        price = int(duration_prices[duration])
        summary = f"{duration}s"
        return price, "db_rules", summary

    # ── resolution_prices (Nano Banana Pro) ──
    if "resolution_prices" in price_rules:
        resolution_prices = price_rules["resolution_prices"]
        resolution = _normalize_resolution(str(validated_inputs.get("resolution") or price_rules.get("default_resolution", "1K")))

        if resolution not in resolution_prices:
            allowed = list(resolution_prices.keys())
            raise AppError("invalid_resolution", f"Разрешение {resolution} не поддерживается. Доступно: {', '.join(allowed)}", 422)

        price = int(resolution_prices[resolution])

        # multiply_by_num_images
        if price_rules.get("multiply_by_num_images"):
            num = int(validated_inputs.get("num_images", 1))
            price = price * num
            summary = f"{resolution} × {num}"
        else:
            summary = resolution

        return price, "db_rules", summary

    # ── multiply_by_num_images (обычные image) ──
    if price_rules.get("multiply_by_num_images"):
        num = int(validated_inputs.get("num_images", 1))
        price = int(base_price_tokens) * num
        summary = f"× {num}" if num > 1 else "× 1"
        return price, "db_rules", summary

    # fallback
    return base_price_tokens, "db_fixed", f"flat {base_price_tokens}"


# ── общие хелперы ──────────────────────────────────────────────────────
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
    """Приоритет: model_pricing.price_rules → model_pricing.price_tokens → fallback (старая логика)"""
    pricing = await get_model_pricing(session, model.code)

    if pricing and pricing.price_rules and isinstance(pricing.price_rules, dict):
        # ── новые price_rules из DB ──
        price, source, summary = resolve_price_from_rules(pricing.price_rules, validated_inputs, int(pricing.price_tokens))
        return price, [
            {"type": "base", "label": "price_tokens", "amount": int(pricing.price_tokens)},
            {"type": "source", "label": "pricing_source", "value": source},
            {"type": "summary", "label": "applied_rules", "value": summary},
            {"type": "total", "label": "final", "amount": price},
        ]

    if pricing:
        # ── фиксированная цена из DB ──
        base = int(pricing.price_tokens)
        return base, [
            {"type": "base", "label": "db_fixed", "amount": base},
            {"type": "source", "label": "pricing_source", "value": "db_fixed"},
            {"type": "total", "label": "final", "amount": base},
        ]

    # ── fallback: старая логика ──
    return calculate_generation_cost_breakdown(model, validated_inputs, await effective_model_base_price(session, model))


async def calculate_generation_cost_from_db(session: AsyncSession, model: AIModel, validated_inputs: dict[str, Any]) -> int:
    final_cost, _ = await calculate_generation_cost_breakdown_from_db(session, model, validated_inputs)
    return final_cost
