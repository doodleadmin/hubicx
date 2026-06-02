import math
from typing import Any

from backend.app.db.models import AIModel


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


def calculate_generation_cost_breakdown(model: AIModel, validated_inputs: dict[str, Any]) -> tuple[int, list[dict[str, Any]]]:
    rules = (model.form_schema or {}).get("price_rules") or {}
    if not isinstance(rules, dict) or not rules:
        return int(model.price_credits), [{"type": "base", "label": "base", "amount": int(model.price_credits)}]

    base = _as_number(rules.get("base"), float(model.price_credits))
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
