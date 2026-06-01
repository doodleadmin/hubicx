import logging

from aiogram import F, Router
from aiogram.types import InlineKeyboardMarkup, Message
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
    try:
        async with async_session() as session:
            user = await session.scalar(select(User).where(User.telegram_id == message.from_user.id))
            if not user:
                await message.answer("Сначала отправьте /start")
                return
            result = await session.execute(
                select(GenerationTask)
                .where(GenerationTask.user_id == user.id)
                .options(selectinload(GenerationTask.model), selectinload(GenerationTask.template))
                .order_by(desc(GenerationTask.created_at))
                .limit(10)
            )
            tasks = result.scalars().all()
        if not tasks:
            await message.answer("📜 История пуста")
            return
        lines = ["📜 Последние генерации:"]
        buttons = []
        for task in tasks:
            title = task.model.title if task.model else task.template.title if task.template else task.task_type
            lines.append(f"#{task.id} · {title} · {task.status} · {task.cost_credits} 🪙 · {task.created_at:%d.%m %H:%M}")
            buttons.append([app_button(f"Открыть #{task.id}", f"{WEBAPP_URL}/history?task={task.id}")])
        await message.answer("\n".join(lines), reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))
    except Exception:
        logger.exception("History handler failed")
        await message.answer("Ошибка при открытии раздела История")
