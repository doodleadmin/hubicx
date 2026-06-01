from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.config import settings
from backend.app.db.models import ReferralReward, Transaction, User
from backend.app.utils.security import make_ref_code


async def get_or_create_user(session: AsyncSession, tg_user: dict, ref_code: str | None = None) -> User:
    result = await session.execute(select(User).where(User.telegram_id == int(tg_user["id"])))
    user = result.scalar_one_or_none()
    if user:
        user.username = tg_user.get("username")
        user.first_name = tg_user.get("first_name")
        user.is_admin = user.telegram_id in settings.admin_id_set
        await session.commit()
        await session.refresh(user)
        return user

    referrer_id = None
    if ref_code:
        referrer = await session.scalar(select(User).where(User.ref_code == ref_code))
        if referrer and referrer.telegram_id != int(tg_user["id"]):
            referrer_id = referrer.id
    user = User(
        telegram_id=int(tg_user["id"]),
        username=tg_user.get("username"),
        first_name=tg_user.get("first_name"),
        language_code=tg_user.get("language_code") or "ru",
        is_admin=int(tg_user["id"]) in settings.admin_id_set,
        ref_code=make_ref_code(),
        referrer_id=referrer_id,
    )
    session.add(user)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        user = await session.scalar(select(User).where(User.telegram_id == int(tg_user["id"])))
        if user is None:
            raise
    await session.refresh(user)
    return user


async def user_stats(session: AsyncSession) -> dict:
    users_count = await session.scalar(select(func.count(User.id)))
    tasks_count = await session.scalar(select(func.count()).select_from(Transaction))
    return {"users_count": users_count or 0, "transactions_count": tasks_count or 0}


async def referral_summary(session: AsyncSession, user: User) -> dict:
    invited = await session.scalar(select(func.count(User.id)).where(User.referrer_id == user.id))
    rewards = await session.scalar(select(func.coalesce(func.sum(ReferralReward.reward_credits), 0)).where(ReferralReward.referrer_id == user.id))
    return {"invited_count": invited or 0, "reward_credits": rewards or 0}
