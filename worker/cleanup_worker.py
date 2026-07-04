"""Periodic purge of expired auth artifacts.

email_verification_codes stores a per-request IP address alongside the code
hash. Once a code is well past its usefulness (expired, and long enough that
no support/abuse investigation would still need it), keeping that IP around
serves no purpose and is unnecessary PII retention.
"""

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete

from backend.app.db.models import EmailVerificationCode
from backend.app.db.session import async_session, engine
from worker.celery_app import celery_app

logger = logging.getLogger(__name__)

EMAIL_CODE_RETENTION_DAYS = 30


async def _purge_email_codes() -> int:
    cutoff = datetime.now(timezone.utc) - timedelta(days=EMAIL_CODE_RETENTION_DAYS)
    async with async_session() as session:
        result = await session.execute(
            delete(EmailVerificationCode).where(EmailVerificationCode.created_at < cutoff)
        )
        await session.commit()
        return result.rowcount or 0


async def _run_purge_email_codes() -> int:
    try:
        return await _purge_email_codes()
    finally:
        await engine.dispose()


@celery_app.task(name="worker.cleanup_worker.purge_expired_email_codes")
def purge_expired_email_codes() -> dict:
    deleted = asyncio.run(_run_purge_email_codes())
    if deleted:
        logger.info("EMAIL_CODE_CLEANUP deleted=%s", deleted)
    return {"deleted": deleted}
