import html
import logging

import httpx

from backend.app.config import settings
from backend.app.utils.errors import AppError

logger = logging.getLogger(__name__)


class EmailSendError(AppError):
    pass


def _configured_provider() -> str:
    return (settings.email_provider or "").strip().lower()


async def send_verification_code(email: str, code: str) -> None:
    provider = _configured_provider()
    if provider == "unisender":
        await _send_unisender_code(email, code)
        return
    raise AppError("email_provider_not_configured", "Отправка email пока не настроена", 503)


async def _send_unisender_code(email: str, code: str) -> None:
    if not settings.unisender_api_key:
        raise AppError("email_provider_not_configured", "UNISENDER_API_KEY не настроен", 503)

    sender_email = (settings.email_from or "").strip()
    if not sender_email:
        raise AppError("email_provider_not_configured", "EMAIL_FROM не настроен", 503)

    body = (
        "<div style=\"font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#191919\">"
        "<h2 style=\"margin:0 0 12px\">Код Hubicx</h2>"
        "<p>Введите этот код для подтверждения почты:</p>"
        f"<div style=\"font-size:32px;font-weight:800;letter-spacing:6px;margin:18px 0\">{html.escape(code)}</div>"
        f"<p style=\"color:#777\">Код действует {settings.email_code_ttl_minutes} минут. "
        "Если вы не запрашивали письмо, просто проигнорируйте его.</p>"
        "</div>"
    )
    data = {
        "format": "json",
        "api_key": settings.unisender_api_key,
        "email": email,
        "sender_name": settings.email_from_name or "Hubicx",
        "sender_email": sender_email,
        "subject": "Код подтверждения Hubicx",
        "body": body,
    }
    if settings.unisender_list_id:
        data["list_id"] = settings.unisender_list_id

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post("https://api.unisender.com/ru/api/sendEmail", data=data)
    except httpx.HTTPError as exc:
        logger.exception("UniSender HTTP error")
        raise AppError("email_send_failed", "Не удалось отправить письмо", 502) from exc

    try:
        payload = response.json()
    except ValueError as exc:
        logger.warning("UniSender returned non-JSON response: %s", response.text[:300])
        raise AppError("email_send_failed", "Почтовый сервис вернул некорректный ответ", 502) from exc

    if response.status_code >= 400 or "error" in payload:
        logger.warning("UniSender sendEmail failed: status=%s payload=%s", response.status_code, payload)
        raise AppError("email_send_failed", "Почтовый сервис не принял письмо", 502)
