"""merge release heads

Revision ID: 0013_merge_release_heads
Revises: 0010_provider_response_url, 0011_referral_system, 0012_subscriptions_package_code
Create Date: 2026-06-25
"""


revision = "0013_merge_release_heads"
down_revision = (
    "0010_provider_response_url",
    "0011_referral_system",
    "0012_subscriptions_package_code",
)
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
