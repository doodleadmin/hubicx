import logging

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import TokenPackage, User
from backend.app.db.session import get_session
from backend.app.schemas.payments import PaymentCreate, PaymentOut, OrderPreviewRequest
from backend.app.services.payments import create_payment, process_webhook
from backend.app.utils.errors import AppError

router = APIRouter(prefix="/payments", tags=["payments"])
logger = logging.getLogger(__name__)

MIN_CUSTOM_TOPUP_RUB = 99


@router.post("/create", response_model=PaymentOut)
async def create_payment_route(
    payload: PaymentCreate,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> PaymentOut:
    payment, payment_url = await create_payment(
        session=session,
        user=user,
        amount_rub=payload.amount_rub,
        credits=payload.credits,
        package_code=payload.package_code,
    )
    return PaymentOut(payment_id=payment.id, status=payment.status, payment_url=payment_url)


@router.post("/webhook")
async def payment_webhook(request: Request, session: AsyncSession = Depends(get_session)) -> dict:
    try:
        event = await request.json()
    except Exception:
        raise AppError("invalid_webhook", "Invalid JSON body", 400)
    await process_webhook(session, event)
    return {"ok": True}


@router.post("/orders/preview")
async def order_preview(payload: OrderPreviewRequest, session: AsyncSession = Depends(get_session)) -> dict:
    if payload.package_code:
        pkg = await session.scalar(
            select(TokenPackage).where(
                TokenPackage.code == payload.package_code,
                TokenPackage.is_active.is_(True),
            )
        )
        if not pkg:
            raise AppError("package_not_found", f"Пакет {payload.package_code} не найден", 404)

        total = pkg.total_tokens or pkg.tokens
        base = pkg.base_tokens or pkg.tokens
        bonus = pkg.bonus_tokens or (total - base) if (total and base) else 0

        return {
            "type": "package",
            "package_code": pkg.code,
            "title": pkg.title,
            "amount_rub": pkg.price_rub,
            "base_tokens": base,
            "bonus_tokens": bonus,
            "total_tokens": total,
            "effective_price_per_token": round(pkg.price_rub / total, 2) if total else 0,
        }

    if payload.custom_amount_rub is not None:
        amount = int(payload.custom_amount_rub)
        if amount < MIN_CUSTOM_TOPUP_RUB:
            raise AppError(
                "amount_too_low",
                f"Минимальная сумма пополнения: {MIN_CUSTOM_TOPUP_RUB} ₽. Вы ввели {amount} ₽.",
                422,
            )
        return {
            "type": "custom",
            "amount_rub": amount,
            "base_tokens": amount,
            "bonus_tokens": 0,
            "total_tokens": amount,
        }

    raise AppError("validation_error", "Укажите package_code или custom_amount_rub", 422)
