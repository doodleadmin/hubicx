import logging

from aiogram import F, Router
from aiogram.types import InlineKeyboardMarkup, Message
from sqlalchemy import select

from backend.app.db.models import AIModel
from backend.app.db.session import async_session
from bot.i18n import t
from bot.keyboards.models import webapp_models_keyboard
from bot.services.language import get_user_language

router = Router()
logger = logging.getLogger(__name__)

PHOTO_MODEL_CODES = ["nano_banana_2", "nano_banana_pro", "nano_banana_edit", "flux_schnell", "gpt_image_2", "seedream", "grok_image", "z_image"]
PHOTO_BUTTON_TITLES = {
    "nano_banana_2": "🍌 Nano Banana 2",
    "nano_banana": "🍌 Nano Banana",
    "nano_banana_pro": "🍌 Nano Banana Pro",
    "nano_banana_edit": "🖼 Nano Banana Edit",
    "flux_schnell": "⚡ Fast Image",
    "seedream": "🌱 Seedream",
    "grok_image": "🧠 Grok Imagine",
    "z_image": "⚡ Z-Image",
}
PHOTO_ICON_MAP = {
    "nano_banana_2": "nano_banana_2",
    "nano_banana_pro": "nano_banana_pro",
    "nano_banana_edit": "nano_banana_edit",
    "flux_schnell": "flux_schnell",
    "seedream": "seedream",
    "gpt_image_2": "gpt_image_2",
    "grok_image": "grok_image",
    "z_image": "z_image",
}


@router.message(F.text.regexp(r".*Фото.*"))
async def photo_models(message: Message) -> None:
    logger.info("PHOTO HANDLER TRIGGERED text=%s user_id=%s", message.text, message.from_user.id)
    await show_photo_menu(message)


async def show_photo_menu(message: Message) -> None:
    lang = await get_user_language(message.from_user.id if message.from_user else None)
    try:
        text, reply_markup = await build_photo_menu(lang)
        await message.answer(text, reply_markup=reply_markup)
    except Exception:
        logger.exception("Photo handler failed")
        await message.answer(t(lang, "common.error.photo"))


async def build_photo_menu(lang: str = "ru") -> tuple[str, InlineKeyboardMarkup]:
    async with async_session() as session:
        result = await session.execute(
            select(AIModel).where(AIModel.code.in_(PHOTO_MODEL_CODES), AIModel.is_active.is_(True)).order_by(AIModel.sort_order)
        )
        items = [(PHOTO_BUTTON_TITLES.get(model.code, model.title), model.code) for model in result.scalars().all()]
    return t(lang, "photo.choose"), webapp_models_keyboard(items, lang=lang, icon_map=PHOTO_ICON_MAP)
