import logging

from aiogram import F, Router
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message
from sqlalchemy import select

from backend.app.db.models import AIModel
from backend.app.db.session import async_session
from bot.keyboards.models import webapp_models_keyboard

router = Router()
logger = logging.getLogger(__name__)
VIDEO_MODEL_CODES = ["seedance", "veo", "kling", "grok_video", "happyhorse", "gemini_omni"]


@router.message(F.text.regexp(r".*Видео.*"))
async def video_models(message: Message) -> None:
    logger.info("VIDEO HANDLER TRIGGERED text=%s user_id=%s", message.text, message.from_user.id)
    await show_video_menu(message)


async def show_video_menu(message: Message) -> None:
    try:
        text, reply_markup = await build_video_menu()
        await message.answer(text, reply_markup=reply_markup)
    except Exception:
        logger.exception("Video handler failed")
        await message.answer("Ошибка при открытии раздела Видео")


async def build_video_menu() -> tuple[str, InlineKeyboardMarkup]:
    async with async_session() as session:
        result = await session.execute(
            select(AIModel).where(AIModel.code.in_(VIDEO_MODEL_CODES), AIModel.is_active.is_(True)).order_by(AIModel.sort_order)
        )
        items = [(model.title, model.code) for model in result.scalars().all()]
    if not items:
        return (
            "🎬 Видео-модели скоро появятся\n\n"
            "Мы уже готовим Kling / Seedance / Veo / image-to-video модели.",
            InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="🏠 Главное меню", callback_data="main:home")]]),
        )
    return "🎥 Выберите модель генерации видео:", webapp_models_keyboard(items)
