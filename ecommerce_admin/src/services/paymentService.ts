import api from '@/lib/axios';

export interface Payment {
  _id: string;
  orderId: string | {
    _id: string;
    orderNumber: string;
  } | null;
  customerId?: string | {
    _id: string;
    name: string;
    email: string;
  };
  transactionId: string;
  amount: number;
  method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery' | 'bkash' | 'nagad' | 'rocket' | 'sslcommerz' | 'stripe';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  gateway: string;
  gatewayResponse: any;
  paymentDetails?: Record<string, any>;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const paymentApi = {
  getAll: async (params?: {
    status?: string;
    method?: string;
  }): Promise<Payment[]> => {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Payment> => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  create: async (data: Partial<Payment>): Promise<Payment> => {
    const response = await api.post('/payments', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Payment>): Promise<Payment> => {
    const response = await api.put(`/payments/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: string, notes?: string): Promise<Payment> => {
    const response = await api.patch(`/payments/${id}/status`, { status, notes });
    return response.data;
  },

  refund: async (id: string, data: { refundAmount: number; refundType: string; refundReason: string; refundTo: string }): Promise<Payment> => {
    const response = await api.post(`/payments/${id}/refund`, data);
    return response.data;
  },

  verify: async (id: string, verified: boolean, notes?: string): Promise<Payment> => {
    const response = await api.patch(`/payments/${id}/verify`, { verified, notes });
    return response.data;
  },

  exportCsv: async (params?: Record<string, string>): Promise<Blob> => {
    const response = await api.get('/payments/export', { params, responseType: 'blob' });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/payments/${id}`);
  },
};
