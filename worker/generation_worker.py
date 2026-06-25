import asyncio
import logging
import mimetypes
from pathlib import Path
from uuid import uuid4
from datetime import datetime, timezone

from aiogram import Bot
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.config import settings
from backend.app.db.models import File, GenerationTask
from backend.app.db.session import async_session, engine
from backend.app.providers.base import ProviderResult, provider_model_configured
from backend.app.providers.fal import FalProvider
from backend.app.providers.openrouter import OpenRouterProvider
from backend.app.services.generations import mark_failed_and_refund
from backend.app.services.storage import storage_configured, storage_service
from worker.celery_app import celery_app

logger = logging.getLogger(__name__)

# Singleton Bot для переиспользования (не создаём новый на каждый notify)
_notify_bot: Bot | None = None


def _get_notify_bot() -> Bot | None:
    global _notify_bot
    if not settings.bot_token:
        return None
    if _notify_bot is None:
        _notify_bot = Bot(settings.bot_token)
    return _notify_bot


TV_BROADCAST_GPT_IMAGE_PROMPT = """Generate a high-quality (4k) photo with the face of the person in the uploaded image, placed onto a realistic scene of a KBO baseball fan captured on live broadcast.

Key Requirements:

*   Scene:
    *   Captured during a live SPOTV KBO broadcast.
    *   Authentic broadcast camera angle (from the stands).
    *   The fan is sitting in the stands, relaxing, maybe legs crossed.
    *   Expression: Natural, not aware of the camera, looking at the game.

*   Details:
    *   Surrounded by other fans.
    *   Include realistic elements: beer cups, cheering gear, portable fans.
    *   Realistic skin texture (not smoothed), stray hairs, hints of sweat.

*   Technical Style:
    *   Captured on an actual broadcast camera.
    *   Slight blur from live transmission, compression noise, subtle motion blur (especially in the background).
    *   CRITICAL:
        *   NO excessive airbrushing/editing of the face.
        *   NO eye enlargement.
        *   NO jawline modification.
        *   NO "beauty" filter or smoothing.
        *   NO "photo shoot" look.
        *   NO "influencer" aesthetic.

Objective: Create a photo that looks like a real-world candid moment of the *person in the image*, caught on a live baseball broadcast, with all the natural flaws and atmosphere of the setting."""


def _strip_internal_provider_keys(params: dict | None) -> dict:
    clean = dict(params or {})
    for key in ("template_pipeline", "__ui_resolution"):
        clean.pop(key, None)
    return clean


async def _run_tv_broadcast_pipeline(provider: FalProvider, provider_params: dict) -> object:
    source_image = provider_params.get("start_image_url") or provider_params.get("image_url")
    if not source_image:
        return ProviderResult(False, error="TV broadcast pipeline requires source image")

    edit_result = await provider.generate_image_v2(
        "openai/gpt-image-2/edit",
        {
            "image_urls": [source_image],
            "prompt": TV_BROADCAST_GPT_IMAGE_PROMPT,
            "image_size": "auto",
            "quality": "medium",
            "num_images": 1,
            "output_format": "png",
            "sync_mode": False,
        },
    )
    if not edit_result.success:
        return edit_result

    duration = str(provider_params.get("duration") or "10")
    if duration not in {"10", "15"}:
        duration = "10"
    kling_params = {
        "start_image_url": edit_result.output_url,
        "prompt": "Человек смотрит матч",
        "duration": duration,
        "generate_audio": False,
        "sync_mode": False,
    }
    return await provider.generate_video_v2("fal-ai/kling-video/v3/standard/image-to-video", kling_params)


def log_task(task: GenerationTask, status: str, error: str | None = None) -> None:
    model_code = task.model.code if task.model else None
    provider_model_id = task.model.provider_model_id if task.model else None
    logger.info(
        "generation task_id=%s user_id=%s model_code=%s provider=%s provider_model_id=%s status=%s error=%s",
        task.id,
        task.user_id,
        model_code,
        task.provider,
        provider_model_id,
        status,
        error,
    )


def get_provider(provider: str):
    if provider == "openrouter":
        return OpenRouterProvider()
    if provider == "fal":
        return FalProvider()
    return None


@celery_app.task(
    name="worker.generation_worker.process_generation_task",
    autoretry_for=(Exception,),
    max_retries=3,
    default_retry_delay=30,  # 30 сек между попытками
    retry_backoff=True,      # exponential: 30s → 60s → 120s
)
def process_generation_task(task_id: int) -> None:
    asyncio.run(_run_process_generation_task(task_id))


async def _run_process_generation_task(task_id: int) -> None:
    try:
        await _process_generation_task(task_id)
    finally:
        await engine.dispose()


