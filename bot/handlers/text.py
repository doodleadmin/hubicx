import logging

from aiogram import F, Router
from aiogram.types import Message

from bot.keyboards.models import webapp_models_keyboard

router = Router()
logger = logging.getLogger(__name__)


@router.message(F.text.regexp(r".*Текст.*"))
async def text_menu(message: Message) -> None:
    logger.info("TEXT HANDLER TRIGGERED text=%s user_id=%s", message.text, message.from_user.id)
    try:
        items = [("Чат с ИИ", "ai_chat"), ("Расшифровка голосовых", "voice_transcription")]
        await message.answer("📄 Выберите пункт:", reply_markup=webapp_models_keyboard(items))
    except Exception:
        logger.exception("Text handler failed")
        await message.answer("Ошибка при открытии раздела Текст")
