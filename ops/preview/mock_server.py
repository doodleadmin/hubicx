"""Local UI preview server: serves webapp/public and answers API calls with demo data.

No backend, database or Docker needed. Nothing is sent to api.hubicx.ru: a small
script injected into every HTML page reroutes API requests to /__mock/api/* here.

Run from the repository root:  python ops/preview/mock_server.py [port]
  Telegram Mini App:  http://localhost:3000/            (opens /app/index.html; shown phone-sized on wide screens)
  Site landing:       http://localhost:3000/app/desktop.html
"""
import importlib.util
import json
import os
import re
import sys
import threading
import time
from datetime import datetime, timedelta, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PUBLIC = os.path.join(ROOT, "webapp", "public")
TEMPLATES_DIR = os.path.join(PUBLIC, "app", "assets", "templates")
MOCK_PREFIX = "/__mock/api"
GENERATION_SECONDS = 8


# Price data lives in backend.app.services.model_pricing_catalog (dependency-free).
sys.path.insert(0, ROOT)


def load_module(name: str, *parts: str):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, *parts))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


seed_models = load_module("preview_seed_models", "backend", "seed_models.py")
pricing_catalog = load_module("preview_pricing_catalog", "backend", "app", "services", "model_pricing_catalog.py")
business = load_module("preview_business", "backend", "app", "services", "business.py")

SHIM = """<script>
/* Hubicx local preview: demo session + API calls rerouted to the local mock server. */
(function() {
  var API = 'https://api.hubicx.ru';
  try { if (!localStorage.getItem('hubicx_jwt')) localStorage.setItem('hubicx_jwt', 'preview-mock-session'); } catch (e) {}
  var nativeFetch = window.fetch;
  window.fetch = function(input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf(API + '/api/') === 0) input = '/__mock' + url.slice(API.length);
    return nativeFetch.call(this, input, init);
  };
  window.__HUBICX_PREVIEW_MOCK__ = true;
})();
</script>
<style>
/* Preview only: on a wide screen show the Mini App phone-sized, as Telegram does. */
@media (min-width: 600px) {
  html:not(.desktop) body { background: #000 !important; }
  html:not(.desktop) #root {
    max-width: 430px; margin: 0 auto; min-height: 100vh;
    box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 30px 120px rgba(0,0,0,.6);
  }
}
</style>"""

# Analytics must not receive hits from a local preview.
ANALYTICS_URLS = (
    "https://www.googletagmanager.com/gtag/js",
    "https://mc.yandex.ru/metrika/tag.js",
)


def iso(dt: datetime) -> str:
    return dt.isoformat()


def now() -> datetime:
    return datetime.now(timezone.utc)


def template_covers(kind: str, filename: str) -> list[str]:
    base = os.path.join(TEMPLATES_DIR, kind)
    if not os.path.isdir(base):
        return []
    return [
        f"/app/assets/templates/{kind}/{name}/{filename}"
        for name in sorted(os.listdir(base))
        if os.path.isfile(os.path.join(base, name, filename))
    ]


PHOTO_OUTPUTS = template_covers("photo", "cover.webp")
VIDEO_OUTPUTS = template_covers("video", "cover.mp4")


def public_models() -> list[dict]:
    models = []
    for index, model in enumerate(seed_models.AI_MODELS_CATALOG, start=1):
        if not model.get("is_active", True):
            continue
        models.append({
            "id": index,
            "code": model["code"],
            "title": model.get("title") or model["code"],
            "description": model.get("description"),
            "category": model.get("category"),
            "provider": model.get("provider"),
            "task_type": model.get("task_type"),
            "input_type": model.get("input_type"),
            # Same as production: model_pricing (seeded from the catalog) wins over the model's own price.
            "price_credits": int(pricing_catalog.MODEL_PRICING.get(model["code"], {}).get("price_tokens") or model.get("price_credits") or 0),
            "price_rules": pricing_catalog.MODEL_PRICING.get(model["code"], {}).get("price_rules"),
            "default_params": model.get("default_params"),
            "form_schema": model.get("form_schema"),
            "is_active": True,
            "sort_order": int(model.get("sort_order") or 0),
        })
    models.sort(key=lambda m: (m["sort_order"], m["id"]))
    return models


