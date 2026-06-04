import logging

from aiogram.exceptions import TelegramBadRequest
from aiogram.types import CallbackQuery, InlineKeyboardMarkup, Message
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import User

logger = logging.getLogger(__name__)


async def delete_active_menu(bot, user: User) -> None:
    if not user.active_menu_chat_id or not user.active_menu_message_id:
        return
    try:
        await bot.delete_message(chat_id=user.active_menu_chat_id, message_id=user.active_menu_message_id)
    except TelegramBadRequest as exc:
        message = str(exc).lower()
        if "message to delete not found" in message or "message can't be deleted" in message:
            logger.info("Active menu already unavailable user_id=%s error=%s", user.id, exc)
            return
        logger.warning("Failed to delete active menu message user_id=%s error=%s", user.id, exc)
    except Exception:
        logger.exception("Failed to delete active menu message user_id=%s", user.id)


async def save_active_menu(session: AsyncSession, user: User, chat_id: int, message_id: int) -> None:
    user.active_menu_chat_id = chat_id
    user.active_menu_message_id = message_id
    await session.commit()


async def send_or_replace_menu(message: Message, session: AsyncSession, user: User, text: str, reply_markup: InlineKeyboardMarkup) -> Message:
    await delete_active_menu(message.bot, user)
    sent = await message.answer(text, reply_markup=reply_markup)
    await save_active_menu(session, user, sent.chat.id, sent.message_id)
    return sent


async def edit_current_menu(callback: CallbackQuery, text: str, reply_markup: InlineKeyboardMarkup) -> bool:
    if not callback.message:
        return False
    if callback.message.photo:
        try:
            await callback.message.edit_caption(caption=text, reply_markup=reply_markup)
            return True
        except TelegramBadRequest as exc:
            message = str(exc).lower()
            if "message is not modified" in message:
                return True
            if "message can't be edited" in message or "message to edit not found" in message:
                logger.warning("Photo menu message cannot be edited user_id=%s error=%s", callback.from_user.id, exc)
                return False
            logger.warning("Failed to edit photo menu user_id=%s error=%s", callback.from_user.id, exc)
            return False
        except Exception:
            logger.exception("Failed to edit photo menu user_id=%s", callback.from_user.id)
            return False
    try:
        await callback.message.edit_text(text, reply_markup=reply_markup)
        return True
    except TelegramBadRequest as exc:
        message = str(exc).lower()
        if "message is not modified" in message:
            return True
        if "message can't be edited" in message or "message to edit not found" in message:
            logger.warning("Menu message cannot be edited user_id=%s error=%s", callback.from_user.id, exc)
            return False
        logger.warning("Failed to edit menu message user_id=%s error=%s", callback.from_user.id, exc)
        return False
    except Exception:
        logger.exception("Failed to edit menu message user_id=%s", callback.from_user.id)
        return False
