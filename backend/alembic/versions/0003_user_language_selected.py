"""add user language selected

Revision ID: 0003_user_language_selected
Revises: 0002_ai_model_default_params
Create Date: 2026-06-02
"""

from alembic import op
import sqlalchemy as sa

revision = "0003_user_language_selected"
down_revision = "0002_ai_model_default_params"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("language_selected", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.execute("UPDATE users SET language_selected = true WHERE language_code IS NOT NULL")
    op.alter_column("users", "language_selected", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "language_selected")
