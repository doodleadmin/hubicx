from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import AIModel, GenerationTask, User
from backend.app.db.session import get_session
from backend.app.services.balance import admin_add_balance
from backend.app.utils.errors import AppError

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(user: User) -> None:
    if not user.is_admin:
        raise AppError("forbidden", "Доступ запрещён", 403)


@router.post("/balance/{telegram_id}")
async def add_balance(telegram_id: int, amount: int, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    require_admin(user)
    if amount <= 0:
        raise AppError("invalid_amount", "Сумма должна быть положительной")
    target = await session.scalar(select(User).where(User.telegram_id == telegram_id))
    if not target:
        raise AppError("user_not_found", "Пользователь не найден", 404)
    await admin_add_balance(session, target.id, amount, "Admin API")
    await session.commit()
    return {"ok": True, "balance": target.balance_credits}


@router.post("/models/{code}/toggle")
async def toggle_model(code: str, is_active: bool, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    require_admin(user)
    model = await session.scalar(select(AIModel).where(AIModel.code == code))
    if not model:
        raise AppError("model_not_found", "Модель не найдена", 404)
    model.is_active = is_active
    await session.commit()
    return {"ok": True, "code": code, "is_active": is_active}


@router.get("/errors")
async def errors(user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> list[dict]:
    require_admin(user)
    result = await session.execute(select(GenerationTask).where(GenerationTask.error_message.is_not(None)).order_by(desc(GenerationTask.created_at)).limit(20))
    return [{"id": task.id, "status": task.status, "error": task.error_message, "created_at": task.created_at} for task in result.scalars().all()]
