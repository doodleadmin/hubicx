import asyncio
import logging
from collections.abc import Awaitable, Callable
from typing import Any

from aiogram import BaseMiddleware, Bot, Dispatcher
from aiogram.types import Message, TelegramObject

from bot.config import BACKEND_URL, BOT_TOKEN, WEBAPP_URL
from bot.handlers import admin, balance, history, language, menu, photo, start, templates, text, video

logger = logging.getLogger(__name__)


class IncomingTextLoggingMiddleware(BaseMiddleware):
    async def __call__(self, handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]], event: TelegramObject, data: dict[str, Any]) -> Any:
        if isinstance(event, Message) and event.text and event.from_user:
            logger.info("Incoming message text=%s user_id=%s", event.text, event.from_user.id)
        return await handler(event, data)


async def main() -> None:
    logging.basicConfig(level=logging.INFO)
    if not BOT_TOKEN:
        raise RuntimeError("BOT_TOKEN is required to run bot")
    logger.info("BOT WEBAPP_URL=%s", WEBAPP_URL)
    logger.info("BOT BACKEND_URL=%s", BACKEND_URL)
    bot = Bot(BOT_TOKEN)
    dp = Dispatcher()
    dp.message.middleware(IncomingTextLoggingMiddleware())
    for router in (start.router, language.router, photo.router, video.router, templates.router, text.router, balance.router, history.router, admin.router, menu.router):
        dp.include_router(router)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
