from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
import time

from backend.app.api.routes import admin, agent_chats, auth, bonuses, debug, files, generations, models, payments, pricing, profile, referral_admin, referral_partners, sitemap, templates, users, webhooks
from backend.app.config import settings
from backend.app.utils.errors import AppError

logger = logging.getLogger("api")

app = FastAPI(title="Telegram AI Aggregator", version="0.1.0")

# GZip compression
app.add_middleware(GZipMiddleware, minimum_size=500)

# Request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = time.perf_counter() - start
    logger.info("%s %s → %s (%.0fms)", request.method, request.url.path, response.status_code, elapsed * 1000)
    return response

# Rate limiting
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Trusted hosts
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["api.hubicx.ru", "app.hubicx.ru", "localhost", "127.0.0.1", "testserver"],
)

cors_origins = list(dict.fromkeys([
    settings.webapp_url.rstrip("/"),
    "https://app.hubicx.ru",
    "https://webapp.hubicx.ru",
    "https://admin.hubicx.ru",
    "https://partners.hubicx.ru",
    "https://hubicx.ru",
    *([] if settings.is_production else ["http://localhost:3000"]),
]))
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
