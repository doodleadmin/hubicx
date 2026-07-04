"""user token_version for JWT invalidation

Revision ID: 0022_user_token_version
Revises: 0021_referral_payout_requests
Create Date: 2026-07-04
"""

from alembic import op
import sqlalchemy as sa


revision = "0022_user_token_version"
down_revision = "0021_referral_payout_requests"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        sa.Column("token_version", sa.Integer(), server_default="0", nullable=False),
    )


def downgrade():
    op.drop_column("users", "token_version")
