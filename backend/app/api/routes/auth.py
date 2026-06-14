from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import User
from backend.app.db.session import get_session
from backend.app.schemas.users import AuthOut, LinkEmailIn, LinkTelegramIn, LoginIn, RegisterIn, UserOut
from backend.app.services.auth_account import (
    authenticate_email_user,
    link_telegram_to_email_account,
    register_email_user,
    set_email_password,
)
from backend.app.services.auth_jwt import create_access_token
from backend.app.services.rate_limit import check_rate_limit

router = APIRouter(prefix="/auth", tags=["auth"])

LOGIN_RATE_LIMIT = 10
LOGIN_RATE_WINDOW = 60


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(current_user)) -> User:
    return user


@router.post("/register", response_model=AuthOut)
async def register(payload: RegisterIn, request: Request, session: AsyncSession = Depends(get_session)) -> AuthOut:
    await check_rate_limit(f"auth_register:{_client_ip(request)}", LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW)
    user = await register_email_user(session, payload.email, payload.password, payload.first_name)
    return AuthOut(token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.post("/login", response_model=AuthOut)
async def login(payload: LoginIn, request: Request, session: AsyncSession = Depends(get_session)) -> AuthOut:
    await check_rate_limit(f"auth_login:{_client_ip(request)}", LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW)
    user = await authenticate_email_user(session, payload.email, payload.password)
    return AuthOut(token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.post("/link-email", response_model=UserOut)
async def link_email(payload: LinkEmailIn, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> User:
    """Attach email+password to the currently authenticated (Telegram) account."""
    return await set_email_password(session, user, payload.email, payload.password)


@router.post("/link-telegram", response_model=AuthOut)
async def link_telegram(payload: LinkTelegramIn, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> AuthOut:
    """Called from inside Telegram. Merge the current Telegram account with an existing
    email account (verified by password) so both credentials share one account."""
    merged = await link_telegram_to_email_account(session, user, payload.email, payload.password)
    return AuthOut(token=create_access_token(merged.id), user=UserOut.model_validate(merged))
