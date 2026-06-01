from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import AIModel, GenerationTask, Template, User
from backend.app.db.session import get_session
from backend.app.providers.base import provider_model_configured

router = APIRouter(prefix="/debug", tags=["debug"])


@router.get("/models")
async def debug_models(session: AsyncSession = Depends(get_session)) -> dict:
    models_count = await session.scalar(select(func.count(AIModel.id)))
    templates_count = await session.scalar(select(func.count(Template.id)))
    result = await session.execute(select(AIModel).order_by(AIModel.category, AIModel.sort_order, AIModel.id))
    models = result.scalars().all()
    return {
        "models_count": models_count or 0,
        "templates_count": templates_count or 0,
        "models": [
            {
                "code": model.code,
                "title": model.title,
                "category": model.category,
                "provider": model.provider,
                "provider_model_id": model.provider_model_id,
                "is_placeholder": not provider_model_configured(model.provider_model_id),
                "price_credits": model.price_credits,
                "is_active": model.is_active,
            }
            for model in models
        ],
    }


@router.get("/me")
async def debug_me(user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    tasks_count = await session.scalar(select(func.count(GenerationTask.id)).where(GenerationTask.user_id == user.id))
    return {
        "id": user.id,
        "telegram_id": user.telegram_id,
        "username": user.username,
        "balance_credits": user.balance_credits,
        "language_code": user.language_code,
        "ref_code": user.ref_code,
        "tasks_count": tasks_count or 0,
    }
