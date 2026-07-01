"""align provider pricing with a safe token margin

Revision ID: 0018_safe_provider_pricing
Revises: 0017_payment_idempotency
Create Date: 2026-07-01
"""

from __future__ import annotations

import json
import math

import sqlalchemy as sa
from alembic import op


revision = "0018_safe_provider_pricing"
down_revision = "0017_payment_idempotency"
branch_labels = None
depends_on = None


DURATION_MULTIPLIERS = {
    "auto": 1,
    "4": 0.8,
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

PREVIOUS_DURATION_MULTIPLIERS = {**DURATION_MULTIPLIERS, "4": 1}


def _duration_prices(base: int) -> dict[str, int]:
    return {duration: max(1, round(base * multiplier)) for duration, multiplier in DURATION_MULTIPLIERS.items()}


def _resolution_duration_prices(base_720p: int, resolution_multipliers: dict[str, float]) -> dict[str, dict[str, int]]:
    return {
        resolution: _duration_prices(math.ceil(base_720p * multiplier))
        for resolution, multiplier in resolution_multipliers.items()
    }


SEEDANCE_RULES = {
    "seedance_2_t2v": (460, {"480p": 0.45, "720p": 1, "1080p": 2.25}),
    "seedance_2_i2v": (460, {"480p": 0.45, "720p": 1, "1080p": 2.25}),
    "seedance_2_reference": (460, {"480p": 0.45, "720p": 1, "1080p": 2.25}),
    "seedance_2_t2v_fast": (370, {"480p": 0.45, "720p": 1}),
    "seedance_2_i2v_fast": (370, {"480p": 0.45, "720p": 1}),
    "seedance_2_reference_fast": (370, {"480p": 0.45, "720p": 1}),
    "seedance_2_mini_t2v": (240, {"480p": 0.466, "720p": 1}),
    "seedance_2_mini_i2v": (240, {"480p": 0.466, "720p": 1}),
    "seedance_2_mini_reference": (240, {"480p": 0.466, "720p": 1}),
}


def _upsert_pricing(conn, code: str, price_tokens: int, price_rules: dict) -> None:
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
            "price_tokens": price_tokens,
            "price_rules": json.dumps(price_rules, ensure_ascii=False),
        },
    )


def upgrade() -> None:
    conn = op.get_bind()
    for code, (base, resolution_multipliers) in SEEDANCE_RULES.items():
        _upsert_pricing(
            conn,
            code,
            base,
            {
                "resolution_duration_prices": _resolution_duration_prices(base, resolution_multipliers),
                "default_resolution": "720p",
                "default_duration": "5",
            },
        )

    _upsert_pricing(
        conn,
        "nano_banana_pro",
        80,
        {
            "resolution_prices": {"1K": 80, "2K": 80, "4K": 160},
            "default_resolution": "1K",
            "multiply_by_num_images": True,
        },
    )


def downgrade() -> None:
    conn = op.get_bind()
    previous = {
        "seedance_2_t2v": (250, {"480p": 200, "720p": 250, "1080p": 500}),
        "seedance_2_i2v": (250, {"480p": 200, "720p": 250, "1080p": 500}),
        "seedance_2_t2v_fast": (180, {"720p": 180}),
        "seedance_2_i2v_fast": (180, {"720p": 180}),
        "seedance_2_mini_t2v": (120, {"720p": 120}),
        "seedance_2_mini_i2v": (120, {"720p": 120}),
    }
    for code, (base, resolution_bases) in previous.items():
        _upsert_pricing(
            conn,
            code,
            base,
            {
                "resolution_duration_prices": {
                    resolution: {
                        duration: max(1, round(resolution_base * multiplier))
                        for duration, multiplier in PREVIOUS_DURATION_MULTIPLIERS.items()
                    }
                    for resolution, resolution_base in resolution_bases.items()
                },
                "default_resolution": "720p",
                "default_duration": "5",
            },
        )

    conn.execute(
        sa.text(
            """
            UPDATE model_pricing
            SET price_tokens = CASE model_code
                    WHEN 'seedance_2_reference' THEN 225
                    WHEN 'seedance_2_reference_fast' THEN 180
                    WHEN 'seedance_2_mini_reference' THEN 120
                    WHEN 'nano_banana_pro' THEN 80
                END,
                price_rules = NULL
            WHERE model_code IN (
                'seedance_2_reference', 'seedance_2_reference_fast',
                'seedance_2_mini_reference', 'nano_banana_pro'
            )
            """
        )
    )
