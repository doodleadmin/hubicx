import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import File
from backend.app.utils.errors import AppError

logger = logging.getLogger(__name__)

ALLOWED_FIELD_TYPES = {"textarea", "text", "select", "number", "switch", "file", "files", "hidden"}


def _parse_switch(value: Any, label: str) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"true", "1", "yes", "on"}:
            return True
        if normalized in {"false", "0", "no", "off"}:
            return False
    if isinstance(value, int) and value in {0, 1}:
        return bool(value)
    raise AppError("validation_error", f"Поле '{label}' должно быть переключателем")


def _mime_matches_accept(mime_type: str | None, accept: str | None) -> bool:
    if not accept or not mime_type:
        return True
    accepted = [part.strip() for part in accept.split(",") if part.strip()]
    for rule in accepted:
        if rule.endswith("/*") and mime_type.startswith(rule[:-1]):
            return True
        if mime_type == rule:
            return True
    return False


def _check_file_size(file_obj: File, field: dict[str, Any]) -> None:
    max_size_mb = field.get("max_size_mb")
    if max_size_mb is None or file_obj.size_bytes is None:
        return
    try:
        limit = int(max_size_mb) * 1024 * 1024
    except (TypeError, ValueError):
        return
    if file_obj.size_bytes > limit:
        raise AppError("validation_error", f"Файл {file_obj.id} слишком большой для поля '{field.get('label', field['name'])}'")


def validate_inputs_against_schema(
    form_schema: dict[str, Any] | None,
    inputs: dict[str, Any] | None,
    default_params: dict[str, Any] | None,
    *,
    for_preview: bool = False,
) -> tuple[dict[str, Any], dict[str, Any]]:
    """Validate inputs against form_schema and return (validated_inputs, provider_input).
    
    When for_preview=True, required checks are skipped for file/image fields
    so price-preview works without actual uploads.
    """
    if not form_schema or not form_schema.get("fields"):
        return inputs or {}, inputs or {}

    fields = form_schema["fields"]
    field_map: dict[str, dict[str, Any]] = {}
    for field in fields:
        field_map[field["name"]] = field

    raw_inputs = inputs or {}
    extra_keys = set(raw_inputs) - set(field_map)
    if extra_keys:
        # Drop unknown keys instead of failing: the simplified webapp UI sends a generic
        # set of inputs (e.g. aspect_ratio) that does not match every model's schema.
        logger.info("Dropping unknown input keys for model schema: %s", sorted(extra_keys))
        raw_inputs = {k: v for k, v in raw_inputs.items() if k in field_map}

    validated: dict[str, Any] = {}
    provider_input: dict[str, Any] = {}

    for field in fields:
        name = field["name"]
        field_type = field.get("type", "text")
        required = field.get("required", False)
        default = field.get("default")
        provider_key = field.get("provider_key") or name

        value = raw_inputs.get(name)

        if value is None:
            # For preview: skip required check for file/image fields and any missing field
            if for_preview:
                if default is not None:
                    validated[name] = default
                    if field_type not in ("file", "files"):
                        provider_input[provider_key] = default
                continue
            if required and default is None:
                raise AppError("validation_error", f"Поле '{field.get('label', name)}' обязательно")
            if default is not None:
                value = default
            elif not required:
                continue

        if value is not None:
            if field_type == "files":
                if not isinstance(value, list):
                    raise AppError("validation_error", f"Поле '{field.get('label', name)}' должно быть списком файлов")
                min_files = int(field.get("min_files", 1 if required else 0))
                max_files = int(field.get("max_files", 4))
                if len(value) < min_files:
                    raise AppError("validation_error", f"Минимум {min_files} файлов для '{field.get('label', name)}'")
                if len(value) > max_files:
                    raise AppError("validation_error", f"Максимум {max_files} файлов для '{field.get('label', name)}'")
            if field_type == "select":
                options = field.get("options", [])
                if options and str(value) not in [str(o) for o in options]:
                    # Fall back to default (or first option) instead of failing, so a generic
                    # client value like aspect_ratio "2:3" doesn't block models with other options.
                    fallback = default if default is not None else options[0]
                    logger.info("Invalid select '%s'=%r for model field; using %r", name, value, fallback)
                    value = fallback
            if field_type == "number":
                try:
                    value = int(value) if isinstance(value, int) or (isinstance(value, str) and value.isdigit()) else float(value)
                except (ValueError, TypeError):
                    raise AppError("validation_error", f"Поле '{field.get('label', name)}' должно быть числом")
                if field.get("min") is not None and value < field["min"]:
                    raise AppError("validation_error", f"Минимум для '{field.get('label', name)}': {field['min']}")
                if field.get("max") is not None and value > field["max"]:
                    raise AppError("validation_error", f"Максимум для '{field.get('label', name)}': {field['max']}")
            if field_type == "switch":
                value = _parse_switch(value, field.get("label", name))

        validated[name] = value
        if field_type not in ("file", "files"):
            provider_input[provider_key] = value

    return validated, provider_input


