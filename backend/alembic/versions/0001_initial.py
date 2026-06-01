"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-01
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("users", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("telegram_id", sa.BigInteger(), nullable=False), sa.Column("username", sa.String(255)), sa.Column("first_name", sa.String(255)), sa.Column("language_code", sa.String(8), nullable=False), sa.Column("balance_credits", sa.Integer(), nullable=False), sa.Column("is_admin", sa.Boolean(), nullable=False), sa.Column("ref_code", sa.String(32), nullable=False), sa.Column("referrer_id", sa.Integer(), sa.ForeignKey("users.id")), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_users_telegram_id", "users", ["telegram_id"], unique=True)
    op.create_index("ix_users_ref_code", "users", ["ref_code"], unique=True)
    op.create_table("ai_models", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("code", sa.String(64), nullable=False), sa.Column("title", sa.String(255), nullable=False), sa.Column("description", sa.Text()), sa.Column("category", sa.String(32), nullable=False), sa.Column("provider", sa.String(32), nullable=False), sa.Column("provider_model_id", sa.String(255), nullable=False), sa.Column("task_type", sa.String(32), nullable=False), sa.Column("input_type", sa.String(32), nullable=False), sa.Column("price_credits", sa.Integer(), nullable=False), sa.Column("cost_usd_estimate", sa.Numeric(10, 4)), sa.Column("is_active", sa.Boolean(), nullable=False), sa.Column("sort_order", sa.Integer(), nullable=False), sa.Column("webapp_route", sa.String(255)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_ai_models_code", "ai_models", ["code"], unique=True)
    op.create_table("templates", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("code", sa.String(64), nullable=False), sa.Column("title", sa.String(255), nullable=False), sa.Column("description", sa.Text()), sa.Column("base_model_id", sa.Integer(), sa.ForeignKey("ai_models.id")), sa.Column("template_type", sa.String(32), nullable=False), sa.Column("system_prompt", sa.Text()), sa.Column("required_inputs", postgresql.JSONB(), nullable=False), sa.Column("default_params", postgresql.JSONB(), nullable=False), sa.Column("price_credits", sa.Integer(), nullable=False), sa.Column("is_active", sa.Boolean(), nullable=False), sa.Column("sort_order", sa.Integer(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_templates_code", "templates", ["code"], unique=True)
    op.create_table("generation_tasks", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False), sa.Column("model_id", sa.Integer(), sa.ForeignKey("ai_models.id")), sa.Column("template_id", sa.Integer(), sa.ForeignKey("templates.id")), sa.Column("provider", sa.String(32), nullable=False), sa.Column("provider_task_id", sa.String(255)), sa.Column("task_type", sa.String(32), nullable=False), sa.Column("status", sa.String(32), nullable=False), sa.Column("prompt", sa.Text()), sa.Column("input_file_url", sa.Text()), sa.Column("output_file_url", sa.Text()), sa.Column("output_text", sa.Text()), sa.Column("params", postgresql.JSONB()), sa.Column("error_message", sa.Text()), sa.Column("cost_credits", sa.Integer(), nullable=False), sa.Column("provider_cost_usd", sa.Numeric(10, 4)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("started_at", sa.DateTime(timezone=True)), sa.Column("completed_at", sa.DateTime(timezone=True)))
    op.create_index("ix_generation_tasks_user_id", "generation_tasks", ["user_id"])
    op.create_index("ix_generation_tasks_status", "generation_tasks", ["status"])
    op.create_table("payments", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False), sa.Column("provider", sa.String(32), nullable=False), sa.Column("amount_rub", sa.Numeric(10, 2)), sa.Column("amount_usd", sa.Numeric(10, 2)), sa.Column("credits", sa.Integer(), nullable=False), sa.Column("status", sa.String(32), nullable=False), sa.Column("external_payment_id", sa.String(255)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("paid_at", sa.DateTime(timezone=True)))
    op.create_index("ix_payments_user_id", "payments", ["user_id"])
    op.create_table("transactions", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False), sa.Column("type", sa.String(32), nullable=False), sa.Column("amount_credits", sa.Integer(), nullable=False), sa.Column("status", sa.String(32), nullable=False), sa.Column("generation_task_id", sa.Integer(), sa.ForeignKey("generation_tasks.id")), sa.Column("payment_id", sa.Integer(), sa.ForeignKey("payments.id")), sa.Column("comment", sa.Text()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_transactions_user_id", "transactions", ["user_id"])
    op.create_table("files", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False), sa.Column("file_type", sa.String(32), nullable=False), sa.Column("telegram_file_id", sa.String(255)), sa.Column("storage_url", sa.Text(), nullable=False), sa.Column("mime_type", sa.String(255)), sa.Column("size_bytes", sa.Integer()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_files_user_id", "files", ["user_id"])
    op.create_table("referral_rewards", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("referrer_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False), sa.Column("referred_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False), sa.Column("payment_id", sa.Integer(), sa.ForeignKey("payments.id")), sa.Column("reward_credits", sa.Integer(), nullable=False), sa.Column("status", sa.String(32), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.UniqueConstraint("referrer_id", "referred_user_id", "payment_id"))
    op.create_index("ix_referral_rewards_referrer_id", "referral_rewards", ["referrer_id"])
    op.create_index("ix_referral_rewards_referred_user_id", "referral_rewards", ["referred_user_id"])


def downgrade() -> None:
    for table in ["referral_rewards", "files", "transactions", "payments", "generation_tasks", "templates", "ai_models", "users"]:
        op.drop_table(table)
