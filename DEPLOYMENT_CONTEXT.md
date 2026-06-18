# Deployment Context

Нужно реализовать video generation в production ai_aggregator. Оплаты пока не трогаем, платежи будут в самом конце.

Контекст проекта:
- Production host: root@62.113.109.73
- Path: /opt/ai_aggregator
- API: https://api.hubicx.ru
- WebApp: https://app.hubicx.ru
- Bot: @Hubicx_bot

Уже работает:
- Telegram WebApp initData auth
- schema-driven forms через ai_models.form_schema
- backend validation и whitelist provider_input
- dynamic pricing
- Fal image generation
- OpenRouter text generation
- file upload в Beget S3
- output files сохраняются в Beget S3
- history
- send-to-chat через Telegram sendDocument
- video empty state сейчас показывает “Видео-модели скоро появятся”

Цель:
Добавить полноценные video-модели:
1. Text-to-video
2. Image-to-video
3. Позже reference-to-video / pro video

Оплату не трогать.
Пополнение баланса пока только вручную/админом.

ВАЖНО:
- Не трогать платежи.
- Не ломать image/text flows.
- Не трогать Telegram auth/menu flow.
- Не запускать seed --force.
- Все модели добавлять через safe seed/upsert.
- Секреты не выводить.
- Все video provider payloads должны идти через form_schema validation.
- Нельзя прокидывать произвольный frontend payload напрямую в Fal.
- Video output нужно сохранять в Beget S3 так же, как image output.
- Send-to-chat должен отправлять видео как document/file, не как compressed video.

==================================================
1. ИЗУЧИТЬ И ПОДТВЕРДИТЬ VIDEO ENDPOINTS
==================================================

Нужно проверить реальные Fal docs/API schemas перед финальным seed.

Минимально добавить и проверить:

A. Seedance 2.0 Text to Video
provider_model_id:
bytedance/seedance-2.0/text-to-video

B. Seedance 2.0 Image to Video Fast
provider_model_id:
bytedance/seedance-2.0/fast/image-to-video

C. Seedance 2.0 Image to Video
provider_model_id:
bytedance/seedance-2.0/image-to-video

D. Kling 2.1 Standard Image to Video
provider_model_id:
fal-ai/kling-video/v2.1/standard/image-to-video

E. Veo 3.1 Text to Video — добавить как inactive/pro, пока не тестировать без осознанного баланса
provider_model_id:
fal-ai/veo3.1

F. Veo 3.1 Image to Video — добавить как inactive/pro, пока не тестировать без осознанного баланса
provider_model_id:
fal-ai/veo3.1/image-to-video

Если какой-то endpoint отличается в реальной документации Fal — использовать фактический provider_model_id из документации, а не этот список.

В отчёте указать подтверждённые endpoint IDs и какие модели активированы.

==================================================
2. ДОБАВИТЬ VIDEO MODELS В REGISTRY
==================================================

Обновить backend/seed_models.py.

Добавить активные модели:

1. seedance_2_t2v
title: Seedance 2 Text to Video
category: video
provider: fal
provider_model_id: bytedance/seedance-2.0/text-to-video
task_type: video
input_type: text
price_credits: например 250
is_active: true

2. seedance_2_i2v_fast
title: Seedance 2 Fast Image to Video
category: video
provider: fal
provider_model_id: bytedance/seedance-2.0/fast/image-to-video
task_type: video
input_type: image
price_credits: например 180
is_active: true

3. seedance_2_i2v
title: Seedance 2 Image to Video
category: video
provider: fal
provider_model_id: bytedance/seedance-2.0/image-to-video
task_type: video
input_type: image
price_credits: например 250
is_active: true

4. kling_21_i2v
title: Kling 2.1 Image to Video
category: video
provider: fal
provider_model_id: fal-ai/kling-video/v2.1/standard/image-to-video
task_type: video
input_type: image
price_credits: например 220
is_active: true

Добавить inactive/pro модели:

5. veo_31_t2v
title: Veo 3.1 Text to Video
category: video
provider: fal
provider_model_id: fal-ai/veo3.1
task_type: video
input_type: text
price_credits: например 800+
is_active: false или hidden_until_ready

