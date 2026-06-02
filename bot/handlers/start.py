import logging

from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message

from backend.app.db.session import async_session
from backend.app.services.users import get_or_create_user
from bot.keyboards.language import language_keyboard
from bot.keyboards.main_menu import main_menu_keyboard
from bot.services.menu_messages import send_or_replace_menu

router = Router()
logger = logging.getLogger(__name__)


@router.message(CommandStart())
async def start(message: Message) -> None:
    payload = message.text.split(maxsplit=1)[1] if message.text and len(message.text.split(maxsplit=1)) > 1 else None
    async with async_session() as session:
        user = await get_or_create_user(session, message.from_user.model_dump(), payload)
        logger.info("START user_id=%s language_selected=%s language_code=%s", message.from_user.id, user.language_selected, user.language_code)
        if not user.language_selected:
            await send_or_replace_menu(message, session, user, "🌐 Выбор языка\n\nВыберите язык интерфейса:", language_keyboard())
            return
        await send_or_replace_menu(message, session, user, "Главное меню", main_menu_keyboard(user.language_code))
