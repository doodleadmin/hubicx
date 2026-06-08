"""token economy update: base_tokens + total_tokens in token_packages, price_rules in model_pricing

Revision ID: 0008_token_economy
Revises: 0007_pricing_admin_mvp
Create Date: 2026-06-08
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0008_token_economy"
down_revision = "0007_pricing_admin_mvp"
branch_labels = None
depends_on = None


# ── новые токен-пакеты ──────────────────────────────────
NEW_TOKEN_PACKAGES = [
    {"code": "start", "title": "160 токенов", "price_rub": 149, "base_tokens": 149, "bonus_tokens": 11, "total_tokens": 160, "sort_order": 10},
    {"code": "basic", "title": "450 токенов", "price_rub": 399, "base_tokens": 399, "bonus_tokens": 51, "total_tokens": 450, "sort_order": 20},
    {"code": "pro",   "title": "1000 токенов", "price_rub": 849, "base_tokens": 849, "bonus_tokens": 151, "total_tokens": 1000, "sort_order": 30},
    {"code": "max",   "title": "2200 токенов", "price_rub": 1690, "base_tokens": 1690, "bonus_tokens": 510, "total_tokens": 2200, "sort_order": 40},
    {"code": "ultra", "title": "4200 токенов", "price_rub": 2990, "base_tokens": 2990, "bonus_tokens": 1210, "total_tokens": 4200, "sort_order": 50},
]

# ── обновлённые цены моделей (price_tokens – базовая цена) ─
NEW_MODEL_PRICES = [
    # text
    ("ai_chat",       "AI Chat",         "text",  3,  True,  True),
    ("prompt_helper", "Prompt Helper",   "text",  3,  True,  True),
    # image
    ("flux_schnell",      "Flux Schnell",        "image", 20, True,  True),
    ("z_image",           "Z-Image",             "image", 20, True,  False),
    ("seedream",          "Seedream",            "image", 45, True,  False),
    ("nano_banana_2",     "Nano Banana 2",       "image", 50, True,  True),
    ("nano_banana_edit",  "Nano Banana Edit",    "image", 60, True,  False),
    ("nano_banana_pro",   "Nano Banana Pro",     "image", 120, True,  True),
    # video
    ("kling_21_i2v",        "Kling 2.1 I2V",        "video", 120, True, False),
    ("seedance_2_i2v_fast", "Seedance 2 I2V Fast",  "video", 250, True, False),
    ("seedance_2_t2v",      "Seedance 2 T2V",       "video", 350, True, False),
    ("seedance_2_i2v",      "Seedance 2 I2V",       "video", 350, True, False),
]

# ── price_rules JSON для моделей ────────────────────────
IMAGE_MULTIPLY_BY_NUM = '{"multiply_by_num_images": true}'

PRICE_RULES_MAP = {
    "nano_banana_pro": {
        "resolution_prices": {"1K": 120, "2K": 160, "4K": 220},
        "multiply_by_num_images": True,
        "default_resolution": "1K",
    },
    "kling_21_i2v": {
        "duration_prices": {"5": 120, "10": 200},
        "default_duration": "5",
    },
    "seedance_2_i2v_fast": {
        "duration_prices": {"5": 250, "10": 450, "15": 650},
        "default_duration": "5",
    },
    "seedance_2_t2v": {
        "resolution_duration_prices": {
            "720p":  {"5": 350, "10": 650, "15": 950},
            "1080p": {"5": 800, "10": 1500},
        },
        "default_resolution": "720p",
        "default_duration": "5",
    },
    "seedance_2_i2v": {
        "resolution_duration_prices": {
            "720p":  {"5": 350, "10": 650, "15": 950},
            "1080p": {"5": 800, "10": 1500},
        },
        "default_resolution": "720p",
        "default_duration": "5",
    },
}


def upgrade() -> None:
    # ── 1. token_packages: добавляем base_tokens / total_tokens ──
    op.add_column("token_packages", sa.Column("base_tokens", sa.Integer(), nullable=True))
    op.add_column("token_packages", sa.Column("total_tokens", sa.Integer(), nullable=True))

    # ── 2. model_pricing: добавляем price_rules, provider_cost_note, admin_cost_note ──
    op.add_column("model_pricing", sa.Column("price_rules", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("model_pricing", sa.Column("provider_cost_note", sa.Text(), nullable=True))

    # admin_note уже есть, переименовывать не будем — будем использовать как admin_cost_note по смыслу
    # (колонка уже называется admin_note в модели и БД)

    # ── 3. upsert токен-пакетов ──
    token_table = sa.table(
        "token_packages",
        sa.column("code", sa.String),
        sa.column("title", sa.String),
        sa.column("tokens", sa.Integer),
        sa.column("price_rub", sa.Integer),
        sa.column("base_tokens", sa.Integer),
        sa.column("total_tokens", sa.Integer),
        sa.column("bonus_tokens", sa.Integer),
        sa.column("is_active", sa.Boolean),
        sa.column("sort_order", sa.Integer),
    )

    # деактивируем старые пакеты (starter, basic, pro, max)
    op.execute(
        sa.text("UPDATE token_packages SET is_active = false WHERE code IN ('starter', 'basic', 'pro', 'max')")
    )

    # upsert новых пакетов
    for pkg in NEW_TOKEN_PACKAGES:
        existing = op.get_bind().execute(
            sa.text("SELECT id FROM token_packages WHERE code = :code"), {"code": pkg["code"]}
        ).fetchone()
        if existing:
            op.get_bind().execute(
                sa.text(
                    "UPDATE token_packages SET title=:title, tokens=:total_tokens, price_rub=:price_rub, "
                    "base_tokens=:base_tokens, total_tokens=:total_tokens, bonus_tokens=:bonus_tokens, "
                    "is_active=true, sort_order=:sort_order WHERE code=:code"
                ),
                {
                    "code": pkg["code"], "title": pkg["title"],
                    "total_tokens": pkg["total_tokens"], "price_rub": pkg["price_rub"],
                    "base_tokens": pkg["base_tokens"], "bonus_tokens": pkg["bonus_tokens"],
                    "sort_order": pkg["sort_order"],
                },
            )
        else:
            op.bulk_insert(
                token_table,
                [{
                    "code": pkg["code"], "title": pkg["title"],
                    "tokens": pkg["total_tokens"], "price_rub": pkg["price_rub"],
                    "base_tokens": pkg["base_tokens"], "total_tokens": pkg["total_tokens"],
                    "bonus_tokens": pkg["bonus_tokens"], "is_active": True, "sort_order": pkg["sort_order"],
                }],
            )

    # ── 4. обновляем model_pricing ──
    pricing_table = sa.table(
        "model_pricing",
        sa.column("model_code", sa.String),
        sa.column("display_name", sa.String),
        sa.column("category", sa.String),
        sa.column("price_tokens", sa.Integer),
        sa.column("is_enabled", sa.Boolean),
        sa.column("is_featured", sa.Boolean),
        sa.column("price_rules", postgresql.JSONB),
    )

    for code, name, category, price, enabled, featured in NEW_MODEL_PRICES:
        existing_p = op.get_bind().execute(
            sa.text("SELECT id FROM model_pricing WHERE model_code = :code"), {"code": code}
        ).fetchone()
        rules_json = None
        if code in PRICE_RULES_MAP:
            import json
            rules_json = json.dumps(PRICE_RULES_MAP[code], ensure_ascii=False)
        elif category == "image" and code not in ("nano_banana_pro",):
            # для обычных image — multiply_by_num_images
            rules_json = IMAGE_MULTIPLY_BY_NUM

        if existing_p:
            conn = op.get_bind()
            conn.execute(
                sa.text(
                    "UPDATE model_pricing SET display_name=:name, category=:cat, price_tokens=:price, "
                    "is_enabled=:enabled, is_featured=:feat, price_rules=CAST(:rules AS jsonb) WHERE model_code=:code"
                ),
                {
                    "code": code, "name": name, "cat": category, "price": price,
                    "enabled": enabled, "feat": featured, "rules": rules_json,
                },
            )
        else:
            op.bulk_insert(
                pricing_table,
                [{
                    "model_code": code, "display_name": name, "category": category,
                    "price_tokens": price, "is_enabled": enabled, "is_featured": featured,
                    "price_rules": rules_json,
                }],
            )


def downgrade() -> None:
    op.drop_column("token_packages", "total_tokens")
    op.drop_column("token_packages", "base_tokens")
    op.drop_column("model_pricing", "provider_cost_note")
    op.drop_column("model_pricing", "price_rules")
