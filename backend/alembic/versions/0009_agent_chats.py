"""add agent chats

Revision ID: 0009_agent_chats
Revises: 0008_token_economy
Create Date: 2026-06-08
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0009_agent_chats"
down_revision = "0008_token_economy"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "agent_chats",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False, server_default="Новый чат"),
        sa.Column("agent_mode", sa.String(length=32), nullable=False, server_default="general"),
        sa.Column("language_code", sa.String(length=8), nullable=False, server_default="ru"),
        sa.Column("last_message_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_archived", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_agent_chats_user_id"), "agent_chats", ["user_id"], unique=False)

    op.create_table(
        "agent_chat_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("chat_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(length=16), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("visible_content", sa.Text(), nullable=True),
        sa.Column("task_id", sa.Integer(), nullable=True),
        sa.Column("token_cost", sa.Integer(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["chat_id"], ["agent_chats.id"]),
        sa.ForeignKeyConstraint(["task_id"], ["generation_tasks.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_agent_chat_messages_chat_id"), "agent_chat_messages", ["chat_id"], unique=False)
    op.create_index(op.f("ix_agent_chat_messages_user_id"), "agent_chat_messages", ["user_id"], unique=False)

    op.alter_column("agent_chats", "title", server_default=None)
    op.alter_column("agent_chats", "agent_mode", server_default=None)
    op.alter_column("agent_chats", "language_code", server_default=None)
    op.alter_column("agent_chats", "is_archived", server_default=None)


def downgrade() -> None:
    op.drop_index(op.f("ix_agent_chat_messages_user_id"), table_name="agent_chat_messages")
    op.drop_index(op.f("ix_agent_chat_messages_chat_id"), table_name="agent_chat_messages")
    op.drop_table("agent_chat_messages")
    op.drop_index(op.f("ix_agent_chats_user_id"), table_name="agent_chats")
    op.drop_table("agent_chats")
