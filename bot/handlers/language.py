import logging

from aiogram import F, Router
from aiogram.types import CallbackQuery, Message
from sqlalchemy import select

from backend.app.db.models import User
from backend.app.db.session import async_session
from bot.i18n import t
from bot.keyboards.language import language_keyboard
from bot.services.start_message import send_start_menu

router = Router()
logger = logging.getLogger(__name__)


async def show_language_selection(message: Message) -> None:
    await message.answer(t("ru", "language.choose"), reply_markup=language_keyboard())


@router.callback_query(F.data.startswith("lang:"))
async def set_language(callback: CallbackQuery) -> None:
    language = callback.data.split(":", 1)[1]
    async with async_session() as session:
        user = await session.scalar(select(User).where(User.telegram_id == callback.from_user.id))
        if user:
            user.language_code = language
            user.language_selected = True
            await session.commit()
    logger.info("LANGUAGE SELECTED lang=%s user_id=%s", language, callback.from_user.id)
    await callback.answer(t(language, "language.changed"))
    if callback.message and user:
        async with async_session() as session:
            fresh_user = await session.scalar(select(User).where(User.telegram_id == callback.from_user.id))
            if fresh_user:
                await send_start_menu(callback.message, session, fresh_user)


@router.message(F.text.regexp(r".*Русский.*"))
async def choose_language(message: Message) -> None:
    await show_language_selection(message)
