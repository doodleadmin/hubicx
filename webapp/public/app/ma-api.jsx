/* ============ API adapter — connects to api.hubicx.ru ============ */
(function() {
  var API_URL = 'https://api.hubicx.ru';
  var TIMEOUT_MS = 12000;
  var TELEGRAM_ERROR = 'Откройте приложение через Telegram-бота';

  function getInitData() {
    var tg = window.Telegram && window.Telegram.WebApp;
    return tg ? (tg.initData || '') : '';
  }

  function requestPublic(path, opts) {
    opts = opts || {};
    var ctrl = new AbortController();
    var timer = setTimeout(function() { ctrl.abort(); }, TIMEOUT_MS);
    var headers = { 'Content-Type': 'application/json' };
    var initData = getInitData();
    if (initData) headers['X-Telegram-Init-Data'] = initData;
    return fetch(API_URL + '/api' + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body || undefined,
      signal: ctrl.signal,
      cache: 'no-store',
    }).then(function(res) {
      clearTimeout(timer);
      if (!res.ok) return res.json().catch(function() { return {}; }).then(function(err) {
        return Promise.reject({ code: String(err.code || ''), message: String(err.detail || 'Ошибка запроса'), status: res.status });
      });
      return res.json();
    }, function(err) {
      clearTimeout(timer);
      if (err && err.name === 'AbortError') return Promise.reject({ code: 'timeout', message: 'Превышено время ожидания' });
      return Promise.reject({ code: 'network', message: 'Нет соединения с сервером' });
    });
  }

  function request(path, opts) {
    opts = opts || {};
    var initData = getInitData();
    if (!initData) return Promise.reject({ code: 'unauthorized', message: TELEGRAM_ERROR });

    var ctrl = new AbortController();
    var timer = setTimeout(function() { ctrl.abort(); }, TIMEOUT_MS);
    var headers = { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': initData };
    if (opts.headers) {
      var k = Object.keys(opts.headers);
      for (var i = 0; i < k.length; i++) headers[k[i]] = opts.headers[k[i]];
    }

    return fetch(API_URL + '/api' + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body || undefined,
      signal: ctrl.signal,
      cache: 'no-store',
    }).then(function(res) {
      clearTimeout(timer);
      if (!res.ok) {
        return res.json().catch(function() { return {}; }).then(function(err) {
          var code = String(err.code || '');
          var msg = String(err.detail || 'Ошибка запроса');
          if (res.status === 401) code = 'unauthorized';
          return Promise.reject({ code: code, message: msg, status: res.status });
        });
      }
      return res.json();
    }, function(err) {
      clearTimeout(timer);
      if (err && err.name === 'AbortError') return Promise.reject({ code: 'timeout', message: 'Превышено время ожидания' });
      if (err && err.code) return Promise.reject(err);
      return Promise.reject({ code: 'network', message: 'Нет соединения с сервером' });
    });
  }

  // File upload — multipart/form-data, no JSON Content-Type
  function uploadFile(file) {
    var initData = getInitData();
    if (!initData) return Promise.reject({ code: 'unauthorized', message: TELEGRAM_ERROR });
    var ctrl = new AbortController();
    var timer = setTimeout(function() { ctrl.abort(); }, 30000); // 30s for uploads
    var formData = new FormData();
    formData.append('file', file);
    return fetch(API_URL + '/api/files/upload', {
      method: 'POST',
      headers: { 'X-Telegram-Init-Data': initData },
      body: formData,
      signal: ctrl.signal,
      cache: 'no-store',
    }).then(function(res) {
      clearTimeout(timer);
      if (!res.ok) {
        return res.json().catch(function() { return {}; }).then(function(err) {
          return Promise.reject({ code: String(err.code || ''), message: String(err.detail || 'Ошибка загрузки файла') });
        });
      }
      return res.json();
    }, function(err) {
      clearTimeout(timer);
      if (err && err.name === 'AbortError') return Promise.reject({ code: 'timeout', message: 'Загрузка файла прервана' });
      return Promise.reject({ code: 'network', message: 'Ошибка загрузки' });
    });
  }

  // SSE streaming for agent chat
  function agentStreamMessage(chatId, content, onChunk, onDone, onError) {
    var initData = getInitData();
    if (!initData) { if (onError) onError(TELEGRAM_ERROR); return null; }

    var ctrl = new AbortController();

    fetch(API_URL + '/api/agent/chats/' + chatId + '/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': initData },
      body: JSON.stringify({ content: content }),
      signal: ctrl.signal,
      cache: 'no-store',
    }).then(function(res) {
      if (!res.ok) {
        return res.json().catch(function() { return {}; }).then(function(err) {
          if (onError) onError(String(err.detail || 'Ошибка чата'));
        });
      }
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buf = '';

      function read() {
        reader.read().then(function(result) {
          if (result.done) { if (onDone) onDone(); return; }
          buf += decoder.decode(result.value, { stream: true });
          var lines = buf.split('\n');
          buf = lines.pop();
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line.startsWith('data:')) continue;
            var raw = line.slice(5).trim();
            if (raw === '[DONE]') { if (onDone) onDone(); return; }
            try {
              var obj = JSON.parse(raw);
              if (obj.error) { if (onError) onError(obj.error); return; }
              if (obj.text && onChunk) onChunk(obj.text);
            } catch(e) {}
          }
          read();
        }).catch(function(err) {
          if (err && err.name === 'AbortError') return;
          if (onError) onError('Соединение прервано');
        });
      }
      read();
    }).catch(function(err) {
      if (err && err.name === 'AbortError') return;
      if (onError) onError('Нет соединения с сервером');
    });

    return ctrl;
  }

  window.HubicxApi = {
    hasAuth:        function()          { return !!getInitData(); },
    me:             function()          { return request('/auth/me'); },
    pricing:        function()          { return request('/pricing'); },
    profile:        function()          { return request('/profile'); },
    updateProfile:  function(data)      { return request('/profile', { method:'PATCH', body:JSON.stringify(data) }); },
    models:         function(category)  { return requestPublic('/models' + (category ? '?category=' + encodeURIComponent(category) : '')); },
    history:        function()          { return request('/generations/history'); },
    createGeneration: function(p)       { return request('/generations', { method:'POST', body:JSON.stringify(p) }); },
    getTask:        function(id)        { return request('/generations/' + id); },
    sendToChat:     function(taskId)    { return request('/generations/' + taskId + '/send-to-chat', { method:'POST', body:'{}' }); },
    uploadFile:     uploadFile,
    agentChats:     function()          { return request('/agent/chats'); },
    agentCreateChat: function(mode, firstMessage) {
      return request('/agent/chats', { method:'POST', body:JSON.stringify({ agent_mode: mode || 'default', first_message: firstMessage }) });
    },
    agentGetChat:   function(chatId)    { return request('/agent/chats/' + chatId); },
    agentArchiveChat: function(chatId)  { return request('/agent/chats/' + chatId, { method:'DELETE' }); },
    agentStreamMessage: agentStreamMessage,
    createPayment:  function(p)         { return request('/payments/create', { method:'POST', body:JSON.stringify(p) }); },
  };
})();
