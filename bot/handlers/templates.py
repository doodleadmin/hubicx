import logging

from aiogram import F, Router
from aiogram.types import InlineKeyboardMarkup, Message
from sqlalchemy import select

from backend.app.db.models import Template
from backend.app.db.session import async_session
from bot.i18n import t
from bot.keyboards.models import webapp_models_keyboard
from bot.services.language import get_user_language

router = Router()
logger = logging.getLogger(__name__)
TEMPLATE_CODES = [
    "enhance_4k",
    "photo_to_prompt",
    "chat_to_song",
    "add_beer",
    "photo_gx",
    "light_aura",
    "broadcast",
    "formula_1",
    "doll_unboxing",
    "ai_avatar",
    "graduation",
]
TEMPLATE_ICON_MAP = {
    "enhance_4k": "flux_schnell",
    "photo_to_prompt": "prompt_helper",
    "chat_to_song": "ai_chat",
    "add_beer": "add_beer",
    "photo_gx": "photo",
    "light_aura": "seedream",
    "broadcast": "video",
    "formula_1": "z_image",
    "doll_unboxing": "doll_unboxing",
    "ai_avatar": "ai_chat",
    "graduation": "templates",
}


@router.message(F.text.regexp(r".*Шаблоны.*"))
async def templates(message: Message) -> None:
    logger.info("TEMPLATES HANDLER TRIGGERED text=%s user_id=%s", message.text, message.from_user.id)
    await show_templates_menu(message)


async def show_templates_menu(message: Message) -> None:
    lang = await get_user_language(message.from_user.id if message.from_user else None)
    try:
        text, reply_markup = await build_templates_menu(lang)
        await message.answer(text, reply_markup=reply_markup)
    except Exception:
        logger.exception("Templates handler failed")
        await message.answer(t(lang, "common.error.templates"))


async def build_templates_menu(lang: str = "ru") -> tuple[str, InlineKeyboardMarkup]:
    async with async_session() as session:
        result = await session.execute(select(Template).where(Template.code.in_(TEMPLATE_CODES), Template.is_active.is_(True)).order_by(Template.sort_order))
        items = [(template.title, template.code) for template in result.scalars().all()]
    return t(lang, "templates.choose"), webapp_models_keyboard(items, route="template", param="code", lang=lang, icon_map=TEMPLATE_ICON_MAP)
