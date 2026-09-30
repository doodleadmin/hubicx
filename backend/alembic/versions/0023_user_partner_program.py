"""every user is a partner: link partners to users, typed balance debits

Revision ID: 0023_user_partner_program
Revises: 0022_user_token_version
Create Date: 2026-10-01
"""

from alembic import op
import sqlalchemy as sa


revision = "0023_user_partner_program"
down_revision = "0022_user_token_version"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "referral_partners",
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
    )
    op.create_index("uq_referral_partners_user_id", "referral_partners", ["user_id"], unique=True)

    # A partner balance is debited either by a withdrawal (paid out manually by an
    # admin) or by a purchase paid from the partner balance inside the service.
    op.add_column(
        "referral_payout_requests",
        sa.Column("kind", sa.String(16), server_default="withdrawal", nullable=False),
    )
    op.add_column(
        "referral_payout_requests",
        sa.Column("payment_id", sa.Integer(), sa.ForeignKey("payments.id"), nullable=True),
    )
    op.create_index("ix_referral_payout_requests_kind", "referral_payout_requests", ["kind"])


def downgrade():
    op.drop_index("ix_referral_payout_requests_kind", table_name="referral_payout_requests")
    op.drop_column("referral_payout_requests", "payment_id")
    op.drop_column("referral_payout_requests", "kind")
    op.drop_index("uq_referral_partners_user_id", table_name="referral_partners")
    op.drop_column("referral_partners", "user_id")
