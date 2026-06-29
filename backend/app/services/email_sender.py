import asyncio
import html
import logging
import smtplib
from email.message import EmailMessage
from email.utils import formatdate, make_msgid

from backend.app.config import settings
from backend.app.utils.errors import AppError

logger = logging.getLogger(__name__)


class EmailSendError(AppError):
    pass


def _configured_provider() -> str:
    return (settings.email_provider or "").strip().lower()


async def send_verification_code(email: str, code: str) -> None:
    provider = _configured_provider()
    if provider == "smtp":
        await _send_smtp_code(email, code)
        return
    raise AppError("email_provider_not_configured", "Отправка email пока не настроена", 503)


def _verification_html(code: str) -> str:
    return (
        "<div style=\"font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#191919\">"
        "<h2 style=\"margin:0 0 12px\">Код Hubicx</h2>"
        "<p>Введите этот код для подтверждения почты:</p>"
        f"<div style=\"font-size:32px;font-weight:800;letter-spacing:6px;margin:18px 0\">{html.escape(code)}</div>"
        f"<p style=\"color:#777\">Код действует {settings.email_code_ttl_minutes} минут. "
        "Если вы не запрашивали письмо, просто проигнорируйте его.</p>"
        "</div>"
    )


def _verification_text(code: str) -> str:
    return (
        "Код Hubicx\n\n"
        f"Введите этот код для подтверждения почты: {code}\n\n"
        f"Код действует {settings.email_code_ttl_minutes} минут. "
        "Если вы не запрашивали письмо, просто проигнорируйте его."
    )


async def _send_smtp_code(email: str, code: str) -> None:
    if not settings.smtp_host or not settings.smtp_username or not settings.smtp_password:
        raise AppError("email_provider_not_configured", "SMTP не настроен", 503)

    sender_email = (settings.email_from or settings.smtp_username or "").strip()
    if not sender_email:
        raise AppError("email_provider_not_configured", "EMAIL_FROM не настроен", 503)

    message = EmailMessage()
    message["Subject"] = "Код подтверждения Hubicx"
    message["From"] = f"{settings.email_from_name or 'Hubicx'} <{sender_email}>"
    message["To"] = email
    message["Date"] = formatdate(localtime=True)
    message["Message-ID"] = make_msgid(domain=sender_email.split("@")[-1])
    message.set_content(_verification_text(code))
    message.add_alternative(_verification_html(code), subtype="html")

    try:
        await asyncio.to_thread(_send_smtp_message, message)
    except smtplib.SMTPException as exc:
        logger.exception(
            "SMTP send failed: host=%s port=%s ssl=%s starttls=%s",
            settings.smtp_host,
            settings.smtp_port,
            settings.smtp_ssl,
            settings.smtp_starttls,
        )
        raise AppError("email_send_failed", "Не удалось отправить письмо", 502) from exc
    except OSError as exc:
        logger.exception("SMTP connection failed: host=%s port=%s", settings.smtp_host, settings.smtp_port)
        raise AppError("email_send_failed", "Не удалось подключиться к почтовому серверу", 502) from exc


def _send_smtp_message(message: EmailMessage) -> None:
    if settings.smtp_ssl:
        with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=20) as server:
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
        return

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
        if settings.smtp_starttls:
            server.starttls()
        server.login(settings.smtp_username, settings.smtp_password)
        server.send_message(message)
