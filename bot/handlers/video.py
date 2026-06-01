import logging

from aiogram import F, Router
from aiogram.types import Message
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
    try:
        async with async_session() as session:
            result = await session.execute(
                select(AIModel).where(AIModel.code.in_(VIDEO_MODEL_CODES), AIModel.is_active.is_(True)).order_by(AIModel.sort_order)
            )
            items = [(model.title, model.code) for model in result.scalars().all()]
        await message.answer("🎥 Выберите модель генерации видео:", reply_markup=webapp_models_keyboard(items))
    except Exception:
        logger.exception("Video handler failed")
        await message.answer("Ошибка при открытии раздела Видео")
