/* ============ Hubicx API adapter for Mira ============ */
(function(){
  const DEFAULT_API_URL = 'https://api.hubicx.ru';
  const TIMEOUT_MS = 20000;

  class HubicxApiError extends Error{
    constructor(message, code, status){
      super(message);
      this.name = 'HubicxApiError';
      this.code = code || '';
      this.status = status || 0;
    }
  }

  function apiBase(){
    return String(window.__HUBICX_API_URL__ || DEFAULT_API_URL).replace(/\/$/, '');
  }
  function initData(){
    return (window.HubicxTelegramAdapter && window.HubicxTelegramAdapter.initData) ||
      (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || '';
  }
  function apiPath(path){
    const p = String(path || '');
    if(/^https?:\/\//.test(p)) return p;
    return `${apiBase()}${p.startsWith('/api/') ? p : '/api' + (p.startsWith('/') ? p : '/' + p)}`;
  }
  function authHint(){
    return 'Откройте приложение через Telegram';
  }
  async function fetchWithTimeout(url, options){
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(), TIMEOUT_MS);
    try{ return await fetch(url, {...options, signal:controller.signal}); }
    finally{ clearTimeout(timer); }
  }
  async function request(path, options={}){
    const headers = {...(options.headers || {})};
    const data = initData();
    if(data) headers['X-Telegram-Init-Data'] = data;
    const isForm = options.body instanceof FormData;
    if(!isForm && options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    let res;
    try{
      res = await fetchWithTimeout(apiPath(path), {...options, headers, cache:'no-store'});
    }catch(e){
      throw new HubicxApiError('Не удалось подключиться к API. Проверьте соединение.', 'network_error');
    }
    const ct = res.headers.get('content-type') || '';
    const body = ct.includes('application/json') ? await res.json().catch(()=>({})) : await res.text().catch(()=>'');
    if(!res.ok){
      const detail = typeof body === 'string' ? body : String(body.detail || body.message || '');
      const code = typeof body === 'object' ? String(body.code || '') : '';
      if(res.status === 401 || detail.includes('Telegram initData')) throw new HubicxApiError(authHint(), 'unauthorized', res.status);
      throw new HubicxApiError(detail || 'Не удалось выполнить запрос.', code, res.status);
    }
    return body;
  }
  async function upload(file){
    const form = new FormData();
    form.append('file', file);
    return request('/files/upload', {method:'POST', body:form});
  }
  async function pricePreview(payload){
    const code = payload.model_code || payload.model || payload.code;
    const inputs = payload.inputs || payload;
    if(!code) throw new HubicxApiError('Не выбрана модель', 'model_required');
    return request(`/models/${encodeURIComponent(code)}/price-preview`, {method:'POST', body:JSON.stringify({inputs})});
  }
  async function createGeneration(payload){
    return request('/generations', {method:'POST', body:JSON.stringify(payload)});
  }
  async function getTask(taskId){ return request(`/generations/${encodeURIComponent(taskId)}`); }
  async function chat(payload){
    const prompt = payload.prompt || (payload.messages || []).map(m=>`${m.role}: ${m.text || m.content}`).join('\n');
    const queued = await createGeneration({model_code:'ai_chat', prompt, inputs:{prompt}});
    const taskId = queued.task_id;
    for(let i=0; i<30; i++){
      const task = await getTask(taskId);
      if(task.status === 'completed') return {text:task.output_text || task.output_file_url || 'Готово', task};
      if(task.status === 'failed') throw new HubicxApiError(task.error_message || 'Чат завершился ошибкой', 'chat_failed');
      await new Promise(r=>setTimeout(r, 1200));
    }
    return {text:'Ответ ещё готовится. Проверьте историю чуть позже.', task_id:taskId};
  }
  async function profile(){ return request('/profile'); }
  async function updateProfile(payload){ return request('/profile', {method:'PATCH', body:JSON.stringify(payload)}); }

  window.HubicxApiError = HubicxApiError;
  window.HubicxApi = {
    getInitData:initData,
    request,
    me:()=>request('/auth/me'),
    pricing:()=>request('/pricing'),
    models:()=>request('/models'),
    model:(code)=>request(`/models/${encodeURIComponent(code)}`),
    pricePreview,
    upload,
    createGeneration,
    getTask,
    history:()=>request('/generations/history'),
    sendToTelegram:(taskId)=>request(`/generations/${encodeURIComponent(taskId)}/send-to-chat`, {method:'POST', body:JSON.stringify({})}),
    chat,
    profile,
    updateProfile,
    authHint,
  };
})();
