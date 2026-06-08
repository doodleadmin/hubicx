"""Agent Chat API — backend chat sessions with history, modes, and token ledger."""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Body, Depends, Query
from pydantic import BaseModel
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.api.deps import current_user
from backend.app.db.models import AgentChat, AgentChatMessage, AIModel, BalanceLedger, GenerationTask, User, UserProfileSettings
from backend.app.db.session import get_session
from backend.app.services.agent_modes import DEFAULT_MODE, VALID_MODES, get_system_prompt, list_modes, mode_name
from backend.app.services.balance import apply_balance_operation
from backend.app.utils.errors import AppError
from worker.generation_worker import process_generation_task

router = APIRouter(prefix="/agent", tags=["agent"])
logger = logging.getLogger(__name__)

AI_CHAT_COST = 3
MAX_CONTEXT_MESSAGES = 20
MAX_TITLE_LENGTH = 60


# --- Schemas ---

class ChatCreate(BaseModel):
    agent_mode: str | None = None
    first_message: str | None = None


class ChatUpdate(BaseModel):
    title: str | None = None
    agent_mode: str | None = None
    is_archived: bool | None = None


class MessageCreate(BaseModel):
    content: str


class MessageReply(BaseModel):
    content: str
    task_id: int | None = None


# --- Helpers ---

def _generate_title(text: str) -> str:
    words = text.strip().split()
    title = " ".join(words[:8])
    if len(title) > MAX_TITLE_LENGTH:
        title = title[:MAX_TITLE_LENGTH].rsplit(" ", 1)[0] + "…"
    return title or "Новый чат"


async def _get_profile_context(session: AsyncSession, user_id: int) -> str:
    profile = await session.scalar(select(UserProfileSettings).where(UserProfileSettings.user_id == user_id))
    if not profile:
        return ""
    lines = []
    if profile.about_user:
        lines.append(f"О пользователе: {profile.about_user[:500]}")
    if profile.communication_style:
        lines.append(f"Стиль общения: {profile.communication_style[:200]}")
    if profile.hubicx_personality:
        lines.append(f"Личность помощника: {profile.hubicx_personality[:500]}")
    if profile.persona_emoji:
        lines.append(f"Эмодзи персоны: {profile.persona_emoji}")
    return "\n".join(lines) if lines else ""


def _serialize_chat(chat: AgentChat) -> dict:
    return {
        "id": chat.id,
        "title": chat.title,
        "agent_mode": chat.agent_mode,
        "language_code": chat.language_code,
        "is_archived": chat.is_archived,
        "last_message_at": chat.last_message_at.isoformat() if chat.last_message_at else None,
        "created_at": chat.created_at.isoformat() if chat.created_at else None,
        "updated_at": chat.updated_at.isoformat() if chat.updated_at else None,
        "message_count": len(chat.messages) if chat.messages else 0,
    }


