import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If 401 → clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────
export const adminLogin = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const adminRegister = (name: string, email: string, password: string) =>
  api.post('/auth/register', { name, email, password, role: 'seller' });

// ── Dashboard Stats ───────────────────────────────────────────────
export const fetchAdminStats = () => api.get('/admin/dashboard');

// ── Users ─────────────────────────────────────────────────────────
export const fetchUsers = (params?: Record<string, string | number>) =>
  api.get('/admin/users', { params });

export const banUser = (id: string, reason?: string) =>
  api.put(`/admin/users/${id}/ban`, { reason });

// ── Vendors (Sellers) ─────────────────────────────────────────────
export const fetchPendingSellers = (params?: Record<string, string | number>) =>
  api.get('/admin/sellers/pending', { params });

export const updateSellerStatus = (id: string, status: 'approved' | 'rejected', reason?: string) =>
  api.put(`/admin/sellers/${id}/status`, { status, reason });

// ── Products ─────────────────────────────────────────────────────
export const fetchAdminProducts = (params?: Record<string, string | number>) =>
  api.get('/admin/products', { params });

export const toggleFeaturedProduct = (id: string) =>
  api.put(`/admin/products/${id}/feature`);

// ── Orders ────────────────────────────────────────────────────────
export const fetchAdminOrders = (params?: Record<string, string | number>) =>
  api.get('/admin/orders', { params });

export const updateOrderStatus = (id: string, status: string) =>
  api.put(`/admin/orders/${id}/status`, { status });

// ── Stores ────────────────────────────────────────────────────────
export const toggleStoreStatus = (id: string) =>
  api.put(`/admin/stores/${id}/toggle`);

export const toggleFeaturedStore = (id: string) =>
  api.put(`/admin/stores/${id}/feature`);

// ── Banners ───────────────────────────────────────────────────────
export const fetchBanners = () => api.get('/admin/banners');

export const deleteBanner = (id: string) => api.delete(`/admin/banners/${id}`);

// ── Categories ────────────────────────────────────────────────────
export const fetchCategories = () => api.get('/categories');

// ── Coupons ───────────────────────────────────────────────────────
export const fetchCoupons = () => api.get('/coupons');

// ── Reviews ───────────────────────────────────────────────────────
export const fetchReviews = (params?: Record<string, string | number>) =>
  api.get('/reviews', { params });
