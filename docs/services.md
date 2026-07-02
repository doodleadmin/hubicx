# Hubicx service map

Current as of 2026-07-03. Hubicx is an AI creation product designed around a short path: select a ready scenario or describe a task, upload the required media, and receive a result without learning provider-specific interfaces.

## Public surfaces

| Surface | Domain | Implementation | Responsibility |
|---|---|---|---|
| Landing and desktop workspace | `hubicx.ru` | Next.js shell plus static React workspace | Marketing pages, email login, photo/video generation, templates, AI chat, history, profile and payments |
| Telegram Mini App | `webapp.hubicx.ru` | Static React Mini App through KZ reverse proxy | Mobile-first generation, templates, chat, balance, profile and Telegram-native navigation |
| Backend API | `api.hubicx.ru` | FastAPI | Authentication, catalog, pricing, tasks, payments, files, referrals, admin API and chat API |
| Admin panel | `admin.hubicx.ru` | `webapp/public/app/admin.*` | Users, balances, tasks, errors, pricing, token packages, partners, commissions and payouts |
| Partner dashboard | `partners.hubicx.ru` | `webapp/public/partners/` | Partner login, links, clicks/conversions, commissions, payout history and payout requests |

## Runtime services

### Backend

`backend/` is the business boundary and source of truth. FastAPI validates authentication and model inputs, calculates trusted prices, creates generation tasks, atomically charges balances, exposes history and receives payment/provider webhooks.

Important areas:

- `backend/app/api/routes/` contains public, authenticated, admin and partner endpoints.
- `backend/app/services/generations.py` creates generation tasks and charges balances.
- `backend/app/services/pricing.py` calculates final prices from database pricing rules.
- `backend/app/services/balance.py` maintains paid/bonus balance and ledger entries.
- `backend/app/services/payments.py` and `tbank.py` implement T-Bank acquiring and idempotent payment effects.
- `backend/app/services/referral.py` manages attribution, conversions and partner commissions.
- `backend/app/providers/` contains Fal.ai and OpenRouter adapters.
- `backend/alembic/versions/` is the only supported path for schema changes.

### Web application

`webapp/` contains two frontend layers that share the same product data:

- `webapp/app/` is the Next.js route shell and public pages.
- `webapp/public/app/` is the active static React workspace used by desktop and Telegram Mini App.

The static app is split by responsibility: `ma-core.jsx` for shared catalog/helpers, `ma-app.jsx` for routing and global modals, `ma-create.jsx` for mobile creation, `ma-desktop-screens.jsx` for desktop workflows, and dedicated modules for chat, profile, landing and generation catalogs. `assets/app.bundle*.js` and `index.html` are generated artifacts and must not be edited manually.

Template media uses WebP posters, optimized MP4 previews and intersection-based lazy loading. New template media should be processed with `npm run optimize:template-media`.

### Telegram bot

`bot/` is an aiogram application. It provides `/start`, language and navigation handlers, opens the Mini App, exposes balance/history entry points, sends generation notifications and retains Telegram admin commands for emergency operations.

### Worker and scheduler

`worker/` executes slow provider work outside HTTP requests:

- `generation_worker.py` calls providers, advances Seedance reference preprocessing, persists outputs and refunds failed tasks.
- `polling_worker.py` checks asynchronous Fal.ai tasks every 20 seconds.
- `refund_worker.py` reconciles stuck/failed tasks every 10 minutes.
- `beat` schedules polling and reconciliation.

Celery uses Redis as broker/result backend with worker prefetch set to one to avoid one process reserving too many expensive jobs.

### PostgreSQL and Redis

PostgreSQL stores users, profiles, safety events, models, pricing, templates, tasks, transactions, balance ledger, subscriptions, payments, files, referrals, partner payouts and chat messages. Redis is used by Celery and transient queue state; PostgreSQL remains the durable source of truth.

## Generation lifecycle

1. The client loads the active model catalog and schema.
2. The user selects a model/template and only sees relevant controls.
3. The frontend calculates a preview and can request a backend price preview.
4. `POST /api/generations` authenticates the user and validates all inputs.
5. The backend recalculates the final trusted price, checks balance, charges atomically and creates `GenerationTask`.
6. Celery submits work to Fal.ai or OpenRouter.
7. Async provider tasks are polled; successful output is copied to persistent storage when configured.
8. The task becomes completed and appears in history/Telegram. Technical or safety failures follow separate handling; chargeable failures are refunded using the exact task cost.

Seedance templates can preprocess every uploaded person image through GPT Image 2 reference preparation. Technical/reference rejection can advance through configured strategies, while safety/adult-policy rejection stops immediately, refunds and records an admin-review event.

## Money and access systems

- Final generation price is controlled by backend database pricing rules; frontend price is informational.
- Paid and bonus token movements are recorded in a ledger.
- T-Bank has separate desktop and Mini App terminal settings selected by return host.
- Subscriptions and one-time packages are served by `/api/pricing`.
- Partner commissions are calculated from eligible net economics, have a configurable hold and stop accruing after partner deactivation/expiry.
- Partners request payouts from their dashboard; admins process them in the admin panel.

## Authentication and safety

- Mini App authenticates signed Telegram `initData`.
- Desktop uses email/password JWT and email verification.
- Telegram and email identities can be linked to one user and one balance.
- Admin access is separate from normal user access.
- Provider moderation events are recorded without automatic bans; repeated events mark a user for manual review.

## Infrastructure

Origin production is `62.113.109.73:/opt/ai_aggregator`. Docker Compose runs `postgres`, `redis`, `backend`, `bot`, `worker`, `beat` and `webapp`. The Telegram Mini App is additionally delivered through the Kazakhstan nginx proxy `45.139.29.127`, which caches static assets.

Deployment is always local change -> checks -> commit/push -> origin `git pull --ff-only` -> build/migrate/restart -> public smoke test. Project code is never edited directly on a server.