6. veo_31_i2v
title: Veo 3.1 Image to Video
category: video
provider: fal
provider_model_id: fal-ai/veo3.1/image-to-video
task_type: video
input_type: image
price_credits: например 800+
is_active: false или hidden_until_ready

Важное:
- Если balance у пользователя маленький, active video models всё равно могут открываться, но generation должна показывать insufficient balance.
- Не активировать непроверенные placeholder модели.

==================================================
3. FORM_SCHEMA ДЛЯ VIDEO
==================================================

Для всех video моделей form_schema должен содержать:
- version
- result_type: video
- submit_label
- schema_source
- fields
- price_rules

Пример schema_source:
{
  "provider": "fal",
  "provider_model_id": "...",
  "verified_at": "2026-06-03",
  "verified_by": "manual_docs_api",
  "notes": "Video endpoint schema verified before activation"
}

==================================================
4. SEEDANCE 2 TEXT TO VIDEO FORM_SCHEMA
==================================================

code: seedance_2_t2v

Базовые поля:
- prompt
  type: textarea
  provider_key: prompt
  required: true
  label: Промт
  placeholder: Опишите сцену, движение камеры, стиль и атмосферу

- aspect_ratio
  type: select
  provider_key: aspect_ratio
  required: false
  default: 16:9
  options:
    16:9
    9:16
    1:1
  Если docs дают другие значения — заменить на реальные.

- duration
  type: select или number
  provider_key: duration
  default: 5
  options:
    5
    10
  Если docs дают другие значения — заменить на реальные.

- resolution
  type: select
  provider_key: resolution
  default: 720p
  options:
    720p
    1080p
  Если docs дают другие значения — заменить на реальные.

Advanced:
- seed number optional
- negative_prompt textarea optional, только если endpoint поддерживает
- enable_audio switch default true/false, только если endpoint поддерживает

price_rules:
base: 250
multipliers:
- duration:
  5: 1
  10: 2
- resolution:
  720p: 1
  1080p: 1.5 или 2
round: ceil
min: 1

==================================================
5. SEEDANCE 2 IMAGE TO VIDEO FAST FORM_SCHEMA
==================================================

code: seedance_2_i2v_fast

