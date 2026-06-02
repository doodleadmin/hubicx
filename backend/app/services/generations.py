from datetime import datetime, timezone
import logging
from typing import Any

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.db.models import AIModel, GenerationTask, Template, User
from backend.app.services.balance import charge_for_generation, has_enough_balance, refund_generation
from backend.app.services.input_validation import build_provider_input_from_resolved, resolve_input_files, validate_inputs_against_schema
from backend.app.services.pricing import calculate_generation_cost
from backend.app.utils.errors import AppError

MODEL_ALIASES = {"nano_banana": "nano_banana_2"}
logger = logging.getLogger(__name__)


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
            logger.info(
                "VALIDATED_PROVIDER_INPUT model_code=%s keys=%s prompt_preview=%s",
                model.code,
                sorted(provider_input.keys()),
                _provider_prompt_preview(provider_input),
            )
            task_params = {**(model.default_params or {}), **provider_input}
        else:
            validated_inputs = inputs or {}
            provider_input = inputs or {}
            task_params = {**(model.default_params or {}), **(params or {})}
            if prompt:
                task_params["prompt"] = prompt
        price = calculate_generation_cost(model, validated_inputs)
    else:
        template = await session.scalar(select(Template).where(Template.code == template_code))
        if not template:
            raise AppError("template_not_found", "Шаблон не найден", 404)
        if not template.is_active:
            raise AppError("model_inactive", "Шаблон временно отключен")
        model = await session.get(AIModel, template.base_model_id) if template.base_model_id else None
        price = template.price_credits
        provider = model.provider if model else "fal"
        task_type = model.task_type if model else template.template_type
        validated_inputs = {}
        provider_input = {}
        task_params = {**((model.default_params if model else {}) or {}), **(template.default_params or {}), **(params or {})}

    if not await has_enough_balance(session, user.id, price):
        raise AppError("not_enough_balance", "Недостаточно кредитов на балансе")

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
    await charge_for_generation(session, user.id, task.id, price)
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
    task.status = "refunded"
    task.error_message = error
    task.completed_at = datetime.now(timezone.utc)
    await refund_generation(session, task.user_id, task.id, task.cost_credits)
    await session.commit()
