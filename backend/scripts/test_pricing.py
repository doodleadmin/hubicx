"""Quick checks for backend generation pricing rules."""

import asyncio
from typing import Any

from sqlalchemy import select

from backend.app.db.models import AIModel
from backend.app.db.session import async_session
from backend.app.services.input_validation import validate_inputs_against_schema
from backend.app.services.pricing import calculate_generation_cost
from backend.seed_models import AI_MODELS_CATALOG


def _load_catalog_model(code: str) -> AIModel:
    for item in AI_MODELS_CATALOG:
        if item.get("code") == code and item.get("is_active", True):
            return AIModel(
                code=item["code"],
                price_credits=item["price_credits"],
                default_params=item.get("default_params") or {},
                form_schema=item.get("form_schema") or {},
            )
    raise AssertionError(f"Active model {code!r} not found in seed catalog")


async def _load_model(code: str) -> AIModel:
    try:
        async with async_session() as session:
            model = await session.scalar(select(AIModel).where(AIModel.code == code, AIModel.is_active.is_(True)))
    except Exception as exc:
        print(f"database unavailable, using seed catalog fallback: {exc.__class__.__name__}")
        return _load_catalog_model(code)
    if not model:
        raise AssertionError(f"Active model {code!r} not found")
    return model


async def _check(code: str, inputs: dict[str, Any], expected: int) -> None:
    model = await _load_model(code)
    validated_inputs, _ = validate_inputs_against_schema(model.form_schema or {}, inputs, model.default_params)
    actual = calculate_generation_cost(model, validated_inputs)
    if actual != expected:
        raise AssertionError(f"{code}: expected {expected}, got {actual} for inputs={inputs!r}")
    print(f"ok {code}: {actual} credits")


async def main() -> None:
    await _check("nano_banana_pro", {"prompt": "test", "resolution": "1K", "num_images": 1}, 80)
    await _check("nano_banana_pro", {"prompt": "test", "resolution": "2K", "num_images": 1}, 160)
    await _check("nano_banana_pro", {"prompt": "test", "resolution": "4K", "num_images": 1}, 320)
    await _check("nano_banana_pro", {"prompt": "test", "resolution": "2K", "num_images": 2}, 320)
    await _check("flux_schnell", {"prompt": "test", "num_images": 2}, 60)
    await _check("ai_chat", {"prompt": "test"}, 2)
    print("Pricing checks passed")


if __name__ == "__main__":
    asyncio.run(main())
