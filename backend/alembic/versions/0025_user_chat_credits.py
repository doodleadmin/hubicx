"""chat credits: AI-chat messages bundled with plans, kept apart from the token balance

Revision ID: 0025_user_chat_credits
Revises: 0024_token_scale_v3
Create Date: 2026-10-01
"""

from alembic import op
import sqlalchemy as sa


revision = "0025_user_chat_credits"
down_revision = "0024_token_scale_v3"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("chat_credits", sa.Integer(), server_default="0", nullable=False))


def downgrade():
    op.drop_column("users", "chat_credits")
