import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return default values instead of throwing error during development
    return {
      customer: null,
      loading: false,
      isAuthenticated: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem('customer');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer');
    setCustomer(null);
  };

  // Listen for auth-logout events from axios interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      setCustomer(null);
    };
    window.addEventListener('customer-auth-logout', handleAuthLogout);
    return () => window.removeEventListener('customer-auth-logout', handleAuthLogout);
  }, []);

  const fetchCustomer = async () => {
    try {
      const response = await api.get('/customer-auth/me');
      setCustomer(response.data);
      localStorage.setItem('customer', JSON.stringify(response.data));
    } catch (error) {
      // Only logout if we get a 401 (token invalid/expired)
      // Do NOT logout on network errors, 500s, or other transient failures
      if (error.response?.status === 401) {
        console.error('Token expired or invalid, logging out');
        logout();
      } else {
        console.error('Error fetching customer (keeping session):', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    const savedCustomer = localStorage.getItem('customer');

    if (token && savedCustomer) {
      setCustomer(JSON.parse(savedCustomer));
      fetchCustomer();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/customer-auth/login', { email, password });
      const { token, customer: customerData } = response.data;

      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer', JSON.stringify(customerData));
      setCustomer(customerData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const response = await api.post('/customer-auth/register', {
        name,
        email,
        phone,
        password,
      });
      const { token, customer: customerData } = response.data;

      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer', JSON.stringify(customerData));
      setCustomer(customerData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.put('/customer-auth/profile', data);
      const updated = response.data.customer || response.data;
      setCustomer((prev) => ({ ...prev, ...updated }));
      localStorage.setItem('customer', JSON.stringify({ ...customer, ...updated }));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed',
      };
    }
  };

  const value = {
    customer,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!customer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
