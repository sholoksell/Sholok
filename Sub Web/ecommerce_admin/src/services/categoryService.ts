import api from '@/lib/axios';

export interface Category {
  _id: string;
  name: string;
  nameBn: string;
  slug: string;
  description: string;
  image: string;
  banner: string;
  icon: string;
  level: number;
  keywords: string;
  metaTitle: string;
  metaDescription: string;
  parentId: string | null;
  isActive: boolean;
  featured: boolean;
  order: number;
  showOnMenu: boolean;
  showOnHomepage: boolean;
  showInSearch: boolean;
  productCount: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  deleted: number;
  featured: number;
}

export const categoryApi = {
  getAll: async (params?: Record<string, string>): Promise<Category[]> => {
    const query = params ? '?' + new URLSearchParams({ limit: '1000', ...params }).toString() : '?limit=1000';
    const response = await api.get(`/categories${query}`);
    const data = response.data;
    return Array.isArray(data) ? data : (data.categories || []);
  },

  getTree: async (): Promise<Category[]> => {
    const response = await api.get('/categories/tree');
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  getStats: async (): Promise<CategoryStats> => {
    const response = await api.get('/categories/stats');
    return response.data;
  },

  getDeleted: async (): Promise<Category[]> => {
    const response = await api.get('/categories/deleted');
    return response.data;
  },

  create: async (data: Partial<Category>): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  restore: async (id: string): Promise<Category> => {
    const response = await api.patch(`/categories/restore/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string, isActive: boolean): Promise<Category> => {
    const response = await api.patch(`/categories/status/${id}`, { isActive });
    return response.data;
  },

  sort: async (items: { id: string; sort_order: number }[]): Promise<void> => {
    await api.patch('/categories/sort', { items });
  },

  bulkDelete: async (ids: string[], permanent = false): Promise<void> => {
    await api.post('/categories/bulk-delete', { ids, permanent });
  },

  bulkUpdate: async (ids: string[], isActive: boolean): Promise<void> => {
    await api.post('/categories/bulk-update', { ids, isActive });
  },
};
