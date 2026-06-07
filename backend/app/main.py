from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.routes import admin, auth, debug, files, generations, models, payments, profile, templates, users, webhooks
from backend.app.config import settings
from backend.app.utils.errors import AppError

app = FastAPI(title="Telegram AI Aggregator", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.webapp_url, "http://localhost:3000"],
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


for router in (auth.router, users.router, models.router, templates.router, generations.router, files.router, payments.router, profile.router, webhooks.router, admin.router):
    app.include_router(router, prefix="/api")

if settings.debug:
    app.include_router(debug.router, prefix="/api")
