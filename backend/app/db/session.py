from collections.abc import AsyncGenerator
import sys

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from backend.app.config import settings


def _running_under_celery() -> bool:
    """Celery tasks call async code via asyncio.run(), creating a new loop per task.

    asyncpg connections are bound to the loop where they were created. Reusing
    pooled connections across Celery task loops can crash with
    "Event loop is closed" / "TCPTransport closed". Keep normal pooling for
    the API process, but disable pooling for Celery worker/beat processes.
    """

    return any("celery" in str(arg).lower() for arg in sys.argv)


engine_kwargs = {"pool_pre_ping": True}
if _running_under_celery():
    engine_kwargs["poolclass"] = NullPool

engine = create_async_engine(settings.database_url, **engine_kwargs)
async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
