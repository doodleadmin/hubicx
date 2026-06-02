import logging

from aiogram import F, Router
from aiogram.types import CallbackQuery, InlineKeyboardMarkup, Message
from sqlalchemy import func, select

from backend.app.db.models import ReferralReward, User
from backend.app.db.session import async_session
from bot.config import BOT_USERNAME
from bot.keyboards.models import balance_keyboard
from bot.services.menu_messages import edit_current_menu

router = Router()
logger = logging.getLogger(__name__)


@router.message(F.text.regexp(r".*Баланс.*"))
async def balance(message: Message) -> None:
    logger.info("BALANCE HANDLER TRIGGERED text=%s user_id=%s", message.text, message.from_user.id)
    await show_balance_menu(message)


async def show_balance_menu(message: Message, user_id: int | None = None) -> None:
    try:
        telegram_id = user_id or message.from_user.id
        text, reply_markup = await build_balance_menu(telegram_id)
        if reply_markup is None:
            await message.answer(text)
            return
        await message.answer(text, reply_markup=reply_markup)
    except Exception:
        logger.exception("Balance handler failed")
        await message.answer("Ошибка при открытии раздела Баланс")


async def build_balance_menu(telegram_id: int) -> tuple[str, InlineKeyboardMarkup | None]:
    async with async_session() as session:
        user = await session.scalar(select(User).where(User.telegram_id == telegram_id))
        if not user:
            return "Сначала отправьте /start", None
        ref_link = f"https://t.me/{BOT_USERNAME}?start={user.ref_code}" if BOT_USERNAME else ""
        text = (
            f"💰 Баланс: {user.balance_credits} 🪙\n\n"
            "💰 Для продолжения использования пополните баланс ниже:\n\n"
            "🔗 Приглашайте друзей по ссылке ниже и получайте 10% от их пополнений."
        )
    return text, balance_keyboard(ref_link)


@router.callback_query(F.data == "team")
async def team(callback: CallbackQuery) -> None:
    async with async_session() as session:
        user = await session.scalar(select(User).where(User.telegram_id == callback.from_user.id))
        invited = await session.scalar(select(func.count(User.id)).where(User.referrer_id == user.id)) if user else 0
        rewards = await session.scalar(select(func.coalesce(func.sum(ReferralReward.reward_credits), 0)).where(ReferralReward.referrer_id == user.id)) if user else 0
    await callback.answer()
    await edit_current_menu(
        callback,
        f"👥 Моя команда\n\nПриглашено: {invited or 0}\nНачислено бонусов: {rewards or 0} 🪙",
        balance_keyboard(f"https://t.me/{BOT_USERNAME}?start={user.ref_code}" if user and BOT_USERNAME else ""),
    )
