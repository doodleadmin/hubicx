"""Agent chat service — direct async LLM call, server-side persistence, refund on error."""

import json
import logging
from datetime import datetime, timezone
from typing import AsyncGenerator

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import AgentChat, AgentChatMessage, AIModel, UserProfileSettings
from backend.app.services.agent_modes import DEFAULT_MODE, get_system_prompt
from backend.app.services.balance import apply_balance_operation
from backend.app.utils.errors import AppError

logger = logging.getLogger(__name__)

AI_CHAT_COST = 3
MAX_CONTEXT_MESSAGES = 20
SUPPORTED_CHAT_MODELS = {"ai_chat", "prompt_helper"}

LANG_INSTRUCTIONS = {
    "ru": "Отвечай на русском языке.",
    "en": "Reply in English.",
    "es": "Responde en español.",
    "pt": "Responda em português.",
}


async def _resolve_model_id(session: AsyncSession, preferred_code: str | None) -> tuple[str, str]:
    """Return (model_code, provider_model_id) for the chat model.

    Falls back to ai_chat if preferred model is unavailable or not text-capable.
    """
    code = preferred_code if preferred_code in SUPPORTED_CHAT_MODELS else "ai_chat"
    model = await session.scalar(select(AIModel).where(AIModel.code == code, AIModel.is_active.is_(True)))
    if not model:
        model = await session.scalar(select(AIModel).where(AIModel.code == "ai_chat"))
    if not model:
        raise AppError("model_not_found", "AI Chat model not found", 500)
    return model.code, model.provider_model_id


def _parse_json_field(raw: str | None) -> dict:
    if not raw:
        return {}
    try:
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, dict) else {}
    except (json.JSONDecodeError, TypeError):
        return {}


def _build_profile_context(profile: UserProfileSettings | None) -> str:
    if not profile:
        return ""
    parts: list[str] = []

    about = _parse_json_field(profile.about_user)
    if about.get("name"):
        parts.append(f"Имя пользователя: {about['name']}")
    if about.get("gender") and about["gender"] not in ("Не указывать", ""):
        parts.append(f"Пол: {about['gender']}")
    if about.get("age"):
        parts.append(f"Возраст: {about['age']}")
    if about.get("location"):
        parts.append(f"Город: {about['location']}")
    if about.get("timezone"):
        parts.append(f"Часовой пояс: {about['timezone']}")
    if about.get("activity"):
        parts.append(f"Чем занимается: {about['activity']}")
    if about.get("interests"):
        parts.append(f"Интересы: {about['interests']}")

    personality = _parse_json_field(profile.hubicx_personality)
    if personality.get("traits"):
        parts.append(f"Личность помощника: {personality['traits']}")

    if profile.communication_style:
        parts.append(f"Стиль общения: {profile.communication_style}")
    if profile.persona_emoji:
        parts.append(f"Эмодзи: {profile.persona_emoji}")

    return "\n".join(parts)


def _build_system_prompt(agent_mode: str, language_code: str, profile: UserProfileSettings | None) -> str:
    parts = [get_system_prompt(agent_mode)]
    lang_instr = LANG_INSTRUCTIONS.get(language_code)
    if lang_instr:
        parts.append(lang_instr)
    profile_ctx = _build_profile_context(profile)
    if profile_ctx:
        parts.append(profile_ctx)
    return "\n\n".join(parts)


def _build_messages(
    system_prompt: str,
    history: list[AgentChatMessage],
    new_content: str,
) -> list[dict]:
    """Build OpenRouter-compatible messages array with history window."""
    history_window = [m for m in history if m.role in ("user", "assistant")][-MAX_CONTEXT_MESSAGES:]
    messages: list[dict] = [{"role": "system", "content": system_prompt}]
    for m in history_window:
        messages.append({"role": m.role, "content": m.visible_content or m.content})
    messages.append({"role": "user", "content": new_content})
    return messages


