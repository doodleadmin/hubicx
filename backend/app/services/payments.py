import logging
from datetime import datetime, timezone
from decimal import Decimal
from urllib.parse import urlparse

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.config import settings
from backend.app.db.models import BalanceLedger, Payment, ReferralCommission, TokenPackage, Transaction, User, UserSubscription
from backend.app.services.business import SUBSCRIPTION_PLANS_V2
from backend.app.utils.errors import AppError

PAYMENT_PACKAGES = {300, 1000, 3000, 10000}
MIN_CUSTOM_TOPUP_RUB = 99

_TOKEN_CATEGORY_CODES = {"topup_300", "topup_1000", "topup_3000", "topup_10000"}
_TEMPLATE_CATEGORY_CODES = {"templates_mini", "templates_plus"}
_FULL_CATEGORY_CODES = {"creator", "creator_pro", "studio"}
_SUBSCRIPTION_PLANS_BY_CODE = {str(plan["code"]): plan for plan in SUBSCRIPTION_PLANS_V2}

logger = logging.getLogger(__name__)


def _payment_channel(return_url: str | None) -> str:
    host = (urlparse(return_url or "").hostname or "").lower()
    return "webapp" if host == "webapp.hubicx.ru" else "desktop"


def _payment_return_urls(return_url: str | None, order_id: str) -> tuple[str, str]:
    base = (return_url or settings.webapp_url).rstrip("/")
    channel = _payment_channel(base)
    path = "" if channel == "webapp" else "/app"
    return (
        f"{base}{path}?paid=success&order={order_id}",
        f"{base}{path}?paid=fail&order={order_id}",
    )


def _commission_category(package_code: str | None) -> str | None:
    """Map package_code to referral commission category."""
    if not package_code:
        return None
    code = str(package_code).lower()
    if code in _TOKEN_CATEGORY_CODES:
        return "token_topup"
    if code in _TEMPLATE_CATEGORY_CODES:
        return "template_subscription"
    if code in _FULL_CATEGORY_CODES:
        return "full_subscription"
    return None


def _subscription_plan(package_code: str | None) -> dict | None:
    if not package_code:
        return None
    return _SUBSCRIPTION_PLANS_BY_CODE.get(str(package_code).lower())


def _subscription_kind(package_code: str) -> str:
    return "template" if package_code in _TEMPLATE_CATEGORY_CODES else "full"


async def _has_payment_ledger(session: AsyncSession, payment_id: int, operation_type: str) -> bool:
    existing = await session.scalar(
        select(BalanceLedger.id).where(
            BalanceLedger.payment_id == payment_id,
            BalanceLedger.operation_type == operation_type,
        )
    )
    return existing is not None


async def _apply_payment_commission(session: AsyncSession, payment: Payment) -> None:
    category = _commission_category(payment.package_code)
    if not category or not payment.referral_partner_id:
        return
    try:
        from backend.app.services.referral import calculate_commission

        await calculate_commission(session, payment, category)
    except Exception:
        logger.exception("Failed to calculate referral commission for payment_id=%s", payment.id)


async def _cancel_payment_commissions(session: AsyncSession, payment_id: int) -> None:
    result = await session.execute(
        select(ReferralCommission).where(
            ReferralCommission.payment_id == payment_id,
            ReferralCommission.status == "pending",
        )
    )
    for commission in result.scalars().all():
        commission.status = "canceled"


async def _activate_subscription(session: AsyncSession, payment: Payment) -> None:
    pkg = payment.package_code
    if not pkg or pkg not in _TEMPLATE_CATEGORY_CODES | _FULL_CATEGORY_CODES:
        return
    plan = _subscription_plan(pkg)
    if not plan:
        raise AppError("subscription_plan_not_found", f"Тариф {pkg} не найден", 500)
    sub_kind = _subscription_kind(pkg)
    existing_sub = await session.scalar(
        select(UserSubscription).where(
            UserSubscription.user_id == payment.user_id,
            UserSubscription.code == pkg,
        ).with_for_update()
    )
    old_sub = await session.scalar(
        select(UserSubscription).where(
            UserSubscription.user_id == payment.user_id,
            UserSubscription.kind == sub_kind,
            UserSubscription.is_active.is_(True),
        ).with_for_update()
    )
    if old_sub and old_sub is not existing_sub:
        old_sub.is_active = False
    title = str(plan["title"])
    tokens = int(plan["tokens_per_month"])
    price = int(plan["price_rub"])
    if existing_sub:
        existing_sub.title = title
        existing_sub.kind = sub_kind
        existing_sub.tokens_per_month = tokens
        existing_sub.price_rub = price
        existing_sub.payment_id = payment.id
        existing_sub.is_active = True
        existing_sub.expires_at = None
    else:
        session.add(
            UserSubscription(
                user_id=payment.user_id,
                code=pkg,
                title=title,
                kind=sub_kind,
                tokens_per_month=tokens,
                price_rub=price,
                payment_id=payment.id,
                is_active=True,
            )
        )


