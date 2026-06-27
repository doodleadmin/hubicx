from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import current_user
from backend.app.db.models import User, UserSubscription
from backend.app.db.session import get_session
from backend.app.schemas.users import AuthOut, LinkEmailIn, LinkTelegramIn, LoginIn, RegisterIn, UserOut
from backend.app.services.balance import award_bonus_tokens
from backend.app.services.business import SIGNUP_BONUS_TOKENS
from backend.app.services.auth_account import link_telegram_to_email_account, set_email_password
from backend.app.services.user_access import ensure_user_not_banned
from backend.app.utils.errors import AppError
from backend.app.utils.security import create_jwt, hash_password, make_ref_code, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def normalize_email(email: str) -> str:
    return email.strip().lower()


async def auth_out(session: AsyncSession, user: User) -> dict:
    await session.refresh(user)
    ensure_user_not_banned(user)
    return {"token": create_jwt(user.id), "user": user}


async def award_signup_once(session: AsyncSession, user: User) -> None:
    if SIGNUP_BONUS_TOKENS <= 0:
        return
    await award_bonus_tokens(session, user.id, "signup", SIGNUP_BONUS_TOKENS, "Signup bonus", {"kind": "automatic"})


@router.post("/register", response_model=AuthOut)
async def register(payload: RegisterIn, session: AsyncSession = Depends(get_session)) -> dict:
    email = normalize_email(payload.email)
    existing = await session.scalar(select(User).where(func.lower(User.email) == email))
    if existing:
        raise AppError("email_exists", "Такой email уже зарегистрирован", 409)
    user = User(
        telegram_id=-int(__import__("secrets").randbelow(9_000_000_000) + 1_000_000_000),
        email=email,
        password_hash=hash_password(payload.password),
        username=None,
        first_name=payload.first_name,
        language_code="ru",
        is_admin=False,
        ref_code=make_ref_code(),
        bonus_credits=0,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    await award_signup_once(session, user)
    await session.commit()
    return await auth_out(session, user)


@router.post("/login", response_model=AuthOut)
async def login(payload: LoginIn, session: AsyncSession = Depends(get_session)) -> dict:
    email = normalize_email(payload.email)
    user = await session.scalar(select(User).where(func.lower(User.email) == email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise AppError("invalid_credentials", "Неверный email или пароль", 401)
    ensure_user_not_banned(user)
    return await auth_out(session, user)


@router.post("/link-email", response_model=UserOut)
async def link_email(payload: LinkEmailIn, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> User:
    return await set_email_password(session, user, payload.email, payload.password)


@router.post("/link-telegram", response_model=AuthOut)
async def link_telegram(payload: LinkTelegramIn, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    if user.telegram_id < 0:
        raise AppError("telegram_required", "Привязать Telegram можно из Telegram Mini App", 400)
    merged = await link_telegram_to_email_account(session, user, payload.email, payload.password)
    return await auth_out(session, merged)


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    # Get active subscription
    sub = await session.scalar(
        select(UserSubscription).where(
            UserSubscription.user_id == user.id,
            UserSubscription.is_active == True,
        ).order_by(UserSubscription.started_at.desc())
    )
    user_dict = user.__dict__.copy()
    user_dict["subscription"] = sub
    return user_dict