Поля:
- image_url
  name: image_url или image_urls
  type: file
  provider_key: image_url
  required: true
  accept: image/*
  max_size_mb: 20
  label: Стартовый кадр

Если endpoint реально требует image_urls array — использовать provider_key image_urls и type files max_files 1.

- prompt
  type: textarea
  provider_key: prompt
  required: true
  label: Описание движения
  placeholder: Например: камера медленно приближается, персонаж поворачивает голову, мягкий кинематографичный свет

- duration
  default 5
  options 5/10, если поддерживается

- aspect_ratio
  default auto или 16:9, если поддерживается

Advanced:
- seed optional
- negative_prompt optional, если поддерживается
- motion_strength / camera_motion, только если docs подтверждают

price_rules:
base: 180
duration multiplier
resolution multiplier, если есть

==================================================
6. SEEDANCE 2 IMAGE TO VIDEO FORM_SCHEMA
==================================================

code: seedance_2_i2v

Похоже на fast, но цена выше:
base: 250

Если endpoint поддерживает start_image_url + end_image_url:
- start_image_url file required
- end_image_url file optional
Или:
- image_url file required
- end_image_url file optional

Точные provider_key брать из docs.

==================================================
7. KLING 2.1 IMAGE TO VIDEO FORM_SCHEMA
==================================================

code: kling_21_i2v

Поля:
- image_url
  type: file
  provider_key: image_url
  required: true
  accept: image/*
  label: Изображение

- prompt
  type: textarea
  provider_key: prompt
  required: false или true по docs
  label: Описание движения

- duration
  select
  options по docs, например 5/10, но проверить

- aspect_ratio
  select, если endpoint поддерживает

Advanced:
- negative_prompt, если поддерживает
- cfg_scale/guidance_scale, если поддерживает
- seed, если поддерживает

price_rules:
base: 220
duration multiplier

==================================================
8. VEO 3.1 PRO MODELS
==================================================

Пока добавить как inactive, если docs подтверждены:

veo_31_t2v
veo_31_i2v

Причина:
- дорогая модель
- перед включением нужно осознанно настроить price_rules и баланс
- можно показать в видео-разделе как Coming Soon / Pro Soon

Если добавляешь inactive:
- не должно открываться как active generation model
- можно показывать в боте как disabled “скоро” или не показывать

==================================================
9. ОБНОВИТЬ BOT VIDEO MENU
==================================================

Сейчас Видео показывает empty state.

Нужно сделать:
- если active video models есть, показать список кнопок WebAppInfo
- если active video models нет, оставить empty state

Кнопки:
🎬 Seedance 2 Text to Video
🖼 Seedance 2 Fast I2V
🎞 Seedance 2 I2V
🎥 Kling 2.1 I2V
⭐ Veo 3.1 — скоро, если inactive/coming soon

Каждая active кнопка должна быть WebAppInfo:
https://app.hubicx.ru/generate?model=<code>

Не использовать обычный url=.

Inactive кнопки:
- либо callback “coming_soon:veo_31”
- либо просто не показывать
Лучше показать “скоро” отдельным callback, чтобы пользователь понимал, что раздел развивается.

==================================================
10. BACKEND VALIDATION ДЛЯ VIDEO INPUT FILES
==================================================

Уже есть /api/files/upload и ownership validation.

Проверить:
- file fields для video image-to-video принимают только image/*
- если позже будет video-to-video, то video/*
- max size: image 20MB
- video input, если будет, 100MB или меньше
- purpose=input
- чужой file_id rejected
- nonexistent file_id rejected
- extra fields rejected

Для type=file:
- frontend может отправлять file_id
- backend резолвит file_id в url
- provider_input получает image_url или image_urls, в зависимости от schema provider_key

Для type=files:
- frontend отправляет массив file_ids
- backend резолвит в массив URL
- max_files соблюдается

==================================================
11. WORKER: VIDEO OUTPUT PARSING
==================================================

Проверить FalProvider / worker output parsing.

Для video endpoints Fal может вернуть:
- video.url
- videos[0].url
- output.video.url
- result.url

Нужно поддержать основные варианты:
- если task_type=video, искать video URL в:
  result["video"]["url"]
  result["videos"][0]["url"]
  result["output"]["video"]["url"]
  result["url"]
  result["data"]["video"]["url"]

Если video URL найден:
- скачать файл
- определить content_type video/mp4, если возможно
- загрузить в Beget S3:
  generations/{user_id}/{task_id}/{uuid}.mp4
- generation_tasks.output_file_url = S3 URL
- files row purpose=output, mime_type=video/mp4
- status completed

Если не найден:
- task refunded/failed с понятной error:
  "Provider completed but no video URL found"

Не ломать image parsing.

==================================================
12. WEBAPP: VIDEO UI
==================================================

Dynamic form уже есть, но нужно проверить UX для video:

На /generate?model=seedance_2_i2v_fast:
- upload image показывается первым
- preview загруженного изображения
- remove image
- prompt
- duration/resolution/aspect
- advanced свернут

На completed video:
- показывать <video controls playsInline>
- кнопка “Открыть оригинал”
- кнопка “📩 Отправить файлом в чат”
- не пытаться показывать video как image

History:
- video tasks должны показывать video preview или video icon
- send-to-chat работает

==================================================
13. DYNAMIC PRICING ДЛЯ VIDEO
==================================================

Для video моделей price_rules обязательны.

Базовая логика:
- duration 5 sec = 1x
- duration 10 sec = 2x
- resolution 720p = 1x
- resolution 1080p = 2x
- Pro models ещё дороже

Если точные провайдерские цены известны из docs, адаптировать credits так, чтобы не уйти в минус.

Пока нет платежей, но цена должна быть высокой:
- text-to-video не меньше 200 credits
- image-to-video не меньше 180 credits
- pro video не меньше 800 credits

==================================================
14. АДМИН-ПОПОЛНЕНИЕ ДЛЯ ТЕСТА
==================================================

Так как оплаты пока нет, для теста нужно пополнить баланс пользователя вручную.

User Telegram ID:
1113930428

Проверить баланс:

docker compose exec postgres psql -U postgres -d ai_aggregator -c "
select telegram_id, username, balance_credits
from users
where telegram_id = 1113930428;
"

Если нужно, добавить тестовые кредиты:

docker compose exec postgres psql -U postgres -d ai_aggregator -c "
update users
set balance_credits = balance_credits + 1000
where telegram_id = 1113930428;
"

Если есть transaction table и известная структура, добавить transaction record. Если нет — просто update balance и указать это в отчёте.

==================================================
15. SAFE DEPLOY
==================================================

Перед production deploy сделать DB backup:

mkdir -p /opt/backups/ai_aggregator

docker compose exec -T postgres pg_dump -U postgres -d ai_aggregator > /opt/backups/ai_aggregator/backup_before_video_$(date +%F_%H-%M-%S).sql

Deploy:

cd /opt/ai_aggregator
git pull
docker compose config --quiet
docker compose up -d --build backend bot webapp worker
docker compose exec backend alembic -c backend/alembic.ini upgrade head
docker compose exec backend python -m backend.seed
docker compose exec backend python -m backend.scripts.validate_model_schemas
docker compose exec backend python -m backend.scripts.test_pricing
docker compose restart backend bot webapp worker

Проверить:
curl -s https://api.hubicx.ru/health
curl -I https://app.hubicx.ru
docker compose ps
docker compose logs --tail=200 backend
docker compose logs --tail=200 worker
docker compose logs --tail=150 bot
docker compose logs --tail=150 webapp

==================================================
16. PRODUCTION TESTS
==================================================

Через Telegram:

A. Проверить video menu:
/start → Видео

Ожидаемо:
- есть реальные active video модели
- нет пустого списка
- Veo, если inactive, показывается как “скоро” или не показывается

B. Seedance Text to Video:
- открыть модель
- проверить price preview
- prompt:
  A cinematic shot of a futuristic city at sunset, slow camera push-in, realistic lighting
- duration 5 sec
- resolution 720p
- generate
Ожидаемо:
- completed или refunded с понятной provider error
- если completed: output_file_url Beget S3 .mp4
- video preview работает
- history работает
- send-to-chat работает

C. Seedance Fast Image to Video:
- upload image
- prompt:
  slow cinematic camera push-in, subtle motion, realistic lighting
- duration 5 sec
- generate
Ожидаемо:
- provider_input содержит image_url или image_urls
- completed
- video output saved to S3
- send-to-chat works

D. Kling I2V:
- upload image
- prompt
- generate
Ожидаемо:
- completed или refunded с provider error
- если ошибка schema/payload — поправить provider_key/schema

E. Security:
- extra field rejected 400
- invalid enum rejected 400
- missing required image rejected 400
- nonexistent/foreign file_id rejected
- insufficient balance handled

F. History:
- video tasks show actual cost_credits
- video preview or icon
- send-to-chat from history works, if implemented there

==================================================
17. НЕ ЗАБЫТЬ
==================================================

Если provider returns "still in progress" как раньше было с Nano:
- не считать это final error
- polling должен продолжаться
- если timeout — refunded с понятной ошибкой

Для video генерации timeout должен быть больше, чем для image:
- image polling timeout: можно оставить текущий
- video polling timeout: увеличить, например 10-20 минут
- poll interval: 5-10 секунд

Не держать HTTP request открытым всё это время:
- task создаётся быстро
- worker делает polling
- WebApp polling status через backend

==================================================
18. FINAL REPORT
==================================================

В отчёте указать:

1. Какие video models добавлены:
   - code
   - title
   - provider_model_id
   - active/inactive
   - price/base price

2. Какие form_schema поля подтверждены по docs.

3. Какие изменения в:
   - seed_models.py
   - bot video menu
   - worker output parsing
   - FalProvider
   - WebApp video UI

4. Backup path.

5. Баланс пользователя до/после тестового top-up.

6. Результаты тестов:
   - Seedance T2V
   - Seedance Fast I2V
   - Seedance I2V
   - Kling I2V
   - Veo inactive/coming soon

7. Для completed video:
   - task_id
   - cost_credits
   - S3 output_file_url
   - files row created
   - send-to-chat success

8. Для failed/refunded:
   - exact provider error без секретов
   - refund exact cost_credits

9. Security tests result.

10. Остались ли модели/поля, которые нужно доаудитить.