async def _cancel_subscription_for_payment(session: AsyncSession, payment: Payment) -> None:
    if not payment.package_code:
        return
    sub = await session.scalar(
        select(UserSubscription).where(
            UserSubscription.user_id == payment.user_id,
            UserSubscription.code == payment.package_code,
            UserSubscription.payment_id == payment.id,
            UserSubscription.is_active.is_(True),
        ).with_for_update()
    )
    if sub:
        sub.is_active = False
        sub.expires_at = datetime.now(timezone.utc)


async def _resolve_payment_catalog_item(
    session: AsyncSession,
    amount_rub: float | int | None,
    credits: int,
    package_code: str | None,
) -> tuple[int, float, str | None]:
    """Resolve payable item from server-side catalog.

    The client may choose a package code or a custom top-up amount, but it must
    not be the source of truth for subscription prices or token amounts.
    """
    if package_code:
        code = str(package_code).strip().lower()
        pkg = await session.scalar(
            select(TokenPackage).where(TokenPackage.code == code, TokenPackage.is_active.is_(True))
        )
        if pkg:
            return int(pkg.total_tokens or pkg.tokens), float(pkg.price_rub), pkg.title

        plan = _subscription_plan(code)
        if plan:
            return int(plan["tokens_per_month"]), float(plan["price_rub"]), str(plan["title"])

        raise AppError("package_not_found", f"Пакет {package_code} не найден", 404)

    if amount_rub is None:
        raise AppError("invalid_payment_package", "Укажите пакет или сумму пополнения", 422)

    amount_decimal = Decimal(str(amount_rub))
    if amount_decimal != amount_decimal.to_integral_value():
        raise AppError("invalid_amount", "Сумма пополнения должна быть целым числом рублей", 422)
    amount = int(amount_decimal)
    if amount < MIN_CUSTOM_TOPUP_RUB:
        raise AppError(
            "amount_too_low",
            f"Минимальная сумма пополнения: {MIN_CUSTOM_TOPUP_RUB} ₽",
            422,
        )

    # Custom top-up: 1 RUB = 1 token. Credits from the client are ignored.
    return amount, float(amount), "Своя сумма"


async def create_mock_payment(session: AsyncSession, user: User, credits: int) -> Payment:
    if credits not in PAYMENT_PACKAGES:
        raise AppError("invalid_payment_package", "Недоступный пакет кредитов")
    payment = Payment(user_id=user.id, provider="manual_mock", credits=credits, status="created")
    session.add(payment)
    await session.commit()
    await session.refresh(payment)
    return payment


async def create_payment(
    session: AsyncSession,
    user: User,
    amount_rub: float | int | None,
    credits: int,
    package_code: str | None = None,
    return_url: str | None = None,
) -> tuple[Payment, str | None]:
    """Создать платёж.

    Если T-Bank включён — вызывает Init и возвращает PaymentURL.
    Иначе — ручной/mock режим.
    """
    package_code = str(package_code).strip().lower() if package_code else None
    final_credits, final_amount, item_title = await _resolve_payment_catalog_item(
        session=session,
        amount_rub=amount_rub,
        credits=credits,
        package_code=package_code,
    )

    # --- T-Bank реальный платёж ---
    if settings.tbank_enabled:
        from backend.app.services.tbank import _generate_order_id, init_payment, TbankError

        order_id = _generate_order_id()
        amount_kopecks = int(round(Decimal(str(final_amount)) * 100))
        channel = _payment_channel(return_url)
        success_url, fail_url = _payment_return_urls(return_url, order_id)

        description = f"Пополнение {final_credits} токенов Hubicx"
        if package_code:
            description = f"{item_title or package_code} — Hubicx"

        try:
            tbank_resp = await init_payment(
                amount_kopecks=amount_kopecks,
                order_id=order_id,
                description=description,
                notification_url=f"{settings.backend_url}/api/payments/notify",
                success_url=success_url,
                fail_url=fail_url,
                customer_key=str(user.id),
                channel=channel,
            )
        except TbankError as e:
            raise AppError("tbank_error", f"Ошибка платёжного шлюза: {e.message}", 502)

        payment = Payment(
            user_id=user.id,
            provider="tbank",
            amount_rub=final_amount,
            credits=final_credits,
            package_code=package_code,
            status="created",
            external_payment_id=order_id,
            referral_partner_id=user.referred_by_partner_id,
        )
        session.add(payment)
        await session.commit()
        await session.refresh(payment)

        payment_url = tbank_resp.get("PaymentURL", "")
        return payment, payment_url

    # --- Manual/mock режим (T-Bank выключен) ---
    payment = Payment(
        user_id=user.id,
        provider="manual_mock",
        amount_rub=final_amount,
        credits=final_credits,
        package_code=package_code,
        status="created",
        referral_partner_id=user.referred_by_partner_id,
    )
    session.add(payment)
    await session.commit()
    await session.refresh(payment)

    return payment, None


