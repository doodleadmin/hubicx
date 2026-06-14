from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    telegram_id: int | None = None
    email: str | None = None
    username: str | None
    first_name: str | None
    language_code: str
    language_selected: bool
    balance_credits: int
    is_admin: bool
    ref_code: str
    active_menu_chat_id: int | None = None
    active_menu_message_id: int | None = None
    has_password: bool = False


class RegisterIn(BaseModel):
    email: str
    password: str
    first_name: str | None = None


class LoginIn(BaseModel):
    email: str
    password: str


class LinkEmailIn(BaseModel):
    email: str
    password: str


class LinkTelegramIn(BaseModel):
    email: str
    password: str


class AuthOut(BaseModel):
    token: str
    user: UserOut
