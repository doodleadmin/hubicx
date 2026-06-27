import logging

from aiogram import F, Router
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message
from sqlalchemy import select

from backend.app.db.models import AIModel
from backend.app.db.session import async_session
from bot.custom_emoji import emoji_icon
from bot.i18n import t
from bot.keyboards.models import webapp_models_keyboard
from bot.services.language import get_user_language

router = Router()
logger = logging.getLogger(__name__)
VIDEO_MODEL_CODES = ["seedance_2_t2v", "seedance_2_i2v_fast", "seedance_2_i2v", "kling_21_i2v"]
VIDEO_BUTTON_TITLES = {
    "seedance_2_t2v": "Seedance 2 Text",
    "seedance_2_i2v_fast": "Seedance 2 Fast I2V",
    "seedance_2_i2v": "Seedance 2 I2V",
    "kling_21_i2v": "Kling 2.1 I2V",
}
VIDEO_ICON_MAP = {
    "seedance_2_t2v": "seedance_2_t2v",
    "seedance_2_i2v_fast": "seedance_2_i2v_fast",
    "seedance_2_i2v": "seedance_2_i2v",
    "kling_21_i2v": "kling_21_i2v",
}


@router.message(F.text.regexp(r".*Видео.*"))
async def video_models(message: Message) -> None:
    logger.info("VIDEO HANDLER TRIGGERED user_id=%s", message.from_user.id)
    await show_video_menu(message)


async def show_video_menu(message: Message) -> None:
    lang = await get_user_language(message.from_user.id if message.from_user else None)
    try:
        text, reply_markup = await build_video_menu(lang)
        await message.answer(text, reply_markup=reply_markup)
    except Exception:
        logger.exception("Video handler failed")
        await message.answer(t(lang, "common.error.video"))


async def build_video_menu(lang: str = "ru") -> tuple[str, InlineKeyboardMarkup]:
    async with async_session() as session:
        result = await session.execute(
            select(AIModel).where(AIModel.code.in_(VIDEO_MODEL_CODES), AIModel.is_active.is_(True)).order_by(AIModel.sort_order)
        )
        items = [(VIDEO_BUTTON_TITLES.get(model.code, model.title), model.code) for model in result.scalars().all()]
    if not items:
        return (
            t(lang, "video.soon"),
            InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=t(lang, "menu.home"), callback_data="main:home", **emoji_icon("home"))]]),
        )
    return t(lang, "video.choose"), webapp_models_keyboard(items, lang=lang, icon_map=VIDEO_ICON_MAP)
