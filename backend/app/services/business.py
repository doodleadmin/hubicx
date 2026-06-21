from __future__ import annotations

SIGNUP_BONUS_TOKENS = 50

TOKEN_PACKAGES_V2 = [
    {"code": "topup_300", "title": "300 токенов", "price_rub": 249, "base_tokens": 300, "bonus_tokens": 0, "total_tokens": 300, "sort_order": 10},
    {"code": "topup_1000", "title": "1 000 токенов", "price_rub": 790, "base_tokens": 1000, "bonus_tokens": 0, "total_tokens": 1000, "sort_order": 20},
    {"code": "topup_3000", "title": "3 000 токенов", "price_rub": 1990, "base_tokens": 3000, "bonus_tokens": 0, "total_tokens": 3000, "sort_order": 30},
    {"code": "topup_10000", "title": "10 000 токенов", "price_rub": 5990, "base_tokens": 10000, "bonus_tokens": 0, "total_tokens": 10000, "sort_order": 40},
]

SUBSCRIPTION_PLANS_V2 = [
    {
        "code": "templates_mini",
        "title": "Шаблоны Mini",
        "price_rub": 790,
        "period": "month",
        "category": "templates",
        "tokens_per_month": 800,
        "features": ["Базовые шаблоны", "Фото-шаблоны", "Стартовый пакет токенов"],
        "badge": "Старт",
    },
    {
        "code": "templates_plus",
        "title": "Шаблоны Plus",
        "price_rub": 2590,
        "period": "month",
        "category": "templates",
        "tokens_per_month": 3500,
        "features": ["Все шаблоны", "Видео-шаблоны", "Больше токенов каждый месяц"],
        "badge": "Для контента",
    },
    {
        "code": "creator",
        "title": "Creator",
        "price_rub": 1490,
        "period": "month",
        "category": "full",
        "tokens_per_month": 1800,
        "features": ["Фото и видео", "Базовые модели", "История генераций"],
        "badge": "Личный",
    },
    {
        "code": "creator_pro",
        "title": "Creator Pro",
        "price_rub": 3990,
        "period": "month",
        "category": "full",
        "tokens_per_month": 6500,
        "features": ["Все основные модели", "Премиум-шаблоны", "Регулярный контент"],
        "badge": "Популярный",
    },
    {
        "code": "studio",
        "title": "Studio",
        "price_rub": 9900,
        "period": "month",
        "category": "full",
        "tokens_per_month": 18000,
        "features": ["Командная работа", "Большой объём токенов", "Студийные сценарии"],
        "badge": "Для бизнеса",
    },
]

BONUS_TASKS_V2 = [
    {
        "code": "signup",
        "title": "Бонус за регистрацию",
        "description": "Начисляется автоматически после первого входа.",
        "tokens": 50,
        "kind": "automatic",
    },
    {
        "code": "social_subscribe",
        "title": "Подписаться на наш канал",
        "description": "Подпишитесь на Telegram/соцсеть Hubicx и получите бонусные токены.",
        "tokens": 70,
        "kind": "manual_claim",
    },
    {
        "code": "post_comment",
        "title": "Оставить комментарий под постом",
        "description": "Оставьте комментарий под нашим постом и заберите бонус.",
        "tokens": 70,
        "kind": "manual_claim",
    },
]

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
