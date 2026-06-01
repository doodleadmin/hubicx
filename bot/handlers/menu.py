import logging

from aiogram import F, Router
from aiogram.types import CallbackQuery, Message

from bot.keyboards.main_menu import main_menu_keyboard

router = Router()
logger = logging.getLogger(__name__)


@router.callback_query(F.data == "home")
async def home_callback(callback: CallbackQuery) -> None:
    await callback.message.answer("Главное меню", reply_markup=main_menu_keyboard())
    await callback.answer()


@router.callback_query(F.data == "webapp_unavailable")
async def webapp_unavailable(callback: CallbackQuery) -> None:
    await callback.answer("Для открытия WebApp нужен публичный HTTPS WEBAPP_URL", show_alert=True)


@router.message(F.text.regexp(r".*Домой.*"))
async def home_message(message: Message) -> None:
    logger.info("MENU HOME HANDLER TRIGGERED text=%s user_id=%s", message.text, message.from_user.id)
    await message.answer("Главное меню", reply_markup=main_menu_keyboard())


@router.message()
async def debug_unhandled(message: Message) -> None:
    logger.warning("MENU FALLBACK TRIGGERED text=%s user_id=%s", message.text, message.from_user.id if message.from_user else None)
    await message.answer(f"DEBUG: получил сообщение: {message.text}")
