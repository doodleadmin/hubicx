import asyncio
import argparse
import os

from sqlalchemy import select

from backend.seed_models import AI_MODELS_CATALOG
from backend.app.db.models import AIModel, Template
from backend.app.db.session import async_session

TEMPLATES = [
    ("enhance_4k", "Улучшить до 4K", "Повышение качества изображения", ["image"], 35),
    ("photo_to_prompt", "Промпт по фото", "Создать подробный промпт по изображению", ["image"], 10),
    ("chat_to_song", "Чат в песню", "Превратить переписку или текст в песню", ["prompt"], 50),
    ("add_beer", "Добавить пиво", "Аккуратно добавить пиво на фото", ["image", "prompt"], 30),
    ("photo_gx", "Фото на GX", "Стилизованная обработка фото", ["image"], 30),
    ("light_aura", "Ореол света", "Добавить кинематографичный световой ореол", ["image"], 30),
    ("broadcast", "Трансляция", "Сцена как в прямом эфире", ["image", "prompt"], 40),
    ("formula_1", "Formula 1", "Сделать образ в стиле Formula 1", ["image"], 40),
    ("doll_unboxing", "Распаковка куклы", "Создать видео/фото распаковки куклы", ["image"], 60),
    ("ai_avatar", "ИИ Аватар", "Создать говорящий ИИ-аватар", ["image", "audio"], 70),
    ("graduation", "Выпускной", "Праздничный выпускной стиль", ["image"], 35),
]


def is_placeholder_model_id(provider_model_id: str | None) -> bool:
    return not provider_model_id or provider_model_id.startswith("placeholder/")


def seed_force_enabled(cli_force: bool) -> bool:
    env_value = os.getenv("SEED_FORCE", "").lower()
    return cli_force or env_value in {"1", "true", "yes", "on"}


async def upsert_model(session, data: dict, force: bool = False) -> None:
    model = await session.scalar(select(AIModel).where(AIModel.code == data["code"]))
    defaults = {"description": f"Модель {data['title']}", "is_active": True, "webapp_route": "/generate", "default_params": {}}
    values = {**defaults, **data}
    if model:
        if not force and not is_placeholder_model_id(model.provider_model_id):
            values["provider_model_id"] = model.provider_model_id
        for key, value in values.items():
            setattr(model, key, value)
    else:
        session.add(AIModel(**values))


async def upsert_template(session, code: str, title: str, description: str, inputs: list[str], price: int, sort_order: int) -> None:
    template = await session.scalar(select(Template).where(Template.code == code))
    values = {
        "title": title,
        "description": description,
        "template_type": "template",
        "system_prompt": f"Выполни шаблон: {title}. Следуй пользовательскому описанию и сохраняй качество результата.",
        "required_inputs": {"fields": inputs},
        "default_params": {"quality": "standard"},
        "price_credits": price,
        "is_active": True,
        "sort_order": sort_order,
    }
    if template:
        for key, value in values.items():
            setattr(template, key, value)
    else:
        session.add(Template(code=code, **values))


async def main(force: bool = False) -> None:
    async with async_session() as session:
        for data in AI_MODELS_CATALOG:
            await upsert_model(session, data, force=force)
        for index, item in enumerate(TEMPLATES, start=1):
            await upsert_template(session, *item, sort_order=index * 10)
        await session.commit()
    mode = "force" if force else "safe"
    print(f"Seed completed ({mode})")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Overwrite provider_model_id and all model fields from catalog")
    args = parser.parse_args()
    asyncio.run(main(force=seed_force_enabled(args.force)))
