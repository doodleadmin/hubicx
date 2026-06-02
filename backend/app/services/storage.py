import asyncio
from dataclasses import dataclass

import boto3
from botocore.config import Config

from backend.app.config import settings


@dataclass
class StoredFile:
    url: str
    size_bytes: int | None = None
    mime_type: str | None = None
    key: str | None = None


def storage_configured() -> bool:
    return all([settings.s3_endpoint, settings.s3_access_key, settings.s3_secret_key, settings.s3_bucket, settings.s3_public_url])


async def upload_bytes(content: bytes, key: str, content_type: str) -> str:
    if not storage_configured():
        raise RuntimeError("Storage is not configured")

    def _upload() -> str:
        client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint,
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            config=Config(signature_version="s3v4"),
        )
        client.put_object(
            Bucket=settings.s3_bucket,
            Key=key,
            Body=content,
            ContentType=content_type,
        )
        return f"{settings.s3_public_url.rstrip('/')}/{key}"

    return await asyncio.to_thread(_upload)


class StorageService:
    async def upload_bytes(self, content: bytes, key: str, content_type: str) -> StoredFile:
        url = await upload_bytes(content, key, content_type)
        return StoredFile(url=url, size_bytes=len(content), mime_type=content_type, key=key)


def generate_presigned_url(key: str, expires_in: int = 3600) -> str:
    if not storage_configured():
        raise RuntimeError("Storage is not configured")
    client = boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        config=Config(signature_version="s3v4"),
    )
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.s3_bucket, "Key": key},
        ExpiresIn=expires_in,
    )


storage_service = StorageService()
