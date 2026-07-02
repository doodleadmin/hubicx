"""referral payout requests and hold settings

Revision ID: 0021_referral_payout_requests
Revises: 0020_user_safety_events
Create Date: 2026-07-02
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0021_referral_payout_requests"
down_revision = "0020_user_safety_events"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "referral_partners",
        sa.Column("hold_days", sa.Integer(), server_default="14", nullable=False),
    )

    op.create_table(
        "referral_payout_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("partner_id", sa.Integer(), sa.ForeignKey("referral_partners.id"), nullable=False),
        sa.Column("amount_rub", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", sa.String(32), server_default="requested", nullable=False),
        sa.Column("payout_details", postgresql.JSONB(), nullable=True),
        sa.Column("admin_note", sa.Text(), nullable=True),
        sa.Column("requested_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("processed_by_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_referral_payout_requests_partner_id", "referral_payout_requests", ["partner_id"])
    op.create_index("ix_referral_payout_requests_status", "referral_payout_requests", ["status"])
    op.add_column(
        "referral_commissions",
        sa.Column("payout_request_id", sa.Integer(), sa.ForeignKey("referral_payout_requests.id"), nullable=True),
    )
    op.create_index("ix_referral_commissions_payout_request_id", "referral_commissions", ["payout_request_id"])


def downgrade():
    op.drop_index("ix_referral_commissions_payout_request_id", table_name="referral_commissions")
    op.drop_column("referral_commissions", "payout_request_id")
    op.drop_index("ix_referral_payout_requests_status", table_name="referral_payout_requests")
    op.drop_index("ix_referral_payout_requests_partner_id", table_name="referral_payout_requests")
    op.drop_table("referral_payout_requests")
    op.drop_column("referral_partners", "hold_days")
