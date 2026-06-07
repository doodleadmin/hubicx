from pydantic import BaseModel, ConfigDict, Field, field_validator


SUPPORTED_LANGUAGES = {"ru", "en", "es", "pt"}


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    language_code: str = "ru"
    preferred_llm_model: str = "ai_chat"
    daily_enabled: bool = False
    hubicx_personality: str | None = None
    about_user: str | None = None
    communication_style: str | None = None
    persona_emoji: str | None = None


class ProfileUpdate(BaseModel):
    language_code: str | None = None
    preferred_llm_model: str | None = Field(default=None, max_length=64)
    daily_enabled: bool | None = None
    hubicx_personality: str | None = Field(default=None, max_length=4000)
    about_user: str | None = Field(default=None, max_length=4000)
    communication_style: str | None = Field(default=None, max_length=1000)
    persona_emoji: str | None = Field(default=None, max_length=32)

    @field_validator("language_code")
    @classmethod
    def validate_language(cls, value: str | None) -> str | None:
        if value is not None and value not in SUPPORTED_LANGUAGES:
            raise ValueError("language_code must be one of: ru, en, es, pt")
        return value

    @field_validator("preferred_llm_model")
    @classmethod
    def validate_llm(cls, value: str | None) -> str | None:
        if value is not None and not value.strip():
            raise ValueError("preferred_llm_model must not be empty")
        return value
