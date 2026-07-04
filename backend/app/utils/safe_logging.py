"""Small structured logging helpers that avoid leaking secrets."""

from __future__ import annotations

import json
import logging
from collections.abc import Mapping, Sequence
from typing import Any


_SENSITIVE_MARKERS = (
    "authorization",
    "cookie",
    "password",
    "secret",
    "token",
    "signature",
    "api_key",
    "access_key",
    "private_key",
    "payment_requisites",
)


def _is_sensitive_key(key: str) -> bool:
    normalized = key.lower().replace("-", "_")
    return any(marker in normalized for marker in _SENSITIVE_MARKERS)


def _safe_value(value: Any, key: str = "") -> Any:
    if key and _is_sensitive_key(key):
        return "<redacted>"
    if value is None or isinstance(value, bool | int | float):
        return value
    if isinstance(value, str):
        return value if len(value) <= 240 else value[:237] + "..."
    if isinstance(value, Mapping):
        return {str(k): _safe_value(v, str(k)) for k, v in value.items()}
    if isinstance(value, Sequence) and not isinstance(value, bytes | bytearray | str):
        return [_safe_value(v, key) for v in list(value)[:20]]
    return str(value)


def safe_context(**fields: Any) -> dict[str, Any]:
    return {str(key): _safe_value(value, str(key)) for key, value in fields.items()}


def _format_value(value: Any) -> str:
    if isinstance(value, str) and value and all(ch not in value for ch in ' \t\n\r"='):
        return value
    return json.dumps(value, ensure_ascii=True, sort_keys=True, default=str)


def log_event(logger: logging.Logger, level: int, event: str, **fields: Any) -> None:
    context = safe_context(**fields)
    suffix = " ".join(f"{key}={_format_value(context[key])}" for key in sorted(context))
    logger.log(level, "%s%s%s", event, " " if suffix else "", suffix)
