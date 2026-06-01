from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message
from sqlalchemy import desc, func, select
from sqlalchemy.orm import selectinload

from backend.app.db.models import GenerationTask, User
from backend.app.db.session import async_session
from backend.app.services.balance import admin_add_balance
from bot.config import ADMIN_IDS

router = Router()


def is_admin(message: Message) -> bool:
    return bool(message.from_user and message.from_user.id in ADMIN_IDS)


@router.message(Command("admin"))
async def admin(message: Message) -> None:
    if not is_admin(message):
        return
    async with async_session() as session:
        users_count = await session.scalar(select(func.count(User.id)))
        tasks_count = await session.scalar(select(func.count(GenerationTask.id)))
    await message.answer(f"Админ-панель\nПользователей: {users_count or 0}\nГенераций: {tasks_count or 0}\n\nКоманды: /add_balance, /user, /tasks, /errors")


@router.message(Command("add_balance"))
async def add_balance(message: Message) -> None:
    if not is_admin(message):
        return
    parts = (message.text or "").split()
    if len(parts) != 3 or not parts[1].isdigit() or not parts[2].isdigit():
        await message.answer("Использование: /add_balance <telegram_id> <amount>")
        return
    telegram_id = int(parts[1])
    amount = int(parts[2])
    if amount <= 0:
        await message.answer("Сумма должна быть положительной")
        return
    async with async_session() as session:
        user = await session.scalar(select(User).where(User.telegram_id == telegram_id))
        if not user:
            await message.answer("Пользователь не найден")
            return
        await admin_add_balance(session, user.id, amount, f"Admin {message.from_user.id}")
        await session.commit()
        await session.refresh(user)
    await message.answer(f"Баланс обновлён: {user.balance_credits} 🪙")


@router.message(Command("user"))
async def user_info(message: Message) -> None:
    if not is_admin(message):
        return
    parts = (message.text or "").split()
    if len(parts) != 2 or not parts[1].isdigit():
        await message.answer("Использование: /user <telegram_id>")
        return
    async with async_session() as session:
        user = await session.scalar(select(User).where(User.telegram_id == int(parts[1])))
    if not user:
        await message.answer("Пользователь не найден")
    else:
        await message.answer(f"ID: {user.id}\nTG: {user.telegram_id}\n@{user.username}\nБаланс: {user.balance_credits}\nref: {user.ref_code}")


@router.message(Command("tasks"))
async def tasks(message: Message) -> None:
    if not is_admin(message):
        return
    async with async_session() as session:
        result = await session.execute(select(GenerationTask).options(selectinload(GenerationTask.model), selectinload(GenerationTask.template)).order_by(desc(GenerationTask.created_at)).limit(10))
        rows = result.scalars().all()
    await message.answer("\n".join([f"#{t.id} user={t.user_id} {t.status} {t.cost_credits}cr" for t in rows]) or "Задач нет")


@router.message(Command("errors"))
async def errors(message: Message) -> None:
    if not is_admin(message):
        return
    async with async_session() as session:
        result = await session.execute(select(GenerationTask).where(GenerationTask.error_message.is_not(None)).order_by(desc(GenerationTask.created_at)).limit(10))
        rows = result.scalars().all()
    await message.answer("\n".join([f"#{t.id} {t.status}: {t.error_message}" for t in rows]) or "Ошибок нет")
