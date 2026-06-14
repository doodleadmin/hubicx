import hashlib
import hmac
import json
import logging
import time
from urllib.parse import parse_qsl

from fastapi import Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.config import settings
from backend.app.db.models import User
from backend.app.services.users import get_or_create_user
from backend.app.utils.errors import AppError

logger = logging.getLogger(__name__)

AUTH_DATE_TTL = 86400  # 24 hours — reject initData older than this


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
    # Check auth_date TTL to prevent replay of leaked initData
    auth_date = parsed.get("auth_date")
    if auth_date:
        try:
            age_seconds = time.time() - int(auth_date)
            if age_seconds > AUTH_DATE_TTL:
                raise AppError("init_data_expired", "Telegram initData has expired. Please reopen the app.", 401)
        except (ValueError, TypeError):
            raise AppError("invalid_init_data", "Invalid auth_date in Telegram initData", 401)
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
    # 1) Email/password session — Authorization: Bearer <jwt>
    if authorization and authorization.lower().startswith("bearer "):
        from backend.app.db.models import User as UserModel
        from backend.app.services.auth_jwt import decode_access_token

        token = authorization[7:].strip()
        user_id = decode_access_token(token)
        user = await session.get(UserModel, user_id)
        if not user:
            raise AppError("invalid_token", "Аккаунт не найден", 401)
        return user

    # 2) Telegram WebApp — initData header (or Authorization: tma <initData>)
    init_data = x_telegram_init_data
    if authorization and authorization.lower().startswith("tma "):
        init_data = authorization[4:]
    if not init_data:
        logger.warning("Auth failed: no Bearer token and no Telegram initData")
        raise AppError("invalid_init_data", "Требуется авторизация", 401)
    tg_user = get_telegram_user_from_init_data(init_data)
    return await get_or_create_user(session, tg_user)
