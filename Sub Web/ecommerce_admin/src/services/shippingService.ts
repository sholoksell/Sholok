import api from '@/lib/axios';

export interface DeliveryArea {
  _id: string;
  name: string;
  city: string;
  postalCodes: string[];
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  estimatedDeliveryDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingStats {
  totalAreas: number;
  activeAreas: number;
  shippedOrders: number;
  deliveredOrders: number;
  outForDelivery: number;
  pendingShipment: number;
  totalShippingRevenue: number;
}

export interface ShippingOrder {
  _id: string;
  orderNumber: string;
  customerId: { _id: string; name: string; email: string; phone?: string } | string;
  status: string;
  total: number;
  trackingId?: string;
  shippingAddress?: any;
  deliveryAddress?: any;
  createdAt: string;
}

export interface ShippingMethod {
  _id: string;
  name: string;
  type: 'flat' | 'weight' | 'free' | 'cod' | 'express';
  baseCharge: number;
  freeThreshold?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const shippingApi = {
  getAreas: async (): Promise<DeliveryArea[]> => {
    const response = await api.get('/shipping/areas');
    return response.data;
  },
  createArea: async (data: Partial<DeliveryArea>): Promise<DeliveryArea> => {
    const response = await api.post('/shipping/areas', data);
    return response.data;
  },
  updateArea: async (id: string, data: Partial<DeliveryArea>): Promise<DeliveryArea> => {
    const response = await api.put(`/shipping/areas/${id}`, data);
    return response.data;
  },
  deleteArea: async (id: string): Promise<void> => {
    await api.delete(`/shipping/areas/${id}`);
  },
  getStats: async (): Promise<ShippingStats> => {
    const response = await api.get('/shipping/stats');
    return response.data;
  },
  getOrders: async (status?: string): Promise<ShippingOrder[]> => {
    const response = await api.get('/shipping/orders', { params: { status } });
    return response.data;
  },
  updateOrderStatus: async (id: string, status: string, trackingId?: string): Promise<ShippingOrder> => {
    const response = await api.patch(`/shipping/orders/${id}/status`, { status, trackingId });
    return response.data;
  },
  getMethods: async (): Promise<ShippingMethod[]> => {
    const response = await api.get('/shipping/methods');
    return response.data;
  },
  createMethod: async (data: Partial<ShippingMethod>): Promise<ShippingMethod> => {
    const response = await api.post('/shipping/methods', data);
    return response.data;
  },
  updateMethod: async (id: string, data: Partial<ShippingMethod>): Promise<ShippingMethod> => {
    const response = await api.put(`/shipping/methods/${id}`, data);
    return response.data;
  },
  deleteMethod: async (id: string): Promise<void> => {
    await api.delete(`/shipping/methods/${id}`);
  },
  exportCsv: async (): Promise<Blob> => {
    const response = await api.get('/shipping/export', { responseType: 'blob' });
    return response.data;
  },
};
