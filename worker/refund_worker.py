"""Watchdog: finds stuck generation tasks and refunds them."""

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from backend.app.db.models import GenerationTask
from backend.app.db.session import async_session, engine
from backend.app.services.generations import mark_failed_and_refund
from worker.celery_app import celery_app

logger = logging.getLogger(__name__)

PHOTO_TIMEOUT_MINUTES = 15
VIDEO_TIMEOUT_MINUTES = 30
STUCK_STATUSES = {"created", "queued", "processing", "running"}
VIDEO_TASK_TYPES = {"text_to_video", "image_to_video", "video"}


async def _refund_stuck_tasks() -> dict:
    now = datetime.now(timezone.utc)
    refunded = []
    skipped = []

    async with async_session() as session:
        result = await session.execute(
            select(GenerationTask).where(GenerationTask.status.in_(STUCK_STATUSES))
        )
        tasks = list(result.scalars().all())

        for task in tasks:
            if not task.created_at:
                continue
            timeout_minutes = VIDEO_TIMEOUT_MINUTES if task.task_type in VIDEO_TASK_TYPES else PHOTO_TIMEOUT_MINUTES
            age = now - task.created_at.replace(tzinfo=timezone.utc)
            if age < timedelta(minutes=timeout_minutes):
                skipped.append(task.id)
                continue

            logger.warning(
                "WATCHDOG_REFUND task_id=%s user_id=%s status=%s task_type=%s age_min=%.1f",
                task.id, task.user_id, task.status, task.task_type, age.total_seconds() / 60,
            )
            try:
                await mark_failed_and_refund(
                    session,
                    task,
                    f"Задача не завершилась за {timeout_minutes} минут. Токены возвращены автоматически.",
                )
                refunded.append(task.id)
            except Exception:
                logger.exception("WATCHDOG_REFUND_FAIL task_id=%s", task.id)

    return {"refunded": refunded, "skipped_count": len(skipped)}


@celery_app.task(name="worker.refund_worker.refund_failed_tasks")
def refund_failed_tasks() -> dict:
    result = asyncio.run(_run_refund_stuck_tasks())
    if result["refunded"]:
        logger.info("WATCHDOG_DONE refunded=%s", result["refunded"])
    return result


async def _run_refund_stuck_tasks() -> dict:
    try:
        return await _refund_stuck_tasks()
    finally:
        await engine.dispose()
