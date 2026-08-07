import api from '../lib/axios';

export const categoryService = {
  getAll: async (params) => {
    try {
      const response = await api.get('/categories/public/all', { params });
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // All active categories with full nested subcategories - for storefront sidebar
  getPublicAll: async () => {
    try {
      const response = await api.get('/categories/public/all');
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching public categories:', error);
      return [];
    }
  },

  getFeaturedCategories: async () => {
    try {
      const response = await api.get('/categories/public/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured categories:', error);
      throw error;
    }
  },

  getBySlug: async (slug) => {
    try {
      const response = await api.get(`/categories/public/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw error;
    }
  },
};
