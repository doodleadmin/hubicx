from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import BalanceLedger, Transaction, User
from backend.app.utils.errors import AppError


async def apply_balance_operation(
    session: AsyncSession,
    user_id: int,
    amount: int,
    operation_type: str,
    reason: str | None = None,
    task_id: int | None = None,
    payment_id: int | None = None,
    admin_user_id: int | None = None,
    metadata: dict | None = None,
) -> tuple[int, int]:
    user = await session.scalar(select(User).where(User.id == user_id).with_for_update())
    if not user:
        raise AppError("user_not_found", "Пользователь не найден", 404)
    before = int(user.balance_credits or 0)
    after = before + int(amount)
    if after < 0:
        raise AppError("not_enough_balance", "Недостаточно кредитов на балансе")
    user.balance_credits = after
    session.add(
        BalanceLedger(
            user_id=user_id,
            amount=int(amount),
            balance_before=before,
            balance_after=after,
            operation_type=operation_type,
            reason=reason,
            task_id=task_id,
            payment_id=payment_id,
            admin_user_id=admin_user_id,
            metadata_=metadata,
        )
    )
    return before, after


async def get_balance(session: AsyncSession, user_id: int) -> int:
    user = await session.get(User, user_id)
    return user.balance_credits if user else 0


async def has_enough_balance(session: AsyncSession, user_id: int, amount: int) -> bool:
    return await get_balance(session, user_id) >= amount


async def charge_for_generation(session: AsyncSession, user_id: int, task_id: int, amount: int) -> None:
    op_type = "agent_chat_debit" if amount > 0 and await _is_text_task(session, task_id) else "generation_debit"
    await apply_balance_operation(session, user_id, -amount, op_type, "Generation debit", task_id=task_id)
    session.add(Transaction(user_id=user_id, type="generation_charge", amount_credits=-amount, status="completed", generation_task_id=task_id))


async def refund_generation(session: AsyncSession, user_id: int, task_id: int, amount: int) -> None:
    await apply_balance_operation(session, user_id, amount, "generation_refund", "Generation refund", task_id=task_id)
    session.add(Transaction(user_id=user_id, type="refund", amount_credits=amount, status="completed", generation_task_id=task_id))


async def admin_add_balance(session: AsyncSession, user_id: int, amount: int, comment: str | None = None, admin_user_id: int | None = None) -> None:
    await apply_balance_operation(session, user_id, amount, "admin_adjustment", comment or "Admin adjustment", admin_user_id=admin_user_id)
    session.add(Transaction(user_id=user_id, type="admin_bonus", amount_credits=amount, status="completed", comment=comment))


async def referral_bonus(session: AsyncSession, user_id: int, payment_id: int, amount: int) -> None:
    user = await session.get(User, user_id)
    if not user or not user.referrer_id:
        return
    bonus = max(amount // 10, 0)
    if bonus:
        await admin_add_balance(session, user.referrer_id, bonus, f"Referral bonus for payment {payment_id}")


async def _is_text_task(session: AsyncSession, task_id: int) -> bool:
    from backend.app.db.models import GenerationTask

    task = await session.get(GenerationTask, task_id)
    return bool(task and task.task_type == "text")
