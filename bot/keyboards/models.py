import logging
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

from bot.config import WEBAPP_URL
from bot.custom_emoji import emoji_icon
from bot.i18n import t

logger = logging.getLogger(__name__)
WEBAPP_VERSION = "20260606_mira_model_filter"


def versioned_webapp_url(url: str) -> str:
    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query["v"] = WEBAPP_VERSION
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def app_button(title: str, url: str, icon_key: str | None = None) -> InlineKeyboardButton:
    extra = emoji_icon(icon_key)
    url = versioned_webapp_url(url)
    is_https = url.startswith("https://")
    if is_https:
        logger.info(
            "Creating WebApp button url=%s is_https=%s using_web_app_info=%s",
            url,
            is_https,
            True,
        )
        return InlineKeyboardButton(text=title, web_app=WebAppInfo(url=url), **extra)
    logger.warning("WEBAPP_URL is not HTTPS, WebAppInfo disabled. WEBAPP_URL=%s", WEBAPP_URL)
    return InlineKeyboardButton(text=title, callback_data="webapp_unavailable", **extra)


def webapp_models_keyboard(items: list[tuple[str, str]], route: str = "generate", param: str = "model", lang: str = "ru", icon_map: dict[str, str] | None = None) -> InlineKeyboardMarkup:
    rows = []
    for index in range(0, len(items), 2):
        row = []
        for title, code in items[index:index + 2]:
            icon_key = (icon_map or {}).get(code)
            row.append(app_button(title, f"{WEBAPP_URL}/{route}?{param}={code}", icon_key=icon_key))
        rows.append(row)
    rows.append([InlineKeyboardButton(text=t(lang, "menu.home"), callback_data="main:home", **emoji_icon("home"))])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def balance_keyboard(lang: str = "ru") -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [app_button(t(lang, "balance.open_balance"), f"{WEBAPP_URL}/balance", icon_key="top_up")],
        [app_button(t(lang, "docs.open"), f"{WEBAPP_URL}/docs", icon_key="open_file")],
        [InlineKeyboardButton(text=t(lang, "menu.home"), callback_data="main:home", **emoji_icon("home"))],
    ])
