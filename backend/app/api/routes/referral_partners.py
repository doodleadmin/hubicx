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
    ReferralPayoutRequest,
)
from backend.app.db.session import get_session
from backend.app.services.referral import create_payout_request, get_partner_by_code, get_partner_payout_summary, get_partner_stats

router = APIRouter(prefix="/partners", tags=["partners"])


async def current_partner(
    code: str = Query(..., description="Partner code for auth"),
    session: AsyncSession = Depends(get_session),
) -> ReferralPartner:
    partner = await get_partner_by_code(session, code)
    if not partner or partner.status != "active":
        from backend.app.utils.errors import AppError
        raise AppError("partner_not_found", "Партнёр не найден или неактивен", 401)
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
        "hold_days": partner.hold_days,
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
    session: AsyncSession = Depends(get_session),
) -> dict:
    ref_code = partner.code
    stats = await get_partner_stats(session, partner.id)
    common_stats = {
        "clicks": stats.get("total_clicks", 0),
        "conversions": stats.get("total_conversions", 0),
        "payments": stats.get("total_payments", 0),
        "commission": stats.get("total_commission", 0),
    }
    return {
        "code": ref_code,
        "links": [
            {
                "type": "bot",
                "label": "Telegram Bot",
                "url": f"https://t.me/hubicx_bot?start=ref_{ref_code}",
                **common_stats,
            },
            {
                "type": "webapp",
                "label": "Mini App",
                "url": f"https://webapp.hubicx.ru/?ref={ref_code}",
                **common_stats,
            },
            {
                "type": "desktop",
                "label": "Desktop App",
                "url": f"https://hubicx.ru/?ref={ref_code}",
                **common_stats,
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
    summary = await get_partner_payout_summary(session, partner)
    stmt = (
        select(ReferralPayoutRequest)
        .where(ReferralPayoutRequest.partner_id == partner.id)
        .order_by(ReferralPayoutRequest.created_at.desc())
        .limit(20)
    )
    result = await session.execute(stmt)
    payout_items = result.scalars().all()

    return {
        "pending_balance": summary["available_balance"],
        "pending_balance_rub": summary["available_balance"],
        "available_balance": summary["available_balance"],
        "available_balance_rub": summary["available_balance"],
        "pending_hold": summary["pending_hold"],
        "pending_hold_rub": summary["pending_hold"],
        "total_paid": summary["total_paid"],
        "total_paid_rub": summary["total_paid"],
        "processing": summary["processing"],
        "processing_rub": summary["processing"],
        "hold_days": summary["hold_days"],
        "payouts": [
            {
                "id": p.id,
                "amount_rub": float(p.amount_rub),
                "status": p.status,
                "note": p.admin_note,
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "requested_at": p.requested_at.isoformat() if p.requested_at else None,
                "processed_at": p.processed_at.isoformat() if p.processed_at else None,
            }
            for p in payout_items
        ],
    }


@router.post("/payouts/request")
async def request_partner_payout(
    payload: dict | None = Body(default=None),
    partner: ReferralPartner = Depends(current_partner),
    session: AsyncSession = Depends(get_session),
) -> dict:
    payload = payload or {}
    payout = await create_payout_request(
        session,
        partner,
        payout_details=payload.get("payout_details") or payload.get("details"),
    )
    await session.commit()
    return {
        "ok": True,
        "id": payout.id,
        "amount_rub": float(payout.amount_rub),
        "status": payout.status,
        "message": "Заявка на выплату отправлена",
    }