MODELS = public_models()
MODELS_BY_CODE = {m["code"]: m for m in MODELS}


def pricing_payload() -> dict:
    packages = []
    for index, pkg in enumerate(business.TOKEN_PACKAGES_V2, start=1):
        total = pkg["total_tokens"]
        packages.append({
            "id": index,
            "code": pkg["code"],
            "title": pkg["title"],
            "tokens": total,
            "price_rub": pkg["price_rub"],
            "base_tokens": pkg["base_tokens"],
            "bonus_tokens": pkg["bonus_tokens"],
            "total_tokens": total,
            "effective_price_per_token": round(pkg["price_rub"] / total, 2) if total else 0,
            "is_active": True,
            "sort_order": pkg["sort_order"],
        })
    return {
        "token_packages": packages,
        "subscription_plans": business.SUBSCRIPTION_PLANS_V2,
        "bonus_program": {
            "title": "50 токенов сразу + бонусы за задания после проверки",
            "total_tokens": business.BONUS_TOTAL_TOKENS,
            "note": "Бонусные токены доступны для базовых фото-моделей и простых сценариев.",
            "tasks": business.BONUS_TASKS_V2,
        },
        "custom_topup": {"enabled": True, "payments_enabled": False, "min_amount_rub": 100, "rub_to_token_rate": 1, "bonus_tokens": 0},
        "model_prices": [],
        "payments_enabled": False,
    }


