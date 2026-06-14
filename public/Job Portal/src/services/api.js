const API_BASE = "http://localhost:5005/api";

// Helper to get auth headers
const getHeaders = () => {
  const token = localStorage.getItem("sholok_token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

// Generic fetch wrapper
const request = async (url, options = {}) => {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: getHeaders(),
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ==================== AUTH ====================
export const authAPI = {
  register: (body) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  getMe: () => request("/auth/me"),

  getUsers: (params = "") => request(`/auth/users?${params}`),

  createAdmin: (body) =>
    request("/auth/create-admin", { method: "POST", body: JSON.stringify(body) }),

  toggleUserStatus: (id) =>
    request(`/auth/users/${id}/toggle-status`, { method: "PUT" }),

  deleteUser: (id) =>
    request(`/auth/users/${id}`, { method: "DELETE" }),
};

// ==================== JOBS ====================
export const jobsAPI = {
  // Public — approved jobs
  getApproved: (params = "") => request(`/jobs?${params}`),

  // Single job
  getById: (id) => request(`/jobs/${id}`),

  // Vendor — CRUD
  create: (body) =>
    request("/jobs", { method: "POST", body: JSON.stringify(body) }),

  update: (id, body) =>
    request(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  delete: (id) =>
    request(`/jobs/${id}`, { method: "DELETE" }),

  getMyJobs: (params = "") => request(`/jobs/my-jobs?${params}`),

  // Admin / Super Admin
  getAll: (params = "") => request(`/jobs/all?${params}`),

  sendToSuperAdmin: (id) =>
    request(`/jobs/send-to-super-admin/${id}`, { method: "PUT" }),

  approve: (id) =>
    request(`/jobs/approve/${id}`, { method: "PUT" }),

  reject: (id, reason = "") =>
    request(`/jobs/reject/${id}`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),
};

// ==================== DASHBOARD ====================
export const dashboardAPI = {
  getStats: () => request("/dashboard/stats"),
};

// ==================== COMPANIES ====================
export const companiesAPI = {
  getAll: (params = "") => request(`/companies?${params}`),
  getById: (id) => request(`/companies/${id}`),
  create: (body) =>
    request("/companies", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    request(`/companies/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id) =>
    request(`/companies/${id}`, { method: "DELETE" }),
};

// ==================== META (Categories, Locations, Stats) ====================
export const metaAPI = {
  getCategories: () => request("/meta/categories"),
  getLocations: () => request("/meta/locations"),
  getPublicStats: () => request("/meta/stats"),
};
