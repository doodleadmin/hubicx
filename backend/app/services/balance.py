from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import BalanceLedger, Transaction, User, UserBonusTask
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
    allow_negative: bool = False,
) -> tuple[int, int]:
    user = await session.scalar(select(User).where(User.id == user_id).with_for_update())
    if not user:
        raise AppError("user_not_found", "Пользователь не найден", 404)
    before = int(user.balance_credits or 0)
    after = before + int(amount)
    if after < 0 and not allow_negative:
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


def paid_balance(user: User) -> int:
    return max(int(user.balance_credits or 0) - int(user.bonus_credits or 0), 0)


async def get_paid_balance(session: AsyncSession, user_id: int) -> int:
    user = await session.get(User, user_id)
    return paid_balance(user) if user else 0


async def has_enough_balance(session: AsyncSession, user_id: int, amount: int, allow_bonus: bool = True) -> bool:
    user = await session.get(User, user_id)
    if not user:
        return False
    if allow_bonus:
        return int(user.balance_credits or 0) >= amount
    return paid_balance(user) >= amount


async def charge_for_generation(session: AsyncSession, user_id: int, task_id: int, amount: int, allow_bonus: bool = True) -> None:
    op_type = "agent_chat_debit" if amount > 0 and await _is_text_task(session, task_id) else "generation_debit"
    user = await session.scalar(select(User).where(User.id == user_id).with_for_update())
    if not user:
        raise AppError("user_not_found", "Пользователь не найден", 404)

    before = int(user.balance_credits or 0)
    before_bonus = int(user.bonus_credits or 0)
    before_paid = paid_balance(user)
    amount = int(amount)
    if allow_bonus:
        if before < amount:
            raise AppError("not_enough_balance", "Недостаточно кредитов на балансе")
        bonus_spent = min(before_bonus, amount)
        paid_spent = amount - bonus_spent
    else:
        if before_paid < amount:
            raise AppError("not_enough_paid_balance", "Для этой модели нужны платные токены")
        bonus_spent = 0
        paid_spent = amount

    user.balance_credits = before - amount
    user.bonus_credits = max(before_bonus - bonus_spent, 0)
    after = int(user.balance_credits or 0)
    session.add(
        BalanceLedger(
            user_id=user_id,
            amount=-amount,
            balance_before=before,
            balance_after=after,
            operation_type=op_type,
            reason="Generation debit",
            task_id=task_id,
            metadata_={
                "allow_bonus": allow_bonus,
                "bonus_spent": bonus_spent,
                "paid_spent": paid_spent,
                "bonus_before": before_bonus,
                "bonus_after": int(user.bonus_credits or 0),
            },
        )
    )
    session.add(Transaction(user_id=user_id, type="generation_charge", amount_credits=-amount, status="completed", generation_task_id=task_id))


async def refund_generation(session: AsyncSession, user_id: int, task_id: int, amount: int) -> None:
    debit = await session.scalar(
        select(BalanceLedger)
        .where(BalanceLedger.user_id == user_id, BalanceLedger.task_id == task_id, BalanceLedger.operation_type.in_(["generation_debit", "agent_chat_debit"]))
        .order_by(BalanceLedger.id.desc())
    )
    bonus_refund = int((debit.metadata_ or {}).get("bonus_spent") or 0) if debit else 0
    user = await session.scalar(select(User).where(User.id == user_id).with_for_update())
    if not user:
        raise AppError("user_not_found", "Пользователь не найден", 404)
    before = int(user.balance_credits or 0)
    before_bonus = int(user.bonus_credits or 0)
    user.balance_credits = before + int(amount)
    user.bonus_credits = before_bonus + min(bonus_refund, int(amount))
    session.add(
        BalanceLedger(
            user_id=user_id,
            amount=int(amount),
            balance_before=before,
            balance_after=int(user.balance_credits or 0),
            operation_type="generation_refund",
            reason="Generation refund",
            task_id=task_id,
            metadata_={"bonus_refund": min(bonus_refund, int(amount)), "bonus_before": before_bonus, "bonus_after": int(user.bonus_credits or 0)},
        )
    )
    session.add(Transaction(user_id=user_id, type="refund", amount_credits=amount, status="completed", generation_task_id=task_id))


async def award_bonus_tokens(
    session: AsyncSession,
    user_id: int,
    code: str,
    tokens: int,
    reason: str,
    metadata: dict | None = None,
) -> tuple[bool, int]:
    existing = await session.scalar(select(UserBonusTask).where(UserBonusTask.user_id == user_id, UserBonusTask.code == code))
    if existing:
        return False, int(existing.tokens or 0)

    user = await session.scalar(select(User).where(User.id == user_id).with_for_update())
    if not user:
        raise AppError("user_not_found", "Пользователь не найден", 404)
    before = int(user.balance_credits or 0)
    before_bonus = int(user.bonus_credits or 0)
    tokens = int(tokens)
    user.balance_credits = before + tokens
    user.bonus_credits = before_bonus + tokens
    session.add(UserBonusTask(user_id=user_id, code=code, tokens=tokens, status="completed", metadata_=metadata))
    session.add(
        BalanceLedger(
            user_id=user_id,
            amount=tokens,
            balance_before=before,
            balance_after=int(user.balance_credits or 0),
            operation_type="bonus_credit",
            reason=reason,
            metadata_={"bonus_code": code, "bonus_before": before_bonus, "bonus_after": int(user.bonus_credits or 0), **(metadata or {})},
        )
    )
    session.add(Transaction(user_id=user_id, type="bonus", amount_credits=tokens, status="completed", comment=reason))
    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        return False, 0
    return True, tokens


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
