from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import Payment, User
from backend.app.utils.errors import AppError


PAYMENT_PACKAGES = {100, 500, 1000, 3000}


async def create_mock_payment(session: AsyncSession, user: User, credits: int) -> Payment:
    if credits not in PAYMENT_PACKAGES:
        raise AppError("invalid_payment_package", "Недоступный пакет кредитов")
    payment = Payment(user_id=user.id, provider="manual_mock", credits=credits, status="created")
    session.add(payment)
    await session.commit()
    await session.refresh(payment)
    return payment
