"""
T-Bank (Tinkoff) Internet Acquiring — платёжная форма банка (non-PCI).

Документация: https://developer.tbank.ru/eacq

Поток:
1.  Backend вызывает POST /v2/Init с подписью Token
2.  T-Bank возвращает PaymentURL
3.  Клиент перенаправляется на платёжную форму
4.  T-Bank шлёт уведомление (Notification) на наш webhook
5.  Backend проверяет Token уведомления и обрабатывает статус
"""

import hashlib
import secrets
from typing import Any

import httpx

from backend.app.config import settings


TBANK_API_BASE = "https://securepay.tinkoff.ru/v2"
TBANK_TEST_BASE = "https://securepay.tinkoff.ru/v2"


def _api_base() -> str:
    """В тестовом режиме используем тот же endpoint, но с тестовыми ключами."""
    return TBANK_API_BASE


def _terminal_key(channel: str = "desktop") -> str:
    if channel == "webapp" and settings.tbank_webapp_terminal_key:
        return settings.tbank_webapp_terminal_key
    return settings.tbank_terminal_key


def _password(channel: str = "desktop") -> str:
    if channel == "webapp" and settings.tbank_webapp_password:
        return settings.tbank_webapp_password
    return settings.tbank_password


def _channel_for_terminal_key(terminal_key: str | None) -> str:
    if terminal_key and terminal_key == settings.tbank_webapp_terminal_key:
        return "webapp"
    return "desktop"


def _generate_order_id() -> str:
    """Генерирует уникальный OrderId для T-Bank.

    T-Bank требует ASCII-цифры/буквы до 50 символов.  Используем timestamp + random.
    """
    ts = secrets.token_hex(6)  # 12 hex chars
    return f"hx{ts}"


def _sign(params: dict[str, Any], channel: str = "desktop") -> str:
    """Генерирует Token (SHA-256 подпись) для запроса/уведомления.

    Алгоритм (из документации T-Bank):
    1. Взять все пары ключ:значение из тела запроса (кроме вложенных объектов)
    2. Добавить Password
    3. Отсортировать по ключу алфавитно
    4. Конкатенировать все значения в одну строку
    5. Применить SHA-256
    """
    # 1. Плоские поля + пропускаем None и вложенные объекты
    flat: dict[str, str] = {}
    for key, raw in params.items():
        if raw is None:
            continue
        if isinstance(raw, (dict, list)):
            continue
        # Нормализуем булевы: True → "true", False → "false"
        if isinstance(raw, bool):
            flat[key] = "true" if raw else "false"
        else:
            flat[key] = str(raw)

    # 2. Добавляем Password
    flat["Password"] = _password(channel)

    # 3-4. Сортируем и конкатенируем
    parts: list[str] = []
    for key in sorted(flat):
        parts.append(flat[key])

    raw = "".join(parts)

    # 5. SHA-256
    return hashlib.sha256(raw.encode()).hexdigest()


async def init_payment(
    amount_kopecks: int,
    order_id: str,
    description: str = "",
    notification_url: str = "",
    success_url: str = "",
    fail_url: str = "",
    customer_key: str | None = None,
    receipt: dict | None = None,
    channel: str = "desktop",
) -> dict[str, Any]:
    """Вызывает POST /v2/Init платёжной формы T-Bank.

    Args:
        amount_kopecks: Сумма в копейках
        order_id: Уникальный ID заказа
        description: Описание (показывается на платёжной форме)
        notification_url: URL для уведомлений (наш webhook)
        success_url: URL при успешной оплате
        fail_url: URL при неудаче
        customer_key: Ключ клиента для сохранения карты
        receipt: Чек для 54-ФЗ

    Returns:
        Ответ T-Bank с PaymentURL и PaymentId
    """
    body: dict[str, Any] = {
        "TerminalKey": _terminal_key(channel),
        "Amount": str(amount_kopecks),
        "OrderId": order_id,
        "Description": description,
    }

    if notification_url:
        body["NotificationURL"] = notification_url
    if success_url:
        body["SuccessURL"] = success_url
    if fail_url:
        body["FailURL"] = fail_url
    if customer_key:
        body["CustomerKey"] = customer_key
    if receipt:
        body["Receipt"] = receipt

    body["Token"] = _sign(body, channel)

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(f"{_api_base()}/Init", json=body)
        resp.raise_for_status()
        data = resp.json()

    if not data.get("Success"):
        error_code = data.get("ErrorCode", "UNKNOWN")
        error_msg = data.get("Message", data.get("Details", "T-Bank Init failed"))
        raise TbankError(error_code, error_msg)

    return data


def verify_notification(notification: dict[str, Any]) -> bool:
    """Проверяет Token входящего уведомления от T-Bank.

    Returns:
        True если подпись верна
    """
    if "Token" not in notification:
        return False

    expected = notification["Token"]

    # Строим подпись из тех же полей (без Token, Receipt, DATA и т.п.)
    verify_params = {k: v for k, v in notification.items() if k != "Token"}
    actual = _sign(verify_params, _channel_for_terminal_key(notification.get("TerminalKey")))

    return actual == expected


class TbankError(Exception):
    """Ошибка API T-Bank."""

    def __init__(self, code: str, message: str) -> None:
        self.code = code
        self.message = message
        super().__init__(f"[{code}] {message}")
