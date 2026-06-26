from fastapi import APIRouter, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import User
from backend.app.db.session import get_session
from backend.app.services.referral import track_conversion

router = APIRouter(prefix="/referral", tags=["referral"])


@router.post("/track")
async def track_referral(
    payload: dict = Body(...),
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    ref_code = str(payload.get("ref_code") or "").strip()
    if not ref_code:
        return {"ok": False, "tracked": False, "message": "ref_code required"}

    partner = await track_conversion(session, user.id, ref_code, None)
    await session.commit()
    return {"ok": True, "tracked": partner is not None}
