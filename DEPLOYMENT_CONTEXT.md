# Hubicx deployment context

Current as of 2026-10-01.

## Repository

- Local path: `F:\dev\generative_bot\ai_aggregator`
- Remote: `https://github.com/doodleadmin/hubicx.git`
- Branch: `main`
- Current checkpoint commit before this documentation pass: `5fc7ba9`

## Production

- Single origin server: `root@185.253.7.71` (Ubuntu 26.04, 2 vCPU, 5 GB RAM + 2 GB swap), project in `/opt/ai_aggregator`.
- Docker Compose services: PostgreSQL, Redis, backend, bot (polling), worker, beat, webapp. Backend and webapp are published on `127.0.0.1` only; nginx (host) is the single entry point, config in `ops/origin-nginx/hubicx.conf`, TLS by certbot.
- Secrets live only in `/opt/ai_aggregator/.env` on the server (never in git).
- Daily database dump to `/opt/backups` (`ops/backup/pg-backup.sh`, 14 days).
- The former KZ proxy (`ops/kz-webapp-proxy`) is not used.

## Domains

- `hubicx.ru`, `www.hubicx.ru` - landing that sends visitors to the Telegram bot.
- `webapp.hubicx.ru` - Telegram Mini App.
- `api.hubicx.ru` - FastAPI.
- `admin.hubicx.ru` - admin panel.

## Standard deployment

1. Make and verify changes locally (`npm run build` in `webapp/`, backend tests).
2. Commit and push `main`.
3. Put the code on the origin: `git pull --ff-only` in `/opt/ai_aggregator` once a read-only deploy key is set up there; until then upload the tree with `tar` over SSH (excluding `.git`, `node_modules`, `.env`).
4. Rebuild affected services: `docker compose build <service> && docker compose up -d <service>`.
5. Apply Alembic migrations: `docker compose run --rm backend alembic -c backend/alembic.ini upgrade head`; restart `worker` and `beat` after worker changes.
6. Verify `https://api.hubicx.ru/health`, the public build ID and affected endpoints.

Never edit project code or configuration directly on a server. Never write secrets to documentation or memory.

## Current product checkpoint

- Insufficient generation balance opens top-up on desktop and mobile.
- Plans and packages show approximate photo capacity.
- Template catalog is grouped by categories and the generation page shows photo templates before video templates.
- Template media uses lazy video loading, optimized MP4 and WebP posters.
- Latest public build before this documentation pass: `20260702-200421-gen-price-trace1`.

See `docs/services.md`, `docs/design-system.md`, `docs/pricing-policy.md` and `README.md` for the maintained project map.
