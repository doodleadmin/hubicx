import logging

from aiogram import F, Router
from aiogram.types import InlineKeyboardMarkup, Message
from sqlalchemy import select

from backend.app.db.models import User
from backend.app.db.session import async_session
from bot.i18n import t
from bot.keyboards.models import balance_keyboard
from bot.services.language import get_user_language

router = Router()
logger = logging.getLogger(__name__)


@router.message(F.text.regexp(r".*Баланс.*"))
async def balance(message: Message) -> None:
    logger.info("BALANCE HANDLER TRIGGERED user_id=%s", message.from_user.id)
    await show_balance_menu(message)


async def show_balance_menu(message: Message, user_id: int | None = None) -> None:
    lang = await get_user_language(user_id or (message.from_user.id if message.from_user else None))
    try:
        telegram_id = user_id or message.from_user.id
        text, reply_markup = await build_balance_menu(telegram_id, lang)
        if reply_markup is None:
            await message.answer(text)
            return
        await message.answer(text, reply_markup=reply_markup)
    except Exception:
        logger.exception("Balance handler failed")
        await message.answer(t(lang, "common.error.balance"))


async def build_balance_menu(telegram_id: int, lang: str | None = None) -> tuple[str, InlineKeyboardMarkup | None]:
    async with async_session() as session:
        user = await session.scalar(select(User).where(User.telegram_id == telegram_id))
        if not user:
            return t(lang, "common.start_first"), None
        lang = lang or user.language_code
        text = f"{t(lang, 'balance.title', balance=user.balance_credits)}\n\n{t(lang, 'balance.description')}"
    return text, balance_keyboard(lang)
