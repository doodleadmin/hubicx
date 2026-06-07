"""add user profile settings

Revision ID: 0006_user_profile_settings
Revises: 0005_form_schema
Create Date: 2026-06-08
"""

from alembic import op
import sqlalchemy as sa


revision = "0006_user_profile_settings"
down_revision = "0005_form_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_profile_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("preferred_llm_model", sa.String(length=64), nullable=False, server_default="ai_chat"),
        sa.Column("daily_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("hubicx_personality", sa.Text(), nullable=True),
        sa.Column("about_user", sa.Text(), nullable=True),
        sa.Column("communication_style", sa.Text(), nullable=True),
        sa.Column("persona_emoji", sa.String(length=32), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index(op.f("ix_user_profile_settings_user_id"), "user_profile_settings", ["user_id"], unique=False)
    op.alter_column("user_profile_settings", "preferred_llm_model", server_default=None)
    op.alter_column("user_profile_settings", "daily_enabled", server_default=None)


def downgrade() -> None:
    op.drop_index(op.f("ix_user_profile_settings_user_id"), table_name="user_profile_settings")
    op.drop_table("user_profile_settings")
