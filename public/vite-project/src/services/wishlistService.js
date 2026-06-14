import api from '../lib/axios';

export const wishlistService = {
  // Get all wishlist items
  getAll: async () => {
    try {
      const response = await api.get('/wishlist');
      return response.data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  },

  // Add product to wishlist
  add: async (productId) => {
    const response = await api.post('/wishlist/add', { productId });
    return response.data;
  },

  // Remove product from wishlist
  remove: async (productId) => {
    const response = await api.post('/wishlist/remove', { productId });
    return response.data;
  },

  // Check if product is in wishlist
  check: async (productId) => {
    try {
      const response = await api.get(`/wishlist/check/${productId}`);
      return response.data.isInWishlist;
    } catch {
      return false;
    }
  },
};
