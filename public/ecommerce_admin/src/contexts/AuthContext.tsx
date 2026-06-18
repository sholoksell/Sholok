import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, RegisterData } from '@/services/authService';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager';
}

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const stored = localStorage.getItem('admin');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password });
      const adminData: Admin = {
        id: response.admin.id,
        email: response.admin.email,
        name: response.admin.name,
        role: response.admin.role as 'super_admin' | 'admin' | 'manager',
      };
      
      setAdmin(adminData);
      localStorage.setItem('admin', JSON.stringify(adminData));
      localStorage.setItem('admin_token', response.token);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await authApi.register(data);
      const adminData: Admin = {
        id: response.admin.id,
        email: response.admin.email,
        name: response.admin.name,
        role: response.admin.role as 'super_admin' | 'admin' | 'manager',
      };
      
      setAdmin(adminData);
      localStorage.setItem('admin', JSON.stringify(adminData));
      localStorage.setItem('admin_token', response.token);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = useCallback(() => {
    setAdmin(null);
    localStorage.removeItem('admin');
    localStorage.removeItem('admin_token');
  }, []);

  // Listen for auth-logout events from axios interceptor (on 401 responses)
  useEffect(() => {
    const handleAuthLogout = () => {
      setAdmin(null);
    };
    window.addEventListener('admin-auth-logout', handleAuthLogout);
    return () => window.removeEventListener('admin-auth-logout', handleAuthLogout);
  }, []);

  // Verify token is still valid on app mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token && admin) {
      authApi.getMe().then((data) => {
        // Token is valid, update admin data
        const adminData: Admin = {
          id: data.admin?.id || data.id || admin.id,
          email: data.admin?.email || data.email || admin.email,
          name: data.admin?.name || data.name || admin.name,
          role: (data.admin?.role || data.role || admin.role) as 'super_admin' | 'admin' | 'manager',
        };
        setAdmin(adminData);
        localStorage.setItem('admin', JSON.stringify(adminData));
      }).catch(() => {
        // Token is invalid/expired - only then logout
        // Don't logout on network errors
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
