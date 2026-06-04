import logging

logger = logging.getLogger(__name__)

CUSTOM_EMOJI = {
    # Главное меню
    "photo": "5262796609460150351",
    "video": "5262818320519834510",
    "templates": "5262756945437169279",
    "text": "5262916348853396208",
    "balance": "5262933623211858140",
    "history": "5262554918765504159",
    "language": "5264736697727359309",
    "home": "5262528672220359790",
    "back": "5262528672220359790",
    # Баланс / системные
    "top_up": "5262943853823957227",
    "team": "5265269578614744595",
    "copy_link": "5265196684429794493",
    "admin": "5265166263176438978",
    "success": "5262904091016731896",
    "error": "5262718634328890874",
    "refund": "5262718634328890874",
    "send_to_chat": "5262511591135417015",
    "open_file": "5265159520077781067",
    # Фото-модели
    "nano_banana_2": "5264913053379500624",
    "nano_banana_pro": "5262645783093615293",
    "nano_banana_edit": "5262666824138396955",
    "flux_schnell": "5262783131852773948",
    "seedream": "5262982744752828896",
    "gpt_image_2": "5264830358079183096",
    "grok_image": "5262728680257393384",
    "z_image": "5262681598825897631",
    # Видео-модели
    "seedance_2_t2v": "5262510259695556208",
    "seedance_2_i2v_fast": "5264818396595265264",
    "seedance_2_i2v": "5262670174212888915",
    "kling_21_i2v": "5262815361287362390",
    "veo_31_t2v": "5262813291113127838",
    "veo_31_i2v": "5262813291113127838",
    "coming_soon": "5262813291113127838",
    # Текст
    "ai_chat": "5262515001339453096",
    "prompt_helper": "5264760294277686960",
    # Шаблоны
    "add_beer": "5264995327773024265",
    "doll_unboxing": "5264724993941477524",
    # Без отдельного эмодзи
    "upscale_4k": "",
    "prompt_by_photo": "",
    "chat_to_song": "",
    "photo_g7x": "",
    "halo_light": "",
    "livestream": "",
    "formula_1": "",
    "ai_avatar": "",
    "graduation": "",
    "settings": "",
    "support": "",
}

_enabled_count = sum(1 for v in CUSTOM_EMOJI.values() if v)
logger.info("CUSTOM_EMOJI enabled count=%d total=%d", _enabled_count, len(CUSTOM_EMOJI))


def emoji_id(key: str) -> str | None:
    value = CUSTOM_EMOJI.get(key)
    if not value:
        return None
    return value


def emoji_icon(key: str | None) -> dict:
    if not key:
        return {}
    custom_emoji_id = emoji_id(key)
    if not custom_emoji_id:
        return {}
    return {"icon_custom_emoji_id": custom_emoji_id}