async def _process_generation_task(task_id: int) -> None:
    async with async_session() as session:
        task = await session.scalar(
            select(GenerationTask)
            .where(GenerationTask.id == task_id)
            .options(selectinload(GenerationTask.model), selectinload(GenerationTask.template), selectinload(GenerationTask.user))
        )
        if not task or task.status not in {"queued", "created"}:
            return
        task.status = "processing"
        task.started_at = datetime.now(timezone.utc)
        await session.commit()
        log_task(task, "processing")

        provider = get_provider(task.provider)
        if not provider:
            log_task(task, "refunded", f"Unknown provider: {task.provider}")
            await mark_failed_and_refund(session, task, f"Unknown provider: {task.provider}")
            await notify_user(task.user.telegram_id, "❌ Генерация не удалась, кредиты возвращены")
            return

        model = task.model
        provider_model_id = model.provider_model_id if model else "placeholder/template-model"
        if not provider_model_configured(provider_model_id):
            log_task(task, "refunded", "Model provider ID is not configured")
            await mark_failed_and_refund(session, task, "Model provider ID is not configured")
            await notify_user(task.user.telegram_id, "❌ Генерация не удалась, кредиты возвращены")
            return

        prompt = task.prompt or ""
        if model and model.code == "prompt_helper":
            prompt = (
                "Улучши пользовательский промпт для AI-генерации. "
                "Верни только готовый улучшенный промпт без пояснений.\n\n"
                f"{prompt}"
            )
        if task.template and task.template.system_prompt:
            prompt = f"{task.template.system_prompt}\n\n{prompt}".strip()

        provider_params = task.provider_input or task.params or {}
        if "prompt" not in provider_params:
            provider_params = {**provider_params, "prompt": prompt}

        if task.task_type == "text":
            result = await provider.generate_text(provider_model_id, prompt, provider_params)
        elif task.task_type == "image":
            if task.provider_input:
                result = await provider.generate_image_v2(provider_model_id, _strip_internal_provider_keys(task.provider_input))
            else:
                result = await provider.generate_image(provider_model_id, prompt, task.input_file_url, provider_params)
        elif task.task_type == "video":
            if provider_params.get("template_pipeline") == "tv_broadcast_kling_30" and isinstance(provider, FalProvider):
                result = await _run_tv_broadcast_pipeline(provider, provider_params)
            elif task.provider_input:
                result = await provider.generate_video_v2(provider_model_id, _strip_internal_provider_keys(task.provider_input))
            else:
                result = await provider.generate_video(provider_model_id, prompt, task.input_file_url, _strip_internal_provider_keys(provider_params))
        else:
            result = await provider.generate_text(provider_model_id, prompt, provider_params)

        if result.success:
            task.status = "completed"
            task.provider_task_id = result.provider_task_id
            task.output_file_url = await persist_generated_file(session, task, result.output_url) if result.output_url else None
            task.output_text = result.output_text
            task.completed_at = datetime.now(timezone.utc)
            await session.commit()
            log_task(task, "completed")
            await notify_user(task.user.telegram_id, "✅ Генерация готова")
        else:
            log_task(task, "refunded", result.error or "generation_failed")
            await mark_failed_and_refund(session, task, result.error or "generation_failed")
            await notify_user(task.user.telegram_id, "❌ Генерация не удалась, кредиты возвращены")


def _extension_from_content_type(content_type: str, url: str) -> str:
    clean_content_type = content_type.split(";", 1)[0].strip().lower()
    known = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "video/mp4": ".mp4",
        "video/webm": ".webm",
        "audio/mpeg": ".mp3",
        "audio/wav": ".wav",
    }
    if clean_content_type in known:
        return known[clean_content_type]
    guessed = mimetypes.guess_extension(clean_content_type)
    if guessed:
        return guessed
    suffix = Path(url.split("?", 1)[0]).suffix
    return suffix or ".bin"


def _normalize_generated_content_type(task_type: str, content_type: str, ext: str) -> str:
    clean_content_type = content_type.split(";", 1)[0].strip().lower()
    if task_type != "video" or clean_content_type not in {"", "application/octet-stream", "binary/octet-stream"}:
        return content_type
    if ext == ".webm":
        return "video/webm"
    if ext == ".mp4":
        return "video/mp4"
    return content_type


async def persist_generated_file(session: AsyncSession, task: GenerationTask, provider_url: str | None) -> str | None:
    if not provider_url:
        return None
    if not storage_configured():
        logger.warning("Storage is not configured, using provider output URL task_id=%s", task.id)
        return provider_url

    try:
        async with httpx.AsyncClient(timeout=120, follow_redirects=True) as client:
            response = await client.get(provider_url)
            response.raise_for_status()
        content_type = response.headers.get("content-type", "application/octet-stream")
        ext = _extension_from_content_type(content_type, provider_url)
        content_type = _normalize_generated_content_type(task.task_type, content_type, ext)
        key = f"generations/{task.user_id}/{task.id}/{uuid4().hex}{ext}"
        stored = await storage_service.upload_bytes(response.content, key, content_type)
        session.add(
            File(
                user_id=task.user_id,
                file_type=task.task_type,
                purpose="output",
                storage_url=stored.url,
                mime_type=stored.mime_type,
                size_bytes=stored.size_bytes,
            )
        )
        return stored.url
    except Exception:
        logger.exception("Storage upload failed task_id=%s, using provider output URL", task.id)
        return provider_url


async def notify_user(telegram_id: int, text: str) -> None:
    bot = _get_notify_bot()
    if not bot:
        return
    try:
        await bot.send_message(telegram_id, text)
    except Exception as exc:
        logger.warning("Failed to send Telegram notification to %s: %s", telegram_id, exc)
