import hashlib
import hmac
import json
import logging
from urllib.parse import parse_qsl

from fastapi import Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.config import settings
from backend.app.db.models import User
from backend.app.services.users import get_or_create_user
from backend.app.utils.errors import AppError
from backend.app.utils.security import decode_jwt

logger = logging.getLogger(__name__)


def validate_init_data(init_data: str) -> dict:
    if not settings.bot_token:
        raise AppError("invalid_init_data", "BOT_TOKEN is required to validate initData", 401)
    parsed = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = parsed.pop("hash", None)
    if not received_hash:
        raise AppError("invalid_init_data", "Missing Telegram hash", 401)
    data_check_string = "\n".join(f"{key}={parsed[key]}" for key in sorted(parsed))
    secret_key = hmac.new(b"WebAppData", settings.bot_token.encode(), hashlib.sha256).digest()
    expected_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected_hash, received_hash):
        raise AppError("invalid_init_data", "Invalid Telegram initData signature", 401)
    if "user" not in parsed:
        raise AppError("invalid_init_data", "Telegram user is missing", 401)
    parsed["user"] = json.loads(parsed["user"])
    return parsed


def get_telegram_user_from_init_data(init_data: str) -> dict:
    return validate_init_data(init_data)["user"]


async def get_current_user(
    session: AsyncSession,
    authorization: str | None = Header(default=None),
    x_telegram_init_data: str | None = Header(default=None),
) -> User:
    if authorization and authorization.lower().startswith("bearer "):
        payload = decode_jwt(authorization[7:].strip())
        user_id = int(payload.get("sub") or 0)
        user = await session.get(User, user_id)
        if not user:
            raise AppError("invalid_token", "Пользователь не найден", 401)
        return user

    init_data = x_telegram_init_data
    if authorization and authorization.lower().startswith("tma "):
        init_data = authorization[4:]
    if not init_data:
        logger.warning("Telegram auth failed: initData header is missing")
        raise AppError("invalid_init_data", "Telegram initData header is required", 401)
    tg_user = get_telegram_user_from_init_data(init_data)
    return await get_or_create_user(session, tg_user)
