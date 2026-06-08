from datetime import datetime
from typing import Any

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True)
    username: Mapped[str | None] = mapped_column(String(255))
    first_name: Mapped[str | None] = mapped_column(String(255))
    language_code: Mapped[str] = mapped_column(String(8), default="ru")
    language_selected: Mapped[bool] = mapped_column(Boolean, default=False)
    balance_credits: Mapped[int] = mapped_column(Integer, default=0)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    ref_code: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    referrer_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    active_menu_chat_id: Mapped[int | None] = mapped_column(BigInteger)
    active_menu_message_id: Mapped[int | None] = mapped_column(BigInteger)

    referrer: Mapped["User | None"] = relationship(remote_side="User.id")


class UserProfileSettings(Base, TimestampMixin):
    __tablename__ = "user_profile_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    preferred_llm_model: Mapped[str] = mapped_column(String(64), default="ai_chat")
    daily_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    hubicx_personality: Mapped[str | None] = mapped_column(Text)
    about_user: Mapped[str | None] = mapped_column(Text)
    communication_style: Mapped[str | None] = mapped_column(Text)
    persona_emoji: Mapped[str | None] = mapped_column(String(32))

    user: Mapped[User] = relationship()


class AIModel(Base, TimestampMixin):
    __tablename__ = "ai_models"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(32))
    provider: Mapped[str] = mapped_column(String(32))
    provider_model_id: Mapped[str] = mapped_column(String(255))
    task_type: Mapped[str] = mapped_column(String(32))
    input_type: Mapped[str] = mapped_column(String(32))
    price_credits: Mapped[int] = mapped_column(Integer)
    default_params: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    form_schema: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True, default=dict)
    cost_usd_estimate: Mapped[float | None] = mapped_column(Numeric(10, 4))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    webapp_route: Mapped[str | None] = mapped_column(String(255))


class TokenPackage(Base, TimestampMixin):
    __tablename__ = "token_packages"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    tokens: Mapped[int] = mapped_column(Integer)
    price_rub: Mapped[int] = mapped_column(Integer)
    bonus_tokens: Mapped[int] = mapped_column(Integer, default=0)
    base_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class ModelPricing(Base, TimestampMixin):
    __tablename__ = "model_pricing"

    id: Mapped[int] = mapped_column(primary_key=True)
    model_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(32))
    price_tokens: Mapped[int] = mapped_column(Integer)
    price_rules: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    admin_note: Mapped[str | None] = mapped_column(Text)
    provider_cost_note: Mapped[str | None] = mapped_column(Text, nullable=True)


class Template(Base, TimestampMixin):
    __tablename__ = "templates"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    base_model_id: Mapped[int | None] = mapped_column(ForeignKey("ai_models.id"))
    template_type: Mapped[str] = mapped_column(String(32))
    system_prompt: Mapped[str | None] = mapped_column(Text)
    required_inputs: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    default_params: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)
    price_credits: Mapped[int] = mapped_column(Integer)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    base_model: Mapped[AIModel | None] = relationship()


class GenerationTask(Base):
    __tablename__ = "generation_tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    model_id: Mapped[int | None] = mapped_column(ForeignKey("ai_models.id"))
    template_id: Mapped[int | None] = mapped_column(ForeignKey("templates.id"))
    provider: Mapped[str] = mapped_column(String(32))
    provider_task_id: Mapped[str | None] = mapped_column(String(255))
    task_type: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(32), default="created", index=True)
    prompt: Mapped[str | None] = mapped_column(Text)
    input_file_url: Mapped[str | None] = mapped_column(Text)
    output_file_url: Mapped[str | None] = mapped_column(Text)
    output_text: Mapped[str | None] = mapped_column(Text)
    params: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    input_payload: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    provider_input: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    error_message: Mapped[str | None] = mapped_column(Text)
    cost_credits: Mapped[int] = mapped_column(Integer)
    provider_cost_usd: Mapped[float | None] = mapped_column(Numeric(10, 4))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship()
    model: Mapped[AIModel | None] = relationship()
    template: Mapped[Template | None] = relationship()


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    type: Mapped[str] = mapped_column(String(32))
    amount_credits: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(32), default="completed")
    generation_task_id: Mapped[int | None] = mapped_column(ForeignKey("generation_tasks.id"))
    payment_id: Mapped[int | None] = mapped_column(ForeignKey("payments.id"))
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class BalanceLedger(Base):
    __tablename__ = "balance_ledger"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    amount: Mapped[int] = mapped_column(Integer)
    balance_before: Mapped[int] = mapped_column(Integer)
    balance_after: Mapped[int] = mapped_column(Integer)
    operation_type: Mapped[str] = mapped_column(String(32), index=True)
    reason: Mapped[str | None] = mapped_column(Text)
    task_id: Mapped[int | None] = mapped_column(ForeignKey("generation_tasks.id"), nullable=True)
    payment_id: Mapped[int | None] = mapped_column(ForeignKey("payments.id"), nullable=True)
    admin_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    metadata_: Mapped[dict[str, Any] | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    provider: Mapped[str] = mapped_column(String(32))
    amount_rub: Mapped[float | None] = mapped_column(Numeric(10, 2))
    amount_usd: Mapped[float | None] = mapped_column(Numeric(10, 2))
    credits: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(32), default="created")
    external_payment_id: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class File(Base):
    __tablename__ = "files"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    file_type: Mapped[str] = mapped_column(String(32))
    purpose: Mapped[str] = mapped_column(String(32), default="output")
    telegram_file_id: Mapped[str | None] = mapped_column(String(255))
    storage_url: Mapped[str] = mapped_column(Text)
    mime_type: Mapped[str | None] = mapped_column(String(255))
    size_bytes: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ReferralReward(Base):
    __tablename__ = "referral_rewards"
    __table_args__ = (UniqueConstraint("referrer_id", "referred_user_id", "payment_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    referrer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    referred_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    payment_id: Mapped[int | None] = mapped_column(ForeignKey("payments.id"))
    reward_credits: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(32), default="created")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AgentChat(Base, TimestampMixin):
    __tablename__ = "agent_chats"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(200), default="Новый чат")
    agent_mode: Mapped[str] = mapped_column(String(32), default="general")
    language_code: Mapped[str] = mapped_column(String(8), default="ru")
    last_message_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped[User] = relationship()
    messages: Mapped[list["AgentChatMessage"]] = relationship(back_populates="chat", order_by="AgentChatMessage.id")


class AgentChatMessage(Base):
    __tablename__ = "agent_chat_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    chat_id: Mapped[int] = mapped_column(ForeignKey("agent_chats.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    role: Mapped[str] = mapped_column(String(16))
    content: Mapped[str] = mapped_column(Text)
    visible_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    task_id: Mapped[int | None] = mapped_column(ForeignKey("generation_tasks.id"), nullable=True)
    token_cost: Mapped[int | None] = mapped_column(Integer, nullable=True)
    metadata_: Mapped[dict[str, Any] | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    chat: Mapped[AgentChat] = relationship(back_populates="messages")
    task: Mapped[GenerationTask | None] = relationship()
