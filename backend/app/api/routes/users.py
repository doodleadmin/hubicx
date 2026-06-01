from fastapi import APIRouter, Depends

from backend.app.api.deps import current_user
from backend.app.config import settings
from backend.app.db.models import User
from backend.app.schemas.users import UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
async def get_me(user: User = Depends(current_user)) -> User:
    return user


@router.get("/me/referral")
async def referral(user: User = Depends(current_user)) -> dict:
    return {"link": f"https://t.me/{settings.bot_username}?start={user.ref_code}" if settings.bot_username else "", "ref_code": user.ref_code}
