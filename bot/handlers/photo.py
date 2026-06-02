import logging

from aiogram import F, Router
from aiogram.types import InlineKeyboardMarkup, Message
from sqlalchemy import select

from backend.app.db.models import AIModel
from backend.app.db.session import async_session
from bot.keyboards.models import webapp_models_keyboard

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


@router.message(F.text.regexp(r".*Фото.*"))
async def photo_models(message: Message) -> None:
    logger.info("PHOTO HANDLER TRIGGERED text=%s user_id=%s", message.text, message.from_user.id)
    await show_photo_menu(message)


async def show_photo_menu(message: Message) -> None:
    try:
        text, reply_markup = await build_photo_menu()
        await message.answer(text, reply_markup=reply_markup)
    except Exception:
        logger.exception("Photo handler failed")
        await message.answer("Ошибка при открытии раздела Фото")


async def build_photo_menu() -> tuple[str, InlineKeyboardMarkup]:
    async with async_session() as session:
        result = await session.execute(
            select(AIModel).where(AIModel.code.in_(PHOTO_MODEL_CODES), AIModel.is_active.is_(True)).order_by(AIModel.sort_order)
        )
        items = [(PHOTO_BUTTON_TITLES.get(model.code, model.title), model.code) for model in result.scalars().all()]
    return "🖼 Выберите модель генерации изображений:", webapp_models_keyboard(items)