async def process_webhook(session: AsyncSession, event: dict) -> None:
    """Обработать уведомление от платёжного шлюза.

    Для T-Bank: проверяет Token, обновляет статус Payment, начисляет токены.
    Для manual/mock: ничего не делает.
    """
    provider = event.get("TerminalKey") and "tbank"

    if provider == "tbank":
        from backend.app.services.tbank import verify_notification

        if not verify_notification(event):
            raise AppError("bad_signature", "Неверная подпись уведомления", 403)

        order_id = event.get("OrderId")
        status = (event.get("Status") or "").upper()
        tbank_payment_id = event.get("PaymentId")

        payment = await session.scalar(
            select(Payment).where(Payment.external_payment_id == order_id).with_for_update()
        )
        if not payment:
            # Try matching by prefix (before the | separator)
            payment = await session.scalar(
                select(Payment).where(Payment.external_payment_id.like(f"{order_id}%")).with_for_update()
            )
        if not payment:
            return

        # Store T-Bank PaymentId
        if tbank_payment_id and '|' not in (payment.external_payment_id or ''):
            payment.external_payment_id = f"{order_id}|{tbank_payment_id}"

        if payment.status in ("confirmed", "refunded", "reversed") and status not in ("CONFIRMED", "REFUNDED", "REVERSED"):
            logger.info(
                "Ignoring non-terminal T-Bank status for terminal payment order_id=%s payment_id=%s status=%s current_status=%s",
                order_id,
                payment.id,
                status,
                payment.status,
            )
            await session.commit()
            return

        if status == "CONFIRMED" and payment.status in ("confirmed", "refunded", "reversed"):
            if payment.status in ("refunded", "reversed"):
                logger.warning(
                    "Ignoring late CONFIRMED for terminal payment order_id=%s payment_id=%s current_status=%s",
                    order_id,
                    payment.id,
                    payment.status,
                )
            await session.commit()
            return

        if status == "CONFIRMED":
            from backend.app.services.balance import apply_balance_operation

            payment.status = "confirmed"
            payment.paid_at = payment.paid_at or datetime.now(timezone.utc)
            if not await _has_payment_ledger(session, payment.id, "payment_topup"):
                await apply_balance_operation(
                    session,
                    user_id=payment.user_id,
                    amount=int(payment.credits),
                    operation_type="payment_topup",
                    reason=f"Пополнение через Т-Банк, заказ {order_id}",
                    payment_id=payment.id,
                )
                session.add(
                    Transaction(
                        user_id=payment.user_id,
                        type="purchase",
                        amount_credits=int(payment.credits),
                        status="completed",
                        payment_id=payment.id,
                    )
                )
            await _activate_subscription(session, payment)
            await _apply_payment_commission(session, payment)
        elif status in ("REFUNDED", "REVERSED") and payment.status not in ("refunded", "reversed"):
            from backend.app.services.balance import apply_balance_operation

            was_confirmed = payment.status == "confirmed"
            has_topup = await _has_payment_ledger(session, payment.id, "payment_topup")
            has_refund = await _has_payment_ledger(session, payment.id, "payment_refund")
            payment.status = status.lower()
            if (was_confirmed or has_topup) and not has_refund:
                await apply_balance_operation(
                    session,
                    user_id=payment.user_id,
                    amount=-int(payment.credits),
                    operation_type="payment_refund",
                    reason=f"Возврат Т-Банк, заказ {order_id}",
                    payment_id=payment.id,
                    allow_negative=True,
                )
            await _cancel_subscription_for_payment(session, payment)
            await _cancel_payment_commissions(session, payment.id)
        else:
            payment.status = status.lower()

        await session.commit()

    # manual_mock / другие провайдеры — ignore
