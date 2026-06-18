import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/admin-api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear if this is not the login request itself
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin');
        // Dispatch custom event so AuthContext can react without hard reload
        window.dispatchEvent(new Event('admin-auth-logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
