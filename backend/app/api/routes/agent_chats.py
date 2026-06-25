"""Agent Chat API — backend chat sessions with history, modes, and token ledger."""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.api.deps import current_user
from backend.app.db.models import AgentChat, AgentChatMessage, User
from backend.app.db.session import get_session
from backend.app.services.agent_chat import run_chat_turn, stream_chat_turn
from backend.app.services.agent_modes import DEFAULT_MODE, VALID_MODES, list_modes
from backend.app.services.rate_limit import check_rate_limit
from backend.app.utils.errors import AppError

router = APIRouter(prefix="/agent", tags=["agent"])
logger = logging.getLogger(__name__)

MAX_TITLE_LENGTH = 60
CHAT_RATE_LIMIT = 20  # max messages
CHAT_RATE_WINDOW = 60  # per 60 seconds


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


# --- Helpers ---

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
        "message_count": chat._message_count if hasattr(chat, "_message_count") else (len(chat.messages) if chat.messages is not None else 0),
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
    from sqlalchemy import func
    from backend.app.db.models import AgentChatMessage as Msg

    stmt = (
        select(AgentChat)
        .where(AgentChat.user_id == user.id)
        .order_by(desc(AgentChat.last_message_at))
        .limit(limit)
    )
    if not include_archived:
        stmt = stmt.where(AgentChat.is_archived.is_(False))

    result = await session.execute(stmt)
    chats = list(result.scalars().all())

    # Efficient message counts via subquery — no eager-loading all messages
    if chats:
        chat_ids = [c.id for c in chats]
        counts_result = await session.execute(
            select(Msg.chat_id, func.count(Msg.id).label("cnt"))
            .where(Msg.chat_id.in_(chat_ids))
            .group_by(Msg.chat_id)
        )
        counts = {row.chat_id: row.cnt for row in counts_result}
        for c in chats:
            c._message_count = counts.get(c.id, 0)

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
        title="Новый чат",
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
    chat = await session.scalar(
        select(AgentChat)
        .where(AgentChat.id == chat.id)
        .options(selectinload(AgentChat.messages))
    )
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
    chat = await session.scalar(
        select(AgentChat)
        .where(AgentChat.id == chat_id)
        .options(selectinload(AgentChat.messages))
    )
    return {"chat": _serialize_chat(chat)}


@router.delete("/chats/{chat_id}")
async def archive_chat(
    chat_id: int,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    chat = await session.scalar(
        select(AgentChat).where(AgentChat.id == chat_id, AgentChat.user_id == user.id)
    )
    if not chat:
        raise AppError("chat_not_found", "Чат не найден", 404)
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
    await check_rate_limit(f"chat:{user.id}", CHAT_RATE_LIMIT, CHAT_RATE_WINDOW)

    chat = await session.scalar(
        select(AgentChat)
        .where(AgentChat.id == chat_id, AgentChat.user_id == user.id, AgentChat.is_archived.is_(False))
        .options(selectinload(AgentChat.messages))
    )
    if not chat:
        raise AppError("chat_not_found", "Чат не найден", 404)

    user_msg, assistant_msg = await run_chat_turn(session, user.id, chat, content)

    return {
        "user_message": _serialize_message(user_msg),
        "assistant_message": _serialize_message(assistant_msg),
        "cost": assistant_msg.token_cost or 0,
    }


@router.post("/chats/{chat_id}/stream")
async def stream_message(
    chat_id: int,
    payload: MessageCreate,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> StreamingResponse:
    content = (payload.content or "").strip()
    if not content:
        raise AppError("empty_message", "Сообщение не может быть пустым")
    await check_rate_limit(f"chat:{user.id}", CHAT_RATE_LIMIT, CHAT_RATE_WINDOW)

    chat = await session.scalar(
        select(AgentChat)
        .where(AgentChat.id == chat_id, AgentChat.user_id == user.id, AgentChat.is_archived.is_(False))
        .options(selectinload(AgentChat.messages))
    )
    if not chat:
        raise AppError("chat_not_found", "Чат не найден", 404)

    return StreamingResponse(
        stream_chat_turn(session, user.id, chat, content),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


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
