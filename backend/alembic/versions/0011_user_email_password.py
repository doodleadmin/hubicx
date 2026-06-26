"""user email password auth

Revision ID: 0011_user_email_password
Revises: 0009_agent_chats
Create Date: 2026-06-21
"""

from alembic import op
import sqlalchemy as sa


revision = "0011_user_email_password"
down_revision = "0009_agent_chats"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("email", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("password_hash", sa.String(length=255), nullable=True))
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)


def downgrade():
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_column("users", "password_hash")
    op.drop_column("users", "email")
