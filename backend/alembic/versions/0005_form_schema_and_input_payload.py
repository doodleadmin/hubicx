"""add form_schema and input_payload

Revision ID: 0005_form_schema_and_input_payload
Revises: 0004_user_active_menu
Create Date: 2026-06-02
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0005_form_schema"
down_revision = "0004_user_active_menu"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("ai_models", sa.Column("form_schema", postgresql.JSONB(), nullable=True, server_default=sa.text("'{}'::jsonb")))
    op.alter_column("ai_models", "form_schema", server_default=None)
    op.add_column("generation_tasks", sa.Column("input_payload", postgresql.JSONB(), nullable=True))
    op.add_column("generation_tasks", sa.Column("provider_input", postgresql.JSONB(), nullable=True))
    op.add_column("files", sa.Column("purpose", sa.String(32), nullable=False, server_default="output"))
    op.alter_column("files", "purpose", server_default=None)


def downgrade() -> None:
    op.drop_column("files", "purpose")
    op.drop_column("generation_tasks", "provider_input")
    op.drop_column("generation_tasks", "input_payload")
    op.drop_column("ai_models", "form_schema")
