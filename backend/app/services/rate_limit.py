"""Redis-backed fixed-window rate limiting for per-user endpoint throttling."""

import logging

from fastapi import Request
import redis.asyncio as aioredis

from backend.app.config import settings
from backend.app.utils.errors import AppError

logger = logging.getLogger(__name__)

_redis: aioredis.Redis | None = None


def _get_client() -> aioredis.Redis | None:
    global _redis
    if _redis is None:
        try:
            _redis = aioredis.from_url(settings.redis_url, decode_responses=True)
        except Exception as exc:
            logger.warning("Rate limiter: failed to init Redis client: %s", exc)
            return None
    return _redis


async def check_rate_limit(key: str, max_requests: int, window_seconds: int) -> None:
    """
    Fixed-window counter. Raises AppError(429) when the limit is exceeded.

    Fails open: if Redis is unavailable, the request is allowed through so a
    cache outage never blocks generation or chat.
    """
    client = _get_client()
    if client is None:
        return

    redis_key = f"ratelimit:{key}"
    try:
        current = await client.incr(redis_key)
        if current == 1:
            await client.expire(redis_key, window_seconds)
    except Exception as exc:
        logger.warning("Rate limiter: Redis error on key %s: %s", redis_key, exc)
        return  # fail open

    if current > max_requests:
        try:
            ttl = await client.ttl(redis_key)
        except Exception:
            ttl = window_seconds
        retry_after = ttl if ttl and ttl > 0 else window_seconds
        raise AppError(
            "rate_limited",
            f"Слишком много запросов. Попробуйте через {retry_after} сек.",
            429,
        )


def client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for", "")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip() or "unknown"
    real_ip = request.headers.get("x-real-ip", "").strip()
    if real_ip:
        return real_ip
    return request.client.host if request.client else "unknown"


async def check_ip_rate_limit(request: Request, scope: str, max_requests: int, window_seconds: int) -> None:
    await check_rate_limit(f"ip:{scope}:{client_ip(request)}", max_requests, window_seconds)


async def check_user_rate_limit(user_id: int, scope: str, max_requests: int, window_seconds: int) -> None:
    await check_rate_limit(f"user:{user_id}:{scope}", max_requests, window_seconds)
