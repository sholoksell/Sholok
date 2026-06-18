import api from '@/lib/axios';

export interface Review {
  _id: string;
  productId: {
    _id: string;
    name: string;
    thumbnail: string;
  };
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRating: number;
}

export const reviewApi = {
  getAll: async (params?: {
    status?: string;
    productId?: string;
    search?: string;
  }): Promise<Review[]> => {
    const response = await api.get('/reviews', { params });
    return response.data;
  },

  getStats: async (): Promise<ReviewStats> => {
    const response = await api.get('/reviews/stats');
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<Review> => {
    const response = await api.patch(`/reviews/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },

  bulkUpdateStatus: async (ids: string[], status: string): Promise<void> => {
    await api.post('/reviews/bulk-status', { ids, status });
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    await api.post('/reviews/bulk-delete', { ids });
  },
};
