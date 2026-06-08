from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import ModelPricing, TokenPackage
from backend.app.db.session import get_session

router = APIRouter(prefix="/pricing", tags=["pricing"])


def serialize_package(pkg: TokenPackage) -> dict:
    return {
        "id": pkg.id,
        "code": pkg.code,
        "title": pkg.title,
        "tokens": pkg.tokens,
        "price_rub": pkg.price_rub,
        "bonus_tokens": pkg.bonus_tokens,
        "is_active": pkg.is_active,
        "sort_order": pkg.sort_order,
    }


def serialize_model_price(price: ModelPricing) -> dict:
    return {
        "id": price.id,
        "model_code": price.model_code,
        "display_name": price.display_name,
        "category": price.category,
        "price_tokens": price.price_tokens,
        "is_enabled": price.is_enabled,
        "is_featured": price.is_featured,
        "admin_note": price.admin_note,
    }


@router.get("")
async def public_pricing(session: AsyncSession = Depends(get_session)) -> dict:
    packages_result = await session.execute(
        select(TokenPackage).where(TokenPackage.is_active.is_(True)).order_by(TokenPackage.sort_order, TokenPackage.id)
    )
    prices_result = await session.execute(select(ModelPricing).order_by(ModelPricing.category, ModelPricing.model_code))
    return {
        "token_packages": [serialize_package(pkg) for pkg in packages_result.scalars().all()],
        "model_prices": [serialize_model_price(price) for price in prices_result.scalars().all()],
        "payments_enabled": False,
    }
