import api from '../lib/axios';

export const bannerService = {
  getAll: async (params) => {
    try {
      const response = await api.get('/banners', { params });
      const d = response.data;
      // Return { banners: [...] } or { data: [...] } consistently
      if (Array.isArray(d)) return { banners: d, data: d };
      return d && typeof d === 'object' ? d : { banners: [], data: [] };
    } catch (error) {
      console.error('Error fetching banners:', error);
      return { banners: [], data: [] };
    }
  },
};

export const couponService = {
  verify: async (code, cartTotal) => {
    const response = await api.post('/coupons/verify', { code, cartTotal });
    return response.data;
  },

  getAvailable: async () => {
    const response = await api.get('/coupons/available');
    return response.data;
  },
};

export const deliveryService = {
  getSlots: async () => {
    const response = await api.get('/delivery/slots');
    return response.data;
  },

  checkAvailability: async (postalCode, city) => {
    const response = await api.post('/delivery/check-availability', { postalCode, city });
    return response.data;
  },

  getAreas: async () => {
    const response = await api.get('/delivery/areas');
    return response.data;
  },
};

export const searchService = {
  search: async (query, limit = 10) => {
    const response = await api.get('/search', { params: { q: query, limit } });
    return response.data;
  },

  getSuggestions: async (query) => {
    const response = await api.get('/search/suggestions', { params: { q: query } });
    return response.data;
  },
};
