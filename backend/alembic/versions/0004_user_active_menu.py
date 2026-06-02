"""add user active menu message

Revision ID: 0004_user_active_menu
Revises: 0003_user_language_selected
Create Date: 2026-06-02
"""

from alembic import op
import sqlalchemy as sa

revision = "0004_user_active_menu"
down_revision = "0003_user_language_selected"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("active_menu_chat_id", sa.BigInteger(), nullable=True))
    op.add_column("users", sa.Column("active_menu_message_id", sa.BigInteger(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "active_menu_message_id")
    op.drop_column("users", "active_menu_chat_id")
