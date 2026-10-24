import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authApi, setToken, removeToken, isLoggedIn } from "@/lib/api";

interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string;
  role: "viewer" | "creator" | "admin";
}

interface Channel {
  _id: string;
  name: string;
  handle: string;
  avatar: string;
  subscriberCount: number;
}

interface AuthContextType {
  user: User | null;
  channel: Channel | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; displayName?: string; role?: string }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isLoggedIn()) {
      setUser(null);
      setChannel(null);
      setLoading(false);
      return;
    }
    try {
      const data = await authApi.getMe();
      setUser(data.user);
      setChannel(data.channel);
    } catch {
      removeToken();
      setUser(null);
      setChannel(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    await refresh();
  };

  const register = async (body: { username: string; email: string; password: string; displayName?: string; role?: string }) => {
    const data = await authApi.register(body);
    setToken(data.token);
    setUser(data.user);
    await refresh();
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setChannel(null);
  };

  return (
    <AuthContext.Provider value={{ user, channel, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
