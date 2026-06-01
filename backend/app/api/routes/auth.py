from fastapi import APIRouter, Depends

from backend.app.api.deps import current_user
from backend.app.db.models import User
from backend.app.schemas.users import UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(current_user)) -> User:
    return user
