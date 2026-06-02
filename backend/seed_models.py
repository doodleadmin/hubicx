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
    {
        "code": "seedance",
        "title": "Seedance",
        "category": "video",
        "provider": "fal",
        "provider_model_id": "placeholder/seedance",
        "task_type": "video",
        "input_type": "text_image",
        "price_credits": 80,
        "is_active": True,
        "sort_order": 10,
        "default_params": {},
        "description": "Video модель для text/image-to-video.",
        "form_schema": {
            "version": 1,
            "submit_label": "Сгенерировать",
            "result_type": "video",
            "fields": [
                {"name": "prompt", "provider_key": "prompt", "label": "Промт", "type": "textarea", "required": True, "placeholder": "Опишите видео"},
                {"name": "image_url", "provider_key": "image_url", "label": "Исходное изображение", "type": "file", "accept": "image/*", "helper_text": "Опционально"},
                {"name": "duration", "provider_key": "duration", "label": "Длительность (сек)", "type": "number", "default": 5, "min": 2, "max": 10},
            ],
        },
    },
    {
        "code": "veo",
        "title": "VEO",
        "category": "video",
        "provider": "fal",
        "provider_model_id": "placeholder/veo",
        "task_type": "video",
        "input_type": "text_image",
        "price_credits": 120,
        "is_active": True,
        "sort_order": 20,
        "default_params": {},
        "description": "Премиальная video модель.",
        "form_schema": {
            "version": 1,
            "submit_label": "Сгенерировать",
            "result_type": "video",
            "fields": [
                {"name": "prompt", "provider_key": "prompt", "label": "Промт", "type": "textarea", "required": True, "placeholder": "Опишите видео"},
                {"name": "image_url", "provider_key": "image_url", "label": "Исходное изображение", "type": "file", "accept": "image/*"},
                {"name": "duration", "provider_key": "duration", "label": "Длительность (сек)", "type": "number", "default": 5, "min": 2, "max": 10},
            ],
        },
    },
    {
        "code": "kling",
        "title": "Kling",
        "category": "video",
        "provider": "fal",
        "provider_model_id": "placeholder/kling",
        "task_type": "video",
        "input_type": "text_image",
        "price_credits": 90,
        "is_active": True,
        "sort_order": 30,
        "default_params": {},
        "description": "Video модель Kling.",
        "form_schema": {
            "version": 1,
            "submit_label": "Сгенерировать",
            "result_type": "video",
            "fields": [
                {"name": "prompt", "provider_key": "prompt", "label": "Промт", "type": "textarea", "required": True, "placeholder": "Опишите видео"},
                {"name": "image_url", "provider_key": "image_url", "label": "Исходное изображение", "type": "file", "accept": "image/*"},
                {"name": "duration", "provider_key": "duration", "label": "Длительность (сек)", "type": "number", "default": 5, "min": 2, "max": 10},
            ],
        },
    },
    {
        "code": "grok_video",
        "title": "Grok Video",
        "category": "video",
        "provider": "fal",
        "provider_model_id": "placeholder/grok-video",
        "task_type": "video",
        "input_type": "text",
        "price_credits": 100,
        "is_active": True,
        "sort_order": 40,
        "default_params": {},
        "description": "Video модель Grok.",
        "form_schema": {
            "version": 1,
            "submit_label": "Сгенерировать",
            "result_type": "video",
            "fields": [
                {"name": "prompt", "provider_key": "prompt", "label": "Промт", "type": "textarea", "required": True, "placeholder": "Опишите видео"},
                {"name": "duration", "provider_key": "duration", "label": "Длительность (сек)", "type": "number", "default": 5, "min": 2, "max": 10},
            ],
        },
    },
    {
        "code": "happyhorse",
        "title": "HappyHorse 1.0",
        "category": "video",
        "provider": "fal",
        "provider_model_id": "placeholder/happyhorse",
        "task_type": "video",
        "input_type": "text_image",
        "price_credits": 70,
        "is_active": True,
        "sort_order": 50,
        "default_params": {},
        "description": "Экспериментальная video модель.",
        "form_schema": {
            "version": 1,
            "submit_label": "Сгенерировать",
            "result_type": "video",
            "fields": [
                {"name": "prompt", "provider_key": "prompt", "label": "Промт", "type": "textarea", "required": True, "placeholder": "Опишите видео"},
                {"name": "image_url", "provider_key": "image_url", "label": "Исходное изображение", "type": "file", "accept": "image/*"},
                {"name": "duration", "provider_key": "duration", "label": "Длительность (сек)", "type": "number", "default": 5, "min": 2, "max": 10},
            ],
        },
    },
    {
        "code": "gemini_omni",
        "title": "Gemini Omni",
        "category": "video",
        "provider": "fal",
        "provider_model_id": "placeholder/gemini-omni",
        "task_type": "video",
        "input_type": "text_image",
        "price_credits": 100,
        "is_active": True,
        "sort_order": 60,
        "default_params": {},
        "description": "Мультимодальная video модель.",
        "form_schema": {
            "version": 1,
            "submit_label": "Сгенерировать",
            "result_type": "video",
            "fields": [
                {"name": "prompt", "provider_key": "prompt", "label": "Промт", "type": "textarea", "required": True, "placeholder": "Опишите видео"},
                {"name": "image_url", "provider_key": "image_url", "label": "Исходное изображение", "type": "file", "accept": "image/*"},
                {"name": "duration", "provider_key": "duration", "label": "Длительность (сек)", "type": "number", "default": 5, "min": 2, "max": 10},
            ],
        },
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


def schema(fields, result_type="image", submit_label="Сгенерировать", schema_source=None, price_rules=None):
    return {
        "version": 1,
        "submit_label": submit_label,
        "result_type": result_type,
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


def set_model(code, **updates):
    for model in AI_MODELS_CATALOG:
        if model["code"] == code:
            model.update(updates)
            return model
    AI_MODELS_CATALOG.append({"code": code, **updates})
    return AI_MODELS_CATALOG[-1]


set_model(
    "nano_banana_2",
    default_params={"num_images": 1},
    form_schema=schema(
        [
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите, что нужно сгенерировать"),
            field("aspect_ratio", "Соотношение сторон", "select", default="auto", options=ASPECT_EXTENDED),
            field("output_format", "Формат", "select", default="png", options=OUTPUT_FORMATS, advanced=True),
            field("num_images", "Количество", "number", default=1, min=1, max=4, advanced=True),
            field("safety_tolerance", "Safety tolerance", "select", default="4", options=SAFETY_TOLERANCE, advanced=True),
            field("resolution", "Разрешение", "select", default="1K", options=["0.5K", "1K", "2K", "4K"], advanced=True),
            field("limit_generations", "Ограничить генерации", "switch", default=True, advanced=True),
            field("enable_web_search", "Веб-поиск", "switch", default=False, advanced=True),
            field("thinking_level", "Thinking level", "select", default="minimal", options=["minimal", "high"], advanced=True),
            field("system_prompt", "Системный промт", "textarea", required=False, placeholder="Опциональная системная инструкция", advanced=True),
            field("seed", "Seed", "number", required=False, helper_text="Для воспроизводимости", advanced=True),
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
    default_params={"num_images": 1},
    form_schema=schema(
        [
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите, что нужно сгенерировать"),
            field("aspect_ratio", "Соотношение сторон", "select", default="1:1", options=ASPECT_STANDARD),
            field("resolution", "Разрешение", "select", default="1K", options=["1K", "2K", "4K"]),
            field("output_format", "Формат", "select", default="png", options=OUTPUT_FORMATS, advanced=True),
            field("num_images", "Количество", "number", default=1, min=1, max=4, advanced=True),
            field("safety_tolerance", "Safety tolerance", "select", default="4", options=SAFETY_TOLERANCE, advanced=True),
            field("limit_generations", "Ограничить генерации", "switch", default=True, advanced=True),
            field("enable_web_search", "Веб-поиск", "switch", default=False, advanced=True),
            field("system_prompt", "Системный промт", "textarea", required=False, advanced=True),
            field("seed", "Seed", "number", required=False, advanced=True),
        ],
        schema_source=source("verified", f"{FAL_DOCS_BASE}/fal-ai/nano-banana-pro", "Fal Nano Banana Pro input schema."),
        price_rules={"base": 80, "multipliers": [{"field": "resolution", "values": {"1K": 1, "2K": 2, "4K": 4}}, {"field": "num_images", "mode": "multiply_by_value"}], "additions": [{"field": "enable_web_search", "values": {"true": 20}}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "nano_banana_edit",
    default_params={"num_images": 1},
    form_schema=schema(
        [
            field("image_urls", "Изображения", "files", required=True, accept="image/*", max_files=4, helper_text="Загрузите до 4 изображений для редактирования"),
            field("prompt", "Промт", "textarea", required=True, placeholder="Например: change background to a futuristic city"),
            field("aspect_ratio", "Соотношение сторон", "select", default="auto", options=ASPECT_STANDARD),
            field("output_format", "Формат", "select", default="png", options=OUTPUT_FORMATS, advanced=True),
            field("num_images", "Количество", "number", default=1, min=1, max=4, advanced=True),
            field("safety_tolerance", "Safety tolerance", "select", default="4", options=SAFETY_TOLERANCE, advanced=True),
            field("limit_generations", "Ограничить генерации", "switch", default=True, advanced=True),
            field("seed", "Seed", "number", required=False, advanced=True),
        ],
        submit_label="Редактировать",
        schema_source=source("verified", f"{FAL_DOCS_BASE}/fal-ai/nano-banana/edit", "Fal Nano Banana Edit input schema."),
        price_rules={"base": 60, "multipliers": [{"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "flux_schnell",
    default_params={"image_size": "square_hd", "num_images": 1, "sync_mode": False},
    form_schema=schema(
        [
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите изображение"),
            field("image_size", "Размер", "select", default="square_hd", options=IMAGE_SIZE_BASIC),
            field("num_images", "Количество", "number", default=1, min=1, max=4, advanced=True),
            field("output_format", "Формат", "select", default="jpeg", options=["jpeg", "png"], advanced=True),
            field("num_inference_steps", "Шаги", "number", default=4, min=1, max=12, advanced=True),
            field("guidance_scale", "Guidance scale", "number", default=3.5, min=0, max=20, step=0.1, advanced=True),
            field("enable_safety_checker", "Проверка безопасности", "switch", default=True, advanced=True),
            field("acceleration", "Ускорение", "select", default="none", options=["none", "regular", "high"], advanced=True),
            field("seed", "Seed", "number", required=False, advanced=True),
        ],
        schema_source=source("verified", f"{FAL_DOCS_BASE}/fal-ai/flux/schnell", "Fal Flux Schnell input schema. sync_mode intentionally omitted/false."),
        price_rules={"base": 30, "multipliers": [{"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "seedream",
    default_params={"num_images": 1, "max_images": 1, "sync_mode": False},
    form_schema=schema(
        [
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите изображение"),
            field("image_size", "Размер", "select", default="square_hd", options=IMAGE_SIZE_BASIC + ["auto", "auto_2K", "auto_4K"]),
            field("num_images", "Количество", "number", default=1, min=1, max=4, advanced=True),
            field("max_images", "Максимум изображений", "number", default=1, min=1, max=4, advanced=True),
            field("enable_safety_checker", "Проверка безопасности", "switch", default=True, advanced=True),
            field("enhance_prompt_mode", "Улучшение промта", "select", default="standard", options=["standard", "fast"], advanced=True),
            field("seed", "Seed", "number", required=False, advanced=True),
        ],
        schema_source=source("verified", f"{FAL_DOCS_BASE}/fal-ai/bytedance/seedream/v4/text-to-image", "Fal Seedream v4 text-to-image input schema."),
        price_rules={"base": 50, "multipliers": [{"field": "image_size", "values": {"auto_2K": 2, "auto_4K": 4}}, {"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"},
    ),
)

set_model(
    "z_image",
    default_params={"num_images": 1, "sync_mode": False},
    form_schema=schema(
        [
            field("prompt", "Промт", "textarea", required=True, placeholder="Опишите изображение"),
            field("image_size", "Размер", "select", default="landscape_4_3", options=IMAGE_SIZE_BASIC),
            field("num_inference_steps", "Шаги", "number", default=8, min=1, max=50, advanced=True),
            field("num_images", "Количество", "number", default=1, min=1, max=4, advanced=True),
            field("enable_safety_checker", "Проверка безопасности", "switch", default=True, advanced=True),
            field("output_format", "Формат", "select", default="png", options=OUTPUT_FORMATS, advanced=True),
            field("acceleration", "Ускорение", "select", default="regular", options=["none", "regular", "high"], advanced=True),
            field("enable_prompt_expansion", "Расширение промта", "switch", default=False, helper_text="Может увеличить стоимость у провайдера; цена в боте пока фиксированная", advanced=True),
            field("seed", "Seed", "number", required=False, advanced=True),
        ],
        schema_source=source("verified", f"{FAL_DOCS_BASE}/fal-ai/z-image/turbo", "Fal Z-Image Turbo input schema. sync_mode intentionally omitted/false."),
        price_rules={"base": 25, "multipliers": [{"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"},
    ),
)

set_model("gpt_image_2", is_active=False, form_schema=schema(AI_MODELS_CATALOG[[m["code"] for m in AI_MODELS_CATALOG].index("gpt_image_2")].get("form_schema", {}).get("fields", []), schema_source=source("unavailable", notes="OpenRouter reported model openai/gpt-image-2 is not available during audit."), price_rules={"base": 40, "min": 1, "round": "ceil"}))
set_model("grok_image", is_active=False, form_schema=schema(AI_MODELS_CATALOG[[m["code"] for m in AI_MODELS_CATALOG].index("grok_image")].get("form_schema", {}).get("fields", []), schema_source=source("unverified", notes="xAI image schema docs were not reachable during audit; model hidden until provider contract is confirmed."), price_rules={"base": 35, "min": 1, "round": "ceil"}))

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
