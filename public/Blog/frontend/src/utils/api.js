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
  (res) => res,
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
