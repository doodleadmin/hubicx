"""add provider_response_url to generation_tasks

Revision ID: 0010_provider_response_url
Revises: 0009_agent_chats
Create Date: 2026-06-14
"""

from alembic import op
import sqlalchemy as sa

revision = "0010_provider_response_url"
down_revision = "0009_agent_chats"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "generation_tasks",
        sa.Column("provider_response_url", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("generation_tasks", "provider_response_url")
