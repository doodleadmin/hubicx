from datetime import datetime, timezone
import logging
from typing import Any

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.db.models import AIModel, BalanceLedger, GenerationTask, Template, User
from backend.app.services.balance import charge_for_generation, has_enough_balance, refund_generation
from backend.app.services.business import is_bonus_eligible_model
from backend.app.services.input_validation import build_provider_input_from_resolved, resolve_input_files, validate_inputs_against_schema
from backend.app.services.pricing import calculate_generation_cost_from_db
from backend.app.utils.errors import AppError

MODEL_ALIASES = {"nano_banana": "nano_banana_2"}
FREE_TEMPLATE_FALLBACK_MODEL_CODE = "nano_banana_2"
TEMPLATE_FALLBACK_MODEL_CODES = {"nano_banana_pro"}
logger = logging.getLogger(__name__)


def _is_photo_template(template: Template, model: AIModel | None) -> bool:
    template_type = (template.template_type or "").lower()
    task_type = ((model.task_type if model else None) or "").lower()
    category = ((model.category if model else None) or "").lower()

    values = {template_type, task_type, category}
    if any("video" in value for value in values):
        return False
    return bool(values & {"image", "photo"})


async def _user_has_template_subscription(session, user_id: int) -> bool:
    from backend.app.db.models import UserSubscription
    from sqlalchemy import select as sa_select
    sub = await session.scalar(
        sa_select(UserSubscription).where(
            UserSubscription.user_id == user_id,
            UserSubscription.kind == "template",
            UserSubscription.is_active.is_(True),
        )
    )
    return sub is not None


def _provider_prompt_preview(provider_input: dict[str, Any]) -> str | None:
    prompt = provider_input.get("prompt")
    if not isinstance(prompt, str):
        return None
    return prompt[:80]


async def create_generation_task(
    session: AsyncSession,
    user: User,
    model_code: str | None,
    template_code: str | None,
    prompt: str | None,
    input_file_url: str | None,
    params: dict[str, Any] | None,
    inputs: dict[str, Any] | None = None,
) -> GenerationTask:
    model = None
    template = None
    if model_code:
        actual_code = MODEL_ALIASES.get(model_code, model_code)
        model = await session.scalar(select(AIModel).where(AIModel.code == actual_code))
        if not model:
            raise AppError("model_not_found", "Модель не найдена", 404)
        if not model.is_active:
            raise AppError("model_inactive", "Модель временно отключена")
        provider = model.provider
        task_type = model.task_type

        if inputs and model.form_schema and model.form_schema.get("fields"):
            validated_inputs, provider_input = validate_inputs_against_schema(model.form_schema, inputs, model.default_params)
            resolved_inputs = await resolve_input_files(session, user.id, validated_inputs, model.form_schema)
            provider_input = build_provider_input_from_resolved(resolved_inputs, model.form_schema)
            if prompt and "prompt" not in provider_input:
                provider_input["prompt"] = prompt
            provider_input = {**(model.default_params or {}), **provider_input}
            logger.info(
                "VALIDATED_PROVIDER_INPUT model_code=%s keys=%s prompt_preview=%s",
                model.code,
                sorted(provider_input.keys()),
                _provider_prompt_preview(provider_input),
            )
            task_params = provider_input
        else:
            validated_inputs = inputs or {}
            provider_input = inputs or {}
            task_params = {**(model.default_params or {}), **(params or {})}
            if prompt:
                task_params["prompt"] = prompt
        price = await calculate_generation_cost_from_db(session, model, validated_inputs)
    else:
        template = await session.scalar(select(Template).where(Template.code == template_code))
        if not template:
            raise AppError("template_not_found", "Шаблон не найден", 404)
        if not template.is_active:
            raise AppError("model_inactive", "Шаблон временно отключен")
        model = await session.get(AIModel, template.base_model_id) if template.base_model_id else None
        price = template.price_credits

        fallback_metadata = None
        if (
            model
            and model.code in TEMPLATE_FALLBACK_MODEL_CODES
            and _is_photo_template(template, model)
            and not await _user_has_template_subscription(session, user.id)
        ):
            fallback_model = await session.scalar(
                select(AIModel).where(
                    AIModel.code == FREE_TEMPLATE_FALLBACK_MODEL_CODE,
                    AIModel.is_active.is_(True),
                )
            )
            if fallback_model:
                fallback_metadata = {
                    "from": model.code,
                    "to": fallback_model.code,
                    "reason": "no_subscription",
                }
                model = fallback_model
                price = await calculate_generation_cost_from_db(session, model, {})
            else:
                logger.info(
                    "TEMPLATE_MODEL_FALLBACK_SKIPPED template_code=%s from_model=%s to_model=%s reason=fallback_inactive_or_missing",
                    template.code,
                    model.code,
                    FREE_TEMPLATE_FALLBACK_MODEL_CODE,
                )

        provider = model.provider if model else "fal"
        task_type = model.task_type if model else template.template_type
        validated_inputs = {}
        provider_input = {}
        task_params = {**((model.default_params if model else {}) or {}), **(template.default_params or {}), **(params or {})}
        if fallback_metadata:
            task_params["_template_model_fallback"] = fallback_metadata

    allow_bonus = is_bonus_eligible_model(model.code if model else None, task_type)
    if provider_input and provider_input.get("template_pipeline"):
        allow_bonus = False
    if not await has_enough_balance(session, user.id, price, allow_bonus=allow_bonus):
        if allow_bonus:
            raise AppError("not_enough_balance", "Недостаточно кредитов на балансе")
        raise AppError("not_enough_paid_balance", "Для этой модели нужны платные токены")

    resolved_file_url = input_file_url
    if not resolved_file_url and provider_input:
        for key in ("image_url", "image_urls"):
            if key in provider_input:
                val = provider_input[key]
                resolved_file_url = val[0] if isinstance(val, list) and val else (val if isinstance(val, str) else None)
                break

    task_prompt = prompt
    if not task_prompt and provider_input and isinstance(provider_input.get("prompt"), str):
        task_prompt = provider_input["prompt"]

    task = GenerationTask(
        user_id=user.id,
        model_id=model.id if model else None,
        template_id=template.id if template else None,
        provider=provider,
        task_type=task_type,
        status="created",
        prompt=task_prompt,
        input_file_url=resolved_file_url,
        params=task_params,
        input_payload=validated_inputs if validated_inputs else None,
        provider_input=provider_input if provider_input else None,
        cost_credits=price,
    )
    session.add(task)
    await session.flush()
    await charge_for_generation(session, user.id, task.id, price, allow_bonus=allow_bonus)
    task.status = "queued"
    await session.commit()
    await session.refresh(task)
    return task


