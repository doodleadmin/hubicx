"""
Partner program for every user: referral attribution, partner balance,
withdrawals (paid out manually by an admin) and purchases paid from the balance.

The partner balance is derived, never stored:
    available = matured commissions - (pending/approved/paid withdrawals + purchases)
Commissions mature after the partner's hold period; canceled ones (refunds) are ignored.
"""
from datetime import datetime, timezone
from decimal import ROUND_HALF_UP, Decimal, InvalidOperation
import logging
import re

from sqlalchemy import and_, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.config import settings
from backend.app.db.models import (
    Payment,
    ReferralCommission,
    ReferralConversion,
    ReferralPartner,
    ReferralPayoutRequest,
    User,
)
from backend.app.services.business import (
    PARTNER_COMMISSION_PERCENT,
    PARTNER_HOLD_DAYS,
    PARTNER_MIN_PAYOUT_RUB,
    PARTNER_PAYOUT_METHODS,
    PARTNER_WITHDRAWALS_ENABLED,
)
from backend.app.services.referral import get_active_partner_by_code, mature_commission_cutoff, track_conversion
from backend.app.utils.errors import AppError
from backend.app.utils.safe_logging import log_event

logger = logging.getLogger(__name__)

REF_PREFIX = "ref_"
DEBIT_STATUSES = ("requested", "approved", "paid")
WITHDRAWAL_IN_PROGRESS = ("requested", "approved")
CENT = Decimal("0.01")


def money(value) -> Decimal:
    return Decimal(str(value or 0)).quantize(CENT, rounding=ROUND_HALF_UP)


def parse_ref_payload(raw: str | None) -> str | None:
    """Extract a referral code from a bot /start payload or a Mini App start_param."""
    code = str(raw or "").strip()
    if code.startswith(REF_PREFIX):
        code = code[len(REF_PREFIX):]
    if not code or len(code) > 64 or not re.fullmatch(r"[A-Za-z0-9_-]+", code):
        return None
    return code


def referral_link(code: str) -> str:
    bot = (settings.bot_username or "").lstrip("@")
    return f"https://t.me/{bot}?start={REF_PREFIX}{code}" if bot else ""


def compute_balance(earned: Decimal, matured: Decimal, debits: dict[tuple[str, str], Decimal]) -> dict:
    """Pure balance math. `debits` maps (kind, status) to the summed amount."""
    def total(kinds: tuple[str, ...], statuses: tuple[str, ...]) -> Decimal:
        return sum((amount for (kind, status), amount in debits.items() if kind in kinds and status in statuses), Decimal("0"))

    debited = total(("withdrawal", "purchase"), DEBIT_STATUSES)
    available = max(Decimal("0"), matured - debited)
    return {
        "available_rub": float(money(available)),
        "hold_rub": float(money(max(Decimal("0"), earned - matured))),
        "earned_total_rub": float(money(earned)),
        "withdrawn_rub": float(money(total(("withdrawal",), ("paid",)))),
        "withdrawal_processing_rub": float(money(total(("withdrawal",), WITHDRAWAL_IN_PROGRESS))),
        "spent_rub": float(money(total(("purchase",), ("paid",)))),
    }


def validate_payout_details(method: str, details: dict | None) -> dict:
    """Normalise payout requisites. Returns what gets stored for the admin."""
    if method not in PARTNER_PAYOUT_METHODS:
        raise AppError("invalid_payout_method", "Выберите способ вывода", 422)
    details = details or {}
    holder = str(details.get("holder") or "").strip()
    if not 2 <= len(holder) <= 80:
        raise AppError("invalid_payout_holder", "Укажите имя получателя", 422)

    if method == "card":
        number = re.sub(r"[\s-]", "", str(details.get("card") or ""))
        if not re.fullmatch(r"\d{16,19}", number) or not _luhn_ok(number):
            raise AppError("invalid_card_number", "Проверьте номер карты", 422)
        return {"method": "card", "card": number, "holder": holder}

    digits = re.sub(r"\D", "", str(details.get("phone") or ""))
    if len(digits) == 11 and digits[0] in "78":
        digits = "7" + digits[1:]
    if not re.fullmatch(r"7\d{10}", digits):
        raise AppError("invalid_phone", "Укажите номер телефона в формате +7", 422)
    bank = str(details.get("bank") or "").strip()
    if not 2 <= len(bank) <= 64:
        raise AppError("invalid_bank", "Укажите банк получателя", 422)
    return {"method": "sbp", "phone": f"+{digits}", "bank": bank, "holder": holder}


