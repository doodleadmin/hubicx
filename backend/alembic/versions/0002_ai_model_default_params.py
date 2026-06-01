"""add ai model default params

Revision ID: 0002_ai_model_default_params
Revises: 0001_initial
Create Date: 2026-06-01
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002_ai_model_default_params"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("ai_models", sa.Column("default_params", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")))
    op.alter_column("ai_models", "default_params", server_default=None)


def downgrade() -> None:
    op.drop_column("ai_models", "default_params")
