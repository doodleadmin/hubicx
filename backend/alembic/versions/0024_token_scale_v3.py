"""token scale v3: prices and packages in the new, 8× larger token

Earlier migrations insert model_pricing and token_packages rows in the old
token scale. This one replaces them with the v3 values. The product has not
launched yet, so user balances are not converted.

Revision ID: 0024_token_scale_v3
Revises: 0023_user_partner_program
Create Date: 2026-10-01
"""

from __future__ import annotations

import json
import math

import sqlalchemy as sa
from alembic import op

from backend.app.services.business import TOKEN_PACKAGES_V2
from backend.app.services.model_pricing_catalog import MODEL_PRICING


revision = "0024_token_scale_v3"
down_revision = "0023_user_partner_program"
branch_labels = None
depends_on = None

OLD_TOKENS_PER_NEW = 8
PRICE_TABLE_KEYS = ("resolution_duration_prices", "duration_prices", "resolution_prices")


def _scaled(value) -> int:
    return max(1, int(math.floor(float(value) / OLD_TOKENS_PER_NEW + 0.5))) if value else 0


def _scale_rules(rules):
    """Rescale token amounts in price tables; multipliers are ratios and stay as they are."""
    if not isinstance(rules, dict):
        return rules

    def walk(node):
        if isinstance(node, dict):
            return {key: walk(value) for key, value in node.items()}
        if isinstance(node, (int, float)) and not isinstance(node, bool):
            return _scaled(node)
        return node

    out = json.loads(json.dumps(rules))
    for key in PRICE_TABLE_KEYS:
        if key in out:
            out[key] = walk(out[key])
    if isinstance(out.get("base"), (int, float)) and not isinstance(out.get("base"), bool):
        out["base"] = _scaled(out["base"])
    return out


def upgrade() -> None:
    conn = op.get_bind()

    for code, data in MODEL_PRICING.items():
        conn.execute(sa.text("""
            INSERT INTO model_pricing (model_code, display_name, category, price_tokens, price_rules, provider_cost_note, is_enabled, is_featured)
            VALUES (:code, :code, :category, :price, CAST(:rules AS jsonb), :note, true, false)
            ON CONFLICT (model_code) DO UPDATE SET
                price_tokens = EXCLUDED.price_tokens,
                price_rules = EXCLUDED.price_rules,
                provider_cost_note = EXCLUDED.provider_cost_note
        """), {
            "code": code,
            "category": data["category"],
            "price": data["price_tokens"],
            "rules": json.dumps(data["price_rules"], ensure_ascii=False) if data["price_rules"] is not None else None,
            "note": data["note"],
        })

    rows = conn.execute(
        sa.text("SELECT model_code, price_tokens, price_rules FROM model_pricing WHERE NOT (model_code = ANY(:codes))"),
        {"codes": list(MODEL_PRICING)},
    ).mappings().all()
    for row in rows:
        rules = row["price_rules"]
        if isinstance(rules, str):
            rules = json.loads(rules)
        conn.execute(
            sa.text("UPDATE model_pricing SET price_tokens = :price, price_rules = CAST(:rules AS jsonb) WHERE model_code = :code"),
            {
                "code": row["model_code"],
                "price": _scaled(row["price_tokens"]),
                "rules": json.dumps(_scale_rules(rules), ensure_ascii=False) if rules is not None else None,
            },
        )

    for pkg in TOKEN_PACKAGES_V2:
        conn.execute(sa.text("""
            UPDATE token_packages
            SET title = :title, tokens = :total, base_tokens = :base, bonus_tokens = :bonus, total_tokens = :total
            WHERE code = :code
        """), {"code": pkg["code"], "title": pkg["title"], "total": pkg["total_tokens"], "base": pkg["base_tokens"], "bonus": pkg["bonus_tokens"]})
    conn.execute(sa.text(f"""
        UPDATE token_packages
        SET tokens = CEIL(tokens / {OLD_TOKENS_PER_NEW}.0)::int,
            base_tokens = CEIL(base_tokens / {OLD_TOKENS_PER_NEW}.0)::int,
            bonus_tokens = CEIL(bonus_tokens / {OLD_TOKENS_PER_NEW}.0)::int,
            total_tokens = CEIL(total_tokens / {OLD_TOKENS_PER_NEW}.0)::int
        WHERE NOT (code = ANY(:codes))
    """), {"codes": [pkg["code"] for pkg in TOKEN_PACKAGES_V2]})


def downgrade() -> None:
    raise RuntimeError("Token scale v3 cannot be reverted; recreate the database instead.")
