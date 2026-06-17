AI_MODELS_CATALOG = [
    {
        "code": "nano_banana_2",
        "title": "Nano Banana 2",
        "category": "photo",
        "provider": "fal",
        "provider_model_id": "fal-ai/nano-banana-2",
        "task_type": "image",
        "input_type": "text",
        "price_credits": 40,
        "is_active": True,
        "sort_order": 10,
        "default_params": {"num_images": 1},
        "description": "Генерация изображений через Nano Banana 2.",
        "form_schema": {
            "version": 1,
            "submit_label": "Сгенерировать",
            "result_type": "image",
            "fields": [
                {"name": "prompt", "provider_key": "prompt", "label": "Промт", "type": "textarea", "required": True, "placeholder": "Опишите, что нужно сгенерировать"},
                {"name": "aspect_ratio", "provider_key": "aspect_ratio", "label": "Соотношение сторон", "type": "select", "default": "auto", "options": ["auto", "21:9", "16:9", "3:2", "4:3", "5:4", "1:1", "4:5", "3:4", "2:3", "9:16"]},
                {"name": "output_format", "provider_key": "output_format", "label": "Формат", "type": "select", "default": "png", "options": ["png", "jpeg", "webp"]},
                {"name": "num_images", "provider_key": "num_images", "label": "Количество", "type": "number", "default": 1, "min": 1, "max": 4},
                {"name": "safety_tolerance", "provider_key": "safety_tolerance", "label": "Толерантность", "type": "select", "default": "4", "options": ["1", "2", "3", "4", "5", "6"]},
                {"name": "seed", "provider_key": "seed", "label": "Seed", "type": "number", "helper_text": "Для воспроизводимости"},
            ],
        },
    },
    {
        "code": "nano_banana",
        "title": "Nano Banana",
        "category": "photo",
        "provider": "fal",
        "provider_model_id": "fal-ai/nano-banana-2",
        "task_type": "image",
        "input_type": "text",
        "price_credits": 40,
        "is_active": True,
        "sort_order": 11,
        "default_params": {"num_images": 1},
        "description": "Alias для Nano Banana 2.",
    },
    {
        "code": "nano_banana_pro",
        "title": "Nano Banana Pro",
        "category": "photo",
        "provider": "fal",
        "provider_model_id": "fal-ai/nano-banana-pro",
        "task_type": "image",
        "input_type": "text",
        "price_credits": 80,
        "is_active": True,
        "sort_order": 12,
        "default_params": {"num_images": 1},
        "description": "Pro версия Nano Banana с поддержкой высокого разрешения.",
        "form_schema": {
            "version": 1,
            "submit_label": "Сгенерировать",
            "result_type": "image",
            "fields": [
                {"name": "prompt", "provider_key": "prompt", "label": "Промт", "type": "textarea", "required": True, "placeholder": "Опишите, что нужно сгенерировать"},
                {"name": "aspect_ratio", "provider_key": "aspect_ratio", "label": "Соотношение сторон", "type": "select", "default": "1:1", "options": ["auto", "21:9", "16:9", "3:2", "4:3", "5:4", "1:1", "4:5", "3:4", "2:3", "9:16"]},
                {"name": "resolution", "provider_key": "resolution", "label": "Разрешение", "type": "select", "default": "1K", "options": ["1K", "2K", "4K"]},
                {"name": "output_format", "provider_key": "output_format", "label": "Формат", "type": "select", "default": "png", "options": ["png", "jpeg", "webp"]},
                {"name": "num_images", "provider_key": "num_images", "label": "Количество", "type": "number", "default": 1, "min": 1, "max": 4},
                {"name": "safety_tolerance", "provider_key": "safety_tolerance", "label": "Толерантность", "type": "select", "default": "4", "options": ["1", "2", "3", "4", "5", "6"]},
                {"name": "enable_web_search", "provider_key": "enable_web_search", "label": "Веб-поиск", "type": "switch", "default": False, "helper_text": "Разрешить поиск в интернете"},
                {"name": "system_prompt", "provider_key": "system_prompt", "label": "Системный промт", "type": "textarea", "helper_text": "Дополнительная инструкция"},
                {"name": "seed", "provider_key": "seed", "label": "Seed", "type": "number"},
            ],
        },
    },
    {
        "code": "nano_banana_edit",
        "title": "Nano Banana Edit",
        "category": "photo",
        "provider": "fal",
        "provider_model_id": "fal-ai/nano-banana/edit",
        "task_type": "image",
        "input_type": "image",
        "price_credits": 60,
        "is_active": True,
        "sort_order": 13,
        "default_params": {"num_images": 1},
        "description": "Редактирование изображений через Nano Banana.",
        "form_schema": {
            "version": 1,
            "submit_label": "Редактировать",
            "result_type": "image",
            "fields": [
                {"name": "image_urls", "provider_key": "image_urls", "label": "Изображения", "type": "files", "required": True, "accept": "image/*", "max_files": 4, "helper_text": "Загрузите изображения для редактирования"},
                {"name": "prompt", "provider_key": "prompt", "label": "Промт", "type": "textarea", "required": True, "placeholder": "Опишите, что изменить"},
                {"name": "aspect_ratio", "provider_key": "aspect_ratio", "label": "Соотношение сторон", "type": "select", "default": "auto", "options": ["auto", "21:9", "16:9", "3:2", "4:3", "5:4", "1:1", "4:5", "3:4", "2:3", "9:16"]},
                {"name": "output_format", "provider_key": "output_format", "label": "Формат", "type": "select", "default": "png", "options": ["png", "jpeg", "webp"]},
                {"name": "num_images", "provider_key": "num_images", "label": "Количество", "type": "number", "default": 1, "min": 1, "max": 4},
                {"name": "safety_tolerance", "provider_key": "safety_tolerance", "label": "Толерантность", "type": "select", "default": "4", "options": ["1", "2", "3", "4", "5", "6"]},
                {"name": "seed", "provider_key": "seed", "label": "Seed", "type": "number"},
            ],
        },
    },
    {
        "code": "flux_schnell",
        "title": "Fast Image",
        "category": "photo",
        "provider": "fal",
        "provider_model_id": "fal-ai/flux/schnell",
        "task_type": "image",
        "input_type": "text",
        "price_credits": 30,
        "is_active": True,
        "sort_order": 15,
        "default_params": {"image_size": "square_hd", "num_images": 1},
        "description": "Быстрая генерация изображений через Flux Schnell",
        "form_schema": {
            "version": 1,
            "submit_label": "Сгенерировать",
            "result_type": "image",
            "fields": [
                {"name": "prompt", "provider_key": "prompt", "label": "Промт", "type": "textarea", "required": True, "placeholder": "Опишите изображение"},
                {"name": "image_size", "provider_key": "image_size", "label": "Размер", "type": "select", "default": "square_hd", "options": ["square_hd", "square", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9"]},
                {"name": "num_images", "provider_key": "num_images", "label": "Количество", "type": "number", "default": 1, "min": 1, "max": 4},
                {"name": "seed", "provider_key": "seed", "label": "Seed", "type": "number"},
            ],
        },
    },
    {
        "code": "seedream",
        "title": "Seedream",
        "category": "photo",
        "provider": "fal",
        "provider_model_id": "fal-ai/bytedance/seedream/v4/text-to-image",
        "task_type": "image",
        "input_type": "text",
        "price_credits": 35,
        "is_active": True,
        "sort_order": 30,
        "default_params": {"num_images": 1},
        "description": "Seedream v4 — фотореалистичная генерация изображений.",
        "form_schema": {
            "version": 1,
            "submit_label": "Сгенерировать",
            "result_type": "image",
            "fields": [
                {"name": "prompt", "provider_key": "prompt", "label": "Промт", "type": "textarea", "required": True, "placeholder": "Опишите изображение"},
                {"name": "image_size", "provider_key": "image_size", "label": "Размер", "type": "select", "default": "square_hd", "options": ["square_hd", "square", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9", "auto", "auto_2K", "auto_4K"]},
                {"name": "num_images", "provider_key": "num_images", "label": "Количество", "type": "number", "default": 1, "min": 1, "max": 4},
                {"name": "enable_safety_checker", "provider_key": "enable_safety_checker", "label": "Проверка безопасности", "type": "switch", "default": True},
                {"name": "enhance_prompt_mode", "provider_key": "enhance_prompt_mode", "label": "Улучшение промта", "type": "select", "default": "standard", "options": ["standard", "fast"]},
                {"name": "seed", "provider_key": "seed", "label": "Seed", "type": "number"},
            ],
        },
    },
    {
        "code": "gpt_image_2",
        "title": "GPT Image 2",
        "category": "photo",
        "provider": "openrouter",
        "provider_model_id": "openai/gpt-image-2",
        "task_type": "image",
        "input_type": "text",
        "price_credits": 40,
        "is_active": True,
        "sort_order": 20,
        "default_params": {},
        "description": "Генерация изображений через GPT Image 2.",
        "form_schema": {
            "version": 1,
            "submit_label": "Сгенерировать",
            "result_type": "image",
            "fields": [
                {"name": "prompt", "provider_key": "prompt", "label": "Промт", "type": "textarea", "required": True, "placeholder": "Опишите изображение"},
                {"name": "image_size", "provider_key": "image_size", "label": "Размер", "type": "select", "default": "square_hd", "options": ["square_hd", "square", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9", "auto"]},
                {"name": "quality", "provider_key": "quality", "label": "Качество", "type": "select", "default": "auto", "options": ["auto", "low", "medium", "high"]},
                {"name": "num_images", "provider_key": "num_images", "label": "Количество", "type": "number", "default": 1, "min": 1, "max": 4},
                {"name": "output_format", "provider_key": "output_format", "label": "Формат", "type": "select", "default": "png", "options": ["png", "jpeg", "webp"]},
            ],
        },
    },
    {
        "code": "grok_image",
        "title": "Grok Imagine",
        "category": "photo",
        "provider": "openrouter",
        "provider_model_id": "xai/grok-imagine-image",
        "task_type": "image",
        "input_type": "text",
        "price_credits": 35,
        "is_active": True,
        "sort_order": 40,
        "default_params": {},
        "description": "Grok Imagine — генерация изображений от xAI.",
        "form_schema": {
            "version": 1,
            "submit_label": "Сгенерировать",
            "result_type": "image",
            "fields": [
                {"name": "prompt", "provider_key": "prompt", "label": "Промт", "type": "textarea", "required": True, "placeholder": "Опишите изображение"},
                {"name": "aspect_ratio", "provider_key": "aspect_ratio", "label": "Соотношение сторон", "type": "select", "default": "1:1", "options": ["2:1", "20:9", "16:9", "4:3", "3:2", "1:1", "2:3", "3:4", "9:16", "1:2"]},
                {"name": "resolution", "provider_key": "resolution", "label": "Разрешение", "type": "select", "default": "1k", "options": ["1k", "2k"]},
                {"name": "output_format", "provider_key": "output_format", "label": "Формат", "type": "select", "default": "jpeg", "options": ["jpeg", "png", "webp"]},
                {"name": "num_images", "provider_key": "num_images", "label": "Количество", "type": "number", "default": 1, "min": 1, "max": 4},
            ],
        },
    },
    {
        "code": "z_image",
        "title": "Z-Image",
        "category": "photo",
        "provider": "fal",
        "provider_model_id": "fal-ai/z-image/turbo",
        "task_type": "image",
        "input_type": "text",
        "price_credits": 25,
        "is_active": True,
        "sort_order": 50,
        "default_params": {"num_images": 1},
        "description": "Z-Image Turbo — быстрая и доступная генерация.",
        "form_schema": {
            "version": 1,
            "submit_label": "Сгенерировать",
            "result_type": "image",
            "fields": [
                {"name": "prompt", "provider_key": "prompt", "label": "Промт", "type": "textarea", "required": True, "placeholder": "Опишите изображение"},
                {"name": "image_size", "provider_key": "image_size", "label": "Размер", "type": "select", "default": "square_hd", "options": ["square_hd", "square", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9"]},
                {"name": "num_inference_steps", "provider_key": "num_inference_steps", "label": "Шаги", "type": "number", "default": 8, "min": 1, "max": 50},
                {"name": "num_images", "provider_key": "num_images", "label": "Количество", "type": "number", "default": 1, "min": 1, "max": 4},
                {"name": "enable_safety_checker", "provider_key": "enable_safety_checker", "label": "Проверка безопасности", "type": "switch", "default": True},
                {"name": "output_format", "provider_key": "output_format", "label": "Формат", "type": "select", "default": "png", "options": ["png", "jpeg", "webp"]},
                {"name": "acceleration", "provider_key": "acceleration", "label": "Ускорение", "type": "select", "default": "regular", "options": ["none", "regular", "high"]},
                {"name": "enable_prompt_expansion", "provider_key": "enable_prompt_expansion", "label": "Расширение промта", "type": "switch", "default": False},
                {"name": "seed", "provider_key": "seed", "label": "Seed", "type": "number"},
            ],
        },
    },
    {
        "code": "ai_chat",
        "title": "Чат с ИИ",
        "category": "text",
        "provider": "openrouter",
        "provider_model_id": "openai/gpt-4o-mini",
        "task_type": "text",
        "input_type": "text",
        "price_credits": 2,
        "is_active": True,
        "sort_order": 10,
        "default_params": {"max_tokens": 800, "temperature": 0.7},
        "description": "Текстовый чат через OpenRouter.",
        "form_schema": {
            "version": 1,
            "submit_label": "Отправить",
            "result_type": "text",
            "fields": [
                {"name": "prompt", "provider_key": "prompt", "label": "Сообщение", "type": "textarea", "required": True, "placeholder": "Введите сообщение"},
                {"name": "temperature", "provider_key": "temperature", "label": "Креативность", "type": "number", "default": 0.7, "min": 0, "max": 2, "step": 0.1},
                {"name": "max_tokens", "provider_key": "max_tokens", "label": "Макс. токенов", "type": "number", "default": 800, "min": 1, "max": 4000},
            ],
        },
    },
    {
        "code": "prompt_helper",
        "title": "Помощник промптов",
        "category": "text",
        "provider": "openrouter",
        "provider_model_id": "openai/gpt-4o-mini",
        "task_type": "text",
        "input_type": "text",
        "price_credits": 2,
        "is_active": True,
        "sort_order": 20,
        "default_params": {"max_tokens": 1000, "temperature": 0.5},
        "description": "Улучшает пользовательские промпты для генеративных моделей.",
        "form_schema": {
            "version": 1,
            "submit_label": "Улучшить",
            "result_type": "text",
            "fields": [
                {"name": "prompt", "provider_key": "prompt", "label": "Промт для улучшения", "type": "textarea", "required": True, "placeholder": "Вставьте промт"},
            ],
        },
    },
    {
        "code": "voice_transcription",
        "title": "Расшифровка голосовых",
        "category": "text",
        "provider": "openrouter",
        "provider_model_id": "placeholder/voice-transcription",
        "task_type": "audio",
        "input_type": "audio",
        "price_credits": 10,
        "is_active": True,
        "sort_order": 30,
        "default_params": {},
        "description": "Audio transcription модель.",
    },
]

FAL_DOCS_BASE = "https://fal.ai/models"

ASPECT_EXTENDED = ["auto", "21:9", "16:9", "3:2", "4:3", "5:4", "1:1", "4:5", "3:4", "2:3", "9:16", "4:1", "1:4", "8:1", "1:8"]
ASPECT_STANDARD = ["auto", "21:9", "16:9", "3:2", "4:3", "5:4", "1:1", "4:5", "3:4", "2:3", "9:16"]
IMAGE_SIZE_BASIC = ["square_hd", "square", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9"]
OUTPUT_FORMATS = ["jpeg", "png", "webp"]
SAFETY_TOLERANCE = ["1", "2", "3", "4", "5", "6"]


def field(name, label, field_type, provider_key=None, **kwargs):
    data = {"name": name, "provider_key": provider_key or name, "label": label, "type": field_type}
    data.update(kwargs)
    return data


def schema(fields, result_type="image", submit_label="Сгенерировать", schema_source=None, price_rules=None, helper_text=None):
    return {
        "version": 1,
        "submit_label": submit_label,
        "result_type": result_type,
        "helper_text": helper_text,
        "schema_source": schema_source or {"status": "custom", "notes": "Internal schema."},
        "price_rules": price_rules,
        "fields": fields,
    }


def source(status, url=None, notes=None, checked_at="2026-06-02"):
    data = {"status": status, "checked_at": checked_at}
    if url:
        data["url"] = url
    if notes:
        data["notes"] = notes
    return data


def fal_schema_source(provider_model_id, notes="Video endpoint schema verified before activation", verified_at="2026-06-03"):
    return {
        "provider": "fal",
        "provider_model_id": provider_model_id,
        "verified_at": verified_at,
        "verified_by": "manual_docs_api",
        "url": f"{FAL_DOCS_BASE}/{provider_model_id}/api",
        "notes": notes,
    }


def set_model(code, **updates):
    for model in AI_MODELS_CATALOG:
        if model["code"] == code:
            model.update(updates)
            return model
    AI_MODELS_CATALOG.append({"code": code, **updates})
    return AI_MODELS_CATALOG[-1]


set_model(
    "nano_banana_2",
    default_params={"output_format": "png", "safety_tolerance": "4"},
    form_schema=schema(
        [
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите, что нужно создать"),
            field("aspect_ratio", "Соотношение сторон", "select", default="1:1", options=["1:1", "4:5", "3:4", "9:16", "16:9"]),
            field("num_images", "Количество", "select", default=1, options=[1, 2, 3, 4], label_key="num_images", advanced=False),
        ],
        schema_source=source("verified", f"{FAL_DOCS_BASE}/fal-ai/nano-banana-2", "Fal Nano Banana 2 input schema."),
        price_rules={"base": 40, "multipliers": [{"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "nano_banana",
    is_active=False,
    form_schema=schema([], schema_source=source("alias", notes="Deprecated alias. /api/models/nano_banana returns nano_banana_2."), price_rules={"base": 40, "min": 1, "round": "ceil"}),
)

set_model(
    "nano_banana_pro",
    default_params={"output_format": "png", "safety_tolerance": "4"},
    form_schema=schema(
        [
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите, что нужно создать"),
            field("aspect_ratio", "Соотношение сторон", "select", default="1:1", options=["1:1", "4:5", "3:4", "9:16", "16:9"]),
            field("resolution", "Качество", "select", default="1K", options=["1K", "2K", "4K"], label_key="quality"),
            field("num_images", "Количество", "select", default=1, options=[1, 2, 3, 4], label_key="num_images", advanced=False),
        ],
        schema_source=source("verified", f"{FAL_DOCS_BASE}/fal-ai/nano-banana-pro", "Fal Nano Banana Pro input schema."),
        price_rules={"base": 80, "multipliers": [{"field": "resolution", "values": {"1K": 1, "2K": 2, "4K": 4}}, {"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "nano_banana_edit",
    default_params={"output_format": "png", "safety_tolerance": "4"},
    form_schema=schema(
        [
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите, что нужно изменить"),
            field("image_urls", "Фото-референсы", "files", required=True, accept="image/*", min_files=1, max_files=4, maps_to="image_urls", label_key="reference_photos", helper_text="Загрузите до 4 изображений для редактирования"),
            field("aspect_ratio", "Соотношение сторон", "select", default="auto", options=["auto", "1:1", "4:5", "3:4", "9:16", "16:9"]),
            field("num_images", "Количество", "select", default=1, options=[1, 2, 3, 4], label_key="num_images", advanced=False),
        ],
        submit_label="Редактировать",
        schema_source=source("verified", f"{FAL_DOCS_BASE}/fal-ai/nano-banana/edit", "Fal Nano Banana Edit input schema."),
        price_rules={"base": 60, "multipliers": [{"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "flux_schnell",
    default_params={"image_size": "square_hd", "num_images": 1, "num_inference_steps": 4, "guidance_scale": 3.5, "enable_safety_checker": True, "output_format": "jpeg", "acceleration": "none", "sync_mode": False},
    form_schema=schema(
        [
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите изображение"),
            field("image_size", "Размер", "select", default="square_hd", options=IMAGE_SIZE_BASIC),
            field("num_images", "Количество", "select", default=1, options=[1, 2, 3, 4], label_key="num_images", advanced=False),
        ],
        schema_source=source("verified", f"{FAL_DOCS_BASE}/fal-ai/flux/schnell", "Fal Flux Schnell input schema. Technical defaults are hidden."),
        price_rules={"base": 30, "multipliers": [{"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "seedream",
    default_params={"num_images": 1, "max_images": 1, "enable_safety_checker": True, "enhance_prompt_mode": "standard", "sync_mode": False},
    form_schema=schema(
        [
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите изображение"),
            field("image_size", "Размер", "select", default="square_hd", options=IMAGE_SIZE_BASIC + ["auto", "auto_2K", "auto_4K"]),
            field("num_images", "Количество", "select", default=1, options=[1, 2, 3, 4], label_key="num_images", advanced=False),
        ],
        schema_source=source("verified", f"{FAL_DOCS_BASE}/fal-ai/bytedance/seedream/v4/text-to-image", "Fal Seedream v4 text-to-image input schema. Technical defaults are hidden."),
        price_rules={"base": 50, "multipliers": [{"field": "image_size", "values": {"auto_2K": 2, "auto_4K": 4}}, {"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "z_image",
    default_params={"num_images": 1, "num_inference_steps": 8, "enable_safety_checker": True, "output_format": "png", "acceleration": "regular", "sync_mode": False},
    form_schema=schema(
        [
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите изображение"),
            field("image_size", "Размер", "select", default="landscape_4_3", options=IMAGE_SIZE_BASIC),
            field("num_images", "Количество", "select", default=1, options=[1, 2, 3, 4], label_key="num_images", advanced=False),
        ],
        schema_source=source("verified", f"{FAL_DOCS_BASE}/fal-ai/z-image/turbo", "Fal Z-Image Turbo input schema. Prompt expansion omitted because pricing changes."),
        price_rules={"base": 25, "multipliers": [{"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "ai_chat",
    default_params={"max_tokens": 800, "temperature": 0.7},
    form_schema=schema(
        [field("prompt", "Сообщение", "textarea", required=True, placeholder="Введите сообщение")],
        submit_label="Отправить",
        result_type="text",
        schema_source=source("custom", notes="OpenRouter chat completion. Technical parameters are defaults."),
        price_rules={"base": 2, "min": 1, "round": "ceil"},
    ),
)

set_model(
    "gpt_image_2",
    title="GPT Image 2",
    category="photo",
    provider="fal",
    provider_model_id="openai/gpt-image-2",
    task_type="image",
    input_type="text",
    price_credits=90,
    is_active=True,
    sort_order=22,
    default_params={"num_images": 1, "quality": "high", "output_format": "png", "sync_mode": False},
    description="GPT Image 2 через Fal — качественная генерация изображений.",
    form_schema=schema(
        [
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите изображение"),
            field("image_size", "Соотношение сторон", "select", default="auto", options=IMAGE_SIZE_BASIC + ["auto"]),
            field("quality", "Качество", "select", default="high", options=["auto", "low", "medium", "high"], advanced=False),
            field("num_images", "Количество", "select", default=1, options=[1, 2, 3, 4], label_key="num_images", advanced=False),
            field("output_format", "Формат файла", "select", default="png", options=["png", "jpeg", "webp"], advanced=True),
        ],
        schema_source=source("verified", f"{FAL_DOCS_BASE}/openai/gpt-image-2/api", "Fal GPT Image 2 input schema."),
        price_rules={"base": 90, "multipliers": [{"field": "quality", "values": {"auto": 1, "low": 0.7, "medium": 1, "high": 1.4}}, {"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"},
    ),
)
set_model(
    "gpt_image_2_edit",
    title="GPT Image 2 Edit",
    category="photo",
    provider="fal",
    provider_model_id="openai/gpt-image-2/edit",
    task_type="image",
    input_type="image",
    price_credits=110,
    is_active=True,
    sort_order=23,
    default_params={"num_images": 1, "quality": "high", "output_format": "png", "sync_mode": False},
    description="GPT Image 2 Edit через Fal — редактирование изображений по промпту.",
    form_schema=schema(
        [
            field("image_urls", "Фото-референсы", "files", required=True, accept="image/*", min_files=1, max_files=4, maps_to="image_urls", label_key="reference_photos", helper_text="Загрузите 1–4 изображения"),
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите, что нужно изменить"),
            field("image_size", "Соотношение сторон", "select", default="auto", options=IMAGE_SIZE_BASIC + ["auto"]),
            field("quality", "Качество", "select", default="high", options=["auto", "low", "medium", "high"], advanced=False),
            field("num_images", "Количество", "select", default=1, options=[1, 2, 3, 4], label_key="num_images", advanced=False),
            field("output_format", "Формат файла", "select", default="png", options=["png", "jpeg", "webp"], advanced=True),
        ],
        submit_label="Редактировать",
        schema_source=source("verified", f"{FAL_DOCS_BASE}/openai/gpt-image-2/edit/api", "Fal GPT Image 2 Edit input schema."),
        price_rules={"base": 110, "multipliers": [{"field": "quality", "values": {"auto": 1, "low": 0.7, "medium": 1, "high": 1.4}}, {"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"},
    ),
)
set_model("grok_image", is_active=False, form_schema=schema(AI_MODELS_CATALOG[[m["code"] for m in AI_MODELS_CATALOG].index("grok_image")].get("form_schema", {}).get("fields", []), schema_source=source("unverified", notes="xAI image schema docs were not reachable during audit; model hidden until provider contract is confirmed."), price_rules={"base": 35, "min": 1, "round": "ceil"}))

VIDEO_ASPECT = ["auto", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16"]
GROK_VIDEO_ASPECT = ["16:9", "4:3", "3:2", "1:1", "2:3", "3:4", "9:16"]
GROK_VIDEO_ASPECT_I2V = ["auto", "16:9", "4:3", "3:2", "1:1", "2:3", "3:4", "9:16"]
SEEDANCE_DURATION = ["auto", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"]
GROK_DURATION = [4, 6]

set_model(
    "seedance_2_t2v",
    title="Seedance 2 Text to Video",
    category="video",
    provider="fal",
    provider_model_id="bytedance/seedance-2.0/text-to-video",
    task_type="video",
    input_type="text",
    price_credits=250,
    is_active=True,
    sort_order=10,
    default_params={"resolution": "720p", "duration": "5", "aspect_ratio": "16:9", "generate_audio": True, "sync_mode": False},
    description="Seedance 2.0 text-to-video через Fal.",
    form_schema=schema(
        [
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите видео"),
            field("aspect_ratio", "Соотношение сторон", "select", default="16:9", options=VIDEO_ASPECT, advanced=False),
            field("duration", "Длительность", "select", default="5", options=SEEDANCE_DURATION, advanced=False),
            field("resolution", "Разрешение", "select", default="720p", options=["480p", "720p", "1080p"], advanced=False),
            field("generate_audio", "Генерировать звук", "switch", default=True, advanced=False),
        ],
        submit_label="Сгенерировать видео",
        result_type="video",
        helper_text="Text-to-video. Для первого теста используйте 480p/720p и короткую длительность.",
        schema_source=fal_schema_source("bytedance/seedance-2.0/text-to-video", "Fal Seedance 2.0 text-to-video input schema."),
        price_rules={"base": 250, "multipliers": [{"field": "resolution", "values": {"480p": 0.8, "720p": 1, "1080p": 2}}, {"field": "duration", "values": {"auto": 1, "4": 1, "5": 1, "6": 1.2, "7": 1.4, "8": 1.6, "9": 1.8, "10": 2, "11": 2.2, "12": 2.4, "13": 2.6, "14": 2.8, "15": 3}}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "seedance_2_i2v_fast",
    title="Seedance 2 Fast Image to Video",
    category="video",
    provider="fal",
    provider_model_id="bytedance/seedance-2.0/fast/image-to-video",
    task_type="video",
    input_type="image",
    price_credits=180,
    is_active=True,
    sort_order=20,
    default_params={"resolution": "720p", "duration": "5", "aspect_ratio": "auto", "generate_audio": True, "sync_mode": False},
    description="Быстрый image-to-video через Seedance 2.0 Fast.",
    form_schema=schema(
        [
            field("image_url", "Стартовое изображение", "file", required=True, accept="image/*", max_size_mb=30, helper_text="JPEG/PNG/WebP до 30MB"),
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите движение и сцену"),
            field("aspect_ratio", "Соотношение сторон", "select", default="auto", options=VIDEO_ASPECT, advanced=False),
            field("duration", "Длительность", "select", default="5", options=SEEDANCE_DURATION, advanced=False),
            field("resolution", "Разрешение", "select", default="720p", options=["480p", "720p"], advanced=False),
            field("generate_audio", "Генерировать звук", "switch", default=True, advanced=False),
            field("end_image_url", "Финальное изображение", "file", required=False, accept="image/*", max_size_mb=30, helper_text="Опционально: финальный кадр", advanced=False),
        ],
        submit_label="Оживить изображение",
        result_type="video",
        helper_text="Быстрый image-to-video. Используйте одно стартовое изображение.",
        schema_source=fal_schema_source("bytedance/seedance-2.0/fast/image-to-video", "Fal Seedance 2.0 Fast image-to-video input schema."),
        price_rules={"base": 180, "multipliers": [{"field": "duration", "values": {"auto": 1, "4": 1, "5": 1, "6": 1.2, "7": 1.4, "8": 1.6, "9": 1.8, "10": 2, "11": 2.2, "12": 2.4, "13": 2.6, "14": 2.8, "15": 3}}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "seedance_2_i2v",
    title="Seedance 2 Image to Video",
    category="video",
    provider="fal",
    provider_model_id="bytedance/seedance-2.0/image-to-video",
    task_type="video",
    input_type="image",
    price_credits=250,
    is_active=True,
    sort_order=30,
    default_params={"resolution": "720p", "duration": "5", "aspect_ratio": "auto", "generate_audio": True, "sync_mode": False},
    description="Image-to-video через Seedance 2.0 с поддержкой 1080p.",
    form_schema=schema(
        [
            field("image_url", "Стартовое изображение", "file", required=True, accept="image/*", max_size_mb=30, helper_text="JPEG/PNG/WebP до 30MB"),
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите движение и сцену"),
            field("aspect_ratio", "Соотношение сторон", "select", default="auto", options=VIDEO_ASPECT, advanced=False),
            field("duration", "Длительность", "select", default="5", options=SEEDANCE_DURATION, advanced=False),
            field("resolution", "Разрешение", "select", default="720p", options=["480p", "720p", "1080p"], advanced=False),
            field("generate_audio", "Генерировать звук", "switch", default=True, advanced=False),
            field("end_image_url", "Финальное изображение", "file", required=False, accept="image/*", max_size_mb=30, helper_text="Опционально: финальный кадр", advanced=False),
        ],
        submit_label="Оживить изображение",
        result_type="video",
        helper_text="Качественный image-to-video. 1080p может быть дороже и дольше.",
        schema_source=fal_schema_source("bytedance/seedance-2.0/image-to-video", "Fal Seedance 2.0 image-to-video input schema."),
        price_rules={"base": 250, "multipliers": [{"field": "resolution", "values": {"480p": 0.8, "720p": 1, "1080p": 2}}, {"field": "duration", "values": {"auto": 1, "4": 1, "5": 1, "6": 1.2, "7": 1.4, "8": 1.6, "9": 1.8, "10": 2, "11": 2.2, "12": 2.4, "13": 2.6, "14": 2.8, "15": 3}}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "kling_21_i2v",
    title="Kling 2.1 Image to Video",
    category="video",
    provider="fal",
    provider_model_id="fal-ai/kling-video/v2.1/standard/image-to-video",
    task_type="video",
    input_type="image",
    price_credits=220,
    is_active=True,
    sort_order=40,
    default_params={"duration": "5", "negative_prompt": "blur, distort, and low quality", "cfg_scale": 0.5, "sync_mode": False},
    description="Kling 2.1 Standard image-to-video через Fal.",
    form_schema=schema(
        [
            field("image_url", "Стартовое изображение", "file", required=True, accept="image/*", max_size_mb=30, helper_text="JPEG/PNG/WebP до 30MB"),
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите движение камеры и объекта"),
            field("duration", "Длительность", "select", default="5", options=["5", "10"], advanced=False),
        ],
        submit_label="Оживить через Kling",
        result_type="video",
        helper_text="Kling image-to-video. Для первого теста используйте 5 секунд.",
        schema_source=fal_schema_source("fal-ai/kling-video/v2.1/standard/image-to-video", "Fal Kling 2.1 Standard image-to-video input schema."),
        price_rules={"base": 220, "multipliers": [{"field": "duration", "values": {"5": 1, "10": 2}}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "veo_31_t2v",
    title="Veo 3.1 Text to Video",
    category="video",
    provider="fal",
    provider_model_id="fal-ai/veo3.1",
    task_type="video",
    input_type="text",
    price_credits=900,
    is_active=True,
    sort_order=80,
    default_params={"aspect_ratio": "16:9", "duration": "8s", "resolution": "720p", "generate_audio": True, "auto_fix": True, "safety_tolerance": "4", "sync_mode": False},
    description="Veo 3.1 text-to-video через Fal. Высокое качество и высокая стоимость.",
    form_schema=schema(
        [
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите видео"),
            field("aspect_ratio", "Соотношение сторон", "select", default="16:9", options=["16:9", "9:16"]),
            field("duration", "Длительность", "select", default="8s", options=["4s", "6s", "8s"]),
            field("resolution", "Разрешение", "select", default="720p", options=["720p", "1080p", "4k"], advanced=True),
            field("generate_audio", "Генерировать звук", "switch", default=True, advanced=True),
            field("auto_fix", "Auto fix", "switch", default=True, advanced=True),
            field("safety_tolerance", "Safety tolerance", "select", default="4", options=SAFETY_TOLERANCE, advanced=True),
            field("negative_prompt", "Negative prompt", "textarea", required=False, advanced=True),
            field("seed", "Seed", "number", required=False, advanced=True),
        ],
        submit_label="Сгенерировать Veo",
        result_type="video",
        helper_text="Высокая стоимость. Для теста используйте 720p и короткую длительность.",
        schema_source=fal_schema_source("fal-ai/veo3.1", "Fal Veo 3.1 text-to-video input schema. Kept inactive because of high provider cost."),
        price_rules={"base": 900, "multipliers": [{"field": "resolution", "values": {"720p": 1, "1080p": 2, "4k": 4}}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "veo_31_i2v",
    title="Veo 3.1 Image to Video",
    category="video",
    provider="fal",
    provider_model_id="fal-ai/veo3.1/image-to-video",
    task_type="video",
    input_type="image",
    price_credits=900,
    is_active=True,
    sort_order=90,
    default_params={"aspect_ratio": "auto", "duration": "8s", "resolution": "720p", "generate_audio": True, "auto_fix": True, "safety_tolerance": "4", "sync_mode": False},
    description="Veo 3.1 image-to-video через Fal. Высокое качество и высокая стоимость.",
    form_schema=schema(
        [
            field("image_url", "Стартовое изображение", "file", required=True, accept="image/*", max_size_mb=8, helper_text="JPEG/PNG/WebP до 8MB"),
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите движение и сцену"),
            field("aspect_ratio", "Соотношение сторон", "select", default="auto", options=["auto", "16:9", "9:16"]),
            field("duration", "Длительность", "select", default="8s", options=["4s", "6s", "8s"]),
            field("resolution", "Разрешение", "select", default="720p", options=["720p", "1080p", "4k"], advanced=True),
            field("generate_audio", "Генерировать звук", "switch", default=True, advanced=True),
            field("auto_fix", "Auto fix", "switch", default=True, advanced=True),
            field("safety_tolerance", "Safety tolerance", "select", default="4", options=SAFETY_TOLERANCE, advanced=True),
            field("negative_prompt", "Negative prompt", "textarea", required=False, advanced=True),
            field("seed", "Seed", "number", required=False, advanced=True),
        ],
        submit_label="Оживить через Veo",
        result_type="video",
        helper_text="Высокая стоимость. Для теста используйте 720p и короткую длительность.",
        schema_source=fal_schema_source("fal-ai/veo3.1/image-to-video", "Fal Veo 3.1 image-to-video input schema. Kept inactive because of high provider cost."),
        price_rules={"base": 900, "multipliers": [{"field": "resolution", "values": {"720p": 1, "1080p": 2, "4k": 4}}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "grok_video_t2v",
    title="Grok Imagine Video Text to Video",
    category="video",
    provider="fal",
    provider_model_id="xai/grok-imagine-video/text-to-video",
    task_type="video",
    input_type="text",
    price_credits=320,
    is_active=True,
    sort_order=50,
    default_params={"duration": 6, "resolution": "720p", "aspect_ratio": "16:9", "sync_mode": False},
    description="Grok Imagine Video — генерация видео по тексту через Fal.",
    form_schema=schema(
        [
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите видео"),
            field("aspect_ratio", "Соотношение сторон", "select", default="16:9", options=GROK_VIDEO_ASPECT, advanced=False),
            field("duration", "Длительность", "select", default=6, options=GROK_DURATION, advanced=False),
            field("resolution", "Разрешение", "select", default="720p", options=["480p", "720p"], advanced=False),
        ],
        submit_label="Сгенерировать Grok Video",
        result_type="video",
        helper_text="Grok text-to-video. Для первого теста используйте 480p/720p.",
        schema_source=fal_schema_source("xai/grok-imagine-video/text-to-video", "Fal Grok Imagine Video text-to-video input schema.", verified_at="2026-06-16"),
        price_rules={"base": 320, "multipliers": [{"field": "resolution", "values": {"480p": 0.8, "720p": 1}}, {"field": "duration", "values": {"4": 0.8, "6": 1, 4: 0.8, 6: 1}}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "grok_video_i2v",
    title="Grok Imagine Video Image to Video",
    category="video",
    provider="fal",
    provider_model_id="xai/grok-imagine-video/image-to-video",
    task_type="video",
    input_type="image",
    price_credits=340,
    is_active=True,
    sort_order=55,
    default_params={"duration": 6, "resolution": "720p", "aspect_ratio": "auto", "sync_mode": False},
    description="Grok Imagine Video — оживление изображения через Fal.",
    form_schema=schema(
        [
            field("image_url", "Стартовое изображение", "file", required=True, accept="image/*", max_size_mb=30, helper_text="JPEG/PNG/WebP до 30MB"),
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите движение и сцену"),
            field("aspect_ratio", "Соотношение сторон", "select", default="auto", options=GROK_VIDEO_ASPECT_I2V, advanced=False),
            field("duration", "Длительность", "select", default=6, options=GROK_DURATION, advanced=False),
            field("resolution", "Разрешение", "select", default="720p", options=["480p", "720p"], advanced=False),
        ],
        submit_label="Оживить через Grok",
        result_type="video",
        helper_text="Grok image-to-video. Для первого теста используйте 480p/720p.",
        schema_source=fal_schema_source("xai/grok-imagine-video/image-to-video", "Fal Grok Imagine Video image-to-video input schema.", verified_at="2026-06-16"),
        price_rules={"base": 340, "multipliers": [{"field": "resolution", "values": {"480p": 0.8, "720p": 1}}, {"field": "duration", "values": {"4": 0.8, "6": 1, 4: 0.8, 6: 1}}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "happy_horse_i2v",
    title="Happy Horse 1.0 Image to Video",
    category="video",
    provider="fal",
    provider_model_id="alibaba/happy-horse/image-to-video",
    task_type="video",
    input_type="image",
    price_credits=200,
    is_active=True,
    sort_order=45,
    default_params={"duration": "5", "aspect_ratio": "auto", "sync_mode": False},
    description="Alibaba Happy Horse 1.0 image-to-video через Fal. 1080p, синхронизированный звук, мультиязычный lip-sync.",
    form_schema=schema(
        [
            field("image_url", "Стартовое изображение", "file", required=True, accept="image/*", max_size_mb=30, helper_text="JPEG/PNG/WebP до 30MB"),
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите движение и сцену"),
            field("aspect_ratio", "Соотношение сторон", "select", default="auto", options=VIDEO_ASPECT, advanced=False),
            field("duration", "Длительность", "select", default="5", options=SEEDANCE_DURATION, advanced=False),
            field("resolution", "Разрешение", "select", default="720p", options=["480p", "720p", "1080p"], advanced=False),
            field("generate_audio", "Генерировать звук", "switch", default=True, advanced=False),
        ],
        submit_label="Оживить через Happy Horse",
        result_type="video",
        helper_text="Alibaba Happy Horse. 1080p с нативным звуком и lip-sync.",
        schema_source=fal_schema_source("alibaba/happy-horse/image-to-video", "Fal Happy Horse 1.0 image-to-video input schema."),
        price_rules={"base": 200, "multipliers": [{"field": "resolution", "values": {"480p": 0.8, "720p": 1, "1080p": 2}}, {"field": "duration", "values": {"auto": 1, "4": 1, "5": 1, "6": 1.2, "7": 1.4, "8": 1.6, "9": 1.8, "10": 2, "11": 2.2, "12": 2.4, "13": 2.6, "14": 2.8, "15": 3}}], "min": 1, "round": "ceil"},
    ),
)

for _model in AI_MODELS_CATALOG:
    if _model["provider_model_id"].startswith("placeholder/"):
        _model["is_active"] = False
    _schema = _model.get("form_schema")
    if _schema:
        _schema.setdefault("schema_source", source("custom", notes="Internal schema; provider docs not yet verified."))
        _schema.setdefault("price_rules", {"base": _model["price_credits"], "min": 1, "round": "ceil"})
        for _field in _schema.get("fields", []):
            if _field.get("name") in {"seed", "safety_tolerance", "system_prompt", "output_format", "num_images", "num_inference_steps", "enable_safety_checker", "enable_prompt_expansion", "acceleration", "guidance_scale", "max_tokens", "temperature", "duration", "max_images", "limit_generations", "enable_web_search", "thinking_level"}:
                _field.setdefault("advanced", True)
