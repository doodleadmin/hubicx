from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import Transaction, User
from backend.app.utils.errors import AppError


async def get_balance(session: AsyncSession, user_id: int) -> int:
    user = await session.get(User, user_id)
    return user.balance_credits if user else 0


async def has_enough_balance(session: AsyncSession, user_id: int, amount: int) -> bool:
    return await get_balance(session, user_id) >= amount


async def charge_for_generation(session: AsyncSession, user_id: int, task_id: int, amount: int) -> None:
    user = await session.scalar(select(User).where(User.id == user_id).with_for_update())
    if not user or user.balance_credits < amount:
        raise AppError("not_enough_balance", "Недостаточно кредитов на балансе")
    user.balance_credits -= amount
    session.add(Transaction(user_id=user_id, type="generation_charge", amount_credits=-amount, status="completed", generation_task_id=task_id))


async def refund_generation(session: AsyncSession, user_id: int, task_id: int, amount: int) -> None:
    user = await session.scalar(select(User).where(User.id == user_id).with_for_update())
    if not user:
        raise AppError("user_not_found", "Пользователь не найден", 404)
    user.balance_credits += amount
    session.add(Transaction(user_id=user_id, type="refund", amount_credits=amount, status="completed", generation_task_id=task_id))


async def admin_add_balance(session: AsyncSession, user_id: int, amount: int, comment: str | None = None) -> None:
    user = await session.scalar(select(User).where(User.id == user_id).with_for_update())
    if not user:
        raise AppError("user_not_found", "Пользователь не найден", 404)
    user.balance_credits += amount
    session.add(Transaction(user_id=user_id, type="admin_bonus", amount_credits=amount, status="completed", comment=comment))


async def referral_bonus(session: AsyncSession, user_id: int, payment_id: int, amount: int) -> None:
    user = await session.get(User, user_id)
    if not user or not user.referrer_id:
        return
    bonus = max(amount // 10, 0)
    if bonus:
        await admin_add_balance(session, user.referrer_id, bonus, f"Referral bonus for payment {payment_id}")
