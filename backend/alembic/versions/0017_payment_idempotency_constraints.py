"""payment idempotency constraints

Revision ID: 0017_payment_idempotency_constraints
Revises: 0016_seedance_pricing_rules
Create Date: 2026-07-01
"""

from alembic import op
import sqlalchemy as sa


revision = "0017_payment_idempotency_constraints"
down_revision = "0016_seedance_pricing_rules"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    duplicate_payment_ids = [
        int(row[0])
        for row in conn.execute(
            sa.text(
                """
                SELECT payment_id
                FROM balance_ledger
                WHERE payment_id IS NOT NULL
                  AND operation_type IN ('payment_topup', 'payment_refund')
                GROUP BY payment_id, operation_type
                HAVING COUNT(*) > 1
                """
            )
        ).all()
    ]
    predicate = "payment_id IS NOT NULL AND operation_type IN ('payment_topup', 'payment_refund')"
    if duplicate_payment_ids:
        ids = ", ".join(str(payment_id) for payment_id in sorted(set(duplicate_payment_ids)))
        predicate = f"{predicate} AND payment_id NOT IN ({ids})"

    op.create_index(
        "uq_balance_ledger_payment_operation_once",
        "balance_ledger",
        ["payment_id", "operation_type"],
        unique=True,
        postgresql_where=sa.text(predicate),
    )
    op.create_index(
        "uq_referral_commissions_payment_id",
        "referral_commissions",
        ["payment_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("uq_referral_commissions_payment_id", table_name="referral_commissions")
    op.drop_index("uq_balance_ledger_payment_operation_once", table_name="balance_ledger")
