# Deployment Context

This file is a handoff note for continuing work in another chat.

## Current Project

- Project: `ai_aggregator`
- Local path: `F:\dev\generative_bot\ai_aggregator`
- Current active task: backend-trusted dynamic pricing for schema-driven generation forms
- Important: production server/path for `ai_aggregator` is not confirmed yet.

## Unrelated Bot Server

The server below is for the separate Telegram casino bot/WebApp, not confirmed as the `ai_aggregator` production host.

- Server: `155.212.140.236`
- Domain: `insidemode.store`
- Bot backend path: `/opt/bot/`
- SQLite DB: `/opt/bot/data.sql`
- Frontend path: `/var/www/insidemode.store/`
- Service: `bot`
- Nginx proxies:
  - `/api/` -> `127.0.0.1:8080`
  - `/webhook` -> `127.0.0.1:8080`
  - `/postback` -> `127.0.0.1:8080`
- SSL: Let's Encrypt is installed and working for `insidemode.store`
- Webhook: `https://insidemode.store/webhook`

## Bot Server Deploy Pattern

Use this only for the separate `/opt/bot` project:

```powershell
scp "F:\dev\bot_1w\bot\main.py" root@155.212.140.236:/opt/bot/main.py
scp "F:\dev\bot_1w\bot\db_sql.py" root@155.212.140.236:/opt/bot/db_sql.py
ssh root@155.212.140.236 "systemctl restart bot && sleep 16 && systemctl is-active bot"
```

Frontend deploy for that bot:

```powershell
npm run build
ssh root@155.212.140.236 "rm -rf /var/www/insidemode.store/static /var/www/insidemode.store/index.html /var/www/insidemode.store/asset-manifest.json"
scp -r "F:\dev\bot_1w\build\*" root@155.212.140.236:/var/www/insidemode.store/
```

## ai_aggregator Dynamic Pricing Requirements

Goal: final generation cost must be calculated only on the backend from validated form inputs and `AIModel.form_schema.price_rules`.

Rules:

- Do not trust frontend price.
- Frontend can show preview only.
- `AIModel.price_credits` remains the base/default fixed price.
- If no `price_rules`, keep old behavior: use `AIModel.price_credits`.
- `GenerationTask.cost_credits` must store the final calculated cost.
- Balance checks, balance deductions, transactions, and refunds must use the final calculated cost.
- Refunds should use exact `task.cost_credits`.
- Do not touch Telegram auth/menu flow.
- Do not run `seed --force` unless explicitly needed.
- Do not expose secrets.

Accepted `price_rules` format:

```json
{
  "base": 80,
  "multipliers": [
    {
      "field": "resolution",
      "values": {
        "1K": 1,
        "2K": 2,
        "4K": 4
      }
    },
    {
      "field": "num_images",
      "mode": "multiply_by_value"
    }
  ],
  "additions": [
    {
      "field": "enable_web_search",
      "values": {
        "true": 20
      }
    }
  ],
  "min": 1,
  "round": "ceil"
}
```

Pricing rules:

- `base` comes from `price_rules.base`, otherwise from `model.price_credits`.
- `multipliers` multiply the running cost.
- `mode: "multiply_by_value"` multiplies by the numeric input value.
- `additions` add to the running cost.
- `round: "ceil"` is the default.
- Final cost is an integer.
- Minimum final cost is at least `1`.

## ai_aggregator Files Already Changed

These changes were started locally in `F:\dev\generative_bot\ai_aggregator`:

- `backend/app/services/pricing.py`
  - Added backend pricing calculator.
  - Functions:
    - `calculate_generation_cost_breakdown(model, validated_inputs)`
    - `calculate_generation_cost(model, validated_inputs)`
- `backend/app/services/generations.py`
  - Model generation path now calculates final price after input validation.
  - Template pricing remains unchanged.
- `backend/app/api/routes/models.py`
  - Added authenticated endpoint:
    - `POST /api/models/{model_code}/price-preview`
  - Validates inputs and returns backend-calculated preview.
- `webapp/lib/types.ts`
  - Added `PricePreview` type.
- `webapp/lib/api.ts`
  - Added `api.modelPricePreview(code, inputs)`.
