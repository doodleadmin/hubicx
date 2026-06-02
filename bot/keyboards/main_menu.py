from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup


LANGUAGE_BUTTONS = {
    "ru": "🇷🇺 Русский",
    "en": "🇬🇧 English",
    "es": "🇪🇸 Español",
    "pt": "🇵🇹 Português",
}


def main_menu_keyboard(language_code: str = "ru") -> InlineKeyboardMarkup:
    language_title = LANGUAGE_BUTTONS.get(language_code, LANGUAGE_BUTTONS["ru"])
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📷 Фото", callback_data="main:photo"), InlineKeyboardButton(text="🎥 Видео", callback_data="main:video")],
        [InlineKeyboardButton(text="🧩 Шаблоны", callback_data="main:templates"), InlineKeyboardButton(text="📄 Текст", callback_data="main:text")],
        [InlineKeyboardButton(text="💰 Баланс", callback_data="main:balance"), InlineKeyboardButton(text="📜 История", callback_data="main:history")],
        [InlineKeyboardButton(text=language_title, callback_data="main:language")],
    ])
