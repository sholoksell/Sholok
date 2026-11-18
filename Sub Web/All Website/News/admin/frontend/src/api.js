const BASE = '/news-api';

function getToken() { return localStorage.getItem('news_admin_token') || ''; }

async function req(method, path, body, isForm) {
  const headers = { Authorization: `Bearer ${getToken()}` };
  if (!isForm) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : (body ? JSON.stringify(body) : undefined),
  });
  if (res.status === 401) { localStorage.removeItem('news_admin_token'); window.location.href = '/news/admin328/'; }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  get: (path) => req('GET', path),
  post: (path, body) => req('POST', path, body),
  put: (path, body) => req('PUT', path, body),
  del: (path) => req('DELETE', path),
  postForm: (path, form) => req('POST', path, form, true),
  login: (email, password) => req('POST', '/auth/login', { email, password }),
  register: (name, email, password, inviteCode) => req('POST', '/auth/register', { name, email, password, inviteCode }),
  me: () => req('GET', '/auth/me'),
};

export default api;
