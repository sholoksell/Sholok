import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('customer_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear auth on 401, and not for login/register requests
    if (error.response?.status === 401) {
      const isAuthRequest = error.config?.url?.includes('/customer-auth/login') || 
                            error.config?.url?.includes('/customer-auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer');
        // Notify React AuthContext about the logout
        window.dispatchEvent(new Event('customer-auth-logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
