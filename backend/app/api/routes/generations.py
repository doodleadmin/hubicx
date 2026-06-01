from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import GenerationTask, User
from backend.app.db.session import get_session
from backend.app.schemas.generations import GenerationCreate, GenerationOut, GenerationQueued
from backend.app.services.generations import create_generation_task, get_user_task, history
from worker.generation_worker import process_generation_task

router = APIRouter(prefix="/generations", tags=["generations"])


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
    task = await create_generation_task(session, user, payload.model_code, payload.template_code, payload.prompt, payload.input_file_url, payload.params)
    process_generation_task.delay(task.id)
    return GenerationQueued(task_id=task.id, status=task.status)


@router.get("/history", response_model=list[GenerationOut])
async def generation_history(user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> list[GenerationOut]:
    return [serialize_task(task) for task in await history(session, user)]


@router.get("/{task_id}", response_model=GenerationOut)
async def generation_status(task_id: int, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> GenerationOut:
    return serialize_task(await get_user_task(session, user, task_id))
