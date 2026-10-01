import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from backend.app.services import agent_chat
from backend.app.services.business import SUBSCRIPTION_PLANS_V2
from backend.app.utils.errors import AppError


def session_with(user):
    return SimpleNamespace(scalar=AsyncMock(return_value=user))


CHAT = SimpleNamespace(id=5, agent_mode="general")


class ChatCreditTests(unittest.IsolatedAsyncioTestCase):
    async def test_bundled_messages_are_spent_before_tokens(self):
        user = SimpleNamespace(id=1, chat_credits=2)
        with patch.object(agent_chat, "apply_balance_operation", new=AsyncMock()) as debit:
            source = await agent_chat._charge_chat_message(session_with(user), 1, CHAT, "ai_chat")
        self.assertEqual(source, "chat_credit")
        self.assertEqual(user.chat_credits, 1)
        debit.assert_not_awaited()

    async def test_falls_back_to_one_token(self):
        user = SimpleNamespace(id=1, chat_credits=0)
        with patch.object(agent_chat, "apply_balance_operation", new=AsyncMock()) as debit:
            source = await agent_chat._charge_chat_message(session_with(user), 1, CHAT, "ai_chat")
        self.assertEqual(source, "tokens")
        self.assertEqual(debit.await_args.args[2], -1)

    async def test_clear_message_when_nothing_left(self):
        user = SimpleNamespace(id=1, chat_credits=0)
        failing = AsyncMock(side_effect=AppError("not_enough_balance", "x"))
        with patch.object(agent_chat, "apply_balance_operation", new=failing):
            with self.assertRaises(AppError) as ctx:
                await agent_chat._charge_chat_message(session_with(user), 1, CHAT, "ai_chat")
        self.assertEqual(ctx.exception.code, "not_enough_chat_balance")

    async def test_refund_returns_the_same_kind(self):
        user = SimpleNamespace(id=1, chat_credits=0)
        await agent_chat._refund_chat_message(session_with(user), 1, CHAT, "chat_credit")
        self.assertEqual(user.chat_credits, 1)

    def test_every_plan_includes_chat_messages(self):
        for plan in SUBSCRIPTION_PLANS_V2:
            self.assertGreater(plan["chat_messages_per_month"], 0, plan["code"])


if __name__ == "__main__":
    unittest.main()
