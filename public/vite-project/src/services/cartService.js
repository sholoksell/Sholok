import api from '../lib/axios';

export const cartService = {
  get: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  add: async (productId, quantity, variantId) => {
    const response = await api.post('/cart/add', { productId, quantity, variantId });
    return response.data;
  },

  update: async (itemId, quantity) => {
    const response = await api.put(`/cart/update/${itemId}`, { quantity });
    return response.data;
  },

  remove: async (itemId) => {
    const response = await api.delete(`/cart/remove/${itemId}`);
    return response.data;
  },

  clear: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },

  applyCoupon: async (couponCode) => {
    const response = await api.post('/cart/apply-coupon', { couponCode });
    return response.data;
  },
};
