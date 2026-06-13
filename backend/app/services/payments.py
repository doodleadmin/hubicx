import uuid
import logging

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.config import settings
from backend.app.db.models import Payment, User
from backend.app.services.balance import apply_balance_operation
from backend.app.utils.errors import AppError

logger = logging.getLogger(__name__)

YOOKASSA_API = "https://api.yookassa.ru/v3/payments"


def _yookassa_enabled() -> bool:
    return bool(settings.yookassa_shop_id and settings.yookassa_secret_key)


def _auth() -> tuple[str, str]:
    return (settings.yookassa_shop_id, settings.yookassa_secret_key)


async def create_payment(session: AsyncSession, user: User, amount_rub: int, credits: int, package_code: str | None = None) -> Payment:
    if amount_rub < 1 or credits < 1:
        raise AppError("invalid_payment", "Некорректные параметры платежа", 422)

    if not _yookassa_enabled():
        raise AppError("payments_disabled", "Платёжный шлюз не настроен. Обратитесь к администратору.", 503)

    idempotency_key = str(uuid.uuid4())

    payload = {
        "amount": {"value": f"{amount_rub}.00", "currency": "RUB"},
        "confirmation": {
            "type": "redirect",
            "return_url": settings.yookassa_return_url,
        },
        "capture": True,
        "description": f"Hubicx — {credits} токенов (user {user.id})",
        "metadata": {
            "user_id": str(user.id),
            "credits": str(credits),
            "package_code": package_code or "",
        },
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                YOOKASSA_API,
                json=payload,
                auth=_auth(),
                headers={"Idempotence-Key": idempotency_key},
            )
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPStatusError as exc:
        logger.error("YooKassa create_payment HTTP %s: %s", exc.response.status_code, exc.response.text)
        raise AppError("payment_gateway_error", "Ошибка платёжного шлюза. Попробуйте позже.", 502)
    except httpx.RequestError as exc:
        logger.error("YooKassa create_payment network error: %s", exc)
        raise AppError("payment_gateway_error", "Ошибка соединения с платёжным шлюзом.", 502)

    external_id = data.get("id")
    payment_url = (data.get("confirmation") or {}).get("confirmation_url")

    if not external_id or not payment_url:
        logger.error("YooKassa unexpected response: %s", data)
        raise AppError("payment_gateway_error", "Неожиданный ответ от платёжного шлюза.", 502)

    payment = Payment(
        user_id=user.id,
        provider="yookassa",
        amount_rub=amount_rub,
        credits=credits,
        status="pending",
        external_payment_id=external_id,
    )
    session.add(payment)
    await session.commit()
    await session.refresh(payment)

    return payment, payment_url


async def process_webhook(session: AsyncSession, event: dict) -> None:
    """Handle YooKassa notification. Re-fetches payment from YooKassa to verify authenticity."""
    obj = event.get("object") or {}
    external_id = obj.get("id")
    event_type = event.get("event", "")

    if not external_id or not event_type.startswith("payment."):
        return

    # Re-fetch from YooKassa to verify (webhooks are not signed)
    if not _yookassa_enabled():
        return

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(f"{YOOKASSA_API}/{external_id}", auth=_auth())
            resp.raise_for_status()
            verified = resp.json()
    except Exception as exc:
        logger.error("YooKassa re-fetch failed for %s: %s", external_id, exc)
        return

    verified_status = verified.get("status")
    metadata = verified.get("metadata") or {}

    from sqlalchemy import select
    from backend.app.db.models import Payment as PaymentModel
    result = await session.execute(
        select(PaymentModel).where(PaymentModel.external_payment_id == external_id)
    )
    payment = result.scalar_one_or_none()

    if not payment:
        logger.warning("Webhook for unknown external_payment_id=%s", external_id)
        return

    if payment.status == "paid":
        return  # already processed

    if verified_status == "succeeded" and payment.status != "paid":
        from datetime import datetime, timezone
        payment.status = "paid"
        payment.paid_at = datetime.now(timezone.utc)
        await session.flush()

        await apply_balance_operation(
            session=session,
            user_id=payment.user_id,
            amount=payment.credits,
            operation_type="topup",
            reason="yookassa_payment",
            payment_id=payment.id,
        )
        await session.commit()
        logger.info("Payment %s credited %s tokens to user %s", payment.id, payment.credits, payment.user_id)

    elif verified_status == "canceled" and payment.status == "pending":
        payment.status = "cancelled"
        await session.commit()