class State:
    """In-memory demo account. Resets on every server restart."""

    def __init__(self) -> None:
        self.lock = threading.Lock()
        plan = business.SUBSCRIPTION_PLANS_V2[-1]
        started = now() - timedelta(days=9)
        self.user = {
            "id": 1,
            "telegram_id": 100000001,
            "email": "demo@hubicx.local",
            "has_password": True,
            "username": "demo_user",
            "first_name": "Демо",
            "photo_url": None,
            "language_code": "ru",
            "language_selected": True,
            "balance_credits": 155,
            "bonus_credits": 0,
            "chat_credits": plan.get("chat_messages_per_month", 0),
            "is_admin": False,
            "is_banned": False,
            "ref_code": "DEMO2026",
            "referrer_id": None,
            "referred_by_partner_id": None,
            "created_at": iso(now() - timedelta(days=40)),
            "subscription": {
                "id": 1,
                "user_id": 1,
                "code": plan["code"],
                "title": plan["title"],
                "kind": "full",
                "tokens_per_month": plan.get("tokens_per_month", 0),
                "price_rub": plan.get("price_rub", 0),
                "is_active": True,
                "started_at": iso(started),
                "expires_at": iso(started + timedelta(days=30)),
            },
        }
        self.profile = {
            "language_code": "ru",
            "preferred_llm_model": "ai_chat",
            "daily_enabled": False,
            "hubicx_personality": None,
            "about_user": None,
            "communication_style": None,
            "persona_emoji": None,
        }
        self.claimed_bonuses: set[str] = set()
        # Partner program demo: matured and on-hold commissions plus balance debits.
        self.partner_matured = 3240.0
        self.partner_hold = 486.0
        self.partner_ops: list[dict] = [
            {"id": 2, "kind": "purchase", "status": "paid", "amount_rub": 790.0, "details": "Шаблоны Mini", "created_at": iso(now() - timedelta(days=6))},
            {"id": 1, "kind": "withdrawal", "status": "paid", "amount_rub": 1000.0, "details": "Карта •• 4242", "created_at": iso(now() - timedelta(days=12))},
        ]
        self.tasks: dict[int, dict] = {}
        self.next_task_id = 1
        self.chats: dict[int, dict] = {}
        self.next_chat_id = 1
        self.next_message_id = 1
        self.next_file_id = 1
        self._seed_history()
        self._seed_chats()

    def _seed_history(self) -> None:
        prompts = [
            "Портрет в тёплом закатном свете, плёночное зерно",
            "Неоновая улица под дождём, кинематографичный кадр",
            "Минималистичный предметный кадр на светлом фоне",
            "Ретро-полароид с вечеринки, вспышка",
            "Горный пейзаж на рассвете, широкий угол",
            "Студийный портрет, мягкий контровой свет",
        ]
        photo_model = next((m for m in MODELS if m["category"] == "photo"), None)
        video_model = next((m for m in MODELS if m["category"] == "video"), None)
        for index, prompt in enumerate(prompts):
            is_video = bool(VIDEO_OUTPUTS and video_model and index in (1, 4))
            model = video_model if is_video else photo_model
            outputs = VIDEO_OUTPUTS if is_video else PHOTO_OUTPUTS
            created = now() - timedelta(hours=3 + index * 7)
            self._add_task(
                model=model,
                prompt=prompt,
                created=created,
                output=outputs[index % len(outputs)] if outputs else None,
                completed=created + timedelta(seconds=40),
            )

    def _seed_chats(self) -> None:
        self.add_chat("general", "Идеи для фотосессии", [
            ("user", "Придумай три идеи для осенней фотосессии в городе"),
            ("assistant", "1. Золотой час на набережной — тёплый контровой свет и длинные тени.\n2. Кофейня у окна в дождь — отражения и мягкий боке.\n3. Старый двор с листвой — плёночная цветокоррекция и крупные планы."),
        ])
        self.add_chat("general", "Промпт для видео", [
            ("user", "Помоги написать промпт для короткого видео с продуктом"),
            ("assistant", "Попробуйте так: «Флакон духов на мокром чёрном камне, медленный облёт камеры, капли воды, мягкий боковой свет, макро, 5 секунд»."),
        ])

    def _add_task(self, model, prompt, created, output=None, completed=None, params=None, template_code=None) -> dict:
        task = {
            "id": self.next_task_id,
            "status": "completed" if completed else "processing",
            "task_type": (model or {}).get("task_type") or "image",
            "prompt": prompt,
            "input_file_url": None,
            "output_file_url": output if completed else None,
            "output_text": None,
            "params": params or {},
            "error_message": None,
            "cost_credits": (model or {}).get("price_credits") or 0,
            "created_at": iso(created),
            "completed_at": iso(completed) if completed else None,
            "model_code": (model or {}).get("code"),
            "template_code": template_code,
            "title": (model or {}).get("title"),
            "_pending_output": None if completed else output,
            "_ready_at": None if completed else time.time() + GENERATION_SECONDS,
        }
        self.tasks[task["id"]] = task
        self.next_task_id += 1
        return task

    def public_task(self, task: dict) -> dict:
        if task["status"] == "processing" and task["_ready_at"] and time.time() >= task["_ready_at"]:
            task["status"] = "completed"
            task["output_file_url"] = task["_pending_output"]
            task["completed_at"] = iso(now())
        return {k: v for k, v in task.items() if not k.startswith("_")}

    def partner_payload(self) -> dict:
        debited = sum(op["amount_rub"] for op in self.partner_ops if op["status"] in ("requested", "approved", "paid"))
        def total(kind, statuses):
            return sum(op["amount_rub"] for op in self.partner_ops if op["kind"] == kind and op["status"] in statuses)
        return {
            "code": "DEMO2026",
            "link": "https://t.me/hubicx_bot?start=ref_DEMO2026",
            "percent": business.PARTNER_COMMISSION_PERCENT,
            "hold_days": business.PARTNER_HOLD_DAYS,
            "min_payout_rub": business.PARTNER_MIN_PAYOUT_RUB,
            "withdrawals_enabled": business.PARTNER_WITHDRAWALS_ENABLED,
            "payout_methods": [{"code": c, "title": t} for c, t in business.PARTNER_PAYOUT_METHODS.items()],
            "invited_count": 14,
            "buyers_count": 5,
            "balance": {
                "available_rub": round(max(0.0, self.partner_matured - debited), 2),
                "hold_rub": self.partner_hold,
                "earned_total_rub": round(self.partner_matured + self.partner_hold, 2),
                "withdrawn_rub": total("withdrawal", ("paid",)),
                "withdrawal_processing_rub": total("withdrawal", ("requested", "approved")),
                "spent_rub": total("purchase", ("paid",)),
            },
            "operations": sorted(self.partner_ops, key=lambda op: op["id"], reverse=True),
        }

    def partner_available(self) -> float:
        return self.partner_payload()["balance"]["available_rub"]

    def add_partner_op(self, kind: str, status: str, amount: float, details: str) -> None:
        self.partner_ops.append({
            "id": max((op["id"] for op in self.partner_ops), default=0) + 1,
            "kind": kind, "status": status, "amount_rub": round(float(amount), 2),
            "details": details, "created_at": iso(now()),
        })

    def create_generation(self, payload: dict) -> dict:
        model = MODELS_BY_CODE.get(payload.get("model_code") or "")
        is_video = bool(model and model.get("category") == "video")
        outputs = (VIDEO_OUTPUTS if is_video else PHOTO_OUTPUTS) or PHOTO_OUTPUTS
        output = outputs[self.next_task_id % len(outputs)] if outputs else None
        inputs = payload.get("inputs") or payload.get("params") or {}
        task = self._add_task(
            model=model,
            prompt=payload.get("prompt") or inputs.get("prompt"),
            created=now(),
            output=output,
            params=inputs,
            template_code=payload.get("template_code"),
        )
        self.user["balance_credits"] = max(0, self.user["balance_credits"] - int(task["cost_credits"] or 0))
        return {"task_id": task["id"], "status": task["status"]}

    def add_chat(self, mode: str, title: str, messages=()) -> dict:
        created = now()
        chat = {
            "id": self.next_chat_id,
            "title": title,
            "agent_mode": mode,
            "language_code": "ru",
            "is_archived": False,
            "last_message_at": iso(created),
            "created_at": iso(created),
            "updated_at": iso(created),
            "messages": [],
        }
        self.next_chat_id += 1
        self.chats[chat["id"]] = chat
        for role, content in messages:
            self.add_message(chat, role, content)
        return chat

    def add_message(self, chat: dict, role: str, content: str) -> None:
        chat["messages"].append({
            "id": self.next_message_id,
            "chat_id": chat["id"],
            "role": role,
            "content": content,
            "task_id": None,
            "token_cost": 0,
            "created_at": iso(now()),
        })
        self.next_message_id += 1
        chat["last_message_at"] = iso(now())

    @staticmethod
    def chat_summary(chat: dict) -> dict:
        data = {k: v for k, v in chat.items() if k != "messages"}
        data["message_count"] = len(chat["messages"])
        return data

    @staticmethod
    def chat_detail(chat: dict) -> dict:
        data = State.chat_summary(chat)
        data["messages"] = chat["messages"]
        return data


