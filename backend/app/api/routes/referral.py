from fastapi import APIRouter, Body, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import User
from backend.app.db.session import get_session
from backend.app.services.referral import track_click, track_conversion
from backend.app.services.rate_limit import check_ip_rate_limit, check_user_rate_limit

router = APIRouter(prefix="/referral", tags=["referral"])


@router.post("/click")
async def referral_click(
    request: Request,
    payload: dict = Body(...),
    session: AsyncSession = Depends(get_session),
) -> dict:
    await check_ip_rate_limit(request, "referral_click", 30, 60)
    ref_code = str(payload.get("ref_code") or "").strip()
    if not ref_code:
        return {"ok": False, "tracked": False}
    click = await track_click(
        session,
        partner_code=ref_code,
        source_url=str(payload.get("source_url") or "")[:1024] or None,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    await session.commit()
    return {"ok": True, "tracked": bool(click)}


@router.post("/track")
async def referral_track(
    payload: dict = Body(...),
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    await check_user_rate_limit(user.id, "referral_track", 20, 3600)
    ref_code = str(payload.get("ref_code") or "").strip()
    if not ref_code:
        return {"ok": False, "tracked": False}
    partner = await track_conversion(session, user.id, ref_code, None)
    await session.commit()
    return {"ok": True, "tracked": bool(partner)}
