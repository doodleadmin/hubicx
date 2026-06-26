"""
Referral system business logic: partners, clicks, conversions, commissions.
"""
from datetime import datetime
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
    User,
)


async def get_partner_by_code(session: AsyncSession, code: str) -> ReferralPartner | None:
    stmt = select(ReferralPartner).where(ReferralPartner.code == code)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def track_click(
    session: AsyncSession,
    partner_code: str,
    source_url: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> ReferralClick:
    click = ReferralClick(
        partner_code=partner_code,
        source_url=source_url,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    session.add(click)
    await session.flush()
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
        partner = await get_partner_by_code(session, partner_code)

    if not partner:
        return None

    user = await session.get(User, user_id)
    if not user:
        return None

    if user.referred_by_partner_id:
        return await session.get(ReferralPartner, user.referred_by_partner_id)

    existing_conversion = await session.scalar(
        select(ReferralConversion).where(ReferralConversion.referred_user_id == user_id)
    )
    if existing_conversion:
        user.referred_by_partner_id = existing_conversion.partner_id
        return await session.get(ReferralPartner, existing_conversion.partner_id)

    user.referred_by_partner_id = partner.id

    conv = ReferralConversion(
        partner_id=partner.id,
        referred_user_id=user_id,
        click_id=click_id,
    )
    session.add(conv)
    await session.flush()
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
        return None

    existing = await session.scalar(
        select(ReferralCommission).where(ReferralCommission.payment_id == payment.id)
    )
    if existing:
        return existing

    rate = await get_commission_rate(session, payment.referral_partner_id, category)
    if rate <= 0:
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
    return comm


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
    since = datetime.utcnow() - datetime.timedelta(days=days)

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
    clicks_daily = []
    for row in (await session.execute(clicks_daily_stmt)).all():
        clicks_daily.append({"date": str(row[0]), "count": row[1]})

    return {
        "partner_code": partner.code,
        "partner_name": partner.name,
        "total_clicks": total_clicks,
        "total_conversions": total_conversions,
        "total_commissions_rub": total_commissions,
        "pending_payout_rub": pending_payout,
        "clicks_daily": clicks_daily,
    }
