import axios from 'axios';

// In production (cPanel): set VITE_API_URL=https://yourdomain.com in frontend/.env.production
// In development: Vite proxies /blog-api → http://localhost:5050/api
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/blog-api';

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
