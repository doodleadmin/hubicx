from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import GenerationTask, UserSafetyEvent


SAFETY_REJECTION_MESSAGE = (
    "Не получилось обработать фото: провайдер отклонил изображение по правилам безопасности. "
    "Пожалуйста, выберите другое фото без откровенного, 18+ или спорного контента. Кредиты возвращены."
)

_SAFETY_MARKERS = (
    "moderation",
    "safety",
    "safe",
    "policy",
    "violat",
    "inappropriate",
    "explicit",
    "adult",
    "sexual",
    "nudity",
    "nude",
    "nsfw",
    "minor",
    "underage",
    "content_filter",
    "content policy",
    "blocked",
    "rejected",
    "отклон",
    "модерац",
    "безопасн",
    "18+",
    "эрот",
    "наг",
)


def is_safety_rejection(error: str | None) -> bool:
    if not error:
        return False
    normalized = error.lower()
    return any(marker in normalized for marker in _SAFETY_MARKERS)


def safety_stage(source: str | None) -> str:
    value = (source or "").strip().lower()
    if value in {"reference_preprocess", "seedance_video", "generation"}:
        return value
    return "generation"


async def record_safety_event(
    session: AsyncSession,
    task: GenerationTask,
    *,
    source: str,
    raw_error: str | None,
    metadata: dict[str, Any] | None = None,
) -> None:
    event_metadata = {
        "model_code": task.model.code if task.model else None,
        "template_code": task.template.code if task.template else None,
        "task_type": task.task_type,
        "raw_error": (raw_error or "")[:2000],
        **(metadata or {}),
    }
    task.params = {
        **(task.params or {}),
        "_safety_review": {
            "source": safety_stage(source),
            "message": SAFETY_REJECTION_MESSAGE,
            "raw_error": (raw_error or "")[:1000],
        },
    }
    session.add(
        UserSafetyEvent(
            user_id=task.user_id,
            generation_task_id=task.id,
            source=safety_stage(source),
            category="provider_safety",
            message=SAFETY_REJECTION_MESSAGE,
            metadata_=event_metadata,
        )
    )


async def handle_generation_failure(
    session: AsyncSession,
    task: GenerationTask,
    error: str | None,
    mark_failed_and_refund,
    *,
    source: str = "generation",
) -> str:
    if is_safety_rejection(error):
        await record_safety_event(session, task, source=source, raw_error=error)
        await mark_failed_and_refund(session, task, SAFETY_REJECTION_MESSAGE)
        return SAFETY_REJECTION_MESSAGE
    message = error or "generation_failed"
    await mark_failed_and_refund(session, task, message)
    return "Генерация не удалась, кредиты возвращены."
