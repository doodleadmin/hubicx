from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import Payment, ReferralCommission, TokenPackage, User
from backend.app.utils.errors import AppError


PAYMENT_PACKAGES = {300, 1000, 3000, 10000}

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
) -> tuple[Payment, str | None]:
    """Create a disabled/manual payment order.

    Real acquiring is not enabled yet, but frontend/backend use this method to
    preview/create an order. Keep it package-aware so new pricing packages pass
    validation and old packages do not.

    Also calculates referral commission if user was referred by a partner.
    """
    final_credits = int(credits)
    final_amount = float(amount_rub or 0)

    if package_code:
        pkg = await session.scalar(
            select(TokenPackage).where(TokenPackage.code == package_code, TokenPackage.is_active.is_(True))
        )
        if not pkg:
            raise AppError("package_not_found", f"Пакет {package_code} не найден", 404)
        final_credits = int(pkg.total_tokens or pkg.tokens)
        final_amount = float(pkg.price_rub)
    elif final_credits not in PAYMENT_PACKAGES:
        raise AppError("invalid_payment_package", "Недоступный пакет кредитов")

    payment = Payment(
        user_id=user.id,
        provider="manual_mock",
        amount_rub=final_amount,
        credits=final_credits,
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
            # Commission failure should never block the payment itself
            pass

    return payment, None


async def process_webhook(session: AsyncSession, event: dict) -> None:
    # Payments are disabled/manual in current production mode.
    return None
