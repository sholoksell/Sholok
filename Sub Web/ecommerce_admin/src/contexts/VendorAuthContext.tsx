import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Vendor {
  _id: number;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  slug: string;
  storeName: string;
  storeLogo: string;
  storeBanner: string;
  storeDescription: string;
  status: string;
  isVerified: boolean;
  rating: number | null;
  ratingCount: number;
  totalOrders: number;
  totalSales: number;
  wallet?: { currentBalance: number; pendingSettlement: number; holdAmount: number };
}

interface VendorAuthContextType {
  vendor: Vendor | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateVendor: (v: Vendor) => void;
}

const VendorAuthContext = createContext<VendorAuthContextType | null>(null);

export function VendorAuthProvider({ children }: { children: ReactNode }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('vendor_token');
    if (saved) {
      setToken(saved);
      fetch('/admin-api/vendor-auth/me', { headers: { Authorization: `Bearer ${saved}` } })
        .then(r => r.json())
        .then(data => { if (data._id) setVendor(data); else localStorage.removeItem('vendor_token'); })
        .catch(() => localStorage.removeItem('vendor_token'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/admin-api/vendor-auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('vendor_token', data.token);
    setToken(data.token);
    setVendor(data.vendor);
  };

  const logout = () => {
    localStorage.removeItem('vendor_token');
    setToken(null);
    setVendor(null);
  };

  const updateVendor = (v: Vendor) => setVendor(v);

  return (
    <VendorAuthContext.Provider value={{ vendor, token, login, logout, isLoading, updateVendor }}>
      {children}
    </VendorAuthContext.Provider>
  );
}

export function useVendorAuth() {
  const ctx = useContext(VendorAuthContext);
  if (!ctx) throw new Error('useVendorAuth must be used within VendorAuthProvider');
  return ctx;
}
