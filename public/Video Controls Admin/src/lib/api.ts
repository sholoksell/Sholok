const API_BASE = "/tv-api";

function getToken(): string | null {
  return localStorage.getItem("vivora_token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(url: string, options: RequestInit = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        ...authHeaders(),
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Server is not responding. Please make sure the backend server is running.");
  }
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Server is not responding. Please make sure the backend server is running.");
  }
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ========== AUTH ==========
export const authApi = {
  register: (body: { username: string; email: string; password: string; displayName?: string; role?: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  getMe: () => request("/auth/me"),

  updateProfile: (body: { displayName?: string; avatar?: string }) =>
    request("/auth/me", { method: "PUT", body: JSON.stringify(body) }),
};

// ========== VIDEOS ==========
export const videoApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string; search?: string; sort?: string; isShort?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) searchParams.set(k, String(v));
      });
    }
    return request(`/videos?${searchParams.toString()}`);
  },

  getById: (id: string) => request(`/videos/${id}`),

  upload: (formData: FormData) =>
    request("/videos/upload", { method: "POST", body: formData }),

  update: (id: string, body: any) =>
    request(`/videos/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  delete: (id: string) => request(`/videos/${id}`, { method: "DELETE" }),

  react: (id: string, type: "like" | "dislike") =>
    request(`/videos/${id}/react`, { method: "POST", body: JSON.stringify({ type }) }),

  getLiked: () => request("/videos/liked"),

  getStreamUrl: (id: string) => `${API_BASE}/videos/stream/${id}`,

  getThumbnailUrl: (id: string) => `${API_BASE}/videos/thumbnail/${id}`,
};

// ========== CHANNELS ==========
export const channelApi = {
  getById: (idOrHandle: string) => request(`/channels/${idOrHandle}`),

  subscribe: (id: string) => request(`/channels/${id}/subscribe`, { method: "POST" }),

  update: (id: string, body: any) =>
    request(`/channels/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  getSubscriptions: () => request("/channels/user/subscriptions"),
};

// ========== COMMENTS ==========
export const commentApi = {
  getForVideo: (videoId: string, page = 1) => request(`/comments/video/${videoId}?page=${page}`),

  add: (body: { videoId: string; text: string; parentComment?: string }) =>
    request("/comments", { method: "POST", body: JSON.stringify(body) }),

  delete: (id: string) => request(`/comments/${id}`, { method: "DELETE" }),

  like: (id: string) => request(`/comments/${id}/like`, { method: "POST" }),
};

// ========== HISTORY ==========
export const historyApi = {
  getAll: () => request("/auth/history"),
  clear: () => request("/auth/history", { method: "DELETE" }),
};

// ========== PLAYLISTS ==========
export const playlistApi = {
  getAll: () => request("/playlists"),
  getById: (id: string) => request(`/playlists/${id}`),
  create: (body: { name: string; description?: string; visibility?: string }) =>
    request("/playlists", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: any) =>
    request(`/playlists/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id: string) => request(`/playlists/${id}`, { method: "DELETE" }),
  addVideo: (id: string, videoId: string) =>
    request(`/playlists/${id}/videos`, { method: "POST", body: JSON.stringify({ videoId }) }),
  removeVideo: (id: string, videoId: string) =>
    request(`/playlists/${id}/videos/${videoId}`, { method: "DELETE" }),
};

// ========== NOTIFICATIONS ==========
export const notificationApi = {
  getAll: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) searchParams.set(k, String(v));
      });
    }
    return request(`/notifications?${searchParams.toString()}`);
  },
  getUnreadCount: () => request("/notifications/unread-count"),
  markAsRead: (id: string) => request(`/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: () => request("/notifications/read-all", { method: "PUT" }),
  delete: (id: string) => request(`/notifications/${id}`, { method: "DELETE" }),
  clearAll: () => request("/notifications", { method: "DELETE" }),
};

// ========== ADMIN ==========
const ADMIN_TOKEN_KEY = "sholok_admin_token";

function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function adminAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

async function adminRequest(url: string, options: RequestInit = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        ...adminAuthHeaders(),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Server is not responding. Please make sure the backend server is running.");
  }
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Server is not responding. Please make sure the backend server is running.");
  }
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const setAdminToken = (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token);
export const removeAdminToken = () => localStorage.removeItem(ADMIN_TOKEN_KEY);
export const isAdminLoggedIn = () => !!getAdminToken();

export const adminAuthApi = {
  login: async (body: { email: string; password: string }) => {
    let res;
    try {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      throw new Error("Server is not responding. Please make sure the backend server is running.");
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    return data;
  },
  verify: () => adminRequest("/auth/me"),
};

export const adminApi = {
  getStats: () => adminRequest("/admin/stats"),
  getUsers: (page = 1) => adminRequest(`/admin/users?page=${page}`),
  toggleUser: (id: string) => adminRequest(`/admin/users/${id}/toggle`, { method: "PUT" }),
  updateUserRole: (id: string, role: string) =>
    adminRequest(`/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
  getVideos: (page = 1, status?: string) =>
    adminRequest(`/admin/videos?page=${page}${status ? `&status=${status}` : ""}`),
  updateVideoControls: (id: string, controls: any) =>
    adminRequest(`/admin/videos/${id}/controls`, { method: "PUT", body: JSON.stringify(controls) }),
  removeVideo: (id: string) => adminRequest(`/admin/videos/${id}`, { method: "DELETE" }),
  getFlagged: () => adminRequest("/admin/flagged"),
};

// ========== HELPERS ==========
export const setToken = (token: string) => localStorage.setItem("vivora_token", token);
export const removeToken = () => localStorage.removeItem("vivora_token");
export const isLoggedIn = () => !!getToken();
