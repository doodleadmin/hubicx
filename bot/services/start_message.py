from pathlib import Path

from aiogram.exceptions import TelegramBadRequest
from aiogram.types import FSInputFile, Message
from aiogram.types import ReplyKeyboardRemove
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import User
from bot.i18n import t
from bot.keyboards.main_menu import main_menu_keyboard
from bot.services.menu_messages import delete_active_menu, save_active_menu


START_IMAGE_PATHS = {
    "ru": Path("bot/assets/start.PNG"),
    "en": Path("bot/assets/start_en.PNG"),
    "es": Path("bot/assets/start_es.PNG"),
    "pt": Path("bot/assets/start_pt.PNG"),
}


def get_start_image_path(language_code: str | None) -> Path:
    return START_IMAGE_PATHS.get((language_code or "ru")[:2].lower(), START_IMAGE_PATHS["ru"])


async def remove_reply_keyboard(message: Message) -> None:
    try:
        cleanup = await message.answer("Обновляю меню...", reply_markup=ReplyKeyboardRemove())
        await message.bot.delete_message(chat_id=cleanup.chat.id, message_id=cleanup.message_id)
    except TelegramBadRequest:
        return


async def send_start_menu(message: Message, session: AsyncSession, user: User) -> Message:
    await delete_active_menu(message.bot, user)
    await remove_reply_keyboard(message)
    sent = await message.answer_photo(
        photo=FSInputFile(get_start_image_path(user.language_code)),
        caption=t(user.language_code, "start.caption"),
        reply_markup=main_menu_keyboard(user.language_code),
    )
    await save_active_menu(session, user, sent.chat.id, sent.message_id)
    return sent