async def run_chat_turn(
    session: AsyncSession,
    user_id: int,
    chat: AgentChat,
    content: str,
) -> tuple[AgentChatMessage, AgentChatMessage]:
    """Execute one chat turn: save user msg → charge → call LLM → save assistant msg.

    Returns (user_message, assistant_message).
    Refunds tokens automatically on LLM error.
    """
    from backend.app.providers.openrouter import OpenRouterProvider

    now = datetime.now(timezone.utc)

    # Save user message first
    user_msg = AgentChatMessage(
        chat_id=chat.id,
        user_id=user_id,
        role="user",
        content=content,
    )
    session.add(user_msg)
    await session.flush()

    # Update title on first user message
    existing_user_count = sum(1 for m in (chat.messages or []) if m.role == "user")
    if existing_user_count <= 1:
        words = content.strip().split()
        title = " ".join(words[:8])
        if len(title) > 60:
            title = title[:60].rsplit(" ", 1)[0] + "…"
        chat.title = title or "Новый чат"

    # Load profile for context + model preference
    profile = await session.scalar(
        select(UserProfileSettings).where(UserProfileSettings.user_id == user_id)
    )

    # Resolve model
    preferred = profile.preferred_llm_model if profile else None
    model_code, provider_model_id = await _resolve_model_id(session, preferred)

    # Build LLM messages
    system_prompt = _build_system_prompt(chat.agent_mode, chat.language_code, profile)
    messages = _build_messages(system_prompt, chat.messages or [], content)

    # Charge tokens (before call — same as existing behaviour)
    balance_before, balance_after = await apply_balance_operation(
        session, user_id, -AI_CHAT_COST, "agent_chat_debit",
        reason=f"Agent chat {chat.id} message",
        metadata={"chat_id": chat.id, "agent_mode": chat.agent_mode, "model": model_code},
    )
    charged = True

    # Call LLM
    provider = OpenRouterProvider()
    result = await provider.generate_chat(provider_model_id, messages)

    if not result.success or not result.output_text:
        # Refund on failure
        await apply_balance_operation(
            session, user_id, AI_CHAT_COST, "agent_chat_refund",
            reason=f"Refund for failed agent chat turn in chat {chat.id}",
            metadata={"chat_id": chat.id},
        )
        charged = False
        error_text = result.error or "Ошибка генерации"
        assistant_msg = AgentChatMessage(
            chat_id=chat.id,
            user_id=user_id,
            role="assistant",
            content=error_text,
            visible_content="Ошибка: не удалось получить ответ. Попробуй ещё раз.",
            token_cost=0,
        )
        session.add(assistant_msg)
        chat.last_message_at = now
        await session.commit()
        await session.refresh(user_msg)
        await session.refresh(assistant_msg)
        logger.warning(
            "AGENT_CHAT_FAIL chat_id=%s user_id=%s model=%s error=%s",
            chat.id, user_id, model_code, result.error,
        )
        return user_msg, assistant_msg

    # Save assistant message
    assistant_msg = AgentChatMessage(
        chat_id=chat.id,
        user_id=user_id,
        role="assistant",
        content=result.output_text,
        token_cost=AI_CHAT_COST,
    )
    session.add(assistant_msg)
    chat.last_message_at = now
    await session.commit()
    await session.refresh(user_msg)
    await session.refresh(assistant_msg)

    logger.info(
        "AGENT_CHAT_OK chat_id=%s user_id=%s model=%s balance=%s→%s",
        chat.id, user_id, model_code, balance_before, balance_after,
    )
    return user_msg, assistant_msg


async def stream_chat_turn(
    session: AsyncSession,
    user_id: int,
    chat: AgentChat,
    content: str,
) -> AsyncGenerator[str, None]:
    """Streaming variant: yields text chunks, saves assistant msg at the end.

    Yields SSE lines: 'data: <chunk>\\n\\n', ends with 'data: [DONE]\\n\\n'.
    Refunds on error, yields 'data: [ERROR] <message>\\n\\n' before closing.
    """
    from backend.app.providers.openrouter import OpenRouterProvider

    now = datetime.now(timezone.utc)

    # Save user message
    user_msg = AgentChatMessage(
        chat_id=chat.id,
        user_id=user_id,
        role="user",
        content=content,
    )
    session.add(user_msg)
    await session.flush()

    existing_user_count = sum(1 for m in (chat.messages or []) if m.role == "user")
    if existing_user_count <= 1:
        words = content.strip().split()
        title = " ".join(words[:8])
        if len(title) > 60:
            title = title[:60].rsplit(" ", 1)[0] + "…"
        chat.title = title or "Новый чат"

    profile = await session.scalar(
        select(UserProfileSettings).where(UserProfileSettings.user_id == user_id)
    )
    preferred = profile.preferred_llm_model if profile else None
    model_code, provider_model_id = await _resolve_model_id(session, preferred)

    system_prompt = _build_system_prompt(chat.agent_mode, chat.language_code, profile)
    messages = _build_messages(system_prompt, chat.messages or [], content)

    # Charge upfront
    await apply_balance_operation(
        session, user_id, -AI_CHAT_COST, "agent_chat_debit",
        reason=f"Agent chat {chat.id} stream",
        metadata={"chat_id": chat.id, "agent_mode": chat.agent_mode, "model": model_code},
    )
    await session.commit()

    provider = OpenRouterProvider()
    full_text = ""
    error: str | None = None

    try:
        async for chunk in provider.stream_chat(provider_model_id, messages):
            full_text += chunk
            yield f"data: {json.dumps({'text': chunk})}\n\n"
    except Exception as exc:
        error = str(exc)
        logger.exception("AGENT_CHAT_STREAM_FAIL chat_id=%s user_id=%s", chat.id, user_id)

    # Re-open session for saving (session may have been used across yield points)
    if error or not full_text:
        # Refund
        await apply_balance_operation(
            session, user_id, AI_CHAT_COST, "agent_chat_refund",
            reason=f"Refund for failed stream in chat {chat.id}",
            metadata={"chat_id": chat.id},
        )
        err_visible = "Ошибка: не удалось получить ответ. Попробуй ещё раз."
        session.add(AgentChatMessage(
            chat_id=chat.id, user_id=user_id, role="assistant",
            content=error or "stream_error", visible_content=err_visible, token_cost=0,
        ))
        chat.last_message_at = now
        await session.commit()
        yield f"data: {json.dumps({'error': err_visible})}\n\n"
        yield "data: [DONE]\n\n"
        return

    session.add(AgentChatMessage(
        chat_id=chat.id, user_id=user_id, role="assistant",
        content=full_text, token_cost=AI_CHAT_COST,
    ))
    chat.last_message_at = now
    await session.commit()

    yield f"data: {json.dumps({'user_message_id': user_msg.id})}\n\n"
    yield "data: [DONE]\n\n"
