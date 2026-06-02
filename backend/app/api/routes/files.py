import logging
from uuid import uuid4

from fastapi import APIRouter, Depends, UploadFile, File as FastAPIFile
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import File, User
from backend.app.db.session import get_session
from backend.app.schemas.generations import FileUploadOut
from backend.app.services.storage import storage_configured, storage_service
from backend.app.utils.errors import AppError

router = APIRouter(prefix="/files", tags=["files"])
logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 20 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff",
    "video/mp4", "video/webm", "video/quicktime",
    "audio/mpeg", "audio/wav", "audio/ogg",
}


@router.post("/upload", response_model=FileUploadOut)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> FileUploadOut:
    if not storage_configured():
        raise AppError("storage_not_configured", "Хранилище файлов не настроено", 500)

    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise AppError("invalid_content_type", f"Тип файла '{content_type}' не поддерживается")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise AppError("file_too_large", f"Файл слишком большой. Максимум {MAX_FILE_SIZE // 1024 // 1024}MB")

    ext = _extension_from_content_type(content_type)
    key = f"inputs/{user.id}/{uuid4().hex}{ext}"

    stored = await storage_service.upload_bytes(content, key, content_type)

    file_obj = File(
        user_id=user.id,
        file_type="input",
        purpose="input",
        storage_url=stored.url,
        mime_type=stored.mime_type,
        size_bytes=stored.size_bytes,
    )
    session.add(file_obj)
    await session.commit()
    await session.refresh(file_obj)

    logger.info("FILE_UPLOAD user_id=%s file_id=%s size=%s type=%s", user.id, file_obj.id, stored.size_bytes, content_type)
    return FileUploadOut(file_id=file_obj.id, url=stored.url)


def _extension_from_content_type(content_type: str) -> str:
    mapping = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/bmp": ".bmp",
        "image/tiff": ".tiff",
        "video/mp4": ".mp4",
        "video/webm": ".webm",
        "video/quicktime": ".mov",
        "audio/mpeg": ".mp3",
        "audio/wav": ".wav",
        "audio/ogg": ".ogg",
    }
    return mapping.get(content_type.split(";")[0].strip().lower(), ".bin")
