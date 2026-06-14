"""Password hashing (bcrypt) and session tokens (JWT) for email/password auth."""
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from backend.app.config import settings
from backend.app.utils.errors import AppError

_ALGO = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str | None) -> bool:
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: int) -> str:
    if not settings.jwt_signing_key:
        raise AppError("server_misconfigured", "JWT signing key is not configured", 500)
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=settings.jwt_ttl_days)).timestamp()),
        "typ": "access",
    }
    return jwt.encode(payload, settings.jwt_signing_key, algorithm=_ALGO)


def decode_access_token(token: str) -> int:
    if not settings.jwt_signing_key:
        raise AppError("server_misconfigured", "JWT signing key is not configured", 500)
    try:
        payload = jwt.decode(token, settings.jwt_signing_key, algorithms=[_ALGO])
    except jwt.ExpiredSignatureError:
        raise AppError("token_expired", "Сессия истекла, войдите снова", 401)
    except jwt.InvalidTokenError:
        raise AppError("invalid_token", "Недействительный токен", 401)
    sub = payload.get("sub")
    if not sub:
        raise AppError("invalid_token", "Недействительный токен", 401)
    try:
        return int(sub)
    except (ValueError, TypeError):
        raise AppError("invalid_token", "Недействительный токен", 401)
