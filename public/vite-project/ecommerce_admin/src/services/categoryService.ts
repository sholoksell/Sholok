import api from '@/lib/axios';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  banner: string;
  icon: string;
  metaTitle: string;
  metaDescription: string;
  parentId: string | null;
  isActive: boolean;
  featured: boolean;
  order: number;
  showOnMenu: boolean;
  showOnHomepage: boolean;
  showInSearch: boolean;
  createdAt: string;
  updatedAt: string;
}

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
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

  bulkDelete: async (ids: string[]): Promise<void> => {
    await api.post('/categories/bulk-delete', { ids });
  },

  bulkUpdate: async (ids: string[], isActive: boolean): Promise<void> => {
    await api.post('/categories/bulk-update', { ids, isActive });
  },
};
