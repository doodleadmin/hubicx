from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import AIModel, ModelPricing
from backend.app.db.session import get_session
from backend.app.schemas.models import AIModelOut
from backend.app.services.input_validation import validate_inputs_against_schema
from backend.app.services.pricing import calculate_generation_cost_breakdown_from_db, get_model_pricing
from backend.app.utils.errors import AppError

router = APIRouter(prefix="/models", tags=["models"])


@router.get("", response_model=list[AIModelOut])
async def list_models(category: str | None = Query(default=None), session: AsyncSession = Depends(get_session)) -> list[dict[str, Any]]:
    stmt = (
        select(AIModel, ModelPricing)
        .outerjoin(ModelPricing, ModelPricing.model_code == AIModel.code)
        .where(AIModel.is_active.is_(True))
        .where(or_(ModelPricing.id.is_(None), ModelPricing.is_enabled.is_(True)))
        .order_by(AIModel.sort_order, AIModel.id)
    )
    if category:
        stmt = stmt.where(AIModel.category == category)
    result = await session.execute(stmt)
    return [_serialize_public_model(model, pricing) for model, pricing in result.all()]


MODEL_ALIASES = {"nano_banana": "nano_banana_2"}


@router.get("/{code}", response_model=AIModelOut)
async def get_model(code: str, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    actual_code = MODEL_ALIASES.get(code, code)
    row = await session.execute(
        select(AIModel, ModelPricing)
        .outerjoin(ModelPricing, ModelPricing.model_code == AIModel.code)
        .where(AIModel.code == actual_code)
    )
    found = row.first()
    if not found:
        raise AppError("model_not_found", "Модель не найдена", 404)
    model, pricing = found
    if not model.is_active or (pricing and not pricing.is_enabled):
        raise AppError("model_not_found", "Модель не найдена", 404)
    return _serialize_public_model(model, pricing)


def _serialize_public_model(model: AIModel, pricing: ModelPricing | None = None) -> dict[str, Any]:
    price_credits = int(pricing.price_tokens) if pricing else int(model.price_credits)
    return {
        "id": model.id,
        "code": model.code,
        "title": model.title,
        "description": model.description,
        "category": model.category,
        "provider": model.provider,
        "task_type": model.task_type,
        "input_type": model.input_type,
        "price_credits": price_credits,
        "default_params": model.default_params,
        "form_schema": model.form_schema,
        "is_active": bool(model.is_active and (not pricing or pricing.is_enabled)),
        "sort_order": model.sort_order,
    }


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
    validated_inputs, _ = validate_inputs_against_schema(model.form_schema or {}, inputs, model.default_params, for_preview=True)
    final_price, breakdown = await calculate_generation_cost_breakdown_from_db(session, model, validated_inputs)

    # Определяем pricing_source из breakdown
    pricing_source = next(
        (item.get("value") for item in breakdown if item.get("label") == "pricing_source"),
        "fallback",
    )
    applied_rules_summary = next(
        (item.get("value") for item in breakdown if item.get("label") == "applied_rules"),
        "",
    )

    base_price = next((item.get("amount") for item in breakdown if item.get("type") == "base"), model.price_credits)

    response = {
        "model_code": model.code,
        "price_tokens": final_price,
        "base_price_credits": int(base_price),
        "final_price_credits": final_price,
        "pricing_source": pricing_source,
        "model_code_out": model.code,
        "applied_rules_summary": applied_rules_summary,
        "currency": "credits",
        "breakdown": breakdown,
    }

    # Добавляем price_rules из model_pricing для фронтенда
    pricing = await get_model_pricing(session, model.code)
    if pricing and pricing.price_rules:
        response["price_rules"] = pricing.price_rules

    return response
