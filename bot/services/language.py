from sqlalchemy import select

from backend.app.db.models import User
from backend.app.db.session import async_session
from bot.i18n import normalize_lang


async def get_user_language(telegram_id: int | None) -> str:
    if telegram_id is None:
        return "ru"
    async with async_session() as session:
        user = await session.scalar(select(User).where(User.telegram_id == telegram_id))
        return normalize_lang(user.language_code if user else None)
