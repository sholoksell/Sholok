/**
 * Sholok Smart Store — API Service
 * Connects the React frontend to the Express/MongoDB backend.
 * Falls back gracefully to mock data if the API is unavailable.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// ── Token storage ────────────────────────────────────────────
const TOKEN_KEY = "sholok_token";
export const tokenStore = {
  get:    () => localStorage.getItem(TOKEN_KEY),
  set:    (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear:  () => localStorage.removeItem(TOKEN_KEY),
};

// ── Fetch wrapper with auth header ───────────────────────────
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res   = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "API Error");
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login:    (email: string, password: string) =>
    apiFetch<any>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  register: (data: { name: string; email: string; password: string; role?: string }) =>
    apiFetch<any>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  me:       () => apiFetch<any>("/auth/me"),
  logout:   () => apiFetch<any>("/auth/logout", { method: "POST" }),
  updateProfile:  (data: any) => apiFetch<any>("/auth/update-profile",  { method: "PUT", body: JSON.stringify(data) }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch<any>("/auth/change-password", { method: "PUT", body: JSON.stringify(data) }),
};

// ── Products ──────────────────────────────────────────────────
export const productsApi = {
  list: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch<any>(`/products${qs ? "?" + qs : ""}`);
  },
  get:        (id: string)        => apiFetch<any>(`/products/${id}`),
  featured:   ()                  => apiFetch<any>("/products/featured"),
  seasonal:   (season: string)    => apiFetch<any>(`/products?season=${season}&limit=12`),
  flashSale:  ()                  => apiFetch<any>("/flash-sales/active"),
  myProducts: ()                  => apiFetch<any>("/products/seller/my-products"),
  create:     (data: any)         => apiFetch<any>("/products", { method: "POST", body: JSON.stringify(data) }),
  update:     (id: string, data: any) => apiFetch<any>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove:     (id: string)        => apiFetch<any>(`/products/${id}`, { method: "DELETE" }),
};

// ── Stores ────────────────────────────────────────────────────
export const storesApi = {
  list:     (params = {}) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch<any>(`/stores${qs ? "?" + qs : ""}`);
  },
  get:      (slug: string)  => apiFetch<any>(`/stores/${slug}`),
  featured: ()              => apiFetch<any>("/stores/featured"),
  me:       ()              => apiFetch<any>("/stores/me"),
  updateMe: (data: any)     => apiFetch<any>("/stores/me", { method: "PUT", body: JSON.stringify(data) }),
};

// ── Categories ────────────────────────────────────────────────
export const categoriesApi = {
  list: ()              => apiFetch<any>("/categories"),
  get:  (slug: string)  => apiFetch<any>(`/categories/${slug}`),
};

// ── Cart ──────────────────────────────────────────────────────
export const cartApi = {
  get:    ()                                              => apiFetch<any>("/cart"),
  add:    (productId: string, quantity = 1, variant?: any) =>
    apiFetch<any>("/cart/add", { method: "POST", body: JSON.stringify({ productId, quantity, variant }) }),
  update: (itemId: string, quantity: number)              =>
    apiFetch<any>(`/cart/${itemId}`, { method: "PUT", body: JSON.stringify({ quantity }) }),
  remove: (itemId: string)                                => apiFetch<any>(`/cart/${itemId}`, { method: "DELETE" }),
  clear:  ()                                              => apiFetch<any>("/cart", { method: "DELETE" }),
};

// ── Wishlist ──────────────────────────────────────────────────
export const wishlistApi = {
  get:    ()                  => apiFetch<any>("/wishlist"),
  toggle: (productId: string) => apiFetch<any>(`/wishlist/${productId}`, { method: "POST" }),
};

// ── Orders ────────────────────────────────────────────────────
export const ordersApi = {
  place:        (data: any) => apiFetch<any>("/orders", { method: "POST", body: JSON.stringify(data) }),
  myOrders:     ()          => apiFetch<any>("/orders/my-orders"),
  sellerOrders: ()          => apiFetch<any>("/orders/seller"),
  get:          (id: string) => apiFetch<any>(`/orders/${id}`),
  updateStatus: (id: string, status: string, trackingNumber?: string) =>
    apiFetch<any>(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status, trackingNumber }) }),
};

// ── Reviews ───────────────────────────────────────────────────
export const reviewsApi = {
  forProduct: (productId: string) => apiFetch<any>(`/reviews/product/${productId}`),
  create:     (productId: string, data: { rating: number; title?: string; body: string; images?: string[] }) =>
    apiFetch<any>(`/reviews/product/${productId}`, { method: "POST", body: JSON.stringify(data) }),
  remove:     (id: string) => apiFetch<any>(`/reviews/${id}`, { method: "DELETE" }),
};

// ── Questions / Q&A ───────────────────────────────────────────
export const questionsApi = {
  forProduct: (productId: string) => apiFetch<any>(`/questions/product/${productId}`),
  ask:        (productId: string, body: string) =>
    apiFetch<any>(`/questions/product/${productId}`, { method: "POST", body: JSON.stringify({ body }) }),
  answer:     (questionId: string, body: string) =>
    apiFetch<any>(`/questions/${questionId}/answer`, { method: "POST", body: JSON.stringify({ body }) }),
  remove:     (id: string) => apiFetch<any>(`/questions/${id}`, { method: "DELETE" }),
};

// ── Coupons ───────────────────────────────────────────────────
export const couponsApi = {
  validate: (code: string, orderTotal: number) =>
    apiFetch<any>("/coupons/validate", { method: "POST", body: JSON.stringify({ code, orderTotal }) }),
  list:     ()              => apiFetch<any>("/coupons"),
  create:   (data: any)     => apiFetch<any>("/coupons", { method: "POST", body: JSON.stringify(data) }),
  update:   (id: string, data: any) => apiFetch<any>(`/coupons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove:   (id: string)    => apiFetch<any>(`/coupons/${id}`, { method: "DELETE" }),
};

// ── Group Buys ────────────────────────────────────────────────
export const groupBuysApi = {
  active: ()            => apiFetch<any>("/group-buys/active"),
  get:    (id: string)  => apiFetch<any>(`/group-buys/${id}`),
  join:   (id: string)  => apiFetch<any>(`/group-buys/${id}/join`,  { method: "POST" }),
  leave:  (id: string)  => apiFetch<any>(`/group-buys/${id}/leave`, { method: "POST" }),
  create: (data: any)   => apiFetch<any>("/group-buys", { method: "POST", body: JSON.stringify(data) }),
};

// ── Notifications ─────────────────────────────────────────────
export const notificationsApi = {
  list:    ()            => apiFetch<any>("/notifications"),
  read:    (id: string)  => apiFetch<any>(`/notifications/${id}/read`, { method: "PUT" }),
  readAll: ()            => apiFetch<any>("/notifications/read-all",   { method: "PUT" }),
  remove:  (id: string)  => apiFetch<any>(`/notifications/${id}`, { method: "DELETE" }),
};

// ── Analytics (seller) ────────────────────────────────────────
export const analyticsApi = {
  seller: () => apiFetch<any>("/analytics/seller"),
};

// ── Banners / Hero ────────────────────────────────────────────
export const bannersApi = {
  list: (slot?: string) => apiFetch<any>(`/banners${slot ? `?slot=${slot}` : ""}`),
};

// ── Payments ──────────────────────────────────────────────────
export const paymentsApi = {
  stripeIntent: (amount: number, orderId?: string) =>
    apiFetch<any>("/payments/create-payment-intent", { method: "POST", body: JSON.stringify({ amount, orderId }) }),
  sslcommerzInit:  (orderId: string) =>
    apiFetch<any>(`/payments/sslcommerz/init/${orderId}`, { method: "POST" }),
  naverpayReserve: (orderId: string) =>
    apiFetch<any>(`/payments/naverpay/reserve/${orderId}`, { method: "POST" }),
  naverpayApprove: (orderId: string, paymentId: string) =>
    apiFetch<any>("/payments/naverpay/approve", { method: "POST", body: JSON.stringify({ orderId, paymentId }) }),
};

export default apiFetch;
