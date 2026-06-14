import api from '../lib/axios';

// Address book service for customer's own addresses (embedded in customer doc)
export const addressService = {
  getAll: async () => {
    const response = await api.get('/customer-auth/addresses');
    return response.data;
  },

  create: async (addressData) => {
    const response = await api.post('/customer-auth/addresses', addressData);
    return response.data;
  },

  update: async (id, addressData) => {
    const response = await api.put(`/customer-auth/addresses/${id}`, addressData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/customer-auth/addresses/${id}`);
    return response.data;
  },

  setDefault: async (id) => {
    const response = await api.patch(`/customer-auth/addresses/${id}/set-default`);
    return response.data;
  },
};
