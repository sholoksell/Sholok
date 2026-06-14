import api from '../lib/axios';

export const reviewService = {
  // Get approved reviews for a product (public)
  getProductReviews: async (productId) => {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      const raw = response.data;
      // Backend returns a plain array; normalise to { reviews, stats }
      const reviews = Array.isArray(raw) ? raw : (raw.reviews || []);
      const distribution = [1, 2, 3, 4, 5].map(
        (s) => reviews.filter((r) => r.rating === s).length
      );
      const total = reviews.length;
      const averageRating =
        total > 0
          ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
          : 0;
      return {
        reviews,
        stats: raw.stats || { total, averageRating, distribution },
      };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return { reviews: [], stats: { total: 0, averageRating: 0, distribution: [0,0,0,0,0] } };
    }
  },

  // Submit a review (requires auth)
  submitReview: async ({ productId, rating, title, comment }) => {
    const response = await api.post('/reviews', { productId, rating, title, comment });
    return response.data;
  },

  // Get customer's own reviews
  getMyReviews: async () => {
    try {
      const response = await api.get('/reviews/my-reviews');
      return response.data;
    } catch (error) {
      console.error('Error fetching my reviews:', error);
      return [];
    }
  },
};
