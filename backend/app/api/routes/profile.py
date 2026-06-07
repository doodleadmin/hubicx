from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import User, UserProfileSettings
from backend.app.db.session import get_session
from backend.app.schemas.profile import ProfileOut, ProfileUpdate

router = APIRouter(prefix="/profile", tags=["profile"])


async def get_or_create_profile(session: AsyncSession, user: User) -> UserProfileSettings:
    profile = await session.scalar(select(UserProfileSettings).where(UserProfileSettings.user_id == user.id))
    if profile:
        return profile
    profile = UserProfileSettings(user_id=user.id)
    session.add(profile)
    await session.flush()
    return profile


def profile_out(user: User, profile: UserProfileSettings) -> ProfileOut:
    return ProfileOut(
        language_code=user.language_code or "ru",
        preferred_llm_model=profile.preferred_llm_model or "ai_chat",
        daily_enabled=bool(profile.daily_enabled),
        hubicx_personality=profile.hubicx_personality,
        about_user=profile.about_user,
        communication_style=profile.communication_style,
        persona_emoji=profile.persona_emoji,
    )


@router.get("", response_model=ProfileOut)
async def get_profile(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> ProfileOut:
    profile = await get_or_create_profile(session, user)
    await session.commit()
    return profile_out(user, profile)


@router.patch("", response_model=ProfileOut)
async def update_profile(
    payload: ProfileUpdate,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> ProfileOut:
    profile = await get_or_create_profile(session, user)
    data = payload.model_dump(exclude_unset=True)
    if "language_code" in data:
        user.language_code = data.pop("language_code") or user.language_code
        user.language_selected = True
    for field, value in data.items():
        setattr(profile, field, value)
    await session.commit()
    await session.refresh(user)
    await session.refresh(profile)
    return profile_out(user, profile)
