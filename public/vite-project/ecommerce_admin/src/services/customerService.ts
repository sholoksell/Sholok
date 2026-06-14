import api from '@/lib/axios';

export interface CustomerAddress {
  _id?: string;
  label: string;
  name?: string;
  phone?: string;
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  type: 'billing' | 'shipping' | 'both';
  isDefault: boolean;
}

export interface CustomerAnalytics {
  total: number;
  newLast30Days: number;
  returning: number;
  firstTime: number;
  topSpenders: Array<{ _id: string; name: string; email: string; totalSpent: number; totalOrders: number; group: string }>;
  groupDistribution: Array<{ _id: string; count: number; totalRevenue: number }>;
  avgLifetimeValue: number;
  avgOrderFrequency: number;
  retentionRate: number;
  activeRecently: number;
}

export interface PointsHistoryEntry {
  type: 'earned' | 'redeemed' | 'bonus' | 'adjusted';
  points: number;
  description: string;
  orderId?: string;
  date: string;
}

export interface LoginHistoryEntry {
  ip: string;
  device: string;
  date: string;
}

export interface CustomerNotification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'promo' | 'warning' | 'account';
  read: boolean;
  createdAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'blocked';
  group: 'regular' | 'wholesale' | 'vip' | 'dealer';
  groupDiscount: number;
  rewardPoints: number;
  pointsHistory: PointsHistoryEntry[];
  wishlist: string[];
  lastLoginDate: string | null;
  lastLoginIp: string;
  loginHistory: LoginHistoryEntry[];
  suspendedUntil: string | null;
  notifications: CustomerNotification[];
  addresses: CustomerAddress[];
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  passwordResetToken: string | null;
  isActivated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetails {
  customer: Customer;
  orders: any[];
  reviews: any[];
}

export const customerApi = {
  getAll: async (params?: {
    status?: string;
    search?: string;
    group?: string;
  }): Promise<Customer[]> => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  getDetails: async (id: string): Promise<CustomerDetails> => {
    const response = await api.get(`/customers/${id}/details`);
    return response.data;
  },

  create: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string; restoredOrders?: number; restoredItems?: number }> => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  updateGroup: async (id: string, group: string, groupDiscount?: number): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}/group`, { group, groupDiscount });
    return response.data;
  },

  addPoints: async (id: string, type: string, points: number, description: string): Promise<Customer> => {
    const response = await api.post(`/customers/${id}/points`, { type, points, description });
    return response.data;
  },

  getLoginActivity: async (id: string) => {
    const response = await api.get(`/customers/${id}/login-activity`);
    return response.data;
  },

  updateStatus: async (id: string, status: 'active' | 'inactive' | 'blocked', suspendedUntil?: string | null): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}/status`, { status, suspendedUntil });
    return response.data;
  },

  sendNotification: async (id: string, data: { title: string; message: string; type?: string }): Promise<{ success: boolean }> => {
    const response = await api.post(`/customers/${id}/notify`, data);
    return response.data;
  },

  bulkNotify: async (customerIds: string[], data: { title: string; message: string; type?: string }): Promise<{ success: boolean; sent: number }> => {
    const response = await api.post('/customers/bulk-notify', { customerIds, ...data });
    return response.data;
  },

  getNotifications: async (id: string): Promise<CustomerNotification[]> => {
    const response = await api.get(`/customers/${id}/notifications`);
    return response.data;
  },

  // Analytics
  getAnalytics: async (): Promise<CustomerAnalytics> => {
    const response = await api.get('/customers/analytics');
    return response.data;
  },

  // Export (triggers CSV download)
  exportCsv: async (params?: { status?: string; group?: string }): Promise<void> => {
    const queryStr = params ? new URLSearchParams(params as any).toString() : '';
    const response = await api.get(`/customers/export${queryStr ? '?' + queryStr : ''}`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  },

  // Import
  importCustomers: async (customers: any[]): Promise<{ imported: number; skipped: number; errors: string[] }> => {
    const response = await api.post('/customers/import', { customers });
    return response.data;
  },

  // Address book (admin)
  addAddress: async (id: string, address: Partial<CustomerAddress>): Promise<CustomerAddress[]> => {
    const response = await api.post(`/customers/${id}/addresses`, address);
    return response.data;
  },

  updateAddress: async (id: string, addrId: string, address: Partial<CustomerAddress>): Promise<CustomerAddress[]> => {
    const response = await api.put(`/customers/${id}/addresses/${addrId}`, address);
    return response.data;
  },

  deleteAddress: async (id: string, addrId: string): Promise<CustomerAddress[]> => {
    const response = await api.delete(`/customers/${id}/addresses/${addrId}`);
    return response.data;
  },

  // Security
  resetPassword: async (id: string): Promise<{ success: boolean; tempPassword: string; message: string }> => {
    const response = await api.post(`/customers/${id}/reset-password`);
    return response.data;
  },

  sendActivationLink: async (id: string): Promise<{ success: boolean; activationLink: string }> => {
    const response = await api.post(`/customers/${id}/send-activation`);
    return response.data;
  },
};
