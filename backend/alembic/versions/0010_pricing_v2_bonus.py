"""pricing v2 bonus balances

Revision ID: 0010_pricing_v2_bonus
Revises: 0009_agent_chats
Create Date: 2026-06-20
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0010_pricing_v2_bonus"
down_revision = "0011_user_email_password"
branch_labels = None
depends_on = None


TOKEN_PACKAGES_V2 = [
    {"code": "topup_300", "title": "300 токенов", "price_rub": 249, "base_tokens": 300, "bonus_tokens": 0, "total_tokens": 300, "sort_order": 10},
    {"code": "topup_1000", "title": "1 000 токенов", "price_rub": 790, "base_tokens": 1000, "bonus_tokens": 0, "total_tokens": 1000, "sort_order": 20},
    {"code": "topup_3000", "title": "3 000 токенов", "price_rub": 1990, "base_tokens": 3000, "bonus_tokens": 0, "total_tokens": 3000, "sort_order": 30},
    {"code": "topup_10000", "title": "10 000 токенов", "price_rub": 5990, "base_tokens": 10000, "bonus_tokens": 0, "total_tokens": 10000, "sort_order": 40},
]


def upgrade() -> None:
    op.add_column("users", sa.Column("bonus_credits", sa.Integer(), nullable=False, server_default="0"))

    op.create_table(
        "user_bonus_tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("tokens", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="completed"),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "code", name="uq_user_bonus_tasks_user_code"),
    )
    op.create_index(op.f("ix_user_bonus_tasks_user_id"), "user_bonus_tasks", ["user_id"], unique=False)
    op.create_index(op.f("ix_user_bonus_tasks_code"), "user_bonus_tasks", ["code"], unique=False)

    bind = op.get_bind()
    old_codes = ("starter", "start", "basic", "pro", "max", "ultra")
    bind.execute(
        sa.text("UPDATE token_packages SET is_active = false WHERE code IN :codes").bindparams(sa.bindparam("codes", expanding=True)),
        {"codes": old_codes},
    )
    for pkg in TOKEN_PACKAGES_V2:
        existing = bind.execute(sa.text("SELECT id FROM token_packages WHERE code = :code"), {"code": pkg["code"]}).fetchone()
        values = {
            **pkg,
            "tokens": pkg["total_tokens"],
            "is_active": True,
        }
        if existing:
            bind.execute(
                sa.text(
                    "UPDATE token_packages SET title=:title, tokens=:tokens, price_rub=:price_rub, "
                    "bonus_tokens=:bonus_tokens, base_tokens=:base_tokens, total_tokens=:total_tokens, "
                    "is_active=:is_active, sort_order=:sort_order WHERE code=:code"
                ),
                values,
            )
        else:
            bind.execute(
                sa.text(
                    "INSERT INTO token_packages (code,title,tokens,price_rub,bonus_tokens,base_tokens,total_tokens,is_active,sort_order) "
                    "VALUES (:code,:title,:tokens,:price_rub,:bonus_tokens,:base_tokens,:total_tokens,:is_active,:sort_order)"
                ),
                values,
            )

    op.alter_column("users", "bonus_credits", server_default=None)
    op.alter_column("user_bonus_tasks", "status", server_default=None)


def downgrade() -> None:
    op.drop_index(op.f("ix_user_bonus_tasks_code"), table_name="user_bonus_tasks")
    op.drop_index(op.f("ix_user_bonus_tasks_user_id"), table_name="user_bonus_tasks")
    op.drop_table("user_bonus_tasks")
    op.drop_column("users", "bonus_credits")
