from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message

from backend.app.db.session import async_session
from backend.app.services.users import get_or_create_user
from bot.keyboards.language import language_keyboard

router = Router()


@router.message(CommandStart())
async def start(message: Message) -> None:
    payload = message.text.split(maxsplit=1)[1] if message.text and len(message.text.split(maxsplit=1)) > 1 else None
    async with async_session() as session:
        await get_or_create_user(session, message.from_user.model_dump(), payload)
    await message.answer("🌐 Выбор языка\n\nВыберите язык интерфейса:", reply_markup=language_keyboard())
