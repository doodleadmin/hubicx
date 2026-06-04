from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

from bot.custom_emoji import emoji_icon
from bot.i18n import t


LANGUAGE_BUTTONS = {
    "ru": "Русский",
    "en": "English",
    "es": "Español",
    "pt": "Português",
}


def main_menu_keyboard(language_code: str = "ru") -> InlineKeyboardMarkup:
    language_title = LANGUAGE_BUTTONS.get(language_code, LANGUAGE_BUTTONS["ru"])
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=t(language_code, "menu.photo"), callback_data="main:photo", **emoji_icon("photo")), InlineKeyboardButton(text=t(language_code, "menu.video"), callback_data="main:video", **emoji_icon("video"))],
        [InlineKeyboardButton(text=t(language_code, "menu.templates"), callback_data="main:templates", **emoji_icon("templates")), InlineKeyboardButton(text=t(language_code, "menu.text"), callback_data="main:text", **emoji_icon("text"))],
        [InlineKeyboardButton(text=t(language_code, "menu.balance"), callback_data="main:balance", **emoji_icon("balance")), InlineKeyboardButton(text=t(language_code, "menu.history"), callback_data="main:history", **emoji_icon("history"))],
        [InlineKeyboardButton(text=language_title, callback_data="main:language", **emoji_icon("language"))],
    ])
