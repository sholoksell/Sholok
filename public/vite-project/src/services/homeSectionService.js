import api from '../lib/axios';

// Storefront service for fetching admin-managed Home Page sections.
// Returns an array of sections, each containing a `products` array of items.
export const homeSectionService = {
  getAll: async () => {
    try {
      const response = await api.get('/home-sections');
      const d = response.data;
      if (Array.isArray(d)) return d;
      return d?.sections || d?.data || [];
    } catch (error) {
      console.error('Error fetching home sections:', error);
      return [];
    }
  },

  getByKey: async (key) => {
    try {
      const response = await api.get(`/home-sections/key/${key}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching home section ${key}:`, error);
      return null;
    }
  },
};
