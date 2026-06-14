import axios from 'axios';

const API_BASE = '/blog-api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sholok_blog_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    // If the server returns HTML instead of JSON (e.g. catch-all CDN rewrite),
    // treat it as an unavailable API so callers fall back to empty state.
    if (typeof res.data === 'string' && res.data.trimStart().startsWith('<')) {
      return Promise.reject(new Error('API unavailable'));
    }
    return res;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sholok_blog_token');
      localStorage.removeItem('sholok_blog_user');
      window.location.href = '/blog/login';
    }
    return Promise.reject(error);
  }
);

export default api;