- `webapp/components/ModelForm.tsx`
  - Added 500ms debounced price preview.
  - Shows final backend preview cost when available.
  - Shows `Стоимость: от {base} 🪙` when preview is incomplete/unavailable.
  - Does not block submit on preview failure.
  - Disables submit only when a known preview/fixed cost exceeds balance.
- `backend/seed_models.py`
  - Updated `price_rules` for dynamic models.

## ai_aggregator Model Pricing Plan

Dynamic pricing models:

- `nano_banana_2`
  - base `40`
  - `num_images` multiply by value
- `nano_banana_pro`
  - base `80`
  - `resolution`: `1K=1`, `2K=2`, `4K=4`
  - `num_images` multiply by value
  - `enable_web_search=true` adds `20`
- `nano_banana_edit`
  - base `60`
  - `num_images` multiply by value
- `flux_schnell`
  - base `30`
  - `num_images` multiply by value
- `seedream`
  - base `50`
  - `image_size`: `auto_2K=2`, `auto_4K=4`
  - `num_images` multiply by value
- `z_image`
  - base current price / `25`
  - `num_images` multiply by value

Fixed-price models:

- `ai_chat`
- `prompt_helper`

## ai_aggregator Still To Do

Continue from here:

1. Patch `backend/scripts/validate_model_schemas.py`.
   - Validate `price_rules.base` is number > 0 if present.
   - Validate `multipliers` is a list.
   - Validate every multiplier has `field` and field exists in schema.
   - Validate multiplier `values` are numeric.
   - Validate `mode: "multiply_by_value"` only applies to `number` fields.
   - Validate `additions` is a list.
   - Validate addition `values` are numeric.
   - Validate `min` is positive if present.
   - Validate `round` is one of `ceil`, `floor`, `round`.
2. Add `backend/scripts/test_pricing.py`.
   - Test examples:
     - `nano_banana_pro`, `1K x 1 = 80`
     - `nano_banana_pro`, `2K x 1 = 160`
     - `nano_banana_pro`, `4K x 1 = 320`
     - `nano_banana_pro`, `2K x 2 = 320`
     - `flux_schnell`, `num_images=2 -> 60`
     - fixed `ai_chat -> 2`
3. Run local checks.
4. Fix any issues.
5. Ask user for actual `ai_aggregator` production host/path before deploying.

## Local Checks For ai_aggregator

Run from:

```powershell
cd F:\dev\generative_bot\ai_aggregator
```

Checks:

```powershell
py -3 -m compileall backend bot worker
py -3 -c "import backend.app.main; print('backend import ok')"
npm run build
docker compose config --quiet
```

After adding pricing test:

```powershell
py -3 -m backend.scripts.test_pricing
```

## Intended Production Deploy For ai_aggregator

Do not run this until the real production host/path is confirmed.

Expected production path from original requirement:

```bash
cd /opt/ai_aggregator
```

Expected commands:

```bash
git pull
docker compose config --quiet
docker compose up -d --build backend webapp worker
docker compose exec backend alembic -c backend/alembic.ini upgrade head
docker compose exec backend python -m backend.seed
docker compose exec backend python -m backend.scripts.validate_model_schemas
docker compose exec backend python -m backend.scripts.test_pricing
docker compose restart backend webapp worker
```

## Production Manual Tests For ai_aggregator

After deploy, test in Telegram WebApp:

- Nano Banana Pro `1K`, `1 image` should show and charge `80`.
- Nano Banana Pro `2K`, `1 image` should show and charge `160`.
- Nano Banana Pro `4K`, `1 image` should show and charge `320`.
- Nano Banana Pro `2K`, `2 images` should show and charge `320`.
- Insufficient balance should disable frontend button when preview is known.
- Backend must still reject insufficient balance even if frontend is modified.
- Generate a cheap `flux_schnell` task and verify completion.
- History should show actual `cost_credits`.
- Failed/refunded task should refund exact `task.cost_credits`.

## Security Notes

- Frontend-sent price must be ignored.
- Existing `validate_inputs_against_schema` rejects unknown input keys, so extra `price_credits` in `inputs` should fail validation if it is not a schema field.
- Backend final cost must be calculated after schema input validation.
- Balance check must use final calculated cost.
- Transaction amount must use final calculated cost.
- `GenerationTask.cost_credits` must use final calculated cost.
- Refund must use `task.cost_credits`.
