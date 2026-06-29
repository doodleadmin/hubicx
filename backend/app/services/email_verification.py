import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.config import settings
from backend.app.db.models import EmailVerificationCode
from backend.app.services.email_sender import send_verification_code
from backend.app.services.rate_limit import check_ip_rate_limit, check_rate_limit, client_ip
from backend.app.utils.errors import AppError

VALID_PURPOSES = {"register", "link_email"}
MAX_ATTEMPTS = 5


def normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def _code_hash(email: str, purpose: str, code: str) -> str:
    key = settings.effective_jwt_signing_key.encode("utf-8")
    msg = f"{normalize_email(email)}:{purpose}:{code}".encode("utf-8")
    return hmac.new(key, msg, hashlib.sha256).hexdigest()


def _new_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


async def start_email_verification(session: AsyncSession, request, email: str, purpose: str) -> None:
    email = normalize_email(email)
    purpose = (purpose or "").strip().lower()
    if purpose not in VALID_PURPOSES:
        raise AppError("invalid_purpose", "Некорректный тип подтверждения", 422)

    await check_ip_rate_limit(request, f"email_code:{purpose}", 10, 3600)
    await check_rate_limit(f"email:{purpose}:{email}", 5, 3600)
    await check_rate_limit(f"email:{purpose}:{email}:cooldown", 1, 60)

    now = datetime.now(timezone.utc)
    code = _new_code()
    row = EmailVerificationCode(
        email=email,
        purpose=purpose,
        code_hash=_code_hash(email, purpose, code),
        ip_address=client_ip(request),
        expires_at=now + timedelta(minutes=max(1, settings.email_code_ttl_minutes)),
    )
    session.add(row)
    await session.commit()
    await send_verification_code(email, code)


async def consume_email_code(session: AsyncSession, email: str, purpose: str, code: str) -> None:
    email = normalize_email(email)
    purpose = (purpose or "").strip().lower()
    code = (code or "").strip()
    if not code:
        raise AppError("email_code_required", "Введите код из письма", 422)

    now = datetime.now(timezone.utc)
    row = await session.scalar(
        select(EmailVerificationCode)
        .where(
            EmailVerificationCode.email == email,
            EmailVerificationCode.purpose == purpose,
            EmailVerificationCode.consumed_at.is_(None),
            EmailVerificationCode.expires_at > now,
        )
        .order_by(desc(EmailVerificationCode.id))
        .limit(1)
    )
    if not row:
        raise AppError("email_code_invalid", "Код не найден или истёк", 400)
    if row.attempts >= MAX_ATTEMPTS:
        raise AppError("email_code_attempts_exceeded", "Слишком много попыток. Запросите новый код", 429)

    if not hmac.compare_digest(row.code_hash, _code_hash(email, purpose, code)):
        await session.execute(
            update(EmailVerificationCode)
            .where(EmailVerificationCode.id == row.id)
            .values(attempts=EmailVerificationCode.attempts + 1)
        )
        await session.commit()
        raise AppError("email_code_invalid", "Неверный код", 400)

    row.consumed_at = now
    await session.commit()


async def require_email_code_if_enabled(session: AsyncSession, email: str, purpose: str, code: str | None) -> None:
    if not settings.email_verification_required:
        return
    await consume_email_code(session, email, purpose, code or "")
