"""subscriptions and payment package_code

Revision ID: 0012_subscriptions_package_code
Revises: 0011_user_email_password
Create Date: 2026-06-25
"""

from alembic import op
import sqlalchemy as sa


revision = "0012_subscriptions_package_code"
down_revision = "0011_user_email_password"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("payments", sa.Column("package_code", sa.String(length=64), nullable=True))
    op.create_table(
        "user_subscriptions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("kind", sa.String(length=32), nullable=False),
        sa.Column("tokens_per_month", sa.Integer(), server_default="0"),
        sa.Column("price_rub", sa.Integer(), server_default="0"),
        sa.Column("payment_id", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["payment_id"], ["payments.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.UniqueConstraint("user_id", "code", name="uq_user_subscriptions_user_code"),
    )
    op.create_index(op.f("ix_user_subscriptions_user_id"), "user_subscriptions", ["user_id"])
    op.create_index(op.f("ix_user_subscriptions_code"), "user_subscriptions", ["code"])


def downgrade():
    op.drop_index(op.f("ix_user_subscriptions_code"), table_name="user_subscriptions")
    op.drop_index(op.f("ix_user_subscriptions_user_id"), table_name="user_subscriptions")
    op.drop_table("user_subscriptions")
    op.drop_column("payments", "package_code")
