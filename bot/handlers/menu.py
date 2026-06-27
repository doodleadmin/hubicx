import logging

from aiogram import F, Router
from aiogram.types import CallbackQuery, Message
from sqlalchemy import select

from backend.app.db.models import User
from backend.app.db.session import async_session
from bot.config import settings
from bot.handlers.balance import build_balance_menu
from bot.handlers.history import build_history_menu
from bot.handlers.photo import build_photo_menu
from bot.handlers.templates import build_templates_menu
from bot.handlers.text import build_text_menu
from bot.handlers.video import build_video_menu
from bot.i18n import t
from bot.keyboards.language import language_keyboard
from bot.keyboards.main_menu import main_menu_keyboard
from bot.services.language import get_user_language
from bot.services.menu_messages import edit_current_menu, send_or_replace_menu
from bot.services.start_message import send_start_menu

router = Router()
logger = logging.getLogger(__name__)


async def show_main_menu(message: Message, language_code: str = "ru") -> None:
    await message.answer(t(language_code, "menu.main"), reply_markup=main_menu_keyboard(language_code))


async def render_callback_menu(callback: CallbackQuery, text: str, reply_markup) -> None:
    if await edit_current_menu(callback, text, reply_markup):
        return
    if not callback.message:
        return
    async with async_session() as session:
        user = await session.scalar(select(User).where(User.telegram_id == callback.from_user.id))
        if user:
            await send_or_replace_menu(callback.message, session, user, text, reply_markup)


@router.callback_query(F.data.startswith("main:"))
async def main_menu_callback(callback: CallbackQuery) -> None:
    action = callback.data.split(":", 1)[1]
    logger.info("MAIN MENU CALLBACK action=%s user_id=%s", action, callback.from_user.id)
    if not callback.message:
        await callback.answer()
        return

    if action == "home":
        async with async_session() as session:
            user = await session.scalar(select(User).where(User.telegram_id == callback.from_user.id))
            if user:
                await send_start_menu(callback.message, session, user)
    elif action == "language":
        language_code = await get_user_language(callback.from_user.id)
        await render_callback_menu(callback, t(language_code, "language.choose"), language_keyboard())
    elif action == "photo":
        text, reply_markup = await build_photo_menu(await get_user_language(callback.from_user.id))
        await render_callback_menu(callback, text, reply_markup)
    elif action == "video":
        text, reply_markup = await build_video_menu(await get_user_language(callback.from_user.id))
        await render_callback_menu(callback, text, reply_markup)
    elif action == "templates":
        text, reply_markup = await build_templates_menu(await get_user_language(callback.from_user.id))
        await render_callback_menu(callback, text, reply_markup)
    elif action == "text":
        text, reply_markup = build_text_menu(await get_user_language(callback.from_user.id))
        await render_callback_menu(callback, text, reply_markup)
    elif action == "balance":
        text, reply_markup = await build_balance_menu(callback.from_user.id)
        if reply_markup:
            await render_callback_menu(callback, text, reply_markup)
    elif action == "history":
        text, reply_markup = await build_history_menu(callback.from_user.id)
        if reply_markup:
            await render_callback_menu(callback, text, reply_markup)
    await callback.answer()


@router.callback_query(F.data == "webapp_unavailable")
async def webapp_unavailable(callback: CallbackQuery) -> None:
    await callback.answer("Для открытия WebApp нужен публичный HTTPS WEBAPP_URL", show_alert=True)


@router.message(F.text.regexp(r".*Домой.*"))
async def home_message(message: Message) -> None:
    logger.info("MENU HOME HANDLER TRIGGERED user_id=%s", message.from_user.id)
    async with async_session() as session:
        user = await session.scalar(select(User).where(User.telegram_id == message.from_user.id))
        if user:
            await send_start_menu(message, session, user)
            return
    await show_main_menu(message, await get_user_language(message.from_user.id))


@router.message()
async def debug_unhandled(message: Message) -> None:
    if not settings.debug:
        return
    logger.warning("MENU FALLBACK TRIGGERED user_id=%s text_len=%s", message.from_user.id if message.from_user else None, len(message.text or ""))
    await message.answer(f"DEBUG: получил сообщение: {message.text}")
