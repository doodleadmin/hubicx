import asyncio
import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.db.models import GenerationTask
from backend.app.db.session import async_session, engine
from backend.app.providers.fal import FalProvider
from backend.app.services.generations import mark_failed_and_refund
from worker.celery_app import celery_app
from worker.generation_worker import notify_user, persist_generated_file

logger = logging.getLogger(__name__)

FAL_TASK_TIMEOUT_SECONDS = 600  # 10 minutes


@celery_app.task(name="worker.polling_worker.poll_provider_tasks")
def poll_provider_tasks() -> dict:
    result = asyncio.run(_run_poll())
    return result


async def _run_poll() -> dict:
    try:
        return await _poll_fal_tasks()
    finally:
        await engine.dispose()


async def _poll_fal_tasks() -> dict:
    async with async_session() as session:
        result = await session.execute(
            select(GenerationTask)
            .where(
                GenerationTask.status == "processing",
                GenerationTask.provider == "fal",
                GenerationTask.provider_response_url.isnot(None),
            )
            .options(
                selectinload(GenerationTask.model),
                selectinload(GenerationTask.template),
                selectinload(GenerationTask.user),
            )
        )
        tasks = result.scalars().all()

    if not tasks:
        return {"checked": 0}

    provider = FalProvider()
    checked = 0
    completed = 0
    failed = 0

    for task in tasks:
        try:
            async with async_session() as session:
                # Re-fetch inside its own session for proper transaction isolation
                task_fresh = await session.scalar(
                    select(GenerationTask)
                    .where(GenerationTask.id == task.id)
                    .options(
                        selectinload(GenerationTask.model),
                        selectinload(GenerationTask.template),
                        selectinload(GenerationTask.user),
                    )
                )
                if not task_fresh or task_fresh.status != "processing":
                    continue

                checked += 1

                # Check for timeout
                started = task_fresh.started_at
                if started:
                    age = (datetime.now(timezone.utc) - started.replace(tzinfo=timezone.utc) if started.tzinfo is None else datetime.now(timezone.utc) - started).total_seconds()
                    if age > FAL_TASK_TIMEOUT_SECONDS:
                        logger.warning(
                            "poll: task %s timed out after %.0fs", task_fresh.id, age
                        )
                        await mark_failed_and_refund(session, task_fresh, "Превышено время ожидания генерации")
                        await notify_user(task_fresh.user.telegram_id, "❌ Генерация не удалась: превышено время ожидания. Кредиты возвращены.")
                        failed += 1
                        continue

                poll_result = await provider.fetch_result(task_fresh.provider_response_url)

                if poll_result is None:
                    # Still in progress — skip until next cycle
                    logger.debug("poll: task %s still in progress", task_fresh.id)
                    continue

                if poll_result.success:
                    task_fresh.status = "completed"
                    task_fresh.provider_task_id = poll_result.provider_task_id or task_fresh.provider_task_id
                    task_fresh.output_file_url = await persist_generated_file(session, task_fresh, poll_result.output_url) if poll_result.output_url else None
                    task_fresh.completed_at = datetime.now(timezone.utc)
                    await session.commit()
                    logger.info("poll: task %s completed", task_fresh.id)
                    await notify_user(task_fresh.user.telegram_id, "✅ Генерация готова")
                    completed += 1
                else:
                    logger.warning("poll: task %s failed: %s", task_fresh.id, poll_result.error)
                    await mark_failed_and_refund(session, task_fresh, poll_result.error or "generation_failed")
                    await notify_user(task_fresh.user.telegram_id, "❌ Генерация не удалась, кредиты возвращены")
                    failed += 1

        except Exception:
            logger.exception("poll: error processing task %s", task.id)

    logger.info("poll: checked=%d completed=%d failed=%d", checked, completed, failed)
    return {"checked": checked, "completed": completed, "failed": failed}
