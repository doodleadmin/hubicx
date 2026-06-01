from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import User
from backend.app.db.session import get_session
from backend.app.services.telegram_auth import get_current_user as auth_current_user


async def current_user(
    session: AsyncSession = Depends(get_session),
    authorization: str | None = Header(default=None),
    x_telegram_init_data: str | None = Header(default=None),
) -> User:
    return await auth_current_user(session, authorization, x_telegram_init_data)
