from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import User
from backend.app.db.session import get_session
from backend.app.schemas.payments import PaymentCreate, PaymentOut
from backend.app.services.payments import create_mock_payment

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/create", response_model=PaymentOut)
async def create_payment(payload: PaymentCreate, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> PaymentOut:
    payment = await create_mock_payment(session, user, payload.credits)
    return PaymentOut(payment_id=payment.id, status=payment.status, payment_url=None, message="Manual payment is enabled. Ask admin to add credits.")


@router.post("/webhook")
async def payment_webhook() -> dict:
    return {"ok": True, "message": "Mock webhook endpoint"}
