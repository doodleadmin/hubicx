import logging

from aiogram import F, Router
from aiogram.types import InlineKeyboardMarkup, Message
from sqlalchemy import select

from backend.app.db.models import Template
from backend.app.db.session import async_session
from bot.keyboards.models import webapp_models_keyboard

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


@router.message(F.text.regexp(r".*Шаблоны.*"))
async def templates(message: Message) -> None:
    logger.info("TEMPLATES HANDLER TRIGGERED text=%s user_id=%s", message.text, message.from_user.id)
    await show_templates_menu(message)


async def show_templates_menu(message: Message) -> None:
    try:
        text, reply_markup = await build_templates_menu()
        await message.answer(text, reply_markup=reply_markup)
    except Exception:
        logger.exception("Templates handler failed")
        await message.answer("Ошибка при открытии раздела Шаблоны")


async def build_templates_menu() -> tuple[str, InlineKeyboardMarkup]:
    async with async_session() as session:
        result = await session.execute(select(Template).where(Template.code.in_(TEMPLATE_CODES), Template.is_active.is_(True)).order_by(Template.sort_order))
        items = [(template.title, template.code) for template in result.scalars().all()]
    return "🧩 Шаблоны\n\nКаждый пресет уже настроен с оптимальными параметрами.", webapp_models_keyboard(items, route="template", param="code")
