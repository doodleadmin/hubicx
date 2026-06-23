(function(){
  const DEFAULT_API_URL = 'https://api.hubicx.ru';
  const API_KEY = 'hubicx_admin_api_url';
  const TOKEN_KEY = 'hubicx_admin_token';
  const root = document.getElementById('root');
  const state = {tab:'overview', token:localStorage.getItem(TOKEN_KEY)||'', apiUrl:localStorage.getItem(API_KEY)||DEFAULT_API_URL, me:null, data:{}, loading:false, error:'', toast:'', filters:{users:'',tasksStatus:'',tasksUser:'',partnerSearch:'',partnerId:''}};
  const tabs = [
    ['overview','Обзор'],['users','Пользователи'],['tasks','Генерации'],['models','Модели'],['pricing','Цены'],['packages','Пакеты'],['transactions','Транзакции'],['files','Файлы'],['partners','Партнёры']
  ];
  function esc(v){return String(v??'').replace(/[&<>"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));}
  function apiBase(){return String(state.apiUrl||DEFAULT_API_URL).replace(/\/$/,'');}
  function apiPath(p){return `${apiBase()}${p.startsWith('/api/')?p:'/api'+(p.startsWith('/')?p:'/'+p)}`;}
  async function request(path,opt={}){
    const headers = {'Content-Type':'application/json', ...(opt.headers||{})};
    if(state.token) headers.Authorization = `Bearer ${state.token}`;
    const res = await fetch(apiPath(path), {...opt, headers, cache:'no-store'});
    const ct = res.headers.get('content-type')||'';
    const body = ct.includes('application/json') ? await res.json().catch(()=>({})) : await res.text().catch(()=>'');
    if(!res.ok){ const msg = typeof body==='string'?body:(body.detail||body.message||'Ошибка запроса'); throw new Error(msg); }
    return body;
  }
  function set(patch){Object.assign(state,patch); render();}
  function toast(msg){set({toast:msg}); setTimeout(()=>{state.toast=''; render();},2600);}
  async function boot(){ if(!state.token) return render(); state.loading=true; render(); try{state.me=(await request('/admin/auth/me')).user; await loadTab('overview', false);}catch(e){localStorage.removeItem(TOKEN_KEY); state.token=''; state.me=null; state.loading=false; state.error='Сессия истекла. Войдите снова.'; render();}}
  async function login(ev){ev.preventDefault(); const fd=new FormData(ev.target); const apiUrl=String(fd.get('apiUrl')||DEFAULT_API_URL).trim(); const password=String(fd.get('password')||''); state.apiUrl=apiUrl; localStorage.setItem(API_KEY,apiUrl); try{set({loading:true,error:''}); const r=await request('/admin/auth/login',{method:'POST',body:JSON.stringify({password})}); state.token=r.token; state.me=r.user; localStorage.setItem(TOKEN_KEY,r.token); await loadTab('overview', false); toast('Вход выполнен');}catch(e){set({error:e.message,loading:false});}}
  function logout(){localStorage.removeItem(TOKEN_KEY); state.token=''; state.me=null; state.data={}; render();}
  async function loadTab(tab=state.tab, rerender=true){state.tab=tab; state.loading=true; state.error=''; if(rerender) render(); try{
    if(tab==='overview'){
      const [users,tasks,errors,models,tx,files]=await Promise.all([request('/admin/users?limit=5'),request('/admin/tasks?limit=5'),request('/admin/errors?limit=5'),request('/admin/models'),request('/admin/transactions?limit=5'),request('/admin/files?limit=5')]);
      state.data.overview={users,tasks,errors,models,tx,files};
    } else if(tab==='users') state.data.users=await request('/admin/users?limit=100');
    else if(tab==='tasks'){
      const qs=new URLSearchParams({limit:'100'}); if(state.filters.tasksStatus) qs.set('status',state.filters.tasksStatus); if(state.filters.tasksUser) qs.set('user_id',state.filters.tasksUser);
      state.data.tasks=await request('/admin/tasks?'+qs.toString());
    } else if(tab==='models') state.data.models=await request('/admin/models');
    else if(tab==='pricing') state.data.pricing=await request('/admin/model-pricing');
    else if(tab==='packages') state.data.packages=await request('/admin/token-packages');
    else if(tab==='transactions') state.data.transactions=await request('/admin/transactions?limit=100');
    else if(tab==='files') state.data.files=await request('/admin/files?limit=100');
    else if(tab==='partners'){ state.data.partners=await request('/admin/referral/partners'); state.data.partnerRates=await request('/admin/referral/rates'); }
    state.loading=false; render();
  }catch(e){set({loading:false,error:e.message});}}
  function nav(){return tabs.map(([id,label])=>`<button class="ad-nav-i${state.tab===id?' on':''}" data-tab="${id}"><span class="ic"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="7"/></svg></span>${label}</button>`).join('');}
  function layout(content){return `<div class="ad-app"><aside class="ad-side"><div class="ad-brand"><div class="ad-logo">H</div><div><h2>Hubicx Admin</h2><p>${esc(state.me?.username?'@'+state.me.username:'browser panel')}</p></div></div><div class="ad-navlabel">Управление</div><nav class="ad-nav">${nav()}</nav><div class="ad-side-foot"><div class="ad-ava">${esc((state.me?.username||'A')[0].toUpperCase())}</div><div class="nm">${esc(state.me?.username?'@'+state.me.username:'Admin')}</div><button class="ad-logout" data-action="logout"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9"/></svg></button></div></aside><main class="ad-main"><div class="ad-top"><div class="ad-top-h"><h1>${esc(tabs.find(t=>t[0]===state.tab)?.[1]||'Admin')}</h1><span class="ad-muted">${esc(apiBase())}</span></div><div class="ad-top-r"><button class="ad-icon-btn" data-action="refresh" title="Обновить"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.5 16.5A9 9 0 001.8 10M22.2 14A9 9 0 013.5 7.5"/></svg></button></div></div><div class="ad-body">${state.error?`<div class="ad-error">${esc(state.error)}</div>`:''}${state.loading?`<div class="ad-card" style="padding:32px;text-align:center;color:var(--mut);font-weight:600">Загрузка...</div>`:content}</div></main><nav class="ad-mobile-nav">${tabs.map(([id,label])=>`<button class="ad-nav-i${state.tab===id?' on':''}" data-tab="${id}">${label}</button>`).join('')}</nav>${state.toast?`<div class="ad-toast">${esc(state.toast)}</div>`:''}</div>`;}
  function loginView(){return `<div class="ad-login"><form class="ad-login-card" id="loginForm"><div class="ad-logo">H</div><h1>Hubicx Admin</h1><p class="ad-muted">Браузерная админка. Работает на desktop и mobile, без Telegram.</p><div class="ad-field"><span>API URL</span><input class="ad-input" name="apiUrl" value="${esc(state.apiUrl)}"/></div><div class="ad-field"><span>Admin password</span><input class="ad-input" name="password" type="password" autocomplete="current-password"/></div><button class="ad-btn ad-btn-pri" style="width:100%;margin-top:18px" ${state.loading?'disabled':''}>Войти</button>${state.error?`<div class="ad-error">${esc(state.error)}</div>`:''}</form></div>`;}
  function badge(v){const s=String(v??''); const cls=s==='completed'||s==='paid'||s==='true'||s==='active'?'ok':(s==='failed'||s==='refunded'||s==='false'||s==='blocked'?'bad':'warn'); return `<span class="ad-pill ${cls}">${esc(s)}</span>`;}
  function table(headers, rows){return `<div class="ad-tbl-wrap"><table class="ad-tbl"><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')||`<tr><td colspan="${headers.length}" class="ad-muted" style="text-align:center;padding:28px">Нет данных</td></tr>`}</tbody></table></div>`;}
  function overview(){const d=state.data.overview||{}; const totalUsers=d.users?.total||0, totalTasks=d.tasks?.total||0, errors=d.errors?.total||0, models=(d.models||[]).length; return layout(`<div class="ad-kpis"><div class="ad-kpi"><div class="ad-kpi-top"><div class="ad-kpi-ic" style="background:rgba(122,183,255,.14);color:var(--blue)"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div class="ad-kpi-l">Пользователей</div></div><div class="ad-kpi-v">${totalUsers}</div></div><div class="ad-kpi"><div class="ad-kpi-top"><div class="ad-kpi-ic" style="background:rgba(182,181,230,.14);color:var(--violet)"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div><div class="ad-kpi-l">Генераций</div></div><div class="ad-kpi-v">${totalTasks}</div></div><div class="ad-kpi"><div class="ad-kpi-top"><div class="ad-kpi-ic" style="background:rgba(255,107,122,.14);color:var(--bad)"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg></div><div class="ad-kpi-l">Ошибок</div></div><div class="ad-kpi-v">${errors}</div></div><div class="ad-kpi"><div class="ad-kpi-top"><div class="ad-kpi-ic" style="background:rgba(95,211,154,.14);color:var(--ok)"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg></div><div class="ad-kpi-l">Моделей</div></div><div class="ad-kpi-v">${models}</div></div></div><div class="ad-grid2" style="margin-top:16px"><div class="ad-card"><div class="ad-card-h"><h3>Последние задачи</h3></div><div style="padding:12px 20px 20px">${miniTasks(d.tasks?.items||[])}</div></div><div class="ad-card"><div class="ad-card-h"><h3>Последние пользователи</h3></div><div style="padding:12px 20px 20px">${miniUsers(d.users?.items||[])}</div></div></div>`);}
  function miniTasks(items){return items.map(t=>`<p style="font-size:13px;margin-bottom:8px">#${t.id} ${badge(t.status)} ${esc(t.model_code||'')} <span class="ad-muted">${esc(t.cost_credits)} cr</span></p>`).join('')||'<p class="ad-muted">Нет задач</p>';}
  function miniUsers(items){return items.map(u=>`<p style="font-size:13px;margin-bottom:8px"><b>${esc(u.username?'@'+u.username:u.telegram_id)}</b> <span class="ad-muted">${esc(u.balance_credits)} cr</span></p>`).join('')||'<p class="ad-muted">Нет пользователей</p>';}
  function usersView(){let items=state.data.users?.items||[]; const q=state.filters.users.toLowerCase(); if(q) items=items.filter(u=>String(u.telegram_id).includes(q)||String(u.username||'').toLowerCase().includes(q)||String(u.first_name||'').toLowerCase().includes(q)); return layout(`<div class="ad-toolbar"><div class="ad-fld"><span style="color:var(--faint)"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M12.5 12.5L17 17"/></svg></span><input data-filter="users" placeholder="Поиск: telegram_id / username" value="${esc(state.filters.users)}"/></div></div>${table(['ID','Telegram','Username','Баланс','Admin','Действия'],items.map(u=>`<tr><td>${u.id}</td><td>${u.telegram_id}</td><td>${esc(u.username||u.first_name||'')}</td><td><b>${u.balance_credits}</b></td><td>${badge(u.is_admin)}</td><td><div class="ad-row-act"><button class="ad-mini" data-action="balance" data-user="${u.id}" data-name="${esc(u.username||u.telegram_id)}" title="Баланс">$</button><button class="ad-mini" data-action="ledger" data-user="${u.id}" title="Ledger">L</button></div></td></tr>`))}`);}
  function tasksView(){const items=state.data.tasks?.items||[]; return layout(`<div class="ad-toolbar"><select class="ad-select" data-filter="tasksStatus"><option value="">Все статусы</option>${['created','processing','completed','failed','refunded'].map(s=>`<option ${state.filters.tasksStatus===s?'selected':''}>${s}</option>`).join('')}</select><div class="ad-fld"><input data-filter="tasksUser" placeholder="user_id" value="${esc(state.filters.tasksUser)}"/></div><button class="ad-btn ad-btn-pri" data-action="applyTasks">Применить</button></div>${table(['ID','User','Модель','Тип','Статус','Цена','Ошибка','Создано'],items.map(t=>`<tr data-action="task" data-id="${t.id}" style="cursor:pointer"><td>#${t.id}</td><td>${esc(t.telegram_id||t.user_id)}</td><td>${esc(t.model_code||t.model_title||'')}</td><td>${esc(t.task_type)}</td><td>${badge(t.status)}</td><td>${esc(t.cost_credits)}</td><td>${esc(t.error_message||'')}</td><td>${esc(t.created_at||'')}</td></tr>`))}`);}
  function modelsView(){const items=state.data.models||[]; return layout(`${table(['Code','Название','Категория','Provider','Цена','Active','Действия'],items.map(m=>`<tr><td><b>${esc(m.code)}</b></td><td>${esc(m.title)}</td><td>${esc(m.category)}</td><td>${esc(m.provider)}</td><td>${esc(m.price_credits)}</td><td>${badge(m.is_active)}</td><td><div class="ad-row-act"><button class="ad-mini" data-action="modelPrice" data-code="${esc(m.code)}" data-price="${esc(m.price_credits)}" title="Цена">$</button><button class="ad-mini" data-action="toggleModel" data-code="${esc(m.code)}" data-active="${m.is_active?'false':'true'}">${m.is_active?'⏻':'▶'}</button></div></td></tr>`))}`);}
  function pricingView(){const items=state.data.pricing||[]; return layout(`${table(['Модель','Название','Категория','Цена','Enabled','Featured','Заметка'],items.map(p=>`<tr><td><b>${esc(p.model_code)}</b></td><td>${esc(p.display_name)}</td><td>${esc(p.category)}</td><td>${esc(p.price_tokens)}</td><td>${badge(p.is_enabled)}</td><td>${badge(p.is_featured)}</td><td>${esc(p.admin_note||'')}</td></tr>`))}`);}
  function packagesView(){const items=state.data.packages||[]; return layout(`${table(['Code','Название','Tokens','Цена ₽','Бонус','Active'],items.map(p=>`<tr><td><b>${esc(p.code)}</b></td><td>${esc(p.title)}</td><td>${esc(p.tokens||p.total_tokens||'')}</td><td>${esc(p.price_rub)}</td><td>${esc(p.bonus_tokens||0)}</td><td>${badge(p.is_active)}</td></tr>`))}`);}
  function transactionsView(){const items=state.data.transactions?.items||[]; return layout(`${table(['ID','User','Тип','Сумма','Статус','Комментарий','Дата'],items.map(t=>`<tr><td>${t.id}</td><td>${t.user_id}</td><td>${esc(t.type)}</td><td>${esc(t.amount_credits)}</td><td>${badge(t.status)}</td><td>${esc(t.comment||'')}</td><td>${esc(t.created_at||'')}</td></tr>`))}`);}
  function filesView(){const items=state.data.files?.items||[]; return layout(`${table(['ID','User','Type','Purpose','MIME','Size','URL'],items.map(f=>`<tr><td>${f.id}</td><td>${f.user_id}</td><td>${esc(f.file_type)}</td><td>${esc(f.purpose)}</td><td>${esc(f.mime_type||'')}</td><td>${esc(f.size_bytes||'')}</td><td><a href="${esc(f.storage_url)}" target="_blank" style="color:var(--blue)">open</a></td></tr>`))}`);}

  // ── Partners view ──
  function partnersView(){
    const items = state.data.partners || [];
    const rates = state.data.partnerRates || [];
    const q = state.filters.partnerSearch.toLowerCase();
    let filtered = items;
    if(q) filtered = items.filter(p => (p.code||'').toLowerCase().includes(q) || (p.name||'').toLowerCase().includes(q));
    const rateByCat = {};
    rates.forEach(r => { if(!r.partner_id) rateByCat[r.category] = r.rate_percent; });
    return layout(`<div class="ad-toolbar">
      <div class="ad-fld"><input data-filter="partnerSearch" placeholder="Поиск партнёра" value="${esc(state.filters.partnerSearch)}"/></div>
      <button class="ad-btn ad-btn-pri" data-action="newPartner">+ Новый партнёр</button>
      <button class="ad-btn ad-btn-ghost" data-action="editRates">Ставки комиссий</button>
    </div>
    <div class="ad-kpis" style="margin-bottom:18px">
      <div class="ad-kpi"><div class="ad-kpi-l">Токены</div><div class="ad-kpi-v">${rateByCat.token_topup||0}%</div></div>
      <div class="ad-kpi"><div class="ad-kpi-l">Шаблоны</div><div class="ad-kpi-v">${rateByCat.template_subscription||0}%</div></div>
      <div class="ad-kpi"><div class="ad-kpi-l">Общие тарифы</div><div class="ad-kpi-v">${rateByCat.full_subscription||0}%</div></div>
    </div>
    ${table(['Code','Название','Статус','Контакты','Переходы','Регистрации','Комиссия','Действия'],
      filtered.map(p=>`<tr>
        <td><b>${esc(p.code)}</b></td>
        <td>${esc(p.name)}</td>
        <td>${badge(p.status)}</td>
        <td>${esc((p.contact_info||{}).telegram||(p.contact_info||{}).email||'')}</td>
        <td>${p.total_clicks||0}</td>
        <td>${p.total_conversions||0}</td>
        <td>${esc(p.total_commission||0)} ₽</td>
        <td><div class="ad-row-act">
          <button class="ad-mini" data-action="editPartner" data-id="${p.id}" data-code="${esc(p.code)}" data-name="${esc(p.name)}" data-status="${esc(p.status)}" data-contact="${esc(JSON.stringify(p.contact_info||{}))}" title="Ред.">✎</button>
          <button class="ad-mini" data-action="partnerStats" data-id="${p.id}" data-code="${esc(p.code)}" title="Стат.">📊</button>
          <button class="ad-mini danger" data-action="togglePartner" data-id="${p.id}" data-status="${p.status==='active'?'blocked':'active'}" title="${p.status==='active'?'Блок.':(p.status==='blocked'?'Акт.':'Акт.')}">${p.status==='active'?'⏻':'▶'}</button>
        </div></td>
      </tr>`)
    )}`);
  }

  function modal(title, body){document.body.insertAdjacentHTML('beforeend',`<div class="ad-modal-backdrop" id="modal"><div class="ad-modal"><div class="ad-modal-head"><h2>${esc(title)}</h2><button class="ad-btn ad-btn-ghost" data-action="closeModal" style="height:32px;padding:0 12px;font-size:12px">Закрыть</button></div><div class="ad-modal-body">${body}</div></div></div>`);}

  async function handleClick(e){const el=e.target.closest('[data-tab],[data-action]'); if(!el) return; const tab=el.dataset.tab, a=el.dataset.action; if(tab) return loadTab(tab); if(a==='refresh') return loadTab(); if(a==='logout') return logout(); if(a==='applyTasks') return loadTab('tasks'); if(a==='closeModal') return document.getElementById('modal')?.remove();
    if(a==='balance'){ const amount=prompt('Сумма изменения баланса (+/-):','1000'); if(!amount) return; const reason=prompt('Причина:','Admin adjustment')||'Admin adjustment'; await request(`/admin/users/${el.dataset.user}/balance-adjust`,{method:'POST',body:JSON.stringify({amount:Number(amount),reason})}); toast('Баланс обновлён'); return loadTab('users'); }
    if(a==='ledger'){ const r=await request(`/admin/users/${el.dataset.user}/balance-ledger?limit=30`); return modal('Balance ledger', table(['Операция','Сумма','До','После','Причина','Дата'],r.items.map(x=>`<tr><td>${esc(x.operation_type)}</td><td>${esc(x.amount)}</td><td>${esc(x.balance_before)}</td><td>${esc(x.balance_after)}</td><td>${esc(x.reason||'')}</td><td>${esc(x.created_at||'')}</td></tr>`))); }
    if(a==='task'){ const r=await request(`/admin/generation-tasks/${el.dataset.id}`); return modal(`Задача #${r.id}`, `<div class="ad-pre">${esc(JSON.stringify(r,null,2))}</div>`); }
    if(a==='modelPrice'){ const price=prompt(`Новая цена для ${el.dataset.code}:`, el.dataset.price||'0'); if(price===null) return; await request(`/admin/models/${encodeURIComponent(el.dataset.code)}/price?price_credits=${encodeURIComponent(price)}`,{method:'POST',body:'{}'}); toast('Цена обновлена'); return loadTab('models'); }
    if(a==='toggleModel'){ await request(`/admin/models/${encodeURIComponent(el.dataset.code)}/toggle?is_active=${encodeURIComponent(el.dataset.active)}`,{method:'POST',body:'{}'}); toast('Статус модели обновлён'); return loadTab('models'); }

    // ── Partner actions ──
    if(a==='newPartner'){
      return modal('Новый партнёр', `<form id="partnerForm" style="display:flex;flex-direction:column;gap:14px">
        <label class="ad-field"><label>Код (уникальный)</label><input class="ad-input" name="code" placeholder="blogger123" required/></label>
        <label class="ad-field"><label>Имя</label><input class="ad-input" name="name" placeholder="Иван Петров" required/></label>
        <label class="ad-field"><label>Telegram (без @)</label><input class="ad-input" name="telegram" placeholder="blogger"/></label>
        <button class="ad-btn ad-btn-pri" type="submit">Создать</button>
      </form>`);
      document.getElementById('partnerForm').onsubmit = async function(ev){ev.preventDefault(); const fd=new FormData(ev.target); const code=fd.get('code'), name=fd.get('name'), tg=fd.get('telegram')||''; try{await request('/admin/referral/partners',{method:'POST',body:JSON.stringify({code,name,status:'active',contact_info:{telegram:'@'+tg}})}); document.getElementById('modal')?.remove(); toast('Партнёр создан'); loadTab('partners');}catch(e){alert(e.message);}};
    }
    if(a==='editPartner'){
      const id=el.dataset.id, code=el.dataset.code, name=el.dataset.name, status=el.dataset.status; let contact={}; try{contact=JSON.parse(el.dataset.contact)}catch(e){}
      return modal('Редактировать партнёра', `<form id="editPartnerForm" style="display:flex;flex-direction:column;gap:14px">
        <label class="ad-field"><label>Код</label><input class="ad-input" name="code" value="${esc(code)}" required/></label>
        <label class="ad-field"><label>Имя</label><input class="ad-input" name="name" value="${esc(name)}" required/></label>
        <label class="ad-field"><label>Статус</label><select class="ad-select" name="status"><option value="active" ${status==='active'?'selected':''}>active</option><option value="paused" ${status==='paused'?'selected':''}>paused</option><option value="blocked" ${status==='blocked'?'selected':''}>blocked</option></select></label>
        <label class="ad-field"><label>Telegram</label><input class="ad-input" name="telegram" value="${esc((contact.telegram||'').replace('@',''))}"/></label>
        <button class="ad-btn ad-btn-pri" type="submit">Сохранить</button>
      </form>`);
      document.getElementById('editPartnerForm').onsubmit = async function(ev){ev.preventDefault(); const fd=new FormData(ev.target); const body={code:fd.get('code'),name:fd.get('name'),status:fd.get('status'),contact_info:{telegram:'@'+fd.get('telegram')}}; try{await request('/admin/referral/partners/'+id,{method:'PUT',body:JSON.stringify(body)}); document.getElementById('modal')?.remove(); toast('Партнёр обновлён'); loadTab('partners');}catch(e){alert(e.message);}};
    }
    if(a==='togglePartner'){
      const id=el.dataset.id, newStatus=el.dataset.status;
      try{await request('/admin/referral/partners/'+id,{method:'PUT',body:JSON.stringify({status:newStatus})}); toast('Статус изменён'); loadTab('partners');}catch(e){alert(e.message);}
    }
    if(a==='partnerStats'){
      const id=el.dataset.id, code=el.dataset.code;
      try{const r=await request('/admin/referral/stats?partner_id='+id); return modal(`Статистика: ${code}`, `<div class="ad-kpis"><div class="ad-kpi"><div class="ad-kpi-l">Переходы</div><div class="ad-kpi-v">${r.total_clicks||0}</div></div><div class="ad-kpi"><div class="ad-kpi-l">Регистрации</div><div class="ad-kpi-v">${r.total_conversions||0}</div></div><div class="ad-kpi"><div class="ad-kpi-l">Комиссия</div><div class="ad-kpi-v">${r.total_commission||0} ₽</div></div></div>`);}catch(e){alert(e.message);}
    }
    if(a==='editRates'){
      const rates = state.data.partnerRates || [];
      const rateByCat = {};
      rates.forEach(r => { if(!r.partner_id) rateByCat[r.category] = r.rate_percent; });
      return modal('Ставки комиссий (по умолчанию)', `<form id="ratesForm" style="display:flex;flex-direction:column;gap:14px">
        <label class="ad-field"><label>Пополнение токенов (%)</label><input class="ad-input" name="token_topup" type="number" min="0" max="100" value="${rateByCat.token_topup||0}"/></label>
        <label class="ad-field"><label>Подписка на шаблоны (%)</label><input class="ad-input" name="template_subscription" type="number" min="0" max="100" value="${rateByCat.template_subscription||0}"/></label>
        <label class="ad-field"><label>Полные тарифы (%)</label><input class="ad-input" name="full_subscription" type="number" min="0" max="100" value="${rateByCat.full_subscription||0}"/></label>
        <button class="ad-btn ad-btn-pri" type="submit">Сохранить</button>
      </form>`);
      document.getElementById('ratesForm').onsubmit = async function(ev){ev.preventDefault(); const fd=new FormData(ev.target); const cats={token_topup:'token_topup',template_subscription:'template_subscription',full_subscription:'full_subscription'}; try{for(const [key,cat] of Object.entries(cats)){const v=parseFloat(fd.get(key))||0; await request('/admin/referral/rates',{method:'PUT',body:JSON.stringify({category:cat,rate_percent:v})});} document.getElementById('modal')?.remove(); toast('Ставки обновлены'); loadTab('partners');}catch(e){alert(e.message);}};
    }
  }
  function handleInput(e){const k=e.target.dataset.filter; if(!k) return; state.filters[k]=e.target.value; if(k==='users'||k==='partnerSearch') render();}
  function render(){ if(!state.token){const form=document.getElementById('loginForm'); if(form){form.onsubmit=login; const api=form.querySelector('[name="apiUrl"]'); if(api && !api.value) api.value=state.apiUrl; return;} root.innerHTML=loginView(); document.getElementById('loginForm')?.addEventListener('submit',login); return;} const map={overview,users:usersView,tasks:tasksView,models:modelsView,pricing:pricingView,packages:packagesView,transactions:transactionsView,files:filesView,partners:partnersView}; root.innerHTML=(map[state.tab]||overview)(); root.onclick=handleClick; root.oninput=handleInput; }
  setTimeout(boot,10);
})();
