import api from '@/lib/axios';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string | {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  deliveryCharge?: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  deliveryAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    area: string;
    postalCode: string;
    landmark?: string;
    deliveryInstructions?: string;
  };
  notes: string;
  trackingNumber?: string;
  courierName?: string;
  estimatedDeliveryDate?: string;
  adminNote?: string;
  statusHistory?: { status: string; note?: string; date: string }[];
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const orderApi = {
  getAll: async (params?: {
    status?: string;
    paymentStatus?: string;
    search?: string;
  }): Promise<Order[]> => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (data: Partial<Order>): Promise<Order> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Order>): Promise<Order> => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  updatePaymentStatus: async (id: string, paymentStatus: string): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/payment-status`, { paymentStatus });
    return response.data;
  },

  updateTracking: async (id: string, data: { trackingNumber: string; courierName: string; estimatedDeliveryDate: string }): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/tracking`, data);
    return response.data;
  },

  updateNote: async (id: string, note: string): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/note`, { note });
    return response.data;
  },

  bulkAction: async (ids: string[], action: string, value?: string): Promise<{ updated: number }> => {
    const response = await api.post('/orders/bulk-action', { ids, action, value });
    return response.data;
  },

  exportCsv: async (params?: Record<string, string>): Promise<Blob> => {
    const response = await api.get('/orders/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  getInvoice: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}/invoice`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
};
