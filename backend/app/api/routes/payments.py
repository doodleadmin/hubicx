import logging

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import TokenPackage, User
from backend.app.db.session import get_session
from backend.app.schemas.payments import PaymentCreate, PaymentOut, OrderPreviewRequest
from backend.app.services.payments import MIN_CUSTOM_TOPUP_RUB, create_payment, process_webhook
from backend.app.utils.errors import AppError

router = APIRouter(prefix="/payments", tags=["payments"])
logger = logging.getLogger(__name__)


@router.post("/init", response_model=PaymentOut)
async def init_payment(payload: PaymentCreate, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> PaymentOut:
    """Инициировать платёж. Если T-Bank включён — вернёт PaymentURL."""
    payment, payment_url = await create_payment(
        session, user,
        amount_rub=payload.amount_rub,
        credits=payload.credits,
        package_code=payload.package_code,
        return_url=payload.return_url,
    )

    if payment_url:
        return PaymentOut(
            payment_id=payment.id,
            status=payment.status,
            payment_url=payment_url,
            message="Перенаправьте пользователя на платёжную форму",
        )

    return PaymentOut(
        payment_id=payment.id,
        status=payment.status,
        payment_url=None,
        message="Оплата через администратора. Свяжитесь с поддержкой.",
    )


@router.post("/notify")
async def payment_notify(request: Request, session: AsyncSession = Depends(get_session)) -> dict:
    """Webhook уведомлений от T-Bank / других платёжных шлюзов."""
    try:
        body = await request.json()
    except Exception:
        body = {}

    try:
        await process_webhook(session, body)
    except AppError as exc:
        if exc.code == "bad_signature":
            from backend.app.services.tbank import notification_log_context

            logger.warning("Payment notify rejected: %s", notification_log_context(body))
        raise
    return {"ok": True}


# совместимость: старый эндпоинт /create → /init
@router.post("/create", response_model=PaymentOut)
async def create_payment_alias(payload: PaymentCreate, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> PaymentOut:
    return await init_payment(payload, user, session)


# совместимость: /webhook → /notify
@router.post("/webhook")
async def payment_webhook_alias(request: Request, session: AsyncSession = Depends(get_session)) -> dict:
    return await payment_notify(request, session)


@router.post("/orders/preview")
async def order_preview(payload: OrderPreviewRequest, session: AsyncSession = Depends(get_session)) -> dict:
    """Preview заказа: package или custom top-up."""

    # ── Режим package ──
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
            "status": "available",
            "message": "Готово к оплате",
        }

    # ── Режим custom ──
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
            "status": "available",
            "message": "Готово к оплате",
        }

    raise AppError("validation_error", "Укажите package_code или custom_amount_rub", 422)
