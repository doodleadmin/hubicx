import logging
from fastapi import APIRouter, Depends

from backend.app.db.session import get_session
from backend.app.services.generations import update_task_from_webhook

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/fal")
async def fal_webhook(payload: dict, session=Depends(get_session)) -> dict:
    """Обрабатывает callback от Fal.ai для async-задач.

    Fal отправляет POST с полями:
      - request_id: ID задачи Fal (совпадает с generation_tasks.external_task_id)
      - status: COMPLETED / FAILED / IN_PROGRESS
      - output: dict с результатами (urls images/video)
    """
    request_id = payload.get("request_id")

    if not request_id:
        logger.warning("Fal webhook без request_id: %s", payload)
        return {"ok": False, "error": "missing request_id"}

    status = payload.get("status", "").upper()

    if status == "COMPLETED":
        output = payload.get("output", {})
        video_url = output.get("video", {}).get("url") if isinstance(output.get("video"), dict) else output.get("video")
        image_url = output.get("images", [{}])[0].get("url") if output.get("images") else None
        result_url = video_url or image_url

        if result_url:
            await update_task_from_webhook(
                session,
                external_task_id=request_id,
                status="completed",
                output_url=str(result_url),
            )
        else:
            logger.error("Fal COMPLETED без output URL: %s", payload)
            await update_task_from_webhook(session, external_task_id=request_id, status="failed")

    elif status == "FAILED":
        error_msg = payload.get("error", "Unknown Fal error")
        logger.error("Fal webhook FAILED для %s: %s", request_id, error_msg)
        await update_task_from_webhook(session, external_task_id=request_id, status="failed")

    elif status == "IN_PROGRESS":
        pass  # Промежуточный статус — не обновляем БД

    else:
        logger.info("Fal webhook: неизвестный статус %s для %s", status, request_id)

    return {"ok": True}