async def resolve_input_files(
    session: AsyncSession,
    user_id: int,
    inputs: dict[str, Any],
    form_schema: dict[str, Any] | None,
) -> dict[str, Any]:
    """Resolve file_ids/urls in inputs to actual URLs, checking ownership."""
    if not form_schema or not form_schema.get("fields"):
        return inputs

    result = dict(inputs)
    for field in form_schema["fields"]:
        name = field["name"]
        field_type = field.get("type", "text")
        provider_key = field.get("provider_key") or name

        if field_type == "files" and name in result:
            file_ids = result[name]
            if not isinstance(file_ids, list):
                raise AppError("validation_error", f"Поле '{field.get('label', name)}' должно быть списком файлов")
            max_files = field.get("max_files", 4)
            if len(file_ids) > max_files:
                raise AppError("validation_error", f"Максимум {max_files} файлов для '{field.get('label', name)}'")
            urls = []
            for fid in file_ids:
                # The webapp uploads to S3 and passes back ready URLs; the bot passes file_ids.
                if isinstance(fid, str) and fid.startswith("http"):
                    urls.append(fid)
                    continue
                if not isinstance(fid, int):
                    raise AppError("validation_error", "Некорректный file_id")
                file_obj = await session.scalar(select(File).where(File.id == fid, File.user_id == user_id))
                if not file_obj:
                    raise AppError("file_not_found", f"Файл {fid} не найден", 404)
                if file_obj.purpose != "input":
                    raise AppError("validation_error", f"Файл {fid} нельзя использовать как входной")
                if not _mime_matches_accept(file_obj.mime_type, field.get("accept")):
                    raise AppError("validation_error", f"Файл {fid} не подходит для поля '{field.get('label', name)}'")
                _check_file_size(file_obj, field)
                urls.append(file_obj.storage_url)
            result[name] = urls
            result[f"{name}_resolved"] = urls

        elif field_type == "file" and name in result:
            fid = result[name]
            if isinstance(fid, str) and fid.startswith("http"):
                # Ready S3 URL from the webapp uploader.
                result[name] = fid
                result[f"{name}_resolved"] = fid
            elif isinstance(fid, int):
                file_obj = await session.scalar(select(File).where(File.id == fid, File.user_id == user_id))
                if not file_obj:
                    raise AppError("file_not_found", f"Файл {fid} не найден", 404)
                if file_obj.purpose != "input":
                    raise AppError("validation_error", f"Файл {fid} нельзя использовать как входной")
                if not _mime_matches_accept(file_obj.mime_type, field.get("accept")):
                    raise AppError("validation_error", f"Файл {fid} не подходит для поля '{field.get('label', name)}'")
                _check_file_size(file_obj, field)
                result[name] = file_obj.storage_url
                result[f"{name}_resolved"] = file_obj.storage_url
            else:
                raise AppError("validation_error", "Некорректный file_id")

    return result


def build_provider_input_from_resolved(
    validated_inputs: dict[str, Any],
    form_schema: dict[str, Any] | None,
) -> dict[str, Any]:
    """Build provider_input from validated inputs with resolved file URLs."""
    if not form_schema or not form_schema.get("fields"):
        return validated_inputs

    provider_input: dict[str, Any] = {}
    for field in form_schema["fields"]:
        name = field["name"]
        provider_key = field.get("provider_key") or name
        field_type = field.get("type", "text")

        if field_type in ("file", "files"):
            resolved_key = f"{name}_resolved"
            if resolved_key in validated_inputs:
                provider_input[provider_key] = validated_inputs[resolved_key]
            elif name in validated_inputs:
                provider_input[provider_key] = validated_inputs[name]
        elif name in validated_inputs:
            provider_input[provider_key] = validated_inputs[name]

    return provider_input
