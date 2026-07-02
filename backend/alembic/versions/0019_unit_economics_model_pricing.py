"""reprice active models with unit economics

Revision ID: 0019_unit_pricing
Revises: 0018_safe_provider_pricing
Create Date: 2026-07-02
"""

from __future__ import annotations

import json
import math

import sqlalchemy as sa
from alembic import op


revision = "0019_unit_pricing"
down_revision = "0018_safe_provider_pricing"
branch_labels = None
depends_on = None


USD_RUB = 78.2652
TAX_RATE = 0.06
ACQUIRING_RATE = 0.025
ACQUIRING_VAT_RATE = 0.22
TARGET_NET_MARGIN_RATE = 0.30
TOKEN_FLOOR_RUB = 0.55
ROUND_TO_TOKENS = 10


def _tokens(provider_cost_usd: float) -> int:
    denominator = 1 - TAX_RATE - ACQUIRING_RATE * (1 + ACQUIRING_VAT_RATE) - TARGET_NET_MARGIN_RATE
    price_rub = provider_cost_usd * USD_RUB / denominator
    return max(1, int(math.ceil((price_rub / TOKEN_FLOOR_RUB) / ROUND_TO_TOKENS) * ROUND_TO_TOKENS))


def _duration_prices(usd_per_second: float, durations: list[str | int], suffix: str = "") -> dict[str, int]:
    prices: dict[str, int] = {}
    for duration in durations:
        key = str(duration)
        seconds_key = key.removesuffix(suffix) if suffix else key.removesuffix("s")
        seconds = float(seconds_key)
        prices[key] = _tokens(usd_per_second * seconds)
    return prices


def _with_auto(prices: dict[str, int], default: str) -> dict[str, int]:
    return {**prices, "auto": prices[default]}


def _resolution_duration(rates: dict[str, float], durations: list[str | int], default_duration: str) -> dict[str, dict[str, int]]:
    return {resolution: _with_auto(_duration_prices(rate, durations), default_duration) for resolution, rate in rates.items()}


def _upsert(conn, code: str, price_tokens: int, price_rules: dict | None, provider_cost_note: str) -> None:
    conn.execute(
        sa.text(
            """
            INSERT INTO model_pricing
                (model_code, display_name, category, price_tokens, price_rules, provider_cost_note, is_enabled, is_featured)
            SELECT code, title, task_type, :price_tokens, CAST(:price_rules AS jsonb), :provider_cost_note, true, false
            FROM ai_models
            WHERE code = :code
            ON CONFLICT (model_code) DO UPDATE SET
                display_name = EXCLUDED.display_name,
                category = EXCLUDED.category,
                price_tokens = EXCLUDED.price_tokens,
                price_rules = EXCLUDED.price_rules,
                provider_cost_note = EXCLUDED.provider_cost_note,
                is_enabled = true
            """
        ),
        {
            "code": code,
            "price_tokens": price_tokens,
            "price_rules": json.dumps(price_rules, ensure_ascii=False) if price_rules is not None else None,
            "provider_cost_note": provider_cost_note,
        },
    )


def _multiply_by_num_images(base_tokens: int) -> dict:
    return {"multiply_by_num_images": True, "min": 1, "round": "ceil"}


