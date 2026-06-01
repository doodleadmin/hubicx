from dataclasses import dataclass


@dataclass
class StoredFile:
    url: str
    size_bytes: int | None = None
    mime_type: str | None = None


class StorageService:
    async def save_from_url(self, user_id: int, url: str) -> StoredFile:
        return StoredFile(url=url)


storage_service = StorageService()
