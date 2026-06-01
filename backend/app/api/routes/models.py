from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import AIModel
from backend.app.db.session import get_session
from backend.app.schemas.models import AIModelOut

router = APIRouter(prefix="/models", tags=["models"])


@router.get("", response_model=list[AIModelOut])
async def list_models(category: str | None = Query(default=None), session: AsyncSession = Depends(get_session)) -> list[AIModel]:
    stmt = select(AIModel).where(AIModel.is_active.is_(True)).order_by(AIModel.sort_order, AIModel.id)
    if category:
        stmt = stmt.where(AIModel.category == category)
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.get("/{code}", response_model=AIModelOut)
async def get_model(code: str, session: AsyncSession = Depends(get_session)) -> AIModel:
    model = await session.scalar(select(AIModel).where(AIModel.code == code))
    if not model:
        from backend.app.utils.errors import AppError

        raise AppError("model_not_found", "Модель не найдена", 404)
    return model
