import logging

from aiogram import F, Router
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message
from sqlalchemy import desc, select
from sqlalchemy.orm import selectinload

from backend.app.db.models import GenerationTask, User
from backend.app.db.session import async_session
from bot.config import WEBAPP_URL
from bot.keyboards.models import app_button

router = Router()
logger = logging.getLogger(__name__)


@router.message(F.text.regexp(r".*История.*"))
async def history(message: Message) -> None:
    logger.info("HISTORY HANDLER TRIGGERED text=%s user_id=%s", message.text, message.from_user.id)
    await show_history_menu(message)


async def show_history_menu(message: Message, user_id: int | None = None) -> None:
    try:
        telegram_id = user_id or message.from_user.id
        text, reply_markup = await build_history_menu(telegram_id)
        if reply_markup is None:
            await message.answer(text)
            return
        await message.answer(text, reply_markup=reply_markup)
    except Exception:
        logger.exception("History handler failed")
        await message.answer("Ошибка при открытии раздела История")


async def build_history_menu(telegram_id: int) -> tuple[str, InlineKeyboardMarkup | None]:
    async with async_session() as session:
        user = await session.scalar(select(User).where(User.telegram_id == telegram_id))
        if not user:
            return "Сначала отправьте /start", None
        result = await session.execute(
            select(GenerationTask)
            .where(GenerationTask.user_id == user.id)
            .options(selectinload(GenerationTask.model), selectinload(GenerationTask.template))
            .order_by(desc(GenerationTask.created_at))
            .limit(10)
        )
        tasks = result.scalars().all()
    if not tasks:
        return "📜 История пуста", InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="Домой", callback_data="main:home")]])
    lines = ["📜 Последние генерации:"]
    buttons = []
    for task in tasks:
        title = task.model.title if task.model else task.template.title if task.template else task.task_type
        lines.append(f"#{task.id} · {title} · {task.status} · {task.cost_credits} 🪙 · {task.created_at:%d.%m %H:%M}")
        buttons.append([app_button(f"Открыть #{task.id}", f"{WEBAPP_URL}/history?task={task.id}")])
    buttons.append([InlineKeyboardButton(text="Домой", callback_data="main:home")])
    return "\n".join(lines), InlineKeyboardMarkup(inline_keyboard=buttons)
