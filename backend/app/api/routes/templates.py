from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import Template
from backend.app.db.session import get_session
from backend.app.schemas.models import TemplateOut
from backend.app.utils.errors import AppError

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("", response_model=list[TemplateOut])
async def list_templates(session: AsyncSession = Depends(get_session)) -> list[Template]:
    result = await session.execute(select(Template).where(Template.is_active.is_(True)).order_by(Template.sort_order, Template.id))
    return list(result.scalars().all())


@router.get("/{code}", response_model=TemplateOut)
async def get_template(code: str, session: AsyncSession = Depends(get_session)) -> Template:
    template = await session.scalar(select(Template).where(Template.code == code))
    if not template:
        raise AppError("template_not_found", "Шаблон не найден", 404)
    return template
