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
    User,
)
from backend.app.db.session import get_session
from backend.app.api.deps import current_user
from backend.app.api.routes.admin import current_admin_user

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
    return [
        {
            "id": p.id,
            "code": p.code,
            "name": p.name,
            "status": p.status,
                "contacts": p.contact_info,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in partners
    ]


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
        contact_info=payload.get("contacts"),
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

    if "name" in payload:
        partner.name = payload["name"]
    if "status" in payload:
        partner.status = payload["status"]
    if "contacts" in payload:
        partner.contact_info = payload["contacts"]

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
) -> dict:
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


# ── Public tracking (user-authenticated) ──

@router.post("/track")
async def track_referral(
    payload: dict = Body(...),
    user: User = Depends(current_user),
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
