from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.config import settings
from backend.app.db.models import ModelPricing, TokenPackage
from backend.app.db.session import get_session

router = APIRouter(prefix="/pricing", tags=["pricing"])


def serialize_package(pkg: TokenPackage) -> dict:
    total = pkg.total_tokens or pkg.tokens
    base = pkg.base_tokens or pkg.tokens
    bonus = pkg.bonus_tokens or (total - base) if (total and base) else 0
    eff_price = round(pkg.price_rub / total, 2) if total else 0
    return {
        "id": pkg.id,
        "code": pkg.code,
        "title": pkg.title,
        "tokens": total,
        "price_rub": pkg.price_rub,
        "base_tokens": base,
        "bonus_tokens": bonus,
        "total_tokens": total,
        "effective_price_per_token": eff_price,
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
        "price_rules": price.price_rules,
        "is_enabled": price.is_enabled,
        "is_featured": price.is_featured,
        "admin_note": price.admin_note,
        "provider_cost_note": price.provider_cost_note,
    }


@router.get("")
async def public_pricing(session: AsyncSession = Depends(get_session)) -> dict:
    packages_result = await session.execute(
        select(TokenPackage).where(TokenPackage.is_active.is_(True)).order_by(TokenPackage.sort_order, TokenPackage.id)
    )
    prices_result = await session.execute(select(ModelPricing).order_by(ModelPricing.category, ModelPricing.model_code))
    payments_enabled = bool(settings.yookassa_shop_id and settings.yookassa_secret_key)
    return {
        "token_packages": [serialize_package(pkg) for pkg in packages_result.scalars().all()],
        "custom_topup": {
            "enabled": True,
            "payments_enabled": payments_enabled,
            "min_amount_rub": 99,
            "rub_to_token_rate": 1,
            "bonus_tokens": 0,
        },
        "model_prices": [serialize_model_price(price) for price in prices_result.scalars().all()],
        "payments_enabled": payments_enabled,
    }
