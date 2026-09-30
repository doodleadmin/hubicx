"""
Partner program API for signed-in users (Mini App → Profile → Партнёрство).
"""
from fastapi import APIRouter, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import User
from backend.app.db.session import get_session
from backend.app.services.partner_program import partner_overview, purchase_with_partner_balance, request_withdrawal
from backend.app.services.rate_limit import check_user_rate_limit

router = APIRouter(prefix="/partner", tags=["partner"])


@router.get("")
async def get_partner(user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    overview = await partner_overview(session, user)
    await session.commit()
    return overview


@router.post("/withdraw")
async def withdraw(
    payload: dict = Body(...),
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    await check_user_rate_limit(user.id, "partner_withdraw", 5, 3600, fail_closed=True)
    details = payload.get("details") if isinstance(payload.get("details"), dict) else {}
    payout = await request_withdrawal(session, user, payload.get("amount_rub"), str(payload.get("method") or ""), details)
    await session.commit()
    return {"ok": True, "id": payout.id, "status": payout.status, "partner": await partner_overview(session, user)}


@router.post("/purchase")
async def purchase(
    payload: dict = Body(...),
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    await check_user_rate_limit(user.id, "partner_purchase", 10, 600, fail_closed=True)
    payment = await purchase_with_partner_balance(session, user, payload.get("package_code"), payload.get("amount_rub"))
    await session.commit()
    await session.refresh(user)
    return {
        "ok": True,
        "payment_id": payment.id,
        "credits": payment.credits,
        "balance_credits": int(user.balance_credits or 0),
        "partner": await partner_overview(session, user),
    }
