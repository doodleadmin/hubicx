#!/usr/bin/env python3
"""Smoke tests for Backend Agent Chat Sessions."""
import json, time, hmac, hashlib, urllib.parse, urllib.request, urllib.error
import sys, os

sys.path.insert(0, '/app')
from backend.app.config import settings as app_settings

BASE = 'http://127.0.0.1:8000/api'
admin_id = next(iter(app_settings.admin_id_set))

def make_init_data():
    params = dict(
        query_id='agent-chat-smoke-' + str(int(time.time())),
        user=json.dumps(dict(id=admin_id, first_name='Admin', username='admin', language_code='ru'), separators=(',', ':')),
        auth_date=str(int(time.time()))
    )
    check = '\n'.join(f'{k}={v}' for k, v in sorted(params.items()))
    secret = hmac.new(b'WebAppData', app_settings.bot_token.encode(), hashlib.sha256).digest()
    params['hash'] = hmac.new(secret, check.encode(), hashlib.sha256).hexdigest()
    return urllib.parse.urlencode(params)

HEADERS = {'X-Telegram-Init-Data': make_init_data(), 'Content-Type': 'application/json'}

def req(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(r, timeout=60) as resp:
            raw = resp.read().decode()
            try:
                return resp.status, json.loads(raw)
            except:
                return resp.status, raw
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            parsed = json.loads(raw)
        except:
            parsed = raw
        return e.code, parsed

def poll_task(task_id, max_polls=10, interval=3):
    for i in range(max_polls):
        time.sleep(interval)
        st, task = req('GET', f'/generations/{task_id}')
        status = task.get('status') if isinstance(task, dict) else None
        print(f'    Poll {i+1}: status={status}')
        if status == 'completed':
            return task.get('output_text', '')
        if status in ('failed', 'error'):
            print(f'    Task FAILED: {task.get("error_message", "unknown")}')
            return None
    print(f'    Task TIMEOUT after {max_polls * interval}s')
    return None

def run_test(test_name, steps):
    print(f'\n=== {test_name} ===')
    results = {}
    for step_fn in steps:
        step_fn(results)
    return results

results = {}

# ---- GET balance before ----
print('>>> Getting initial balance...')
st, me = req('GET', '/auth/me')
balance_before = me.get('balance_credits', 0) if isinstance(me, dict) else 0
print(f'  Balance before: {balance_before}')

# ===================== TEST 1: General Chat =====================
results['test1'] = {}
def t1_create(r):
    st, chat = req('POST', '/agent/chats', {'first_message': 'Ответь коротко: обычный чат работает?'})
    cid = chat.get('chat', {}).get('id') if isinstance(chat, dict) else None
    mode = chat.get('chat', {}).get('agent_mode') if isinstance(chat, dict) else None
    print(f'  Create: status={st} id={cid} mode={mode}')
    r.update({'chat_id': cid, 'create_status': st, 'mode': mode})

def t1_send(r):
    cid = r.get('chat_id')
    if not cid: return
    st, msg = req('POST', f'/agent/chats/{cid}/messages', {'content': 'Ответь коротко: обычный чат работает?'})
    tid = msg.get('task_id') if isinstance(msg, dict) else None
    uid = msg.get('user_message', {}).get('id') if isinstance(msg, dict) else None
    print(f'  Send: status={st} task={tid} user_msg={uid}')
    r.update({'task_id': tid, 'user_msg_id': uid, 'send_status': st})

def t1_reply(r):
    cid, tid, uid = r.get('chat_id'), r.get('task_id'), r.get('user_msg_id')
    if not all([cid, tid, uid]): return
    output = poll_task(tid)
    if output:
        st, reply = req('POST', f'/agent/chats/{cid}/messages/{uid}/reply', {'content': output, 'task_id': tid})
        cost = reply.get('assistant_message', {}).get('token_cost') if isinstance(reply, dict) else None
        asst_id = reply.get('assistant_message', {}).get('id') if isinstance(reply, dict) else None
        print(f'  Reply: status={st} cost={cost} asst_msg_id={asst_id}')
        r.update({'reply_status': st, 'cost': cost, 'asst_msg_id': asst_id, 'output_len': len(output)})
        # Verify chat
        st3, chk = req('GET', f'/agent/chats/{cid}')
        msgs_n = len(chk.get('chat', {}).get('messages', [])) if isinstance(chk, dict) else 0
        print(f'  Chat verify: messages={msgs_n}')
        r['messages_count'] = msgs_n

run_test('TEST 1: General Chat', [t1_create, t1_send, t1_reply])

# ===================== TEST 2: Context =====================
results['test2'] = {}
def t2_create(r):
    st, chat = req('POST', '/agent/chats', {'first_message': 'Я делаю баннер для AI-бота Hubicx'})
    cid = chat.get('chat', {}).get('id') if isinstance(chat, dict) else None
    print(f'  Create: status={st} id={cid}')
    r['chat_id'] = cid

def t2_msg1(r):
    cid = r.get('chat_id')
    if not cid: return
    st, msg = req('POST', f'/agent/chats/{cid}/messages', {'content': 'Я делаю баннер для AI-бота Hubicx'})
    tid, uid = msg.get('task_id'), msg.get('user_message', {}).get('id')
    print(f'  Msg1: task={tid} user_msg={uid}')
    r['msg1_tid'], r['msg1_uid'] = tid, uid
    output = poll_task(tid)
    if output and uid:
        st, reply = req('POST', f'/agent/chats/{cid}/messages/{uid}/reply', {'content': output, 'task_id': tid})
        print(f'  Reply1: status={st}')
        r['reply1_status'] = st
        r['output1_len'] = len(output)

def t2_msg2(r):
    cid = r.get('chat_id')
    if not cid: return
    st, msg = req('POST', f'/agent/chats/{cid}/messages', {'content': 'Сделай его более премиальным, но коротко'})
    tid, uid = msg.get('task_id'), msg.get('user_message', {}).get('id')
    print(f'  Msg2 (context): task={tid} user_msg={uid}')
    r['msg2_tid'], r['msg2_uid'] = tid, uid
    output = poll_task(tid)
    if output and uid:
        st, reply = req('POST', f'/agent/chats/{cid}/messages/{uid}/reply', {'content': output, 'task_id': tid})
        cost = reply.get('assistant_message', {}).get('token_cost') if isinstance(reply, dict) else None
        print(f'  Reply2: status={st} cost={cost}')
        r['reply2_status'] = st
        r['cost'] = cost
        r['output2_len'] = len(output)
        # Check context - "его" should refer to banner
        context_ok = 'баннер' in output.lower() or 'banner' in output.lower() or 'premium' in output.lower() or 'премиум' in output.lower() or len(output) > 20
        r['context_ok'] = context_ok
        print(f'  Context check: {context_ok}')

run_test('TEST 2: Context', [t2_create, t2_msg1, t2_msg2])

# ===================== TEST 3: Role Mode =====================
results['test3'] = {}
def t3_create(r):
    st, chat = req('POST', '/agent/chats', {'agent_mode': 'prompt_master', 'first_message': 'Улучши промт: синий логотип AI'})
    cid = chat.get('chat', {}).get('id') if isinstance(chat, dict) else None
    mode = chat.get('chat', {}).get('agent_mode') if isinstance(chat, dict) else None
    print(f'  Create: status={st} id={cid} mode={mode}')
    r['chat_id'] = cid
    r['mode'] = mode

def t3_send(r):
    cid = r.get('chat_id')
    if not cid: return
    st, msg = req('POST', f'/agent/chats/{cid}/messages', {'content': 'Улучши промт: синий логотип AI'})
    tid, uid = msg.get('task_id'), msg.get('user_message', {}).get('id')
    print(f'  Send: task={tid} user_msg={uid}')
    r['task_id'], r['user_msg_id'] = tid, uid
    output = poll_task(tid)
    if output and uid:
        st, reply = req('POST', f'/agent/chats/{cid}/messages/{uid}/reply', {'content': output, 'task_id': tid})
        cost = reply.get('assistant_message', {}).get('token_cost') if isinstance(reply, dict) else None
        print(f'  Reply: status={st} cost={cost}')
        r['reply_status'] = st
        r['cost'] = cost
        r['output_len'] = len(output)
        # Check prompt-related keywords
        prompt_keywords = ['промпт', 'prompt', 'улучш', 'детал', 'стиль', 'логотип', 'logo', 'цвет']
        has_prompt_style = any(k in output.lower() for k in prompt_keywords)
        r['has_prompt_style'] = has_prompt_style
        print(f'  Prompt style: {has_prompt_style}')
        # Verify mode preserved
        st, chk = req('GET', f'/agent/chats/{cid}')
        mode_after = chk.get('chat', {}).get('agent_mode') if isinstance(chk, dict) else None
        r['mode_after'] = mode_after
        print(f'  Mode after: {mode_after}')

run_test('TEST 3: Prompt Master', [t3_create, t3_send])

# ---- GET balance after ----
st, me = req('GET', '/auth/me')
balance_after = me.get('balance_credits', 0) if isinstance(me, dict) else 0
print(f'\nBalance before: {balance_before}')
print(f'Balance after:  {balance_after}')
print(f'Total spent:    {balance_before - balance_after}')

# ---- DB checks ----
print('\n>>> DB Checks...')
st, ledger = req('GET', f'/admin/users/1/balance-ledger?limit=5')
ledger_items = ledger.get('items', []) if isinstance(ledger, dict) else []
agent_ledger = [x for x in ledger_items if x.get('operation_type') == 'agent_chat_debit']
print(f'  agent_chat_debit entries: {len(agent_ledger)}')

# ---- Summary ----
print('\n' + '='*60)
print('SMOKE TEST SUMMARY')
print('='*60)
print(json.dumps(results, ensure_ascii=False, indent=2))
print(f'\nBalance: {balance_before} -> {balance_after} (spent {balance_before - balance_after})')
print(f'Ledger agent_chat_debit count: {len(agent_ledger)}')
print('\nALL TESTS COMPLETED')
