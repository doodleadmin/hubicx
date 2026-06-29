from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    bot_token: str = ""
    bot_username: str = ""
    admin_ids: str = ""
    admin_panel_password: str = ""
    admin_panel_token: str = ""
    debug: bool = False
    webapp_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"
    jwt_signing_key: str = ""
    jwt_secret: str = ""
    jwt_ttl_days: int = 30
    signup_bonus_credits: int = 0
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_aggregator"
    redis_url: str = "redis://localhost:6379/0"
    openrouter_api_key: str = ""
    fal_key: str = ""
    yookassa_shop_id: str = ""
    yookassa_secret_key: str = ""
    yookassa_return_url: str = ""
    tbank_terminal_key: str = ""
    tbank_password: str = ""
    tbank_webapp_terminal_key: str = ""
    tbank_webapp_password: str = ""
    tbank_enabled: bool = False
    s3_endpoint: str = ""
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_bucket: str = ""
    s3_public_url: str = ""
    proxy_url: str = ""
    email_verification_required: bool = False
    email_code_ttl_minutes: int = 10
    email_from: str = "noreply@hubicx.ru"
    email_from_name: str = "Hubicx"
    email_provider: str = ""
    smtp_host: str = ""
    smtp_port: int = 465
    smtp_ssl: bool = True
    smtp_starttls: bool = False
    smtp_username: str = ""
    smtp_password: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def admin_id_set(self) -> set[int]:
        return {int(x.strip()) for x in self.admin_ids.split(",") if x.strip().isdigit()}

    @property
    def effective_jwt_signing_key(self) -> str:
        return (self.jwt_signing_key or "").strip() or (self.jwt_secret or "").strip()

    def validate_runtime_secrets(self) -> None:
        key = self.effective_jwt_signing_key
        if not key:
            raise RuntimeError("JWT_SIGNING_KEY is required for email/password auth")
        if len(key) < 32:
            raise RuntimeError("JWT_SIGNING_KEY must be at least 32 characters")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
