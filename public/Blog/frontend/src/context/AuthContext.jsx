import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  const initSocket = useCallback((userId) => {
    // Socket URL comes from env var; falls back to current origin (works through Vite proxy in dev)
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const s = io(socketUrl, { transports: ['websocket', 'polling'] });
    s.on('connect', () => s.emit('join', userId));
    setSocket(s);
    return s;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('sholok_blog_token');
    const savedUser = localStorage.getItem('sholok_blog_user');

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        const s = initSocket(parsedUser._id);
        // Verify token with server
        api.get('/auth/me').then((res) => {
          setUser(res.data.user);
          localStorage.setItem('sholok_blog_user', JSON.stringify(res.data.user));
        }).catch(() => {
          logout();
        }).finally(() => setLoading(false));
        return () => s?.disconnect();
      } catch {
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('sholok_blog_token', token);
    localStorage.setItem('sholok_blog_user', JSON.stringify(user));
    setUser(user);
    const s = initSocket(user._id);
    return { user, socket: s };
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    const { token, user } = res.data;
    localStorage.setItem('sholok_blog_token', token);
    localStorage.setItem('sholok_blog_user', JSON.stringify(user));
    setUser(user);
    initSocket(user._id);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('sholok_blog_token');
    localStorage.removeItem('sholok_blog_user');
    setUser(null);
    socket?.disconnect();
    setSocket(null);
    setLoading(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('sholok_blog_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, socket, login, register, logout, updateUser, isAuthenticated: !!user, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
