from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import AIModel
from backend.app.db.session import get_session
from backend.app.schemas.models import AIModelOut
from backend.app.services.input_validation import validate_inputs_against_schema
from backend.app.services.pricing import calculate_generation_cost_breakdown
from backend.app.utils.errors import AppError

router = APIRouter(prefix="/models", tags=["models"])


@router.get("", response_model=list[AIModelOut])
async def list_models(category: str | None = Query(default=None), session: AsyncSession = Depends(get_session)) -> list[AIModel]:
    stmt = select(AIModel).where(AIModel.is_active.is_(True)).order_by(AIModel.sort_order, AIModel.id)
    if category:
        stmt = stmt.where(AIModel.category == category)
    result = await session.execute(stmt)
    return list(result.scalars().all())


MODEL_ALIASES = {"nano_banana": "nano_banana_2"}


@router.get("/{code}", response_model=AIModelOut)
async def get_model(code: str, session: AsyncSession = Depends(get_session)) -> AIModel:
    actual_code = MODEL_ALIASES.get(code, code)
    model = await session.scalar(select(AIModel).where(AIModel.code == actual_code))
    if not model:
        raise AppError("model_not_found", "Модель не найдена", 404)
    return model


@router.post("/{code}/price-preview")
async def preview_model_price(
    code: str,
    payload: dict[str, Any],
    _user=Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    actual_code = MODEL_ALIASES.get(code, code)
    model = await session.scalar(select(AIModel).where(AIModel.code == actual_code, AIModel.is_active.is_(True)))
    if not model:
        raise AppError("model_not_found", "Модель не найдена", 404)
    inputs = payload.get("inputs") or {}
    if not isinstance(inputs, dict):
        raise AppError("validation_error", "inputs must be an object")
    validated_inputs, _ = validate_inputs_against_schema(model.form_schema or {}, inputs, model.default_params)
    final_price, breakdown = calculate_generation_cost_breakdown(model, validated_inputs)
    base_price = next((item.get("amount") for item in breakdown if item.get("type") == "base"), model.price_credits)
    return {
        "model_code": model.code,
        "base_price_credits": int(base_price),
        "final_price_credits": final_price,
        "currency": "credits",
        "breakdown": breakdown,
    }
