"""add user safety events

Revision ID: 0020_user_safety_events
Revises: 0019_unit_economics_model_pricing
Create Date: 2026-07-02
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0020_user_safety_events"
down_revision = "0019_unit_economics_model_pricing"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_safety_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("generation_task_id", sa.Integer(), sa.ForeignKey("generation_tasks.id"), nullable=True),
        sa.Column("source", sa.String(length=64), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=False, server_default="provider_safety"),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )
    op.create_index("ix_user_safety_events_user_id", "user_safety_events", ["user_id"])
    op.create_index("ix_user_safety_events_generation_task_id", "user_safety_events", ["generation_task_id"])
    op.create_index("ix_user_safety_events_source", "user_safety_events", ["source"])
    op.create_index("ix_user_safety_events_category", "user_safety_events", ["category"])


def downgrade() -> None:
    op.drop_index("ix_user_safety_events_category", table_name="user_safety_events")
    op.drop_index("ix_user_safety_events_source", table_name="user_safety_events")
    op.drop_index("ix_user_safety_events_generation_task_id", table_name="user_safety_events")
    op.drop_index("ix_user_safety_events_user_id", table_name="user_safety_events")
    op.drop_table("user_safety_events")
