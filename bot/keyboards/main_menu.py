from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

from bot.config import WEBAPP_URL
from bot.custom_emoji import emoji_icon
from bot.i18n import t
from bot.keyboards.models import app_button


LANGUAGE_BUTTONS = {
    "ru": "Русский",
    "en": "English",
    "es": "Español",
    "pt": "Português",
}


def main_menu_keyboard(language_code: str = "ru") -> InlineKeyboardMarkup:
    language_title = LANGUAGE_BUTTONS.get(language_code, LANGUAGE_BUTTONS["ru"])
    webapp_url = WEBAPP_URL
    return InlineKeyboardMarkup(inline_keyboard=[
        [app_button(t(language_code, "menu.open_hubicx"), webapp_url, icon_key="home")],
        [InlineKeyboardButton(text="📄 Документация", url="https://hubicx.ru/pages/docs")],
        [InlineKeyboardButton(text=language_title, callback_data="main:language", **emoji_icon("language"))],
    ])
