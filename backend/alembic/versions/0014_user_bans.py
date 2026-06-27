"""user bans

Revision ID: 0014_user_bans
Revises: 0013_merge_release_heads
Create Date: 2026-06-27
"""

from alembic import op
import sqlalchemy as sa


revision = "0014_user_bans"
down_revision = "0013_merge_release_heads"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("is_banned", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("users", sa.Column("ban_reason", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("banned_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("banned_by_user_id", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_users_banned_by_user_id_users", "users", "users", ["banned_by_user_id"], ["id"])
    op.create_index(op.f("ix_users_is_banned"), "users", ["is_banned"])


def downgrade():
    op.drop_index(op.f("ix_users_is_banned"), table_name="users")
    op.drop_constraint("fk_users_banned_by_user_id_users", "users", type_="foreignkey")
    op.drop_column("users", "banned_by_user_id")
    op.drop_column("users", "banned_at")
    op.drop_column("users", "ban_reason")
    op.drop_column("users", "is_banned")
