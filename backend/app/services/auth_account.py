"""Email/password account flows: register, login, and linking with Telegram accounts."""
import re
import secrets

from sqlalchemy import func, select, text, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.config import settings
from backend.app.db.models import User
from backend.app.utils.errors import AppError
from backend.app.utils.security import hash_password, make_ref_code, verify_password

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# Tables whose user_id should be repointed when merging two accounts.
_USER_FK_TABLES = [
    ("generation_tasks", "user_id"),
    ("transactions", "user_id"),
    ("balance_ledger", "user_id"),
    ("balance_ledger", "admin_user_id"),
    ("payments", "user_id"),
    ("files", "user_id"),
    ("agent_chats", "user_id"),
    ("agent_chat_messages", "user_id"),
    ("referral_rewards", "referrer_id"),
    ("referral_rewards", "referred_user_id"),
    ("referral_conversions", "referred_user_id"),
    ("referral_commissions", "referred_user_id"),
    ("users", "referrer_id"),
]


def normalize_email(email: str) -> str:
    email = (email or "").strip().lower()
    if not _EMAIL_RE.match(email):
        raise AppError("invalid_email", "Введите корректный email", 400)
    return email


def _validate_password(password: str) -> None:
    if not password or len(password) < 8:
        raise AppError("weak_password", "Пароль должен быть не короче 8 символов", 400)


async def register_email_user(session: AsyncSession, email: str, password: str, first_name: str | None = None) -> User:
    email = normalize_email(email)
    _validate_password(password)
    existing = await session.scalar(select(User).where(func.lower(User.email) == email))
    if existing:
        raise AppError("email_taken", "Этот email уже зарегистрирован", 409)
    user = User(
        telegram_id=-int(secrets.randbelow(9_000_000_000) + 1_000_000_000),
        email=email,
        password_hash=hash_password(password),
        first_name=(first_name or "").strip() or None,
        language_code="ru",
        balance_credits=settings.signup_bonus_credits,
        ref_code=make_ref_code(),
    )
    session.add(user)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise AppError("email_taken", "Этот email уже зарегистрирован", 409)
    await session.refresh(user)
    return user


async def authenticate_email_user(session: AsyncSession, email: str, password: str) -> User:
    email = normalize_email(email)
    user = await session.scalar(select(User).where(func.lower(User.email) == email))
    if not user or not verify_password(password, user.password_hash):
        raise AppError("invalid_credentials", "Неверный email или пароль", 401)
    return user


async def set_email_password(session: AsyncSession, user: User, email: str, password: str) -> User:
    """Attach email+password to an existing (Telegram) account."""
    email = normalize_email(email)
    _validate_password(password)
    other = await session.scalar(select(User).where(func.lower(User.email) == email, User.id != user.id))
    if other:
        raise AppError("email_taken", "Этот email уже используется другим аккаунтом", 409)
    user.email = email
    user.password_hash = hash_password(password)
    await session.commit()
    await session.refresh(user)
    return user


async def merge_users(session: AsyncSession, source: User, target: User) -> User:
    """Repoint all of source's data onto target, sum balances, then delete source."""
    if source.id == target.id:
        return target
    await session.execute(
        text(
            """
            DELETE FROM user_bonus_tasks s
            WHERE s.user_id = :source
              AND EXISTS (
                SELECT 1 FROM user_bonus_tasks t
                WHERE t.user_id = :target AND t.code = s.code
              )
            """
        ),
        {"target": target.id, "source": source.id},
    )
    await session.execute(
        text(
            """
            DELETE FROM user_subscriptions s
            WHERE s.user_id = :source
              AND EXISTS (
                SELECT 1 FROM user_subscriptions t
                WHERE t.user_id = :target AND t.code = s.code
              )
            """
        ),
        {"target": target.id, "source": source.id},
    )
    target_has_profile = await session.scalar(
        text("SELECT 1 FROM user_profile_settings WHERE user_id = :target LIMIT 1"),
        {"target": target.id},
    )
    if target_has_profile:
        await session.execute(text("DELETE FROM user_profile_settings WHERE user_id = :source"), {"source": source.id})
    else:
        await session.execute(
            text("UPDATE user_profile_settings SET user_id = :target WHERE user_id = :source"),
            {"target": target.id, "source": source.id},
        )
    await session.execute(
        text("UPDATE user_bonus_tasks SET user_id = :target WHERE user_id = :source"),
        {"target": target.id, "source": source.id},
    )
    await session.execute(
        text("UPDATE user_subscriptions SET user_id = :target WHERE user_id = :source"),
        {"target": target.id, "source": source.id},
    )
    for table, column in _USER_FK_TABLES:
        await session.execute(
            text(f"UPDATE {table} SET {column} = :target WHERE {column} = :source"),
            {"target": target.id, "source": source.id},
        )
    target.balance_credits = (target.balance_credits or 0) + (source.balance_credits or 0)
    if not target.username and source.username:
        target.username = source.username
    if not target.first_name and source.first_name:
        target.first_name = source.first_name
    await session.delete(source)
    await session.commit()
    await session.refresh(target)
    return target


async def link_telegram_to_email_account(session: AsyncSession, tg_user: User, email: str, password: str) -> User:
    """Called from inside Telegram: verify ownership of an email account and merge it
    with the current Telegram account so both credentials point to one account."""
    email_account = await authenticate_email_user(session, email, password)
    if email_account.id == tg_user.id:
        return email_account
    if email_account.telegram_id and email_account.telegram_id > 0 and email_account.telegram_id != tg_user.telegram_id:
        raise AppError("already_linked", "К этому email уже привязан другой Telegram", 409)
    # Keep the email account as the surviving record; move telegram identity onto it.
    tg_id = tg_user.telegram_id
    tg_username = tg_user.username
    tg_first = tg_user.first_name
    # Detach telegram_id from the Telegram stub first to avoid a unique conflict while
    # the email account receives the real Telegram identity after the merge.
    temp_tg_id = -int(secrets.randbelow(9_000_000_000) + 10_000_000_000)
    await session.execute(update(User).where(User.id == tg_user.id).values(telegram_id=temp_tg_id))
    await session.commit()
    merged = await merge_users(session, tg_user, email_account)
    merged.telegram_id = tg_id
    if not merged.username:
        merged.username = tg_username
    if not merged.first_name:
        merged.first_name = tg_first
    merged.is_admin = (tg_id in settings.admin_id_set) if tg_id else merged.is_admin
    await session.commit()
    await session.refresh(merged)
    return merged
