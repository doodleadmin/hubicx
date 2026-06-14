"""add email/password auth to users; make telegram_id nullable

Revision ID: 0011_user_email_password
Revises: 0010_provider_response_url
Create Date: 2026-06-14
"""

from alembic import op
import sqlalchemy as sa

revision = "0011_user_email_password"
down_revision = "0010_provider_response_url"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("email", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("password_hash", sa.String(length=255), nullable=True))
    op.alter_column("users", "telegram_id", existing_type=sa.BigInteger(), nullable=True)
    op.create_unique_constraint("uq_users_email", "users", ["email"])
    op.create_index("ix_users_email", "users", ["email"])


def downgrade() -> None:
    op.drop_index("ix_users_email", table_name="users")
    op.drop_constraint("uq_users_email", "users", type_="unique")
    op.alter_column("users", "telegram_id", existing_type=sa.BigInteger(), nullable=False)
    op.drop_column("users", "password_hash")
    op.drop_column("users", "email")
