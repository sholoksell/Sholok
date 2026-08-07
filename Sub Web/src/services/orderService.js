import api from '../lib/axios';

export const orderService = {
  create: async (orderData) => {
    const response = await api.post('/customer-auth/orders', orderData);
    return response.data;
  },

  getAll: async (params) => {
    const response = await api.get('/customer-auth/orders', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/customer-auth/orders/${id}`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.put(`/customer-auth/orders/${id}/cancel`);
    return response.data;
  },
};
