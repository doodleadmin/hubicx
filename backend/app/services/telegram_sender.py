import logging
from pathlib import Path

import httpx

from backend.app.config import settings
from backend.app.db.models import GenerationTask
from backend.app.services.storage import generate_presigned_url, storage_configured
from backend.app.utils.errors import AppError

logger = logging.getLogger(__name__)


def _model_title(task: GenerationTask) -> str:
    if task.model:
        return task.model.title
    if task.template:
        return task.template.title
    return "AI"


def _filename_from_url(url: str) -> str:
    name = Path(url.split("?", 1)[0]).name
    return name or "generation-result"


def _s3_key_from_url(url: str) -> str | None:
    if not settings.s3_public_url:
        return None
    prefix = settings.s3_public_url.rstrip("/") + "/"
    if url.startswith(prefix):
        return url[len(prefix):]
    return None


async def send_generation_result_to_chat(telegram_id: int, task: GenerationTask) -> None:
    if not settings.bot_token:
        raise AppError("telegram_bot_not_configured", "Telegram bot token is not configured", 500)

    if task.output_file_url:
        await _send_document(telegram_id, task)
        return

    if task.output_text:
        await _send_message(telegram_id, task.output_text)
        return

    raise AppError("generation_has_no_result", "Generation has no result")


async def _send_message(telegram_id: int, output_text: str) -> None:
    url = f"https://api.telegram.org/bot{settings.bot_token}/sendMessage"
    payload = {"chat_id": telegram_id, "text": f"✅ Ваш результат генерации:\n\n{output_text}"}
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url, json=payload)
        _raise_telegram_error(response)


async def _send_document(telegram_id: int, task: GenerationTask) -> None:
    url = f"https://api.telegram.org/bot{settings.bot_token}/sendDocument"
    caption = f"✅ Ваш результат генерации\nМодель: {_model_title(task)}"
    payload = {"chat_id": telegram_id, "document": task.output_file_url, "caption": caption}
    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(url, json=payload)
        if response.is_success and response.json().get("ok"):
            return

        logger.warning("Telegram sendDocument by URL failed task_id=%s status=%s", task.id, response.status_code)
        # TODO: If Telegram cannot fetch remote URL, download file to temp and send multipart upload.
        await _send_document_multipart(client, url, telegram_id, task, caption)


async def _send_document_multipart(client: httpx.AsyncClient, url: str, telegram_id: int, task: GenerationTask, caption: str) -> None:
    file_response = await client.get(task.output_file_url, follow_redirects=True)
    download_url = task.output_file_url
    if file_response.status_code == 403 and storage_configured():
        key = _s3_key_from_url(task.output_file_url)
        if key:
            logger.info("Public URL returned 403, trying presigned URL task_id=%s key=%s", task.id, key)
            try:
                download_url = generate_presigned_url(key)
                file_response = await client.get(download_url, follow_redirects=True)
            except Exception:
                logger.exception("Presigned URL generation failed task_id=%s", task.id)
    file_response.raise_for_status()
    filename = _filename_from_url(task.output_file_url)
    data = {"chat_id": str(telegram_id), "caption": caption}
    files = {"document": (filename, file_response.content, file_response.headers.get("content-type", "application/octet-stream"))}
    response = await client.post(url, data=data, files=files)
    _raise_telegram_error(response)


def _raise_telegram_error(response: httpx.Response) -> None:
    try:
        data = response.json()
    except ValueError:
        data = {}
    if response.is_success and data.get("ok"):
        return
    description = data.get("description") or response.text[:300] or "Telegram API error"
    raise AppError("telegram_send_failed", f"Telegram send failed: {description}", 502)