async def get_user_task(session: AsyncSession, user: User, task_id: int) -> GenerationTask:
    task = await session.scalar(
        select(GenerationTask)
        .where(GenerationTask.id == task_id, GenerationTask.user_id == user.id)
        .options(selectinload(GenerationTask.model), selectinload(GenerationTask.template))
    )
    if not task:
        raise AppError("task_not_found", "Задача не найдена", 404)
    return task


async def history(session: AsyncSession, user: User, limit: int = 20) -> list[GenerationTask]:
    result = await session.execute(
        select(GenerationTask)
        .where(GenerationTask.user_id == user.id)
        .options(selectinload(GenerationTask.model), selectinload(GenerationTask.template))
        .order_by(desc(GenerationTask.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())


async def mark_failed_and_refund(session: AsyncSession, task: GenerationTask, error: str) -> None:
    locked_task = await session.scalar(
        select(GenerationTask).where(GenerationTask.id == task.id).with_for_update()
    )
    if not locked_task:
        raise AppError("task_not_found", "Задача не найдена", 404)
    if locked_task.status == "refunded":
        return
    existing_refund = await session.scalar(
        select(BalanceLedger)
        .where(
            BalanceLedger.user_id == locked_task.user_id,
            BalanceLedger.task_id == locked_task.id,
            BalanceLedger.operation_type == "generation_refund",
        )
        .order_by(BalanceLedger.id.desc())
    )
    if existing_refund:
        locked_task.status = "refunded"
        locked_task.error_message = locked_task.error_message or error
        locked_task.completed_at = locked_task.completed_at or datetime.now(timezone.utc)
        await session.commit()
        return
    locked_task.status = "refunded"
    locked_task.error_message = error
    locked_task.completed_at = datetime.now(timezone.utc)
    await refund_generation(session, locked_task.user_id, locked_task.id, locked_task.cost_credits)
    await session.commit()
