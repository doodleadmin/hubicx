"""referral system for partners/bloggers

Revision ID: 0011_referral_system
Revises: 0010_pricing_v2_bonus
Create Date: 2026-06-21
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0011_referral_system"
down_revision = "0010_pricing_v2_bonus"


def upgrade():
    # ── referral_partners ──
    op.create_table(
        "referral_partners",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(64), unique=True, index=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("status", sa.String(32), server_default="active", nullable=False),
        sa.Column("contact_info", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── referral_commission_rates ──
    op.create_table(
        "referral_commission_rates",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("partner_id", sa.Integer(), sa.ForeignKey("referral_partners.id"), nullable=True, index=True),
        sa.Column("category", sa.String(64), nullable=False, index=True),
        sa.Column("rate_percent", sa.Numeric(5, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── referral_clicks ──
    op.create_table(
        "referral_clicks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("partner_code", sa.String(64), index=True, nullable=False),
        sa.Column("source_url", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.String(64), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── referral_conversions ──
    op.create_table(
        "referral_conversions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("partner_id", sa.Integer(), sa.ForeignKey("referral_partners.id"), index=True, nullable=False),
        sa.Column("referred_user_id", sa.Integer(), sa.ForeignKey("users.id"), index=True, nullable=False),
        sa.Column("click_id", sa.Integer(), sa.ForeignKey("referral_clicks.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── referral_commissions ──
    op.create_table(
        "referral_commissions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("partner_id", sa.Integer(), sa.ForeignKey("referral_partners.id"), index=True, nullable=False),
        sa.Column("payment_id", sa.Integer(), sa.ForeignKey("payments.id"), index=True, nullable=False),
        sa.Column("referred_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("category", sa.String(64), nullable=False),
        sa.Column("amount_rub", sa.Numeric(10, 2), nullable=False),
        sa.Column("rate_percent", sa.Numeric(5, 2), nullable=False),
        sa.Column("commission_rub", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", sa.String(32), server_default="pending", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── add columns to existing tables ──
    op.add_column("users", sa.Column("referred_by_partner_id", sa.Integer(), sa.ForeignKey("referral_partners.id"), nullable=True))
    op.create_index("ix_users_referred_by_partner_id", "users", ["referred_by_partner_id"])

    op.add_column("payments", sa.Column("referral_partner_id", sa.Integer(), sa.ForeignKey("referral_partners.id"), nullable=True))
    op.create_index("ix_payments_referral_partner_id", "payments", ["referral_partner_id"])


def downgrade():
    op.drop_index("ix_payments_referral_partner_id", table_name="payments")
    op.drop_column("payments", "referral_partner_id")

    op.drop_index("ix_users_referred_by_partner_id", table_name="users")
    op.drop_column("users", "referred_by_partner_id")

    op.drop_table("referral_commissions")
    op.drop_table("referral_conversions")
    op.drop_table("referral_clicks")
    op.drop_table("referral_commission_rates")
    op.drop_table("referral_partners")
