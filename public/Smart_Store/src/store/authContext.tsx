import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, tokenStore } from "@/lib/api";

export type AuthUser = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: "customer" | "seller" | "admin";
  avatar?: string;
  phone?: string;
};

interface AuthContextValue {
  user:     AuthUser | null;
  loading:  boolean;
  login:    (email: string, password: string) => Promise<AuthUser>;
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<AuthUser>;
  logout:   () => Promise<void>;
  refresh:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!tokenStore.get()) { setUser(null); return; }
    try {
      const res = await authApi.me();
      setUser(res?.user || res?.data || null);
    } catch {
      tokenStore.clear();
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => { await refresh(); setLoading(false); })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const token = res?.token || res?.accessToken;
    if (token) tokenStore.set(token);
    const u = res?.user || res?.data;
    setUser(u);
    return u as AuthUser;
  };

  const register = async (data: { name: string; email: string; password: string; role?: string }) => {
    const res = await authApi.register(data);
    const token = res?.token || res?.accessToken;
    if (token) tokenStore.set(token);
    const u = res?.user || res?.data;
    setUser(u);
    return u as AuthUser;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
