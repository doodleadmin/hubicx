from __future__ import annotations

# Welcome and task bonuses are switched off: growth now goes through the partner
# program. Bonus balances users already have stay spendable.
SIGNUP_BONUS_TOKENS = 0

# Partner program: every user can invite people and earn from their purchases.
PARTNER_COMMISSION_PERCENT = 20
PARTNER_HOLD_DAYS = 14
PARTNER_MIN_PAYOUT_RUB = 500
# Cash-outs are paused until the legal/tax side of paying individuals is settled.
# Earnings can still be spent on plans and tokens.
PARTNER_WITHDRAWALS_ENABLED = False
PARTNER_PAYOUT_METHODS = {
    "card": "Банковская карта",
    "sbp": "СБП по номеру телефона",
}

# Token scale v3 (October 2026): one token ≈ 4.4-7.9 ₽ depending on the plan (8× the old token).
# Custom top-ups buy at 8 ₽ per token.
RUB_PER_TOKEN_CUSTOM = 8

TOKEN_PACKAGES_V2 = [
    {"code": "topup_300", "title": "38 токенов", "price_rub": 249, "base_tokens": 38, "bonus_tokens": 0, "total_tokens": 38, "sort_order": 10},
    {"code": "topup_1000", "title": "125 токенов", "price_rub": 790, "base_tokens": 125, "bonus_tokens": 0, "total_tokens": 125, "sort_order": 20},
    {"code": "topup_3000", "title": "375 токенов", "price_rub": 1990, "base_tokens": 375, "bonus_tokens": 0, "total_tokens": 375, "sort_order": 30},
    {"code": "topup_10000", "title": "1 250 токенов", "price_rub": 5990, "base_tokens": 1250, "bonus_tokens": 0, "total_tokens": 1250, "sort_order": 40},
]

# Every plan also includes AI-chat messages (≈ 1 per 3 ₽ of the price). They live in
# users.chat_credits, are not shown in the token balance and are spent before tokens.
SUBSCRIPTION_PLANS_V2 = [
    {
        "code": "templates_mini",
        "title": "Шаблоны Mini",
        "price_rub": 790,
        "period": "month",
        "category": "templates",
        "tokens_per_month": 100,
        "chat_messages_per_month": 300,
        "features": ["Базовые шаблоны", "Фото-шаблоны", "Стартовый пакет токенов"],
        "badge": "Старт",
    },
    {
        "code": "templates_plus",
        "title": "Шаблоны Plus",
        "price_rub": 2590,
        "period": "month",
        "category": "templates",
        "tokens_per_month": 438,
        "chat_messages_per_month": 900,
        "features": ["Все шаблоны", "Видео-шаблоны", "Больше токенов каждый месяц"],
        "badge": "Для контента",
    },
    {
        "code": "creator",
        "title": "Creator",
        "price_rub": 1490,
        "period": "month",
        "category": "full",
        "tokens_per_month": 225,
        "chat_messages_per_month": 500,
        "features": ["Фото и видео", "Базовые модели", "История генераций"],
        "badge": "Личный",
    },
    {
        "code": "creator_pro",
        "title": "Creator Pro",
        "price_rub": 3990,
        "period": "month",
        "category": "full",
        "tokens_per_month": 813,
        "chat_messages_per_month": 1300,
        "features": ["Все основные модели", "Премиум-шаблоны", "Регулярный контент"],
        "badge": "Популярный",
    },
    {
        "code": "studio",
        "title": "Studio",
        "price_rub": 9900,
        "period": "month",
        "category": "full",
        "tokens_per_month": 2250,
        "chat_messages_per_month": 3300,
        "features": ["Командная работа", "Большой объём токенов", "Студийные сценарии"],
        "badge": "Для бизнеса",
    },
]

BONUS_TASKS_V2: list[dict] = []

BONUS_TOTAL_TOKENS = sum(int(t["tokens"]) for t in BONUS_TASKS_V2)

# Бонусные токены можно тратить только на дешёвые/базовые сценарии.
# Премиум-видео, chained pipelines и дорогие модели должны требовать paid-баланс.
BONUS_ELIGIBLE_MODEL_CODES = {
    "ai_chat",
    "prompt_helper",
    "flux_schnell",
    "z_image",
    "nano_banana",
    "nano_banana_2",
}


def is_bonus_eligible_model(model_code: str | None, task_type: str | None = None) -> bool:
    if task_type == "video":
        return False
    return bool(model_code and model_code in BONUS_ELIGIBLE_MODEL_CODES)
