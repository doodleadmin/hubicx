from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime


class SubOut(BaseModel):
    code: str
    title: str
    kind: str
    tokens_per_month: int = 0
    price_rub: int = 0
    is_active: bool = True
    started_at: datetime | None = None
    expires_at: datetime | None = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    telegram_id: int
    username: str | None
    first_name: str | None
    language_code: str
    language_selected: bool
    balance_credits: int
    bonus_credits: int = 0
    is_admin: bool
    is_banned: bool = False
    ban_reason: str | None = None
    banned_at: datetime | None = None
    banned_by_user_id: int | None = None
    ref_code: str
    referred_by_partner_id: int | None = None
    active_menu_chat_id: int | None = None
    active_menu_message_id: int | None = None
    email: str | None = None
    has_password: bool = False
    subscription: SubOut | None = None


EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class RegisterIn(BaseModel):
    email: str = Field(min_length=3, max_length=255, pattern=EMAIL_PATTERN)
    password: str = Field(min_length=8, max_length=128)
    first_name: str | None = Field(default=None, max_length=120)


class LoginIn(BaseModel):
    email: str = Field(min_length=3, max_length=255, pattern=EMAIL_PATTERN)
    password: str = Field(min_length=1, max_length=128)


class LinkEmailIn(BaseModel):
    email: str = Field(min_length=3, max_length=255, pattern=EMAIL_PATTERN)
    password: str = Field(min_length=8, max_length=128)


class LinkTelegramIn(BaseModel):
    email: str = Field(min_length=3, max_length=255, pattern=EMAIL_PATTERN)
    password: str = Field(min_length=1, max_length=128)


class AuthOut(BaseModel):
    token: str
    user: UserOut
