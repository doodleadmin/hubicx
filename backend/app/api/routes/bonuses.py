from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import User, UserBonusTask
from backend.app.db.session import get_session
from backend.app.services.balance import award_bonus_tokens
from backend.app.services.business import BONUS_TASKS_V2, BONUS_TOTAL_TOKENS
from backend.app.utils.errors import AppError

router = APIRouter(prefix="/bonuses", tags=["bonuses"])


def _task_map() -> dict[str, dict]:
    return {str(task["code"]): task for task in BONUS_TASKS_V2}


async def _claimed_codes(session: AsyncSession, user_id: int) -> set[str]:
    result = await session.execute(select(UserBonusTask.code).where(UserBonusTask.user_id == user_id))
    return {str(code) for code in result.scalars().all()}


def _serialize_task(task: dict, claimed: set[str]) -> dict:
    code = str(task["code"])
    return {**task, "claimed": code in claimed, "claimable": task.get("kind") == "manual_claim" and code not in claimed}


@router.get("")
async def my_bonuses(user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    claimed = await _claimed_codes(session, user.id)
    return {
        "title": "50 токенов сразу + бонусы за задания после проверки",
        "total_tokens": BONUS_TOTAL_TOKENS,
        "bonus_credits": int(user.bonus_credits or 0),
        "tasks": [_serialize_task(task, claimed) for task in BONUS_TASKS_V2],
    }


@router.post("/{code}/claim")
async def claim_bonus(code: str, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    task = _task_map().get(code)
    if not task:
        raise AppError("bonus_task_not_found", "Бонусное задание не найдено", 404)
    if task.get("kind") != "manual_claim":
        raise AppError("bonus_not_claimable", "Этот бонус начисляется автоматически", 422)
    awarded, tokens = await award_bonus_tokens(
        session,
        user.id,
        code,
        int(task["tokens"]),
        f"Bonus task: {task['title']}",
        {"kind": task.get("kind")},
    )
    if awarded:
        await session.commit()
        await session.refresh(user)
    return {"ok": True, "awarded": awarded, "tokens": tokens, "bonus_credits": int(user.bonus_credits or 0), "balance_credits": int(user.balance_credits or 0)}
