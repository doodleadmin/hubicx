"""seedance dynamic pricing rules

Revision ID: 0016_seedance_pricing_rules
Revises: 0015_email_verification_codes
Create Date: 2026-06-30
"""

from __future__ import annotations

import json

import sqlalchemy as sa
from alembic import op


revision = "0016_seedance_pricing_rules"
down_revision = "0015_email_verification_codes"
branch_labels = None
depends_on = None


def _duration_prices(base: int, multipliers: dict[str, float]) -> dict[str, int]:
    return {key: max(1, round(base * value)) for key, value in multipliers.items()}


SEEDANCE_STANDARD_DURATION = {
    "4": 1,
    "5": 1,
    "6": 1.2,
    "7": 1.4,
    "8": 1.6,
    "9": 1.8,
    "10": 2,
    "11": 2.2,
    "12": 2.4,
    "13": 2.6,
    "14": 2.8,
    "15": 3,
}

RULES = {
    "seedance_2_t2v": {
        "price_tokens": 250,
        "price_rules": {
            "resolution_duration_prices": {
                "480p": _duration_prices(200, SEEDANCE_STANDARD_DURATION),
                "720p": _duration_prices(250, SEEDANCE_STANDARD_DURATION),
                "1080p": _duration_prices(500, SEEDANCE_STANDARD_DURATION),
            },
            "default_resolution": "720p",
            "default_duration": "5",
        },
    },
    "seedance_2_i2v": {
        "price_tokens": 250,
        "price_rules": {
            "resolution_duration_prices": {
                "480p": _duration_prices(200, SEEDANCE_STANDARD_DURATION),
                "720p": _duration_prices(250, SEEDANCE_STANDARD_DURATION),
                "1080p": _duration_prices(500, SEEDANCE_STANDARD_DURATION),
            },
            "default_resolution": "720p",
            "default_duration": "5",
        },
    },
    "seedance_2_t2v_fast": {
        "price_tokens": 180,
        "price_rules": {
            "duration_prices": _duration_prices(180, SEEDANCE_STANDARD_DURATION),
            "default_duration": "5",
        },
    },
    "seedance_2_i2v_fast": {
        "price_tokens": 180,
        "price_rules": {
            "duration_prices": _duration_prices(180, SEEDANCE_STANDARD_DURATION),
            "default_duration": "5",
        },
    },
    "seedance_2_mini_t2v": {
        "price_tokens": 120,
        "price_rules": {
            "duration_prices": _duration_prices(120, SEEDANCE_STANDARD_DURATION),
            "default_duration": "5",
        },
    },
    "seedance_2_mini_i2v": {
        "price_tokens": 120,
        "price_rules": {
            "duration_prices": _duration_prices(120, SEEDANCE_STANDARD_DURATION),
            "default_duration": "5",
        },
    },
}


def upgrade() -> None:
    conn = op.get_bind()
    for code, data in RULES.items():
        conn.execute(
            sa.text(
                """
                INSERT INTO model_pricing
                    (model_code, display_name, category, price_tokens, price_rules, is_enabled, is_featured)
                SELECT code, title, task_type, :price_tokens, CAST(:price_rules AS jsonb), true, false
                FROM ai_models
                WHERE code = :code
                ON CONFLICT (model_code) DO UPDATE SET
                    price_tokens = EXCLUDED.price_tokens,
                    price_rules = EXCLUDED.price_rules,
                    is_enabled = true
                """
            ),
            {
                "code": code,
                "price_tokens": data["price_tokens"],
                "price_rules": json.dumps(data["price_rules"], ensure_ascii=False),
            },
        )


def downgrade() -> None:
    conn = op.get_bind()
    for code in RULES:
        conn.execute(
            sa.text("UPDATE model_pricing SET price_rules = NULL WHERE model_code = :code"),
            {"code": code},
        )
