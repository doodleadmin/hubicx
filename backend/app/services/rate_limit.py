"""Redis-backed fixed-window rate limiting for per-user endpoint throttling."""

import logging
import time

from fastapi import Request
import redis.asyncio as aioredis

from backend.app.config import settings
from backend.app.utils.errors import AppError

logger = logging.getLogger(__name__)

_redis: aioredis.Redis | None = None

# Per-process fallback used only when Redis is unavailable AND the scope is
# security-critical (fail_closed=True). Prevents a Redis outage from disabling
# brute-force / spam protection on auth, admin and email flows. Best-effort:
# with a single API worker this is effective; it is intentionally simple.
_local_buckets: dict[str, tuple[int, float]] = {}


def _get_client() -> aioredis.Redis | None:
    global _redis
    if _redis is None:
        try:
            _redis = aioredis.from_url(settings.redis_url, decode_responses=True)
        except Exception as exc:
            logger.warning("Rate limiter: failed to init Redis client: %s", exc)
            return None
    return _redis


def _local_incr(key: str, window_seconds: int) -> int:
    """Fixed-window counter kept in process memory. Returns the new count."""
    now = time.time()
    count, expiry = _local_buckets.get(key, (0, 0.0))
    if now >= expiry:
        count, expiry = 0, now + window_seconds
    count += 1
    _local_buckets[key] = (count, expiry)
    # Opportunistic cleanup so the dict does not grow unbounded.
    if len(_local_buckets) > 10_000:
        for k, (_, exp) in list(_local_buckets.items()):
            if now >= exp:
                _local_buckets.pop(k, None)
    return count


def _reject(retry_after: int) -> None:
    raise AppError(
        "rate_limited",
        f"Слишком много запросов. Попробуйте через {retry_after} сек.",
        429,
    )


async def check_rate_limit(
    key: str,
    max_requests: int,
    window_seconds: int,
    fail_closed: bool = False,
) -> None:
    """
    Fixed-window counter. Raises AppError(429) when the limit is exceeded.

    Redis is the primary backend. If Redis is unavailable:
    - fail_closed=False (default): the request is allowed through so a cache
      outage never blocks generation or chat.
    - fail_closed=True: an in-process fallback still enforces the limit, so a
      Redis outage cannot silently disable brute-force / spam protection on
      security-critical flows (auth, admin, email codes).
    """
    client = _get_client()
    redis_key = f"ratelimit:{key}"

    if client is not None:
        try:
            current = await client.incr(redis_key)
            if current == 1:
                await client.expire(redis_key, window_seconds)
            if current > max_requests:
                try:
                    ttl = await client.ttl(redis_key)
                except Exception:
                    ttl = window_seconds
                _reject(ttl if ttl and ttl > 0 else window_seconds)
            return
        except Exception as exc:
            logger.warning("Rate limiter: Redis error on key %s: %s", redis_key, exc)
            # fall through to fallback handling below

    if not fail_closed:
        return  # fail open for non-critical scopes

    if _local_incr(redis_key, window_seconds) > max_requests:
        _reject(window_seconds)


def client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for", "")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip() or "unknown"
    real_ip = request.headers.get("x-real-ip", "").strip()
    if real_ip:
        return real_ip
    return request.client.host if request.client else "unknown"


async def check_ip_rate_limit(
    request: Request, scope: str, max_requests: int, window_seconds: int, fail_closed: bool = False
) -> None:
    await check_rate_limit(f"ip:{scope}:{client_ip(request)}", max_requests, window_seconds, fail_closed)


async def check_user_rate_limit(
    user_id: int, scope: str, max_requests: int, window_seconds: int, fail_closed: bool = False
) -> None:
    await check_rate_limit(f"user:{user_id}:{scope}", max_requests, window_seconds, fail_closed)
