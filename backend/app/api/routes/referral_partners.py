"""
Partner cabinet API: auth, dashboard, links, commissions, payouts.
"""
from fastapi import APIRouter, Body, Depends, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import (
    ReferralClick,
    ReferralCommission,
    ReferralConversion,
    ReferralPartner,
)
from backend.app.db.session import get_session
from backend.app.services.referral import get_partner_by_code, get_partner_stats

router = APIRouter(prefix="/partners", tags=["partners"])


async def current_partner(
    code: str = Query(..., description="Partner code for auth"),
    session: AsyncSession = Depends(get_session),
) -> ReferralPartner:
    partner = await get_partner_by_code(session, code)
    if not partner or partner.status == "blocked":
        from backend.app.utils.errors import AppError
        raise AppError("partner_not_found", "Партнёр не найден или заблокирован", 401)
    return partner


# ── Auth/Me ──

@router.get("/me")
async def partner_me(
    partner: ReferralPartner = Depends(current_partner),
) -> dict:
    return {
        "id": partner.id,
        "code": partner.code,
        "name": partner.name,
        "status": partner.status,
        "contacts": partner.contact_info,
    }


# ── Dashboard ──

@router.get("/dashboard")
async def partner_dashboard(
    partner: ReferralPartner = Depends(current_partner),
    session: AsyncSession = Depends(get_session),
) -> dict:
    return await get_partner_stats(session, partner.id)


# ── Referral Links ──

@router.get("/links")
async def partner_links(
    partner: ReferralPartner = Depends(current_partner),
) -> dict:
    ref_code = partner.code
    return {
        "code": ref_code,
        "links": [
            {
                "type": "bot",
                "label": "Telegram Bot",
                "url": f"https://t.me/hubicx_bot?start=ref_{ref_code}",
            },
            {
                "type": "webapp",
                "label": "Mini App",
                "url": f"https://webapp.hubicx.ru/?ref={ref_code}",
            },
            {
                "type": "desktop",
                "label": "Desktop App",
                "url": f"https://hubicx.ru/?ref={ref_code}",
            },
        ],
    }


# ── Statistics ──

@router.get("/stats")
async def partner_stats(
    partner: ReferralPartner = Depends(current_partner),
    session: AsyncSession = Depends(get_session),
    days: int = Query(default=30, ge=1, le=365),
) -> dict:
    return await get_partner_stats(session, partner.id, days=days)


# ── Commissions ──

@router.get("/commissions")
async def partner_commissions(
    partner: ReferralPartner = Depends(current_partner),
    session: AsyncSession = Depends(get_session),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    status: str | None = Query(default=None),
) -> dict:
    stmt = select(ReferralCommission).where(
        ReferralCommission.partner_id == partner.id
    )

    if status:
        stmt = stmt.where(ReferralCommission.status == status)

    # Total count
    count_stmt = select(func.count()).select_from(stmt.subquery())
    count_res = await session.execute(count_stmt)
    total = count_res.scalar() or 0

    stmt = stmt.order_by(ReferralCommission.created_at.desc())
    stmt = stmt.offset((page - 1) * limit).limit(limit)

    result = await session.execute(stmt)
    commissions = result.scalars().all()

    items = [
        {
            "id": c.id,
            "payment_id": c.payment_id,
            "category": c.category,
            "amount_rub": float(c.amount_rub or 0),
            "rate_percent": float(c.rate_percent),
            "commission_rub": float(c.commission_rub),
            "status": c.status,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in commissions
    ]

    return {"items": items, "total": total, "page": page, "limit": limit}


# ── Payouts ──

@router.get("/payouts")
async def partner_payouts(
    partner: ReferralPartner = Depends(current_partner),
    session: AsyncSession = Depends(get_session),
) -> dict:
    # Pending balance
    pending_stmt = await session.execute(
        select(func.coalesce(func.sum(ReferralCommission.commission_rub), 0)).where(
            and_(
                ReferralCommission.partner_id == partner.id,
                ReferralCommission.status == "pending",
            )
        )
    )
    pending_balance = float(pending_stmt.scalar() or 0)

    # Total paid
    paid_stmt = await session.execute(
        select(func.coalesce(func.sum(ReferralCommission.commission_rub), 0)).where(
            and_(
                ReferralCommission.partner_id == partner.id,
                ReferralCommission.status == "paid",
            )
        )
    )
    total_paid = float(paid_stmt.scalar() or 0)

    # Recent payouts
    stmt = (
        select(ReferralCommission)
        .where(
            and_(
                ReferralCommission.partner_id == partner.id,
                ReferralCommission.status == "paid",
            )
        )
        .order_by(ReferralCommission.updated_at.desc())
        .limit(20)
    )
    result = await session.execute(stmt)
    paid_items = result.scalars().all()

    return {
        "pending_balance_rub": pending_balance,
        "total_paid_rub": total_paid,
        "payouts": [
            {
                "id": c.id,
                "commission_rub": float(c.commission_rub),
                "category": c.category,
                "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            }
            for c in paid_items
        ],
    }
