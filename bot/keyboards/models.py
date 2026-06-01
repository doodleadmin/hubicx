from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

from bot.config import WEBAPP_URL


def app_button(title: str, url: str) -> InlineKeyboardButton:
    if url.startswith("https://"):
        return InlineKeyboardButton(text=title, web_app=WebAppInfo(url=url))
    return InlineKeyboardButton(text=title, callback_data="webapp_unavailable")


def webapp_models_keyboard(items: list[tuple[str, str]], route: str = "generate", param: str = "model") -> InlineKeyboardMarkup:
    rows = []
    for index in range(0, len(items), 2):
        row = []
        for title, code in items[index:index + 2]:
            row.append(app_button(title, f"{WEBAPP_URL}/{route}?{param}={code}"))
        rows.append(row)
    rows.append([InlineKeyboardButton(text="Домой", callback_data="home")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def balance_keyboard(ref_link: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [app_button("Пополнить баланс", f"{WEBAPP_URL}/balance")],
        [InlineKeyboardButton(text="Моя команда", callback_data="team")],
        [InlineKeyboardButton(text="Скопировать личную ссылку", url=ref_link)],
        [InlineKeyboardButton(text="Домой", callback_data="home")],
    ])
