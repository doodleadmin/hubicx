"""add pricing admin mvp

Revision ID: 0007_pricing_admin_mvp
Revises: 0006_user_profile_settings
Create Date: 2026-06-08
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0007_pricing_admin_mvp"
down_revision = "0006_user_profile_settings"
branch_labels = None
depends_on = None


TOKEN_PACKAGES = [
    {"code": "starter", "title": "100 токенов", "tokens": 100, "price_rub": 149, "bonus_tokens": 0, "sort_order": 10},
    {"code": "basic", "title": "300 токенов", "tokens": 300, "price_rub": 399, "bonus_tokens": 0, "sort_order": 20},
    {"code": "pro", "title": "700 токенов", "tokens": 700, "price_rub": 849, "bonus_tokens": 0, "sort_order": 30},
    {"code": "max", "title": "1500 токенов", "tokens": 1500, "price_rub": 1690, "bonus_tokens": 0, "sort_order": 40},
]

MODEL_PRICES = [
    ("ai_chat", "AI Chat", "text", 2, True),
    ("prompt_helper", "Prompt Helper", "text", 2, True),
    ("flux_schnell", "Flux Schnell", "image", 30, True),
    ("nano_banana_2", "Nano Banana 2", "image", 40, True),
    ("nano_banana_edit", "Nano Banana Edit", "image", 60, False),
    ("nano_banana_pro", "Nano Banana Pro", "image", 80, True),
    ("seedream", "Seedream", "image", 40, False),
    ("z_image", "Z-Image", "image", 30, False),
    ("seedance_2_i2v_fast", "Seedance 2 I2V Fast", "video", 180, False),
    ("kling_21_i2v", "Kling 2.1 I2V", "video", 220, False),
    ("seedance_2_t2v", "Seedance 2 T2V", "video", 250, False),
    ("seedance_2_i2v", "Seedance 2 I2V", "video", 250, False),
]


def upgrade() -> None:
    op.create_table(
        "token_packages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("tokens", sa.Integer(), nullable=False),
        sa.Column("price_rub", sa.Integer(), nullable=False),
        sa.Column("bonus_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )
    op.create_index(op.f("ix_token_packages_code"), "token_packages", ["code"], unique=True)

    op.create_table(
        "model_pricing",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("model_code", sa.String(length=64), nullable=False),
        sa.Column("display_name", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=32), nullable=False),
        sa.Column("price_tokens", sa.Integer(), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("admin_note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("model_code"),
    )
    op.create_index(op.f("ix_model_pricing_model_code"), "model_pricing", ["model_code"], unique=True)

    op.create_table(
        "balance_ledger",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("balance_before", sa.Integer(), nullable=False),
        sa.Column("balance_after", sa.Integer(), nullable=False),
        sa.Column("operation_type", sa.String(length=32), nullable=False),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("task_id", sa.Integer(), nullable=True),
        sa.Column("payment_id", sa.Integer(), nullable=True),
        sa.Column("admin_user_id", sa.Integer(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["admin_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["payment_id"], ["payments.id"]),
        sa.ForeignKeyConstraint(["task_id"], ["generation_tasks.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_balance_ledger_user_id"), "balance_ledger", ["user_id"], unique=False)
    op.create_index(op.f("ix_balance_ledger_operation_type"), "balance_ledger", ["operation_type"], unique=False)

    token_table = sa.table(
        "token_packages",
        sa.column("code", sa.String),
        sa.column("title", sa.String),
        sa.column("tokens", sa.Integer),
        sa.column("price_rub", sa.Integer),
        sa.column("bonus_tokens", sa.Integer),
        sa.column("is_active", sa.Boolean),
        sa.column("sort_order", sa.Integer),
    )
    op.bulk_insert(token_table, [{**p, "is_active": True} for p in TOKEN_PACKAGES])

    pricing_table = sa.table(
        "model_pricing",
        sa.column("model_code", sa.String),
        sa.column("display_name", sa.String),
        sa.column("category", sa.String),
        sa.column("price_tokens", sa.Integer),
        sa.column("is_enabled", sa.Boolean),
        sa.column("is_featured", sa.Boolean),
    )
    op.bulk_insert(
        pricing_table,
        [
            {"model_code": code, "display_name": name, "category": category, "price_tokens": price, "is_enabled": True, "is_featured": featured}
            for code, name, category, price, featured in MODEL_PRICES
        ],
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_balance_ledger_operation_type"), table_name="balance_ledger")
    op.drop_index(op.f("ix_balance_ledger_user_id"), table_name="balance_ledger")
    op.drop_table("balance_ledger")
    op.drop_index(op.f("ix_model_pricing_model_code"), table_name="model_pricing")
    op.drop_table("model_pricing")
    op.drop_index(op.f("ix_token_packages_code"), table_name="token_packages")
    op.drop_table("token_packages")
