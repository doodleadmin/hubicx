from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.routes import admin, agent_chats, auth, bonuses, debug, files, generations, models, payments, pricing, profile, referral_admin, referral_partners, sitemap, templates, users, webhooks
from backend.app.config import settings
from backend.app.utils.errors import AppError

app = FastAPI(title="Telegram AI Aggregator", version="0.1.0")
cors_origins = list(dict.fromkeys([
    settings.webapp_url.rstrip("/"),
    "https://hubicx.ru",
    "https://www.hubicx.ru",
    "https://app.hubicx.ru",
    "https://webapp.hubicx.ru",
    "https://admin.hubicx.ru",
    "https://partners.hubicx.ru",
    "http://localhost:3000",
]))
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message, "code": exc.code})


@app.get("/health")
async def health() -> dict:
    return {"ok": True}


for router in (auth.router, users.router, models.router, templates.router, generations.router, files.router, payments.router, pricing.router, bonuses.router, profile.router, webhooks.router, admin.router, agent_chats.router, referral_admin.router, referral_partners.router, sitemap.router):
    app.include_router(router, prefix="/api")

if settings.debug:
    app.include_router(debug.router, prefix="/api")
