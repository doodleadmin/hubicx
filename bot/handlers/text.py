import logging

from aiogram import F, Router
from aiogram.types import InlineKeyboardMarkup, Message

from bot.keyboards.models import webapp_models_keyboard

router = Router()
logger = logging.getLogger(__name__)


@router.message(F.text.regexp(r".*Текст.*"))
async def text_menu(message: Message) -> None:
    logger.info("TEXT HANDLER TRIGGERED text=%s user_id=%s", message.text, message.from_user.id)
    await show_text_menu(message)


async def show_text_menu(message: Message) -> None:
    try:
        text, reply_markup = build_text_menu()
        await message.answer(text, reply_markup=reply_markup)
    except Exception:
        logger.exception("Text handler failed")
        await message.answer("Ошибка при открытии раздела Текст")


def build_text_menu() -> tuple[str, InlineKeyboardMarkup]:
    items = [("Чат с ИИ", "ai_chat"), ("Расшифровка голосовых", "voice_transcription")]
    return "📄 Выберите пункт:", webapp_models_keyboard(items)
