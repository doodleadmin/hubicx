import logging

from aiogram import F, Router
from aiogram.types import InlineKeyboardMarkup, Message

from bot.i18n import t
from bot.keyboards.models import webapp_models_keyboard
from bot.services.language import get_user_language

router = Router()
logger = logging.getLogger(__name__)

TEXT_ICON_MAP = {
    "ai_chat": "ai_chat",
    "voice_transcription": "prompt_helper",
}


@router.message(F.text.regexp(r".*Текст.*"))
async def text_menu(message: Message) -> None:
    logger.info("TEXT HANDLER TRIGGERED user_id=%s", message.from_user.id)
    await show_text_menu(message)


async def show_text_menu(message: Message) -> None:
    lang = await get_user_language(message.from_user.id if message.from_user else None)
    try:
        text, reply_markup = build_text_menu(lang)
        await message.answer(text, reply_markup=reply_markup)
    except Exception:
        logger.exception("Text handler failed")
        await message.answer(t(lang, "common.error.text"))


def build_text_menu(lang: str = "ru") -> tuple[str, InlineKeyboardMarkup]:
    items = [(t(lang, "text.chat"), "ai_chat"), (t(lang, "text.transcription"), "voice_transcription")]
    return t(lang, "text.choose"), webapp_models_keyboard(items, lang=lang, icon_map=TEXT_ICON_MAP)
