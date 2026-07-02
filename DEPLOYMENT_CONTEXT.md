# Hubicx deployment context

Current as of 2026-07-03.

## Repository

- Local path: `F:\dev\generative_bot\ai_aggregator`
- Remote: `https://github.com/doodleadmin/hubicx.git`
- Branch: `main`
- Current checkpoint commit before this documentation pass: `5fc7ba9`

## Production

- Origin: `root@62.113.109.73`
- Project path: `/opt/ai_aggregator`
- Telegram Mini App KZ proxy: `root@45.139.29.127`
- Origin services: PostgreSQL, Redis, backend, bot, worker, beat and webapp through Docker Compose.

## Domains

- `hubicx.ru` - landing and desktop workspace.
- `webapp.hubicx.ru` - Telegram Mini App through KZ proxy.
- `api.hubicx.ru` - FastAPI.
- `admin.hubicx.ru` - admin panel.
- `partners.hubicx.ru` - partner dashboard.

## Standard deployment

1. Make and verify changes locally.
2. Commit and push `main`.
3. On origin run `cd /opt/ai_aggregator && git pull --ff-only`.
4. Rebuild only affected Compose services.
5. Apply committed Alembic migrations when present.
6. For Mini App static changes, clear `/var/cache/nginx/hubicx_webapp_static/*` on the KZ proxy, validate nginx and reload it.
7. Verify health, public build ID and affected endpoints.

Never edit project code or configuration directly on a server. Never write secrets to documentation or memory.

## Current product checkpoint

- Insufficient generation balance opens top-up on desktop and mobile.
- Plans and packages show approximate photo capacity.
- Template catalog is grouped by categories and the generation page shows photo templates before video templates.
- Template media uses lazy video loading, optimized MP4 and WebP posters.
- Latest public build before this documentation pass: `20260702-200421-gen-price-trace1`.

See `docs/services.md`, `docs/design-system.md`, `docs/pricing-policy.md` and `README.md` for the maintained project map.
