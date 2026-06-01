# Telegram AI Aggregator MVP

MVP Telegram AI-агрегатора по типу Syntx AI / Yes AI: Telegram Bot служит меню и навигацией, а сложные генерации запускаются в Telegram WebApp через backend, очередь worker и провайдеры OpenRouter/Fal.ai.

## Архитектура

- `bot/` - aiogram 3.x бот: `/start`, выбор языка, меню, баланс, история, админ-команды и WebApp-кнопки.
- `backend/` - FastAPI API, SQLAlchemy async, Alembic, сервисы пользователей, баланса, Telegram WebApp auth, payments mock.
- `worker/` - Celery worker для генераций, refund при ошибке, уведомления пользователю в Telegram.
- `webapp/` - Next.js Telegram Mini App: формы генерации, шаблоны, баланс, история.
- `postgres` - хранит пользователей, модели, шаблоны, задачи, транзакции, платежи, referral, внутри Compose доступен как `postgres:5432`.
- `redis` - брокер Celery, внутри Compose доступен как `redis:6379`.

## Быстрый Запуск

1. Скопируйте env: `cp .env.example .env`.
2. Заполните минимум `BOT_TOKEN`, `BOT_USERNAME`, `ADMIN_IDS`, `WEBAPP_URL`, `BACKEND_URL`.
3. Запустите инфраструктуру: `docker compose up -d postgres redis`.
4. Примените миграции: `docker compose run --rm backend alembic -c backend/alembic.ini upgrade head`.
5. Заполните модели и шаблоны: `docker compose run --rm backend python -m backend.seed`.
6. Запустите сервисы: `docker compose up backend bot worker webapp`.

## Env Переменные

- `BOT_TOKEN` - токен Telegram BotFather, обязателен для бота и проверки initData.
- `BOT_USERNAME` - username бота без `@`, нужен для referral link.
- `ADMIN_IDS` - Telegram ID админов через запятую.
- `DEBUG` - `true` включает `/api/debug/models` и `/api/debug/me` для локальной приёмки.
- `WEBAPP_URL` - публичный URL Mini App.
- `BACKEND_URL` - публичный URL API.
- `DATABASE_URL` - async SQLAlchemy URL PostgreSQL.
- `REDIS_URL` - Redis broker/backend для Celery.
- `OPENROUTER_API_KEY` - ключ OpenRouter. Если пустой, сервис стартует, но генерация вернёт понятную ошибку.
- `FAL_KEY` - ключ Fal.ai. Если пустой, сервис стартует, но генерация вернёт понятную ошибку.
- `S3_*` - зарезервировано под Cloudflare R2/S3, в MVP используется storage-заглушка.

## Миграции И Seed

- Миграции лежат в `backend/alembic/versions`.
- Каталог моделей лежит в `backend/seed_models.py`.
- Seed лежит в `backend/seed.py` и делает upsert моделей по `code`.
- Обычный seed создаёт отсутствующие модели и обновляет безопасные поля, но не затирает реальный `provider_model_id`, если он уже не начинается с `placeholder/`.
- Force seed полностью перезаписывает модели из каталога: `python -m backend.seed --force` или `SEED_FORCE=true python -m backend.seed`.
- Модели и цены не захардкожены в handlers: бот читает активные модели/шаблоны из БД.
- Если `provider_model_id` начинается с `placeholder/`, worker не отправляет запрос провайдеру и возвращает `Model provider ID is not configured` с refund.

## Добавить Новую Модель

1. Добавьте запись в `AI_MODELS_CATALOG` в `backend/seed_models.py` или создайте запись в таблице `ai_models`.
2. Укажите `code`, `title`, `category`, `provider`, `provider_model_id`, `task_type`, `input_type`, `price_credits`, `is_active`, `sort_order`, `default_params`, `description`.
3. Выполните seed повторно: `python -m backend.seed`.
4. Для реальной генерации замените `provider_model_id` на ID провайдера.

## Как Подключить Реальную Модель

Каталог хранит безопасные placeholder id, чтобы production seed не запускал случайные внешние вызовы. Реальный provider id лучше менять в БД через админку или SQL:

```sql
update ai_models
set provider_model_id = 'fal-ai/flux/schnell'
where code = 'nano_banana';
```

После этого обычный seed не перетрёт значение, потому что оно больше не начинается с `placeholder/`:

```bash
python -m backend.seed
```

Если нужно вернуть все модели строго к каталогу, используйте force seed:

```bash
python -m backend.seed --force
```

Проверить текущие provider ids можно через SQL:

```sql
select code, provider, provider_model_id, provider_model_id like 'placeholder/%' as is_placeholder
from ai_models
order by category, sort_order;
```

При `DEBUG=true` также доступен endpoint:

```bash
curl http://localhost:8000/api/debug/models
```

## Добавить Новый Шаблон

1. Добавьте запись в `TEMPLATES` в `backend/seed.py` или в таблицу `templates`.
2. Укажите `required_inputs`, `default_params`, `system_prompt`, `price_credits`.
3. WebApp построит форму по `required_inputs`.

## Логика Баланса

- Перед созданием генерации проверяется баланс.
- После создания `generation_task` баланс атомарно списывается через `charge_for_generation`.
- Создаётся transaction `generation_charge` с отрицательной суммой.
- Если worker получает ошибку провайдера, вызывается `refund_generation`.
- Создаётся transaction `refund`, задача получает статус `refunded`, баланс не уходит в минус.

## Telegram WebApp Auth

- Frontend отправляет `Authorization: tma {initData}`.
- Backend проверяет подпись initData через `BOT_TOKEN` в `services/telegram_auth.py`.
- Backend не доверяет `user_id` с frontend и сам находит или создаёт пользователя.

## Провайдеры

- `providers/base.py` задаёт единый интерфейс `generate_text`, `generate_image`, `generate_video`, `get_status`.
- `providers/openrouter.py` реализует текст через Chat Completions.
- `providers/fal.py` реализует queue-совместимую отправку image/video.
- Добавление Replicate/RunPod/ComfyUI/OpenAI/Google делается новым классом provider и маршрутизацией в worker.

## Admin В Telegram

- `/admin` - статистика.
- `/add_balance <telegram_id> <amount>` - ручное пополнение.
- `/user <telegram_id>` - информация о пользователе.
- `/tasks` - последние задачи.
- `/errors` - последние ошибки.

## Payments MVP

- `POST /api/payments/create` создаёт mock payment.
- Ручное пополнение делается через `/add_balance`.
- Таблицы и webhook endpoint подготовлены для Telegram Stars, CryptoBot или ЮKassa.

## Где Менять provider_model_id

- Для каталога по умолчанию: `backend/seed_models.py`, затем выполнить `python -m backend.seed`.
- Для production-значений: менять запись в таблице `ai_models` через админку или SQL, чтобы обычный seed не затирал реальный `provider_model_id`.
