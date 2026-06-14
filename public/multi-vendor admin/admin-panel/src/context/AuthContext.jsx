import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sholok_admin_token");
    if (token) fetchMe();
    else setLoading(false);
  }, []);

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      if (data.user.role !== "admin") {
        localStorage.removeItem("sholok_admin_token");
        setUser(null);
      } else {
        setUser(data.user);
      }
    } catch {
      localStorage.removeItem("sholok_admin_token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.user.role !== "admin") throw new Error("Access denied. Admin only.");
    localStorage.setItem("sholok_admin_token", data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("sholok_admin_token");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, fetchMe }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
