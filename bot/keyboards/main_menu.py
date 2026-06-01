from aiogram.types import KeyboardButton, ReplyKeyboardMarkup


def main_menu_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📷 Фото"), KeyboardButton(text="🎥 Видео")],
            [KeyboardButton(text="🧩 Шаблоны"), KeyboardButton(text="📄 Текст")],
            [KeyboardButton(text="💰 Баланс"), KeyboardButton(text="📜 История")],
            [KeyboardButton(text="🇷🇺 Русский")],
        ],
        resize_keyboard=True,
    )
