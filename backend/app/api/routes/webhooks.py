from fastapi import APIRouter

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/fal")
async def fal_webhook(payload: dict) -> dict:
    return {"ok": True, "received": bool(payload)}
