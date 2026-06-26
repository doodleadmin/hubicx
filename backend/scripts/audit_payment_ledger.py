"""Read-only payment ledger audit for release checks."""

import asyncio

from sqlalchemy import text

from backend.app.db.session import async_session


QUERIES = {
    "duplicate_payment_ledger": """
        select payment_id, operation_type, count(*) as rows_count, sum(amount) as total_amount
        from balance_ledger
        where payment_id is not null
          and operation_type in ('payment_topup', 'payment_refund')
        group by payment_id, operation_type
        having count(*) > 1
        order by rows_count desc, payment_id
        limit 50
    """,
    "refunded_active_subscriptions": """
        select s.id as subscription_id, s.user_id, s.code, s.payment_id, p.status as payment_status
        from user_subscriptions s
        join payments p on p.id = s.payment_id
        where s.is_active is true
          and p.status in ('refunded', 'reversed')
        order by s.id
        limit 50
    """,
    "duplicate_referral_commissions": """
        select payment_id, count(*) as rows_count, sum(commission_rub) as total_commission
        from referral_commissions
        group by payment_id
        having count(*) > 1
        order by rows_count desc, payment_id
        limit 50
    """,
    "negative_balances": """
        select id as user_id, balance_credits
        from users
        where balance_credits < 0
        order by balance_credits
        limit 50
    """,
}


async def main() -> None:
    async with async_session() as session:
        for name, sql in QUERIES.items():
            rows = (await session.execute(text(sql))).mappings().all()
            print(f"\n{name}: {len(rows)}")
            for row in rows:
                print(dict(row))


if __name__ == "__main__":
    asyncio.run(main())