def mask_payout_details(details: dict | None) -> str:
    details = details or {}
    if details.get("method") == "card" and details.get("card"):
        return f"Карта •• {str(details['card'])[-4:]}"
    if details.get("method") == "sbp" and details.get("phone"):
        return f"СБП {details.get('bank') or ''} •• {str(details['phone'])[-4:]}".replace("  ", " ")
    return ""


def _luhn_ok(number: str) -> bool:
    total = 0
    for index, char in enumerate(reversed(number)):
        digit = int(char)
        if index % 2 == 1:
            digit *= 2
            if digit > 9:
                digit -= 9
        total += digit
    return total % 10 == 0


async def ensure_user_partner(session: AsyncSession, user: User) -> ReferralPartner:
    partner = await session.scalar(select(ReferralPartner).where(ReferralPartner.user_id == user.id))
    if partner:
        return partner
    code = user.ref_code
    if await session.scalar(select(ReferralPartner.id).where(ReferralPartner.code == code)):
        code = f"u{user.id}"
    partner = ReferralPartner(
        code=code,
        name=f"@{user.username}" if user.username else (user.first_name or f"user {user.id}"),
        status="active",
        hold_days=PARTNER_HOLD_DAYS,
        user_id=user.id,
        contact_info={"telegram_id": user.telegram_id, "username": user.username},
    )
    try:
        async with session.begin_nested():
            session.add(partner)
    except IntegrityError:
        # Created concurrently by another request for the same user.
        partner = await session.scalar(select(ReferralPartner).where(ReferralPartner.user_id == user.id))
        if partner is None:
            raise
    return partner


async def attribute_referral(session: AsyncSession, user: User, raw_payload: str | None) -> ReferralPartner | None:
    """Tie a new user to whoever invited them. Existing attributions are never changed."""
    code = parse_ref_payload(raw_payload)
    if not code or user.referred_by_partner_id:
        return None
    partner = await get_active_partner_by_code(session, code)
    if partner is None:
        referrer = await session.scalar(select(User).where(User.ref_code == code))
        if referrer is None or referrer.id == user.id:
            return None
        partner = await ensure_user_partner(session, referrer)
    if partner.user_id == user.id:
        return None
    return await track_conversion(session, user.id, partner.code)


async def _lock_partner(session: AsyncSession, partner_id: int) -> ReferralPartner:
    return await session.scalar(select(ReferralPartner).where(ReferralPartner.id == partner_id).with_for_update())


async def partner_balance(session: AsyncSession, partner: ReferralPartner) -> dict:
    cutoff = mature_commission_cutoff(partner.hold_days)
    counted = and_(ReferralCommission.partner_id == partner.id, ReferralCommission.status != "canceled")
    earned = money(await session.scalar(select(func.coalesce(func.sum(ReferralCommission.commission_rub), 0)).where(counted)))
    matured = money(await session.scalar(
        select(func.coalesce(func.sum(ReferralCommission.commission_rub), 0)).where(counted, ReferralCommission.created_at <= cutoff)
    ))
    rows = await session.execute(
        select(ReferralPayoutRequest.kind, ReferralPayoutRequest.status, func.coalesce(func.sum(ReferralPayoutRequest.amount_rub), 0))
        .where(ReferralPayoutRequest.partner_id == partner.id)
        .group_by(ReferralPayoutRequest.kind, ReferralPayoutRequest.status)
    )
    debits = {(kind, status): money(amount) for kind, status, amount in rows.all()}
    return compute_balance(earned, matured, debits)