def upgrade() -> None:
    conn = op.get_bind()
    note_prefix = "Unit economics v2: USD/RUB 78.2652, USN 6%, acquiring 2.5% + VAT 22%, target net margin 30%."

    # Image models. Ambiguous token-based endpoints are kept close to the current safe price.
    image_prices = {
        "nano_banana_2_lite": (25, _multiply_by_num_images(25), "Fal pricing API: unit-based; kept at existing 25 tokens until per-image unit is confirmed."),
        "nano_banana_2": (_tokens(0.08), _multiply_by_num_images(_tokens(0.08)), "Fal pricing API: $0.08/image."),
        "nano_banana_edit": (_tokens(0.0398), _multiply_by_num_images(_tokens(0.0398)), "Fal pricing API: $0.0398/image."),
        "flux_schnell": (_tokens(0.003), _multiply_by_num_images(_tokens(0.003)), "Fal pricing API: $0.003/megapixel; priced from 1MP baseline."),
        "seedream": (_tokens(0.03), _multiply_by_num_images(_tokens(0.03)), "Fal pricing API: $0.03/image."),
        "z_image": (_tokens(0.005), _multiply_by_num_images(_tokens(0.005)), "Fal pricing API: $0.005/megapixel; priced from 1MP baseline."),
        "gpt_image_2": (90, {"multipliers": [{"field": "quality", "values": {"auto": 1, "low": 0.7, "medium": 1, "high": 1.4}}, {"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"}, "Fal pricing API: token-based; kept at existing safe price until exact token estimator is implemented."),
        "gpt_image_2_edit": (110, {"multipliers": [{"field": "quality", "values": {"auto": 1, "low": 0.7, "medium": 1, "high": 1.4}}, {"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"}, "Fal pricing API: token-based edit endpoint; kept at existing safe price until exact token estimator is implemented."),
    }
    for code, (price, rules, note) in image_prices.items():
        _upsert(conn, code, price, rules, f"{note_prefix} {note}")

    _upsert(
        conn,
        "nano_banana_pro",
        _tokens(0.15),
        {
            "resolution_prices": {"1K": _tokens(0.15), "2K": _tokens(0.15), "4K": _tokens(0.30)},
            "default_resolution": "1K",
            "multiply_by_num_images": True,
        },
        f"{note_prefix} Fal pricing API: $0.15/image for 1K/2K, $0.30/image for 4K.",
    )

    durations_4_15 = [str(v) for v in range(4, 16)]
    seedance_standard = _resolution_duration({"480p": 0.1512, "720p": 0.3034, "1080p": 0.682}, durations_4_15, "5")
    seedance_fast = _resolution_duration({"480p": 0.12095, "720p": 0.2419}, durations_4_15, "5")
    seedance_mini = _resolution_duration({"480p": 0.0721, "720p": 0.1547}, durations_4_15, "5")
    seedance_sets = {
        "seedance_2_t2v": (seedance_standard, "Fal model page: 720p $0.3034/s, 1080p $0.682/s; 480p by token-derived public rate."),
        "seedance_2_i2v": (seedance_standard, "Fal model page: 720p $0.3034/s, 1080p $0.682/s; 480p by token-derived public rate."),
        "seedance_2_reference": (seedance_standard, "Fal model page: 720p $0.3034/s, 1080p $0.682/s; 480p by token-derived public rate."),
        "seedance_2_t2v_fast": (seedance_fast, "Fal model page: fast 720p $0.2419/s; 480p by token-derived public rate."),
        "seedance_2_i2v_fast": (seedance_fast, "Fal model page: fast 720p $0.2419/s; 480p by token-derived public rate."),
        "seedance_2_reference_fast": (seedance_fast, "Fal model page: fast 720p $0.2419/s; 480p by token-derived public rate."),
        "seedance_2_mini_t2v": (seedance_mini, "Fal model page: mini 720p roughly $0.1547/s, 480p roughly $0.0721/s."),
        "seedance_2_mini_i2v": (seedance_mini, "Fal model page: mini 720p roughly $0.1547/s, 480p roughly $0.0721/s."),
        "seedance_2_mini_reference": (seedance_mini, "Fal model page: mini 720p roughly $0.1547/s, 480p roughly $0.0721/s."),
    }
    for code, (rules_by_resolution, note) in seedance_sets.items():
        base = rules_by_resolution["720p"]["5"]
        _upsert(
            conn,
            code,
            base,
            {"resolution_duration_prices": rules_by_resolution, "default_resolution": "720p", "default_duration": "5"},
            f"{note_prefix} {note}",
        )

    video_rules = {
        "kling_21_i2v": (_duration_prices(0.056, ["5", "10"]), "5", "Fal pricing API: $0.056/second."),
        "kling_30_i2v": (_duration_prices(0.14, [str(v) for v in range(3, 16)]), "10", "Fal pricing API: $0.14/second."),
        "grok_video_t2v": (_duration_prices(0.05, ["4", "6"]), "6", "Fal pricing API: $0.05/second."),
        "grok_video_i2v": (_duration_prices(0.05, ["4", "6"]), "6", "Fal pricing API: $0.05/second."),
    }
    for code, (prices, default_duration, note) in video_rules.items():
        _upsert(conn, code, prices[default_duration], {"duration_prices": prices, "default_duration": default_duration}, f"{note_prefix} {note}")

    happy_horse = _resolution_duration({"480p": 0.112, "720p": 0.14, "1080p": 0.28}, durations_4_15, "5")
    _upsert(
        conn,
        "happy_horse_i2v",
        happy_horse["720p"]["5"],
        {"resolution_duration_prices": happy_horse, "default_resolution": "720p", "default_duration": "5"},
        f"{note_prefix} Fal pricing API: $0.14/second; resolution multipliers follow existing UI pricing ratios.",
    )

    veo = _resolution_duration({"720p": 0.4, "1080p": 0.8, "4k": 1.6}, ["4s", "6s", "8s"], "8s")
    for code in ("veo_31_t2v", "veo_31_i2v"):
        _upsert(
            conn,
            code,
            veo["720p"]["8s"],
            {"resolution_duration_prices": veo, "default_resolution": "720p", "default_duration": "8s"},
            f"{note_prefix} Fal pricing API: $0.40/second baseline; resolution multipliers follow existing UI pricing ratios.",
        )

    _upsert(
        conn,
        "kling_30_motion_control",
        _tokens(0.126 * 10),
        None,
        f"{note_prefix} Fal pricing API: $0.126/second; fixed price uses 10-second planning baseline because UI has no duration control.",
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text(
            """
            UPDATE model_pricing
            SET provider_cost_note = NULL
            WHERE provider_cost_note LIKE 'Unit economics v2:%'
            """
        )
    )
