import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sholok_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("sholok_admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
