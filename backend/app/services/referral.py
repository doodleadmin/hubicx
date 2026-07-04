"""
Referral system business logic: partners, clicks, conversions, commissions.
"""
from datetime import datetime, timedelta, timezone
import logging
from typing import Sequence

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import (
    Payment,
    ReferralClick,
    ReferralCommission,
    ReferralCommissionRate,
    ReferralConversion,
    ReferralPartner,
    ReferralPayoutRequest,
    User,
)
from backend.app.utils.safe_logging import log_event


logger = logging.getLogger(__name__)


async def get_partner_by_code(session: AsyncSession, code: str) -> ReferralPartner | None:
    stmt = select(ReferralPartner).where(ReferralPartner.code == code)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def get_active_partner_by_code(session: AsyncSession, code: str) -> ReferralPartner | None:
    stmt = select(ReferralPartner).where(
        ReferralPartner.code == code,
        ReferralPartner.status == "active",
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def track_click(
    session: AsyncSession,
    partner_code: str,
    source_url: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> ReferralClick | None:
    partner = await get_active_partner_by_code(session, partner_code)
    if not partner:
        log_event(logger, logging.INFO, "REFERRAL_CLICK_IGNORED", partner_code=partner_code, reason="inactive_or_missing")
        return None

    click = ReferralClick(
        partner_code=partner_code,
        source_url=source_url,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    session.add(click)
    await session.flush()
    log_event(logger, logging.INFO, "REFERRAL_CLICK_TRACKED", click_id=click.id, partner_code=partner_code)
    return click


async def track_conversion(
    session: AsyncSession,
    user_id: int,
    partner_code: str | None = None,
    click_id: int | None = None,
) -> ReferralPartner | None:
    """Assign a partner to a new user."""
    partner = None
    if partner_code:
        partner = await get_active_partner_by_code(session, partner_code)

    if not partner:
        log_event(logger, logging.INFO, "REFERRAL_CONVERSION_IGNORED", partner_code=partner_code, reason="inactive_or_missing")
        return None

    user = await session.get(User, user_id)
    if not user:
        log_event(logger, logging.INFO, "REFERRAL_CONVERSION_IGNORED", user_id=user_id, reason="user_missing")
        return None

    if user.referred_by_partner_id:
        log_event(
            logger,
            logging.INFO,
            "REFERRAL_CONVERSION_ALREADY_ASSIGNED",
            user_id=user_id,
            partner_id=user.referred_by_partner_id,
        )
        return await session.get(ReferralPartner, user.referred_by_partner_id)

    existing = await session.scalar(
        select(ReferralConversion).where(ReferralConversion.referred_user_id == user_id)
    )
    if existing:
        user.referred_by_partner_id = existing.partner_id
        await session.flush()
        return await session.get(ReferralPartner, existing.partner_id)

    user.referred_by_partner_id = partner.id

    conv = ReferralConversion(
        partner_id=partner.id,
        referred_user_id=user_id,
        click_id=click_id,
    )
    session.add(conv)
    await session.flush()
    log_event(logger, logging.INFO, "REFERRAL_CONVERSION_TRACKED", user_id=user_id, partner_id=partner.id, click_id=click_id)
    return partner


async def get_commission_rate(
    session: AsyncSession,
    partner_id: int | None,
    category: str,
) -> float:
    """Return commission rate (percent) for a given partner and category.
    
    Priority: partner-specific rate → global default rate → 0.
    """
    # Try partner-specific rate
    if partner_id:
        stmt = select(ReferralCommissionRate).where(
            and_(
                ReferralCommissionRate.partner_id == partner_id,
                ReferralCommissionRate.category == category,
            )
        )
        result = await session.execute(stmt)
        rate = result.scalar_one_or_none()
        if rate:
            return rate.rate_percent

    # Try global default
    stmt = select(ReferralCommissionRate).where(
        and_(
            ReferralCommissionRate.partner_id.is_(None),
            ReferralCommissionRate.category == category,
        )
    )
    result = await session.execute(stmt)
    rate = result.scalar_one_or_none()
    if rate:
        return rate.rate_percent

    return 0


async def calculate_commission(
    session: AsyncSession,
    payment: Payment,
    category: str,
) -> ReferralCommission | None:
    """Calculate and create a commission entry for a payment."""
    if not payment.referral_partner_id:
        log_event(logger, logging.INFO, "REFERRAL_COMMISSION_SKIPPED", payment_id=payment.id, reason="no_partner")
        return None

    existing = await session.scalar(
        select(ReferralCommission).where(ReferralCommission.payment_id == payment.id)
    )
    if existing:
        log_event(logger, logging.INFO, "REFERRAL_COMMISSION_IDEMPOTENT", payment_id=payment.id, commission_id=existing.id)
        return existing

    partner = await session.get(ReferralPartner, payment.referral_partner_id)
    if not partner or partner.status != "active":
        log_event(
            logger,
            logging.INFO,
            "REFERRAL_COMMISSION_SKIPPED",
            payment_id=payment.id,
            partner_id=payment.referral_partner_id,
            reason="partner_inactive_or_missing",
        )
        return None

    rate = await get_commission_rate(session, payment.referral_partner_id, category)
    if rate <= 0:
        log_event(
            logger,
            logging.INFO,
            "REFERRAL_COMMISSION_SKIPPED",
            payment_id=payment.id,
            partner_id=payment.referral_partner_id,
            category=category,
            reason="zero_rate",
        )
        return None

    commission_rub = round(float(payment.amount_rub or 0) * rate / 100, 2)

    comm = ReferralCommission(
        partner_id=payment.referral_partner_id,
        payment_id=payment.id,
        referred_user_id=payment.user_id,
        category=category,
        amount_rub=payment.amount_rub,
        rate_percent=rate,
        commission_rub=commission_rub,
        status="pending",
    )
    session.add(comm)
    await session.flush()
    log_event(
        logger,
        logging.INFO,
        "REFERRAL_COMMISSION_CREATED",
        payment_id=payment.id,
        partner_id=payment.referral_partner_id,
        category=category,
        amount_rub=payment.amount_rub,
        rate_percent=rate,
        commission_rub=commission_rub,
    )
    return comm


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def mature_commission_cutoff(hold_days: int | None) -> datetime:
    days = max(0, int(hold_days if hold_days is not None else 14))
    return _utc_now() - timedelta(days=days)


async def get_partner_payout_summary(session: AsyncSession, partner: ReferralPartner) -> dict:
    cutoff = mature_commission_cutoff(partner.hold_days)

    available_stmt = select(
        func.coalesce(func.sum(ReferralCommission.commission_rub), 0)
    ).where(
        and_(
            ReferralCommission.partner_id == partner.id,
            ReferralCommission.status == "pending",
            ReferralCommission.created_at <= cutoff,
        )
    )
    pending_hold_stmt = select(
        func.coalesce(func.sum(ReferralCommission.commission_rub), 0)
    ).where(
        and_(
            ReferralCommission.partner_id == partner.id,
            ReferralCommission.status == "pending",
            ReferralCommission.created_at > cutoff,
        )
    )
    processing_stmt = select(
        func.coalesce(func.sum(ReferralPayoutRequest.amount_rub), 0)
    ).where(
        and_(
            ReferralPayoutRequest.partner_id == partner.id,
            ReferralPayoutRequest.status.in_(["requested", "approved"]),
        )
    )
    paid_stmt = select(
        func.coalesce(func.sum(ReferralPayoutRequest.amount_rub), 0)
    ).where(
        and_(
            ReferralPayoutRequest.partner_id == partner.id,
            ReferralPayoutRequest.status == "paid",
        )
    )

    available = float((await session.execute(available_stmt)).scalar() or 0)
    pending_hold = float((await session.execute(pending_hold_stmt)).scalar() or 0)
    processing = float((await session.execute(processing_stmt)).scalar() or 0)
    total_paid = float((await session.execute(paid_stmt)).scalar() or 0)
    return {
        "available_balance": round(available, 2),
        "pending_hold": round(pending_hold, 2),
        "processing": round(processing, 2),
        "total_paid": round(total_paid, 2),
        "hold_days": int(partner.hold_days if partner.hold_days is not None else 14),
        "hold_until_hint": cutoff.isoformat(),
    }


async def create_payout_request(
    session: AsyncSession,
    partner: ReferralPartner,
    payout_details: dict | None = None,
) -> ReferralPayoutRequest:
    cutoff = mature_commission_cutoff(partner.hold_days)
    result = await session.execute(
        select(ReferralCommission)
        .where(
            and_(
                ReferralCommission.partner_id == partner.id,
                ReferralCommission.status == "pending",
                ReferralCommission.created_at <= cutoff,
            )
        )
        .order_by(ReferralCommission.created_at)
    )
    commissions = result.scalars().all()
    amount = round(sum(float(c.commission_rub or 0) for c in commissions), 2)
    if amount <= 0:
        from backend.app.utils.errors import AppError

        raise AppError("no_available_payout_balance", "Нет доступной суммы для вывода с учётом холда", 422)

    payout = ReferralPayoutRequest(
        partner_id=partner.id,
        amount_rub=amount,
        status="requested",
        payout_details=payout_details or partner.contact_info,
    )
    session.add(payout)
    await session.flush()
    for commission in commissions:
        commission.status = "requested"
        commission.payout_request_id = payout.id
    await session.flush()
    return payout


async def set_payout_status(
    session: AsyncSession,
    payout: ReferralPayoutRequest,
    status: str,
    admin_user_id: int | None = None,
    admin_note: str | None = None,
) -> ReferralPayoutRequest:
    allowed = {"requested", "approved", "paid", "rejected", "cancelled"}
    if status not in allowed:
        from backend.app.utils.errors import AppError

        raise AppError("invalid_payout_status", "Некорректный статус выплаты", 422)

    payout.status = status
    if admin_note is not None:
        payout.admin_note = admin_note
    if status in {"paid", "rejected", "cancelled"}:
        payout.processed_at = _utc_now()
        payout.processed_by_user_id = admin_user_id

    result = await session.execute(
        select(ReferralCommission).where(ReferralCommission.payout_request_id == payout.id)
    )
    commissions = result.scalars().all()
    if status == "paid":
        for commission in commissions:
            commission.status = "paid"
    elif status in {"rejected", "cancelled"}:
        for commission in commissions:
            commission.status = "pending"
            commission.payout_request_id = None
    else:
        for commission in commissions:
            commission.status = status
    await session.flush()
    return payout


async def get_partner_stats(
    session: AsyncSession,
    partner_id: int,
    days: int = 30,
) -> dict:
    """Aggregated stats for partner dashboard."""
    # Total clicks
    partner = await session.get(ReferralPartner, partner_id)
    if not partner:
        return {}

    clicks_stmt = select(func.count(ReferralClick.id)).where(
        ReferralClick.partner_code == partner.code
    )
    clicks_res = await session.execute(clicks_stmt)
    total_clicks = clicks_res.scalar() or 0

    # Total conversions
    convs_stmt = select(func.count(ReferralConversion.id)).where(
        ReferralConversion.partner_id == partner_id
    )
    convs_res = await session.execute(convs_stmt)
    total_conversions = convs_res.scalar() or 0

    # Total commissions
    comms_stmt = select(
        func.coalesce(func.sum(ReferralCommission.commission_rub), 0)
    ).where(ReferralCommission.partner_id == partner_id)
    comms_res = await session.execute(comms_stmt)
    total_commissions = float(comms_res.scalar() or 0)

    # Pending payout
    pending_stmt = select(
        func.coalesce(func.sum(ReferralCommission.commission_rub), 0)
    ).where(
        and_(
            ReferralCommission.partner_id == partner_id,
            ReferralCommission.status == "pending",
        )
    )
    pending_res = await session.execute(pending_stmt)
    pending_payout = float(pending_res.scalar() or 0)

    # Daily stats for last N days
    since = datetime.utcnow() - timedelta(days=days)

    clicks_daily_stmt = (
        select(func.date(ReferralClick.created_at), func.count(ReferralClick.id))
        .where(
            and_(
                ReferralClick.partner_code == partner.code,
                ReferralClick.created_at >= since,
            )
        )
        .group_by(func.date(ReferralClick.created_at))
        .order_by(func.date(ReferralClick.created_at))
    )
    daily: dict[str, dict] = {}
    for row in (await session.execute(clicks_daily_stmt)).all():
        key = str(row[0])
        daily.setdefault(key, {"date": key, "clicks": 0, "conversions": 0, "payments": 0, "commission": 0})
        daily[key]["clicks"] = row[1]

    conv_daily_stmt = (
        select(func.date(ReferralConversion.created_at), func.count(ReferralConversion.id))
        .where(
            and_(
                ReferralConversion.partner_id == partner_id,
                ReferralConversion.created_at >= since,
            )
        )
        .group_by(func.date(ReferralConversion.created_at))
    )
    for row in (await session.execute(conv_daily_stmt)).all():
        key = str(row[0])
        daily.setdefault(key, {"date": key, "clicks": 0, "conversions": 0, "payments": 0, "commission": 0})
        daily[key]["conversions"] = row[1]

    payments_count_stmt = select(func.count(ReferralCommission.id)).where(ReferralCommission.partner_id == partner_id)
    payments_count = (await session.execute(payments_count_stmt)).scalar() or 0

    comm_daily_stmt = (
        select(
            func.date(ReferralCommission.created_at),
            func.count(ReferralCommission.id),
            func.coalesce(func.sum(ReferralCommission.commission_rub), 0),
        )
        .where(
            and_(
                ReferralCommission.partner_id == partner_id,
                ReferralCommission.created_at >= since,
            )
        )
        .group_by(func.date(ReferralCommission.created_at))
    )
    for row in (await session.execute(comm_daily_stmt)).all():
        key = str(row[0])
        daily.setdefault(key, {"date": key, "clicks": 0, "conversions": 0, "payments": 0, "commission": 0})
        daily[key]["payments"] = row[1]
        daily[key]["commission"] = float(row[2] or 0)

    daily_rows = [daily[key] for key in sorted(daily)]

    return {
        "partner_code": partner.code,
        "partner_name": partner.name,
        "total_clicks": total_clicks,
        "total_conversions": total_conversions,
        "total_payments": payments_count,
        "total_commission": total_commissions,
        "total_commissions_rub": total_commissions,
        "unpaid_commission": pending_payout,
        "pending_payout_rub": pending_payout,
        "daily": daily_rows,
        "clicks_daily": daily_rows,
    }
