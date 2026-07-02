"""
Admin API for referral system: partners CRUD, commission rates, global stats.
"""
from fastapi import APIRouter, Body, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import (
    ReferralClick,
    ReferralCommission,
    ReferralCommissionRate,
    ReferralConversion,
    ReferralPartner,
    ReferralPayoutRequest,
    User,
)
from backend.app.db.session import get_session
from backend.app.api.routes.admin import current_admin_user
from backend.app.services.referral import get_partner_stats, get_partner_payout_summary, set_payout_status

router = APIRouter(prefix="/admin/referral", tags=["admin-referral"])


# ── Partners CRUD ──

@router.get("/partners")
async def list_partners(
    user: User = Depends(current_admin_user),
    session: AsyncSession = Depends(get_session),
) -> list[dict]:
    stmt = select(ReferralPartner).order_by(ReferralPartner.created_at.desc())
    result = await session.execute(stmt)
    partners = result.scalars().all()
    rows = []
    for p in partners:
        stats = await get_partner_stats(session, p.id)
        rows.append({
            "id": p.id,
            "code": p.code,
            "name": p.name,
            "status": p.status,
            "contacts": p.contact_info,
            "contact_info": p.contact_info,
            "hold_days": p.hold_days,
            "total_clicks": stats.get("total_clicks", 0),
            "total_conversions": stats.get("total_conversions", 0),
            "total_commission": stats.get("total_commission", 0),
            "unpaid_commission": stats.get("unpaid_commission", 0),
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    return rows


@router.post("/partners")
async def create_partner(
    payload: dict = Body(...),
    user: User = Depends(current_admin_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    existing = await session.execute(
        select(ReferralPartner).where(ReferralPartner.code == payload["code"])
    )
    if existing.scalar_one_or_none():
        from backend.app.utils.errors import AppError
        raise AppError("partner_code_exists", "Код партнёра уже занят", 409)

    partner = ReferralPartner(
        code=payload["code"],
        name=payload.get("name", payload["code"]),
        status=payload.get("status", "active"),
        contact_info=payload.get("contact_info", payload.get("contacts")),
        hold_days=int(payload.get("hold_days", 14)),
    )
    session.add(partner)
    await session.commit()
    await session.refresh(partner)
    return {
        "id": partner.id,
        "code": partner.code,
        "name": partner.name,
        "status": partner.status,
    }


@router.put("/partners/{partner_id}")
async def update_partner(
    partner_id: int,
    payload: dict = Body(...),
    user: User = Depends(current_admin_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    partner = await session.get(ReferralPartner, partner_id)
    if not partner:
        from backend.app.utils.errors import AppError
        raise AppError("partner_not_found", "Партнёр не найден", 404)

    if "code" in payload and payload["code"] != partner.code:
        existing = await session.execute(
            select(ReferralPartner).where(ReferralPartner.code == payload["code"])
        )
        if existing.scalar_one_or_none():
            from backend.app.utils.errors import AppError
            raise AppError("partner_code_exists", "Код партнёра уже занят", 409)
        partner.code = payload["code"]
    if "name" in payload:
        partner.name = payload["name"]
    if "status" in payload:
        partner.status = payload["status"]
    if "contact_info" in payload or "contacts" in payload:
        partner.contact_info = payload.get("contact_info", payload.get("contacts"))
    if "hold_days" in payload:
        partner.hold_days = max(0, min(365, int(payload.get("hold_days") or 0)))

    await session.commit()
    return {"ok": True, "id": partner.id}


@router.delete("/partners/{partner_id}")
async def delete_partner(
    partner_id: int,
    user: User = Depends(current_admin_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    partner = await session.get(ReferralPartner, partner_id)
    if not partner:
        from backend.app.utils.errors import AppError
        raise AppError("partner_not_found", "Партнёр не найден", 404)

    partner.status = "blocked"
    await session.commit()
    return {"ok": True}


# ── Commission Rates ──

@router.get("/rates")
async def list_rates(
    user: User = Depends(current_admin_user),
    session: AsyncSession = Depends(get_session),
) -> list[dict]:
    stmt = select(ReferralCommissionRate).order_by(ReferralCommissionRate.category, ReferralCommissionRate.partner_id)
    result = await session.execute(stmt)
    rates = result.scalars().all()
    return [
        {
            "id": r.id,
            "partner_id": r.partner_id,
            "category": r.category,
            "rate_percent": float(r.rate_percent),
        }
        for r in rates
    ]


@router.put("/rates")
async def set_rate(
    payload: dict = Body(...),
    user: User = Depends(current_admin_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    category = payload["category"]
    rate_percent = float(payload["rate_percent"])
    partner_id = payload.get("partner_id")

    stmt = select(ReferralCommissionRate).where(
        ReferralCommissionRate.category == category,
        ReferralCommissionRate.partner_id == (partner_id if partner_id else None),
    )
    result = await session.execute(stmt)
    rate = result.scalar_one_or_none()

    if rate:
        rate.rate_percent = rate_percent
    else:
        rate = ReferralCommissionRate(
            partner_id=partner_id,
            category=category,
            rate_percent=rate_percent,
        )
        session.add(rate)

    await session.commit()
    return {"ok": True, "id": rate.id, "category": category, "rate_percent": rate_percent}


# ── Global Stats ──

@router.get("/stats")
async def global_stats(
    user: User = Depends(current_admin_user),
    session: AsyncSession = Depends(get_session),
    partner_id: int | None = Query(default=None),
) -> dict:
    if partner_id:
        return await get_partner_stats(session, partner_id)

    # Total partners
    partners_count = await session.execute(
        select(func.count(ReferralPartner.id))
    )
    total_partners = partners_count.scalar() or 0

    # Total clicks
    clicks_count = await session.execute(
        select(func.count(ReferralClick.id))
    )
    total_clicks = clicks_count.scalar() or 0

    # Total conversions
    convs_count = await session.execute(
        select(func.count(ReferralConversion.id))
    )
    total_conversions = convs_count.scalar() or 0

    # Total commissions
    comms_stmt = await session.execute(
        select(func.coalesce(func.sum(ReferralCommission.commission_rub), 0))
    )
    total_commissions = float(comms_stmt.scalar() or 0)

    return {
        "total_partners": total_partners,
        "total_clicks": total_clicks,
        "total_conversions": total_conversions,
        "total_commissions_rub": total_commissions,
    }


@router.get("/payouts")
async def list_payouts(
    user: User = Depends(current_admin_user),
    session: AsyncSession = Depends(get_session),
    status: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=300),
) -> list[dict]:
    stmt = select(ReferralPayoutRequest, ReferralPartner).join(
        ReferralPartner, ReferralPartner.id == ReferralPayoutRequest.partner_id
    )
    if status:
        stmt = stmt.where(ReferralPayoutRequest.status == status)
    stmt = stmt.order_by(ReferralPayoutRequest.created_at.desc()).limit(limit)
    rows = (await session.execute(stmt)).all()
    return [
        {
            "id": payout.id,
            "partner_id": payout.partner_id,
            "partner_code": partner.code,
            "partner_name": partner.name,
            "amount_rub": float(payout.amount_rub),
            "status": payout.status,
            "payout_details": payout.payout_details,
            "admin_note": payout.admin_note,
            "requested_at": payout.requested_at.isoformat() if payout.requested_at else None,
            "processed_at": payout.processed_at.isoformat() if payout.processed_at else None,
            "created_at": payout.created_at.isoformat() if payout.created_at else None,
        }
        for payout, partner in rows
    ]


@router.put("/payouts/{payout_id}")
async def update_payout(
    payout_id: int,
    payload: dict = Body(...),
    user: User = Depends(current_admin_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    payout = await session.get(ReferralPayoutRequest, payout_id)
    if not payout:
        from backend.app.utils.errors import AppError

        raise AppError("payout_not_found", "Заявка на выплату не найдена", 404)
    payout = await set_payout_status(
        session,
        payout,
        str(payload.get("status") or payout.status),
        admin_user_id=user.id,
        admin_note=payload.get("admin_note"),
    )
    await session.commit()
    return {"ok": True, "id": payout.id, "status": payout.status}


@router.get("/partners/{partner_id}/payout-summary")
async def partner_payout_summary(
    partner_id: int,
    user: User = Depends(current_admin_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    partner = await session.get(ReferralPartner, partner_id)
    if not partner:
        from backend.app.utils.errors import AppError

        raise AppError("partner_not_found", "Партнёр не найден", 404)
    return await get_partner_payout_summary(session, partner)


# ── Public tracking (user-authenticated) ──

@router.post("/track")
async def track_referral(
    payload: dict = Body(...),
    user: User = Depends(current_admin_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Track referral conversion when a new user comes from a partner link."""
    ref_code = str(payload.get("ref_code") or "").strip()
    if not ref_code:
        return {"ok": False, "message": "ref_code required"}

    from backend.app.services.referral import track_conversion

    try:
        await track_conversion(session, user.id, ref_code, None)
        await session.commit()
        return {"ok": True, "tracked": True}
    except Exception:
        await session.rollback()
        return {"ok": True, "tracked": False, "message": "already tracked or invalid"}
