import asyncio
import logging
from sqlalchemy import select

from worker.celery_app import celery_app
from backend.app.db.session import async_session_factory
from backend.app.db.models import GenerationTask

logger = logging.getLogger(__name__)


@celery_app.task(name="worker.polling_worker.poll_provider_tasks")
def poll_provider_tasks() -> dict:
    """Опрашивает статус активных async-задач у провайдеров (Fal.ai).

    Для задач со статусом 'processing', отправленных с sync_mode=False,
    периодически запрашивает статус у Fal API и обновляет задачу при завершении.
    Запускается Celery Beat каждые 60 секунд.
    """
    return asyncio.run(_poll())


async def _poll() -> dict:
    """Асинхронная логика опроса."""
    from backend.app.providers.fal import FalProvider

    checked = 0
    completed = 0
    failed = 0

    try:
        async with async_session_factory() as session:
            # Ищем задачи в статусе processing с external_task_id
            result = await session.execute(
                select(GenerationTask)
                .where(
                    GenerationTask.status == "processing",
                    GenerationTask.external_task_id.isnot(None),
                )
                .limit(50)
            )
            tasks = result.scalars().all()

            if not tasks:
                return {"ok": True, "checked": 0, "message": "No active tasks to poll"}

            provider = FalProvider()

            for task in tasks:
                checked += 1
                try:
                    status = await provider.get_status(task.external_task_id)

                    if status == "COMPLETED":
                        # Получаем результат
                        result_data = await provider.get_result(task.external_task_id)
                        output_url = await _extract_output_url(result_data)
                        if output_url:
                            task.status = "completed"
                            task.output_file_url = output_url
                            await _notify_user(task)
                        else:
                            task.status = "failed"
                        completed += 1

                    elif status == "FAILED":
                        task.status = "failed"
                        failed += 1

                    # IN_PROGRESS — оставляем как есть

                except Exception as e:
                    logger.error("Poll error for task %s: %s", task.id, e)

                await session.commit()

    except Exception as e:
        logger.exception("Polling worker failed: %s", e)
        return {"ok": False, "error": str(e)}

    return {"ok": True, "checked": checked, "completed": completed, "failed": failed}


async def _extract_output_url(result: dict) -> str | None:
    """Извлекает URL результата из ответа Fal API."""
    if not result:
        return None
    # Видео результат
    video = result.get("video")
    if isinstance(video, dict):
        return video.get("url")
    if isinstance(video, str):
        return video
    # Изображение
    images = result.get("images")
    if images and isinstance(images, list) and len(images) > 0:
        return images[0].get("url")
    return None


async def _notify_user(task: GenerationTask) -> None:
    """Отправляет уведомление пользователю о завершении генерации."""
    try:
        from backend.app.services.telegram_sender import send_result_notification
        from backend.app.db.session import async_session as async_session_factory
        async with async_session_factory() as session:
            await send_result_notification(session, task)
    except Exception as e:
        logger.error("Failed to notify user for task %s: %s", task.id, e)