def _serialize_message(msg: AgentChatMessage) -> dict:
    return {
        "id": msg.id,
        "chat_id": msg.chat_id,
        "role": msg.role,
        "content": msg.visible_content or msg.content,
        "task_id": msg.task_id,
        "token_cost": msg.token_cost,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


def _serialize_chat_detail(chat: AgentChat) -> dict:
    data = _serialize_chat(chat)
    data["messages"] = [_serialize_message(m) for m in (chat.messages or [])]
    return data


async def _require_chat_owner(session: AsyncSession, chat_id: int, user_id: int) -> AgentChat:
    chat = await session.scalar(
        select(AgentChat)
        .where(AgentChat.id == chat_id, AgentChat.user_id == user_id)
        .options(selectinload(AgentChat.messages))
    )
    if not chat:
        raise AppError("chat_not_found", "Чат не найден", 404)
    return chat


# --- Endpoints ---

@router.get("/modes")
async def get_modes() -> dict:
    return {"modes": list_modes("ru"), "default": DEFAULT_MODE}


@router.get("/chats")
async def list_chats(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
    include_archived: bool = Query(default=False),
    limit: int = Query(default=50, ge=1, le=200),
) -> dict:
    stmt = select(AgentChat).where(AgentChat.user_id == user.id)
    if not include_archived:
        stmt = stmt.where(AgentChat.is_archived.is_(False))
    stmt = stmt.options(selectinload(AgentChat.messages)).order_by(desc(AgentChat.last_message_at)).limit(limit)
    result = await session.execute(stmt)
    chats = list(result.scalars().all())
    return {"chats": [_serialize_chat(c) for c in chats]}


@router.post("/chats")
async def create_chat(
    payload: ChatCreate,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    mode = payload.agent_mode or DEFAULT_MODE
    if mode not in VALID_MODES:
        mode = DEFAULT_MODE
    now = datetime.now(timezone.utc)
    chat = AgentChat(
        user_id=user.id,
        title=_generate_title(payload.first_message) if payload.first_message else "Новый чат",
        agent_mode=mode,
        language_code=user.language_code or "ru",
        last_message_at=now,
    )
    session.add(chat)
    await session.flush()
    if payload.first_message:
        msg = AgentChatMessage(
            chat_id=chat.id,
            user_id=user.id,
            role="user",
            content=payload.first_message,
        )
        session.add(msg)
        chat.last_message_at = now
    await session.commit()
    await session.refresh(chat)
    if chat.messages:
        _ = chat.messages
    else:
        chat.messages = []
    return {"chat": _serialize_chat_detail(chat)}


@router.get("/chats/{chat_id}")
async def get_chat(
    chat_id: int,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    chat = await _require_chat_owner(session, chat_id, user.id)
    return {"chat": _serialize_chat_detail(chat)}


@router.patch("/chats/{chat_id}")
async def update_chat(
    chat_id: int,
    payload: ChatUpdate,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    chat = await _require_chat_owner(session, chat_id, user.id)
    if payload.title is not None:
        chat.title = payload.title[:MAX_TITLE_LENGTH]
    if payload.agent_mode is not None and payload.agent_mode in VALID_MODES:
        chat.agent_mode = payload.agent_mode
    if payload.is_archived is not None:
        chat.is_archived = payload.is_archived
    await session.commit()
    await session.refresh(chat)
    return {"chat": _serialize_chat(chat)}


@router.delete("/chats/{chat_id}")
async def archive_chat(
    chat_id: int,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    chat = await _require_chat_owner(session, chat_id, user.id)
    chat.is_archived = True
    await session.commit()
    return {"ok": True}


@router.post("/chats/{chat_id}/messages")
async def send_message(
    chat_id: int,
    payload: MessageCreate,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    content = (payload.content or "").strip()
    if not content:
        raise AppError("empty_message", "Сообщение не может быть пустым")

    chat = await session.scalar(
        select(AgentChat)
        .where(AgentChat.id == chat_id, AgentChat.user_id == user.id, AgentChat.is_archived.is_(False))
        .options(selectinload(AgentChat.messages))
    )
    if not chat:
        raise AppError("chat_not_found", "Чат не найден", 404)

    now = datetime.now(timezone.utc)

    # Save user message
    user_msg = AgentChatMessage(
        chat_id=chat.id,
        user_id=user.id,
        role="user",
        content=content,
    )
    session.add(user_msg)
    await session.flush()

    # Update title on first user message
    existing_user_msgs = [m for m in (chat.messages or []) if m.role == "user"]
    if len(existing_user_msgs) <= 1:
        chat.title = _generate_title(content)

    # Build context
    system_parts = [get_system_prompt(chat.agent_mode)]

    profile_ctx = await _get_profile_context(session, user.id)
    if profile_ctx:
        system_parts.append(profile_ctx)

    system_prompt = "\n\n".join(system_parts)

    # Get recent message history
    history_msgs = [m for m in (chat.messages or []) if m.role in ("user", "assistant")][-MAX_CONTEXT_MESSAGES:]
    conversation = [{"role": m.role, "content": m.visible_content or m.content} for m in history_msgs]
    conversation.append({"role": "user", "content": content})

    # Build full prompt for ai_chat generation
    prompt_lines = [f"[System: {system_prompt}]"]
    for msg in conversation:
        role_label = "User" if msg["role"] == "user" else "Assistant"
        prompt_lines.append(f"{role_label}: {msg['content']}")
    full_prompt = "\n".join(prompt_lines)

    # Charge tokens
    balance_before, balance_after = await apply_balance_operation(
        session, user.id, -AI_CHAT_COST, "agent_chat_debit",
        reason=f"Agent chat {chat.id} message",
        metadata={"chat_id": chat.id, "agent_mode": chat.agent_mode},
    )

    # Create generation task
    model = await session.scalar(select(AIModel).where(AIModel.code == "ai_chat"))
    if not model:
        raise AppError("model_not_found", "AI Chat model not found", 500)

    task = GenerationTask(
        user_id=user.id,
        model_id=model.id,
        provider=model.provider,
        task_type="text",
        status="queued",
        prompt=full_prompt[:4000],
        cost_credits=AI_CHAT_COST,
    )
    session.add(task)
    await session.flush()

    # Enqueue generation
    process_generation_task.delay(task.id)

    chat.last_message_at = now
    await session.commit()

    logger.info(
        "AGENT_CHAT_MESSAGE chat_id=%s user_id=%s task_id=%s mode=%s cost=%s balance=%s→%s",
        chat.id, user.id, task.id, chat.agent_mode, AI_CHAT_COST, balance_before, balance_after,
    )

    return {
        "user_message": _serialize_message(user_msg),
        "task_id": task.id,
        "balance_before": balance_before,
        "balance_after": balance_after,
        "cost": AI_CHAT_COST,
    }


@router.post("/chats/{chat_id}/messages/{user_message_id}/reply")
async def reply_to_message(
    chat_id: int,
    user_message_id: int,
    payload: MessageReply,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    chat = await _require_chat_owner(session, chat_id, user.id)
    content = (payload.content or "").strip()
    if not content:
        raise AppError("empty_reply", "Ответ не может быть пустым")

    # Verify user message exists and belongs to this chat
    user_msg = await session.get(AgentChatMessage, user_message_id)
    if not user_msg or user_msg.chat_id != chat.id or user_msg.role != "user":
        raise AppError("message_not_found", "Сообщение не найдено", 404)

    now = datetime.now(timezone.utc)

    assistant_msg = AgentChatMessage(
        chat_id=chat.id,
        user_id=user.id,
        role="assistant",
        content=content,
        task_id=payload.task_id,
        token_cost=AI_CHAT_COST,
    )
    session.add(assistant_msg)
    chat.last_message_at = now
    await session.commit()
    await session.refresh(assistant_msg)

    logger.info(
        "AGENT_CHAT_REPLY chat_id=%s user_message_id=%s assistant_message_id=%s",
        chat.id, user_message_id, assistant_msg.id,
    )

    return {"assistant_message": _serialize_message(assistant_msg)}


# --- Admin endpoints ---

@router.get("/admin/users/{user_id}/chats")
async def admin_user_chats(
    user_id: int,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
    limit: int = Query(default=20, ge=1, le=100),
) -> dict:
    if not user.is_admin:
        raise AppError("forbidden", "Доступ запрещён", 403)
    result = await session.execute(
        select(AgentChat)
        .where(AgentChat.user_id == user_id)
        .options(selectinload(AgentChat.messages))
        .order_by(desc(AgentChat.last_message_at))
        .limit(limit)
    )
    chats = list(result.scalars().all())
    return {"chats": [_serialize_chat(c) for c in chats], "count": len(chats)}