STATE = State()
DEMO_REPLY = (
    "Это демо-ответ локального предпросмотра: бэкенд и нейросети не подключены, "
    "поэтому текст заранее заготовлен. В рабочей версии здесь будет ответ модели."
)


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC, **kwargs)

    def log_message(self, format, *args):  # noqa: A002 - signature is fixed by the base class
        pass

    # ---- helpers -------------------------------------------------------
    def send_json(self, payload, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, status: int, code: str, detail: str) -> None:
        self.send_json({"code": code, "detail": detail}, status)

    def read_body(self) -> bytes:
        length = int(self.headers.get("Content-Length") or 0)
        return self.rfile.read(length) if length > 0 else b""

    def read_json(self) -> dict:
        try:
            data = json.loads(self.read_body() or b"{}")
        except ValueError:
            return {}
        return data if isinstance(data, dict) else {}

    def send_html(self, file_path: str) -> None:
        with open(file_path, "r", encoding="utf-8") as fh:
            html = fh.read()
        for url in ANALYTICS_URLS:
            html = html.replace(url, "/__mock/noop.js")
        html, injected = re.subn(r"<head[^>]*>", lambda m: m.group(0) + "\n" + SHIM, html, count=1)
        if not injected:
            html = SHIM + html
        body = html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    # ---- routing -------------------------------------------------------
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith(MOCK_PREFIX):
            return self.handle_api("GET", path[len(MOCK_PREFIX):], parse_qs(parsed.query))
        if path == "/__mock/noop.js":
            self.send_response(200)
            self.send_header("Content-Type", "application/javascript")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        if path in ("", "/"):
            self.send_response(302)
            self.send_header("Location", "/app/index.html")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        file_path = self.translate_path(path)
        if os.path.isdir(file_path):
            file_path = os.path.join(file_path, "index.html")
        if file_path.endswith(".html") and os.path.isfile(file_path):
            return self.send_html(file_path)
        if not os.path.exists(file_path) and "." not in os.path.basename(file_path):
            # Desktop workspace routes (/generation, /history, ...) are client-side.
            return self.send_html(os.path.join(PUBLIC, "app", "desktop.html"))
        return super().do_GET()

    def do_POST(self):
        self.handle_write("POST")

    def do_PATCH(self):
        self.handle_write("PATCH")

    def do_DELETE(self):
        self.handle_write("DELETE")

    def handle_write(self, method: str) -> None:
        path = urlparse(self.path).path
        if not path.startswith(MOCK_PREFIX):
            self.read_body()
            return self.send_error_json(404, "not_found", "Not found")
        self.handle_api(method, path[len(MOCK_PREFIX):], {})

    def handle_api(self, method: str, path: str, query: dict) -> None:
        with STATE.lock:
            try:
                self.route_api(method, path.rstrip("/"), query)
            except (BrokenPipeError, ConnectionResetError):
                pass

    def route_api(self, method: str, path: str, query: dict) -> None:
        s = STATE
        if method == "GET":
            if path == "/partner":
                return self.send_json(s.partner_payload())
            if path == "/auth/me":
                return self.send_json(s.user)
            if path == "/pricing":
                return self.send_json(pricing_payload())
            if path == "/bonuses":
                return self.send_json({
                    "title": "50 токенов сразу + бонусы за задания после проверки",
                    "total_tokens": business.BONUS_TOTAL_TOKENS,
                    "bonus_credits": s.user["bonus_credits"],
                    "tasks": [
                        {**task, "claimed": task["code"] in s.claimed_bonuses,
                         "claimable": task.get("kind") == "manual_claim" and task["code"] not in s.claimed_bonuses}
                        for task in business.BONUS_TASKS_V2
                    ],
                })
            if path == "/profile":
                return self.send_json(s.profile)
            if path == "/models":
                category = (query.get("category") or [None])[0]
                return self.send_json([m for m in MODELS if not category or m["category"] == category])
            if path.startswith("/models/"):
                model = MODELS_BY_CODE.get(path.split("/")[2])
                return self.send_json(model) if model else self.send_error_json(404, "model_not_found", "Модель не найдена")
            if path == "/generations/history":
                tasks = sorted(s.tasks.values(), key=lambda t: t["id"], reverse=True)
                return self.send_json([s.public_task(t) for t in tasks])
            if path.startswith("/generations/"):
                task = s.tasks.get(self.int_part(path, 2))
                return self.send_json(s.public_task(task)) if task else self.send_error_json(404, "task_not_found", "Задача не найдена")
            if path == "/agent/chats":
                chats = sorted(s.chats.values(), key=lambda c: c["last_message_at"], reverse=True)
                return self.send_json({"chats": [s.chat_summary(c) for c in chats if not c["is_archived"]]})
            if path.startswith("/agent/chats/"):
                chat = s.chats.get(self.int_part(path, 3))
                return self.send_json({"chat": s.chat_detail(chat)}) if chat else self.send_error_json(404, "chat_not_found", "Чат не найден")
            return self.send_error_json(404, "not_found", "Нет в демо-режиме")

        if path == "/files/upload":
            self.read_body()
            url = PHOTO_OUTPUTS[s.next_file_id % len(PHOTO_OUTPUTS)] if PHOTO_OUTPUTS else ""
            s.next_file_id += 1
            return self.send_json({"file_id": s.next_file_id, "url": url})

        if method == "POST" and path.startswith("/agent/chats/") and path.endswith("/stream"):
            return self.stream_chat(s.chats.get(self.int_part(path, 3)), self.read_json())

        payload = self.read_json()
        if path in ("/auth/login", "/auth/register", "/auth/link-telegram"):
            return self.send_json({"token": "preview-mock-session", "user": s.user})
        if path in ("/auth/email/start", "/auth/link-email", "/referral/track", "/referral/click"):
            return self.send_json({"ok": True})
        if path == "/profile" and method == "PATCH":
            s.profile.update({k: v for k, v in payload.items() if k in s.profile})
            return self.send_json(s.profile)
        if path.startswith("/bonuses/") and path.endswith("/claim"):
            code = path.split("/")[2]
            task = next((t for t in business.BONUS_TASKS_V2 if t["code"] == code), None)
            if not task:
                return self.send_error_json(404, "bonus_task_not_found", "Бонусное задание не найдено")
            awarded = code not in s.claimed_bonuses
            if awarded:
                s.claimed_bonuses.add(code)
                s.user["bonus_credits"] += int(task["tokens"])
            return self.send_json({"ok": True, "awarded": awarded, "tokens": int(task["tokens"]),
                                   "bonus_credits": s.user["bonus_credits"], "balance_credits": s.user["balance_credits"]})
        if path.startswith("/models/") and path.endswith("/price-preview"):
            # No server price in the preview: the UI falls back to its own estimate.
            return self.send_json({"model_code": path.split("/")[2], "price_tokens": 0, "final_price_credits": 0, "pricing_source": "preview"})
        if path == "/generations" and method == "POST":
            return self.send_json(s.create_generation(payload))
        if path.startswith("/generations/") and path.endswith("/send-to-chat"):
            return self.send_json({"ok": True, "message": "Демо-режим: отправка в Telegram отключена"})
        if path == "/agent/chats" and method == "POST":
            chat = s.add_chat(payload.get("agent_mode") or "general", "Новый чат")
            if payload.get("first_message"):
                s.add_message(chat, "user", str(payload["first_message"]))
            return self.send_json({"chat": s.chat_detail(chat)})
        if path.startswith("/agent/chats/"):
            chat = s.chats.get(self.int_part(path, 3))
            if not chat:
                return self.send_error_json(404, "chat_not_found", "Чат не найден")
            if method == "DELETE":
                chat["is_archived"] = True
                return self.send_json({"ok": True})
            for key in ("title", "agent_mode", "is_archived"):
                if payload.get(key) is not None:
                    chat[key] = payload[key]
            return self.send_json({"chat": s.chat_detail(chat)})
        if path == "/partner/withdraw" and not business.PARTNER_WITHDRAWALS_ENABLED:
            return self.send_error_json(403, "withdrawals_disabled", "Вывод средств скоро будет доступен")
        if path == "/partner/withdraw":
            amount = float(payload.get("amount_rub") or 0)
            details = payload.get("details") or {}
            if amount < business.PARTNER_MIN_PAYOUT_RUB:
                return self.send_error_json(422, "amount_too_low", f"Минимальная сумма вывода — {business.PARTNER_MIN_PAYOUT_RUB} ₽")
            if amount > s.partner_available():
                return self.send_error_json(422, "insufficient_partner_balance", "Недостаточно средств на партнёрском балансе")
            if len(str(details.get("holder") or "").strip()) < 2:
                return self.send_error_json(422, "invalid_payout_holder", "Укажите имя получателя")
            if payload.get("method") == "card":
                digits = "".join(ch for ch in str(details.get("card") or "") if ch.isdigit())
                if len(digits) < 16:
                    return self.send_error_json(422, "invalid_card_number", "Проверьте номер карты")
                label = f"Карта •• {digits[-4:]}"
            else:
                digits = "".join(ch for ch in str(details.get("phone") or "") if ch.isdigit())
                if len(digits) != 11:
                    return self.send_error_json(422, "invalid_phone", "Укажите номер телефона в формате +7")
                label = f"СБП {details.get('bank') or ''} •• {digits[-4:]}"
            s.add_partner_op("withdrawal", "requested", amount, label)
            return self.send_json({"ok": True, "status": "requested", "partner": s.partner_payload()})
        if path == "/partner/purchase":
            code = payload.get("package_code")
            item = next((p for p in business.SUBSCRIPTION_PLANS_V2 if p["code"] == code), None)
            item = item or next((p for p in business.TOKEN_PACKAGES_V2 if p["code"] == code), None)
            price = float(item["price_rub"]) if item else float(payload.get("amount_rub") or 0)
            credits = int((item or {}).get("tokens_per_month") or (item or {}).get("total_tokens") or price)
            if price <= 0:
                return self.send_error_json(422, "invalid_payment_package", "Выберите тариф или пакет")
            if price > s.partner_available():
                return self.send_error_json(422, "insufficient_partner_balance", "Недостаточно средств на партнёрском балансе")
            s.add_partner_op("purchase", "paid", price, (item or {}).get("title") or f"{credits} токенов")
            s.user["balance_credits"] += credits
            return self.send_json({"ok": True, "credits": credits, "balance_credits": s.user["balance_credits"], "partner": s.partner_payload()})
        if path == "/payments/create":
            return self.send_error_json(400, "preview_mode", "Демо-режим: оплата отключена")
        return self.send_error_json(404, "not_found", "Нет в демо-режиме")

    @staticmethod
    def int_part(path: str, index: int) -> int:
        try:
            return int(path.split("/")[index])
        except (IndexError, ValueError):
            return -1

    def stream_chat(self, chat, payload: dict) -> None:
        if not chat:
            return self.send_error_json(404, "chat_not_found", "Чат не найден")
        content = str(payload.get("content") or "")
        if content:
            STATE.add_message(chat, "user", content)
            if chat["title"] == "Новый чат":
                chat["title"] = content[:40]
        if STATE.user["chat_credits"] > 0:
            STATE.user["chat_credits"] -= 1
        else:
            STATE.user["balance_credits"] = max(0, STATE.user["balance_credits"] - 1)
        STATE.add_message(chat, "assistant", DEMO_REPLY)
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Connection", "close")
        self.end_headers()
        self.close_connection = True
        for word in DEMO_REPLY.split(" "):
            self.wfile.write(("data: " + json.dumps({"text": word + " "}, ensure_ascii=False) + "\n\n").encode("utf-8"))
            self.wfile.flush()
            time.sleep(0.04)
        self.wfile.write(b"data: [DONE]\n\n")
        self.wfile.flush()


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Hubicx preview (demo data): http://localhost:{port}/app/desktop.html", flush=True)
    print(f"Mobile Mini App:            http://localhost:{port}/app/index.html", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
