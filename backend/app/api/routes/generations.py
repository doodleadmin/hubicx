import logging
import asyncio

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.api.deps import current_user
from backend.app.db.models import GenerationTask, User
from backend.app.db.session import get_session
from backend.app.schemas.generations import GenerationCreate, GenerationOut, GenerationQueued
from backend.app.services.generations import create_generation_task, get_user_task, history
from backend.app.services.telegram_sender import send_generation_result_to_chat
from backend.app.utils.errors import AppError
from worker.generation_worker import process_generation_task

router = APIRouter(prefix="/generations", tags=["generations"])
logger = logging.getLogger(__name__)


def serialize_task(task: GenerationTask) -> GenerationOut:
    return GenerationOut(
        id=task.id,
        status=task.status,
        task_type=task.task_type,
        prompt=task.prompt,
        input_file_url=task.input_file_url,
        output_file_url=task.output_file_url,
        output_text=task.output_text,
        params=task.params,
        error_message=task.error_message,
        cost_credits=task.cost_credits,
        created_at=task.created_at,
        completed_at=task.completed_at,
        model_code=task.model.code if task.model else None,
        template_code=task.template.code if task.template else None,
        title=(task.model.title if task.model else task.template.title if task.template else None),
    )


@router.post("", response_model=GenerationQueued)
async def create_generation(payload: GenerationCreate, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> GenerationQueued:
    task = None
    last_exc: Exception | None = None
    for attempt in range(3):
        try:
            task = await create_generation_task(session, user, payload.model_code, payload.template_code, payload.prompt, payload.input_file_url, payload.params, payload.inputs)
            break
        except Exception as exc:
            if "deadlock detected" not in str(exc).lower():
                raise
            last_exc = exc
            logger.warning("GENERATION_CREATE_DEADLOCK_RETRY user_id=%s attempt=%s", user.id, attempt + 1)
            await session.rollback()
            await asyncio.sleep(0.2 * (attempt + 1))
    if task is None:
        raise last_exc  # type: ignore[misc]
    process_generation_task.delay(task.id)
    return GenerationQueued(task_id=task.id, status=task.status)


@router.get("/history", response_model=list[GenerationOut])
async def generation_history(user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> list[GenerationOut]:
    return [serialize_task(task) for task in await history(session, user)]


@router.get("/{task_id}", response_model=GenerationOut)
async def generation_status(task_id: int, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> GenerationOut:
    return serialize_task(await get_user_task(session, user, task_id))


@router.post("/{task_id}/send-to-chat")
async def send_generation_to_chat(task_id: int, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    task = await session.scalar(
        select(GenerationTask)
        .where(GenerationTask.id == task_id)
        .options(selectinload(GenerationTask.model), selectinload(GenerationTask.template))
    )
    if not task:
        raise AppError("task_not_found", "Generation task not found", 404)
    if task.user_id != user.id:
        raise AppError("forbidden", "Access denied", 403)
    if task.status != "completed":
        raise AppError("generation_not_completed", "Generation is not completed")
    if not task.output_file_url and not task.output_text:
        raise AppError("generation_has_no_result", "Generation has no result")

    logger.info("SEND_TO_CHAT requested task_id=%s user_id=%s telegram_id=%s", task.id, user.id, user.telegram_id)
    try:
        await send_generation_result_to_chat(user.telegram_id, task)
    except Exception:
        logger.exception("SEND_TO_CHAT failed task_id=%s", task.id)
        raise
    logger.info("SEND_TO_CHAT success task_id=%s", task.id)
    return {"ok": True, "message": "Результат отправлен в Telegram-чат"}
