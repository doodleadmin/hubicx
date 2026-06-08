import logging

from fastapi import APIRouter, Body, Depends, Query
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.api.deps import current_user
from backend.app.api.routes.pricing import serialize_model_price, serialize_package
from backend.app.db.models import AIModel, BalanceLedger, File, GenerationTask, ModelPricing, TokenPackage, Transaction, User
from backend.app.db.session import get_session
from backend.app.services.balance import admin_add_balance
from backend.app.utils.errors import AppError

router = APIRouter(prefix="/admin", tags=["admin"])
logger = logging.getLogger(__name__)


def require_admin(user: User) -> None:
    if not user.is_admin:
        raise AppError("forbidden", "Доступ запрещён", 403)


@router.get("/users")
async def list_users(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    require_admin(user)
    offset = (page - 1) * limit
    total = await session.scalar(select(func.count(User.id)))
    result = await session.execute(
        select(User).order_by(desc(User.created_at)).offset(offset).limit(limit)
    )
    users = [
        {
            "id": u.id,
            "telegram_id": u.telegram_id,
            "username": u.username,
            "first_name": u.first_name,
            "language_code": u.language_code,
            "balance_credits": u.balance_credits,
            "is_admin": u.is_admin,
            "ref_code": u.ref_code,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in result.scalars().all()
    ]
    return {"items": users, "total": total or 0, "page": page, "limit": limit}


def serialize_user(u: User) -> dict:
    return {
        "id": u.id,
        "telegram_id": u.telegram_id,
        "username": u.username,
        "first_name": u.first_name,
        "language_code": u.language_code,
        "balance_credits": u.balance_credits,
        "is_admin": u.is_admin,
        "ref_code": u.ref_code,
        "created_at": u.created_at.isoformat() if u.created_at else None,
        "last_active_at": None,
    }


def serialize_ledger(item: BalanceLedger) -> dict:
    return {
        "id": item.id,
        "user_id": item.user_id,
        "amount": item.amount,
        "balance_before": item.balance_before,
        "balance_after": item.balance_after,
        "operation_type": item.operation_type,
        "reason": item.reason,
        "task_id": item.task_id,
        "payment_id": item.payment_id,
        "admin_user_id": item.admin_user_id,
        "metadata": item.metadata_,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


def serialize_task_admin(t: GenerationTask) -> dict:
    return {
        "id": t.id,
        "user_id": t.user_id,
        "telegram_id": t.user.telegram_id if t.user else None,
        "username": t.user.username if t.user else None,
        "model_id": t.model_id,
        "model_code": t.model.code if t.model else None,
        "model_title": t.model.title if t.model else None,
        "task_type": t.task_type,
        "status": t.status,
        "prompt": t.prompt[:120] if t.prompt else None,
        "cost_credits": t.cost_credits,
        "error_message": t.error_message,
        "output_file_url": t.output_file_url,
        "output_text": t.output_text[:240] if t.output_text else None,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "completed_at": t.completed_at.isoformat() if t.completed_at else None,
    }


@router.post("/balance/{telegram_id}")
async def add_balance(telegram_id: int, amount: int, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    require_admin(user)
    if amount <= 0:
        raise AppError("invalid_amount", "Сумма должна быть положительной")
    target = await session.scalar(select(User).where(User.telegram_id == telegram_id))
    if not target:
        raise AppError("user_not_found", "Пользователь не найден", 404)
    await admin_add_balance(session, target.id, amount, "Admin API", admin_user_id=user.id)
    await session.commit()
    logger.info("ADMIN_BALANCE_ADD admin_user_id=%s target_user_id=%s amount=%s", user.id, target.id, amount)
    return {"ok": True, "balance": target.balance_credits}


@router.get("/tasks")
async def list_tasks(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    status: str | None = Query(default=None),
    user_id: int | None = Query(default=None),
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    require_admin(user)
    offset = (page - 1) * limit
    stmt = select(GenerationTask)
    count_stmt = select(func.count(GenerationTask.id))
    if status:
        stmt = stmt.where(GenerationTask.status == status)
        count_stmt = count_stmt.where(GenerationTask.status == status)
    if user_id is not None:
        stmt = stmt.where(GenerationTask.user_id == user_id)
        count_stmt = count_stmt.where(GenerationTask.user_id == user_id)
    total = await session.scalar(count_stmt)
    result = await session.execute(
        stmt.options(selectinload(GenerationTask.user), selectinload(GenerationTask.model)).order_by(desc(GenerationTask.created_at)).offset(offset).limit(limit)
    )
    tasks = [serialize_task_admin(t) for t in result.scalars().all()]
    return {"items": tasks, "total": total or 0, "page": page, "limit": limit}


@router.get("/errors")
async def errors(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    require_admin(user)
    offset = (page - 1) * limit
    count_stmt = select(func.count(GenerationTask.id)).where(GenerationTask.error_message.is_not(None))
    total = await session.scalar(count_stmt)
    result = await session.execute(
        select(GenerationTask)
        .where(GenerationTask.error_message.is_not(None))
        .order_by(desc(GenerationTask.created_at))
        .offset(offset)
        .limit(limit)
    )
    items = [
        {
            "id": t.id,
            "user_id": t.user_id,
            "task_type": t.task_type,
            "status": t.status,
            "error": t.error_message,
            "cost_credits": t.cost_credits,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in result.scalars().all()
    ]
    return {"items": items, "total": total or 0, "page": page, "limit": limit}


@router.get("/models")
async def list_models_admin(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> list[dict]:
    require_admin(user)
    result = await session.execute(select(AIModel).order_by(AIModel.category, AIModel.sort_order, AIModel.id))
    return [
        {
            "id": m.id,
            "code": m.code,
            "title": m.title,
            "category": m.category,
            "provider": m.provider,
            "task_type": m.task_type,
            "price_credits": m.price_credits,
            "is_active": m.is_active,
            "form_schema": m.form_schema,
        }
        for m in result.scalars().all()
    ]


@router.post("/models/{code}/toggle")
async def toggle_model(code: str, is_active: bool, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    require_admin(user)
    model = await session.scalar(select(AIModel).where(AIModel.code == code))
    if not model:
        raise AppError("model_not_found", "Модель не найдена", 404)
    model.is_active = is_active
    await session.commit()
    return {"ok": True, "code": code, "is_active": is_active}


@router.post("/models/{code}/price")
async def update_model_price(code: str, price_credits: int, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    require_admin(user)
    if price_credits < 0:
        raise AppError("invalid_price", "Цена не может быть отрицательной")
    model = await session.scalar(select(AIModel).where(AIModel.code == code))
    if not model:
        raise AppError("model_not_found", "Модель не найдена", 404)
    model.price_credits = price_credits
    await session.commit()
    return {"ok": True, "code": code, "price_credits": price_credits}


@router.get("/models/{code}/schema")
async def get_model_schema(code: str, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    require_admin(user)
    model = await session.scalar(select(AIModel).where(AIModel.code == code))
    if not model:
        raise AppError("model_not_found", "Модель не найдена", 404)
    return {"code": model.code, "title": model.title, "form_schema": model.form_schema}


@router.get("/transactions")
async def list_transactions(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    user_id: int | None = Query(default=None),
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    require_admin(user)
    offset = (page - 1) * limit
    stmt = select(Transaction)
    count_stmt = select(func.count(Transaction.id))
    if user_id is not None:
        stmt = stmt.where(Transaction.user_id == user_id)
        count_stmt = count_stmt.where(Transaction.user_id == user_id)
    total = await session.scalar(count_stmt)
    result = await session.execute(stmt.order_by(desc(Transaction.created_at)).offset(offset).limit(limit))
    items = [
        {
            "id": t.id,
            "user_id": t.user_id,
            "type": t.type,
            "amount_credits": t.amount_credits,
            "status": t.status,
            "generation_task_id": t.generation_task_id,
            "payment_id": t.payment_id,
            "comment": t.comment,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in result.scalars().all()
    ]
    return {"items": items, "total": total or 0, "page": page, "limit": limit}


@router.get("/files")
async def list_files(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    user_id: int | None = Query(default=None),
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    require_admin(user)
    offset = (page - 1) * limit
    stmt = select(File)
    count_stmt = select(func.count(File.id))
    if user_id is not None:
        stmt = stmt.where(File.user_id == user_id)
        count_stmt = count_stmt.where(File.user_id == user_id)
    total = await session.scalar(count_stmt)
    result = await session.execute(stmt.order_by(desc(File.created_at)).offset(offset).limit(limit))
    items = [
        {
            "id": f.id,
            "user_id": f.user_id,
            "file_type": f.file_type,
            "purpose": f.purpose,
            "storage_url": f.storage_url,
            "mime_type": f.mime_type,
            "size_bytes": f.size_bytes,
            "created_at": f.created_at.isoformat() if f.created_at else None,
        }
        for f in result.scalars().all()
    ]
    return {"items": items, "total": total or 0, "page": page, "limit": limit}


@router.get("/token-packages")
async def list_token_packages(user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> list[dict]:
    require_admin(user)
    result = await session.execute(select(TokenPackage).order_by(TokenPackage.sort_order, TokenPackage.id))
    return [serialize_package(pkg) for pkg in result.scalars().all()]


@router.post("/token-packages")
async def create_token_package(payload: dict = Body(...), user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    require_admin(user)
    code = str(payload.get("code") or "").strip()
    title = str(payload.get("title") or "").strip()
    tokens = int(payload.get("tokens") or 0)
    price_rub = int(payload.get("price_rub") or 0)
    if not code or not title or tokens <= 0 or price_rub < 0:
        raise AppError("validation_error", "Некорректный пакет")
    pkg = TokenPackage(
        code=code,
        title=title,
        tokens=tokens,
        price_rub=price_rub,
        bonus_tokens=int(payload.get("bonus_tokens") or 0),
        is_active=bool(payload.get("is_active", True)),
        sort_order=int(payload.get("sort_order") or 0),
    )
    session.add(pkg)
    await session.commit()
    await session.refresh(pkg)
    logger.info("ADMIN_TOKEN_PACKAGE_CREATE admin_user_id=%s package_code=%s", user.id, pkg.code)
    return serialize_package(pkg)


@router.patch("/token-packages/{package_id}")
async def update_token_package(package_id: int, payload: dict = Body(...), user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    require_admin(user)
    pkg = await session.get(TokenPackage, package_id)
    if not pkg:
        raise AppError("package_not_found", "Пакет не найден", 404)
    for field in ("code", "title"):
        if field in payload:
            setattr(pkg, field, str(payload[field]).strip())
    for field in ("tokens", "price_rub", "bonus_tokens", "sort_order"):
        if field in payload:
            setattr(pkg, field, int(payload[field]))
    if "is_active" in payload:
        pkg.is_active = bool(payload["is_active"])
    await session.commit()
    await session.refresh(pkg)
    logger.info("ADMIN_TOKEN_PACKAGE_UPDATE admin_user_id=%s package_id=%s", user.id, pkg.id)
    return serialize_package(pkg)


@router.delete("/token-packages/{package_id}")
async def delete_token_package(package_id: int, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    require_admin(user)
    pkg = await session.get(TokenPackage, package_id)
    if not pkg:
        raise AppError("package_not_found", "Пакет не найден", 404)
    pkg.is_active = False
    await session.commit()
    logger.info("ADMIN_TOKEN_PACKAGE_DISABLE admin_user_id=%s package_id=%s", user.id, pkg.id)
    return {"ok": True, "id": pkg.id, "is_active": pkg.is_active}


@router.get("/model-pricing")
async def list_model_pricing(user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> list[dict]:
    require_admin(user)
    result = await session.execute(select(ModelPricing).order_by(ModelPricing.category, ModelPricing.model_code))
    return [serialize_model_price(price) for price in result.scalars().all()]


@router.patch("/model-pricing/{model_code}")
async def update_model_pricing(model_code: str, payload: dict = Body(...), user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    require_admin(user)
    price = await session.scalar(select(ModelPricing).where(ModelPricing.model_code == model_code))
    if not price:
        model = await session.scalar(select(AIModel).where(AIModel.code == model_code))
        if not model:
            raise AppError("model_not_found", "Модель не найдена", 404)
        price = ModelPricing(model_code=model.code, display_name=model.title, category=model.task_type, price_tokens=model.price_credits)
        session.add(price)
    if "display_name" in payload:
        price.display_name = str(payload["display_name"]).strip()
    if "category" in payload:
        category = str(payload["category"])
        if category not in {"image", "video", "text"}:
            raise AppError("validation_error", "category must be image/video/text")
        price.category = category
    if "price_tokens" in payload:
        next_price = int(payload["price_tokens"])
        if next_price < 0:
            raise AppError("invalid_price", "Цена не может быть отрицательной")
        price.price_tokens = next_price
    if "is_enabled" in payload:
        price.is_enabled = bool(payload["is_enabled"])
    if "is_featured" in payload:
        price.is_featured = bool(payload["is_featured"])
    if "admin_note" in payload:
        price.admin_note = str(payload["admin_note"] or "")[:2000] or None
    await session.commit()
    await session.refresh(price)
    logger.info("ADMIN_MODEL_PRICING_UPDATE admin_user_id=%s model_code=%s price_tokens=%s", user.id, model_code, price.price_tokens)
    return serialize_model_price(price)


@router.get("/users/{user_id}")
async def get_admin_user(user_id: int, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    require_admin(user)
    target = await session.get(User, user_id)
    if not target:
        raise AppError("user_not_found", "Пользователь не найден", 404)
    return serialize_user(target)


@router.post("/users/{user_id}/balance-adjust")
async def balance_adjust(user_id: int, payload: dict = Body(...), user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    require_admin(user)
    amount = int(payload.get("amount") or 0)
    reason = str(payload.get("reason") or "Admin adjustment")[:1000]
    if amount == 0:
        raise AppError("invalid_amount", "amount must not be zero")
    await admin_add_balance(session, user_id, amount, reason, admin_user_id=user.id)
    target = await session.get(User, user_id)
    await session.commit()
    logger.info("ADMIN_BALANCE_ADJUST admin_user_id=%s target_user_id=%s amount=%s", user.id, user_id, amount)
    return {"ok": True, "user_id": user_id, "balance": target.balance_credits if target else None}


@router.get("/users/{user_id}/balance-ledger")
async def user_balance_ledger(user_id: int, page: int = Query(default=1, ge=1), limit: int = Query(default=50, ge=1, le=200), user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    require_admin(user)
    offset = (page - 1) * limit
    stmt = select(BalanceLedger).where(BalanceLedger.user_id == user_id)
    total = await session.scalar(select(func.count(BalanceLedger.id)).where(BalanceLedger.user_id == user_id))
    result = await session.execute(stmt.order_by(desc(BalanceLedger.created_at)).offset(offset).limit(limit))
    return {"items": [serialize_ledger(item) for item in result.scalars().all()], "total": total or 0, "page": page, "limit": limit}


@router.get("/generation-tasks")
async def list_generation_tasks(page: int = Query(default=1, ge=1), limit: int = Query(default=50, ge=1, le=200), status: str | None = Query(default=None), user_id: int | None = Query(default=None), user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    return await list_tasks(page=page, limit=limit, status=status, user_id=user_id, user=user, session=session)


@router.get("/generation-tasks/{task_id}")
async def get_generation_task_admin(task_id: int, user: User = Depends(current_user), session: AsyncSession = Depends(get_session)) -> dict:
    require_admin(user)
    task = await session.scalar(
        select(GenerationTask)
        .where(GenerationTask.id == task_id)
        .options(selectinload(GenerationTask.user), selectinload(GenerationTask.model), selectinload(GenerationTask.template))
    )
    if not task:
        raise AppError("task_not_found", "Задача не найдена", 404)
    return serialize_task_admin(task)
