import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem("sholok_token");
    if (token) {
      authAPI
        .getMe()
        .then((data) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem("sholok_token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    localStorage.setItem("sholok_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const data = await authAPI.register(formData);
    localStorage.setItem("sholok_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("sholok_token");
    setUser(null);
  };

  const isVendor = user?.role === "vendor";
  const isAdmin = user?.role === "admin";
  const isSuperAdmin = user?.role === "super_admin";
  const isAdminOrAbove = isAdmin || isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isVendor,
        isAdmin,
        isSuperAdmin,
        isAdminOrAbove,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
