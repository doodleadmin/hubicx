import base64
import hashlib
import hmac
import json
import secrets
from datetime import datetime, timedelta, timezone

from backend.app.config import settings
from backend.app.utils.errors import AppError


def make_ref_code() -> str:
    return secrets.token_urlsafe(8).replace("-", "_")[:12]


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 200_000)
    return "pbkdf2_sha256$200000$" + salt + "$" + digest.hex()


def verify_password(password: str, password_hash: str | None) -> bool:
    if not password_hash:
        return False
    try:
        algo, iterations_raw, salt, expected = password_hash.split("$", 3)
        if algo != "pbkdf2_sha256":
            return False
        iterations = int(iterations_raw)
        digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations).hex()
        return hmac.compare_digest(digest, expected)
    except Exception:
        return False


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    return base64.urlsafe_b64decode(data + "=" * (-len(data) % 4))


def _jwt_key() -> bytes:
    key = settings.jwt_signing_key or settings.admin_panel_token or settings.bot_token
    if not key:
        raise AppError("jwt_not_configured", "JWT_SIGNING_KEY не настроен", 503)
    return key.encode("utf-8")


def create_jwt(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=settings.jwt_ttl_days)).timestamp()),
    }
    signing_input = _b64url(json.dumps(header, separators=(",", ":")).encode()) + "." + _b64url(json.dumps(payload, separators=(",", ":")).encode())
    sig = hmac.new(_jwt_key(), signing_input.encode("ascii"), hashlib.sha256).digest()
    return signing_input + "." + _b64url(sig)


def decode_jwt(token: str) -> dict:
    try:
        header_b64, payload_b64, sig_b64 = token.split(".", 2)
    except ValueError:
        raise AppError("invalid_token", "Неверный токен", 401)
    signing_input = header_b64 + "." + payload_b64
    expected = _b64url(hmac.new(_jwt_key(), signing_input.encode("ascii"), hashlib.sha256).digest())
    if not hmac.compare_digest(expected, sig_b64):
        raise AppError("invalid_token", "Неверный токен", 401)
    try:
        payload = json.loads(_b64url_decode(payload_b64))
    except Exception:
        raise AppError("invalid_token", "Неверный токен", 401)
    if int(payload.get("exp") or 0) < int(datetime.now(timezone.utc).timestamp()):
        raise AppError("token_expired", "Сессия истекла", 401)
    return payload