async def partner_overview(session: AsyncSession, user: User) -> dict:
    partner = await ensure_user_partner(session, user)
    balance = await partner_balance(session, partner)
    invited = await session.scalar(select(func.count(ReferralConversion.id)).where(ReferralConversion.partner_id == partner.id))
    buyers = await session.scalar(
        select(func.count(func.distinct(ReferralCommission.referred_user_id))).where(
            ReferralCommission.partner_id == partner.id, ReferralCommission.status != "canceled"
        )
    )
    operations = (await session.execute(
        select(ReferralPayoutRequest)
        .where(ReferralPayoutRequest.partner_id == partner.id)
        .order_by(ReferralPayoutRequest.created_at.desc())
        .limit(20)
    )).scalars().all()
    return {
        "code": partner.code,
        "link": referral_link(partner.code),
        "percent": PARTNER_COMMISSION_PERCENT,
        "hold_days": int(partner.hold_days if partner.hold_days is not None else PARTNER_HOLD_DAYS),
        "min_payout_rub": PARTNER_MIN_PAYOUT_RUB,
        "withdrawals_enabled": PARTNER_WITHDRAWALS_ENABLED,
        "payout_methods": [{"code": code, "title": title} for code, title in PARTNER_PAYOUT_METHODS.items()],
        "invited_count": int(invited or 0),
        "buyers_count": int(buyers or 0),
        "balance": balance,
        "operations": [
            {
                "id": op.id,
                "kind": op.kind,
                "status": op.status,
                "amount_rub": float(money(op.amount_rub)),
                "details": mask_payout_details(op.payout_details) if op.kind == "withdrawal" else (op.payout_details or {}).get("title", ""),
                "created_at": op.created_at.isoformat() if op.created_at else None,
            }
            for op in operations
        ],
    }


async def request_withdrawal(session: AsyncSession, user: User, amount_rub, method: str, details: dict | None) -> ReferralPayoutRequest:
    if not PARTNER_WITHDRAWALS_ENABLED:
        raise AppError("withdrawals_disabled", "Вывод средств скоро будет доступен. Пока заработок можно потратить на тарифы и токены.", 403)
    try:
        amount = money(amount_rub)
    except (InvalidOperation, ValueError):
        raise AppError("invalid_amount", "Укажите сумму вывода", 422)
    if amount < PARTNER_MIN_PAYOUT_RUB:
        raise AppError("amount_too_low", f"Минимальная сумма вывода — {PARTNER_MIN_PAYOUT_RUB} ₽", 422)
    stored_details = validate_payout_details(method, details)

    partner = await _lock_partner(session, (await ensure_user_partner(session, user)).id)
    available = money((await partner_balance(session, partner))["available_rub"])
    if amount > available:
        raise AppError("insufficient_partner_balance", "Недостаточно средств на партнёрском балансе", 422)

    payout = ReferralPayoutRequest(
        partner_id=partner.id,
        kind="withdrawal",
        amount_rub=amount,
        status="requested",
        payout_details=stored_details,
    )
    session.add(payout)
    await session.flush()
    log_event(logger, logging.INFO, "PARTNER_WITHDRAWAL_REQUESTED", partner_id=partner.id, payout_id=payout.id, amount_rub=float(amount))
    return payout


async def purchase_with_partner_balance(
    session: AsyncSession,
    user: User,
    package_code: str | None,
    amount_rub: float | int | None,
) -> Payment:
    """Pay for a plan or tokens from the partner balance. No commission is paid on these."""
    from backend.app.services.payments import _resolve_payment_catalog_item, grant_confirmed_payment

    package_code = str(package_code).strip().lower() if package_code else None
    credits, price, title = await _resolve_payment_catalog_item(session, amount_rub, 0, package_code)
    price_dec = money(price)

    partner = await _lock_partner(session, (await ensure_user_partner(session, user)).id)
    available = money((await partner_balance(session, partner))["available_rub"])
    if price_dec > available:
        raise AppError("insufficient_partner_balance", "Недостаточно средств на партнёрском балансе", 422)

    payment = Payment(
        user_id=user.id,
        provider="partner_balance",
        amount_rub=float(price_dec),
        credits=credits,
        package_code=package_code,
        status="confirmed",
        paid_at=datetime.now(timezone.utc),
        referral_partner_id=None,
    )
    session.add(payment)
    await session.flush()
    await grant_confirmed_payment(session, payment, f"Оплата с партнёрского баланса: {title or package_code or 'токены'}")
    session.add(ReferralPayoutRequest(
        partner_id=partner.id,
        kind="purchase",
        amount_rub=price_dec,
        status="paid",
        payment_id=payment.id,
        payout_details={"title": title or "Токены", "package_code": package_code, "credits": credits},
        processed_at=datetime.now(timezone.utc),
    ))
    await session.flush()
    log_event(logger, logging.INFO, "PARTNER_BALANCE_PURCHASE", partner_id=partner.id, payment_id=payment.id, amount_rub=float(price_dec))
    return payment
