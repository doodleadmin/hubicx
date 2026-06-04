from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

from bot.custom_emoji import emoji_icon
from bot.i18n import t


def home_keyboard(lang: str = "ru") -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=t(lang, "menu.home"), callback_data="main:home", **emoji_icon("home"))]])
