from decimal import Decimal
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.config import settings
from backend.app.db.models import Payment, ReferralCommission, TokenPackage, Transaction, User, UserSubscription
from backend.app.utils.errors import AppError

logger = logging.getLogger(__name__)

PAYMENT_PACKAGES = {300, 1000, 3000, 10000}

# Subscription packages (code → kind mapping)
SUBSCRIPTION_CODES: dict[str, str] = {
    "templates_mini":  "template",
    "templates_plus":  "template",
    "creator":         "full",
    "creator_pro":     "full",
    "studio":          "full",
}

# Subscription info: code → (title, tokens, price_rub)
SUBSCRIPTION_INFO: dict[str, tuple[str, int, int]] = {
    "templates_mini":  ("Шаблоны Mini", 800, 790),
    "templates_plus":  ("Шаблоны Plus", 3500, 2590),
    "creator":         ("Creator", 1800, 1490),
    "creator_pro":     ("Creator Pro", 6500, 3990),
    "studio":          ("Studio", 18000, 9900),
}

_TOKEN_CATEGORY_CODES = {"topup_300", "topup_1000", "topup_3000", "topup_10000"}
_TEMPLATE_CATEGORY_CODES = {"templates_mini", "templates_plus"}
_FULL_CATEGORY_CODES = {"creator", "creator_pro", "studio"}


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
    final_credits = int(credits)
    final_amount = float(amount_rub or 0)

    if package_code:
        pkg = await session.scalar(
            select(TokenPackage).where(TokenPackage.code == package_code, TokenPackage.is_active.is_(True))
        )
        if not pkg:
            # Check if it's a subscription code (not in TokenPackage)
            sub_codes = list(SUBSCRIPTION_CODES.keys())
            if package_code in sub_codes:
                final_credits = int(credits)
                final_amount = float(amount_rub or 0)
            else:
                raise AppError("package_not_found", f"Пакет {package_code} не найден", 404)
        else:
            final_credits = int(pkg.total_tokens or pkg.tokens)
            final_amount = float(pkg.price_rub)
    elif final_credits not in PAYMENT_PACKAGES:
        raise AppError("invalid_payment_package", "Недоступный пакет кредитов")

    # --- T-Bank реальный платёж ---
    if settings.tbank_enabled:
        from backend.app.services.tbank import _generate_order_id, init_payment, TbankError

        order_id = _generate_order_id()
        amount_kopecks = int(round(Decimal(str(final_amount)) * 100))

        description = f"Пополнение {final_credits} токенов Hubicx"
        if package_code:
            description = f"{pkg.title if pkg else package_code} — Hubicx"

        try:
            tbank_resp = await init_payment(
                amount_kopecks=amount_kopecks,
                order_id=order_id,
                description=description,
                notification_url=f"{settings.backend_url}/api/payments/notify",
                success_url=f"{return_url or settings.webapp_url}/app?paid=success&order={order_id}",
                fail_url=f"{return_url or settings.webapp_url}/app?paid=fail&order={order_id}",
                customer_key=str(user.id),
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

    # Calculate referral commission if applicable
    category = _commission_category(package_code)
    if category and payment.referral_partner_id:
        try:
            from backend.app.services.referral import calculate_commission as calc_ref_commission
            await calc_ref_commission(session, payment, category)
            await session.commit()
            await session.refresh(payment)
        except Exception:
            logger.exception("Referral commission calculation failed for payment %s, category=%s", payment.id, category)

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

        # Блокируем строку платежа для идемпотентной обработки
        payment = await session.scalar(
            select(Payment).where(Payment.external_payment_id == order_id).with_for_update()
        )
        if not payment:
            payment = await session.scalar(
                select(Payment).where(Payment.external_payment_id.like(f"{order_id}%")).with_for_update()
            )
        if not payment:
            return

        # Store T-Bank PaymentId
        if tbank_payment_id and '|' not in (payment.external_payment_id or ''):
            payment.external_payment_id = f"{order_id}|{tbank_payment_id}"

        # Идемпотентность: не обрабатываем уже завершённые платежи повторно
        if payment.status in ("confirmed", "refunded", "reversed"):
            await session.commit()
            return

        # Начисляем токены при успешной оплате
        if status == "CONFIRMED":
            from backend.app.services.balance import apply_balance_operation

            payment.status = "confirmed"
            await apply_balance_operation(
                session,
                user_id=payment.user_id,
                amount=int(payment.credits),
                operation_type="payment_topup",
                reason=f"Пополнение через Т-Банк, заказ {order_id}",
                payment_id=payment.id,
            )
            session.add(
                Transaction(user_id=payment.user_id, type="purchase", amount_credits=int(payment.credits), status="completed", payment_id=payment.id)
            )

            # --- Активация подписки ---
            pkg = payment.package_code
            if pkg and pkg in SUBSCRIPTION_CODES:
                sub_kind = SUBSCRIPTION_CODES[pkg]
                old_sub = await session.scalar(
                    select(UserSubscription).where(
                        UserSubscription.user_id == payment.user_id,
                        UserSubscription.kind == sub_kind,
                        UserSubscription.is_active.is_(True),
                    )
                )
                if old_sub:
                    old_sub.is_active = False
                title, tokens, price = SUBSCRIPTION_INFO.get(pkg, (pkg, int(payment.credits), 0))
                new_sub = UserSubscription(
                    user_id=payment.user_id,
                    code=pkg,
                    title=title,
                    kind=sub_kind,
                    tokens_per_month=tokens,
                    price_rub=price,
                    payment_id=payment.id,
                    is_active=True,
                )
                session.add(new_sub)
        elif status in ("REFUNDED", "REVERSED"):
            from backend.app.services.balance import apply_balance_operation

            payment.status = status.lower()
            await apply_balance_operation(
                session,
                user_id=payment.user_id,
                amount=-int(payment.credits),
                operation_type="payment_refund",
                reason=f"Возврат Т-Банк, заказ {order_id}",
                payment_id=payment.id,
            )
        else:
            payment.status = status.lower()

        await session.commit()

    # manual_mock / другие провайдеры — ignore
