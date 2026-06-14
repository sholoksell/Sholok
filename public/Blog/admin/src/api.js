import axios from 'axios';

const api = axios.create({ baseURL: '/blog-api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sholok_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('sholok_admin_token');
      localStorage.removeItem('sholok_admin_user');
      window.location.href = '/blog/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
