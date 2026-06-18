import api from '@/lib/axios';

export interface HomeSectionItem {
  _id?: string;
  productId?: string | null;
  name: string;
  nameBn?: string;
  slug?: string;
  image?: string;
  price?: number;
  comparePrice?: number;
  unit?: string;
  badge?: string;
  minQty?: number;
  description?: string;
  descriptionBn?: string;
  link?: string;
  order?: number;
  isActive?: boolean;
}

export interface HomeSection {
  _id: string;
  key: string;
  title: string;
  titleBn?: string;
  subtitle?: string;
  subtitleBn?: string;
  description?: string;
  descriptionBn?: string;
  icon?: string;
  layout: 'grid' | 'carousel';
  accentColor?: string;
  backgroundColor?: string;
  bannerImage?: string;
  order: number;
  isActive: boolean;
  products: HomeSectionItem[];
  createdAt?: string;
  updatedAt?: string;
}

export const homeSectionApi = {
  list: async (): Promise<HomeSection[]> => {
    const res = await api.get('/home-sections', { params: { all: 'true' } });
    return res.data?.sections ?? res.data?.data ?? res.data ?? [];
  },

  get: async (id: string): Promise<HomeSection> => {
    const res = await api.get(`/home-sections/${id}`);
    return res.data;
  },

  create: async (data: Partial<HomeSection>): Promise<HomeSection> => {
    const res = await api.post('/home-sections', data);
    return res.data;
  },

  update: async (id: string, data: Partial<HomeSection>): Promise<HomeSection> => {
    const res = await api.put(`/home-sections/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/home-sections/${id}`);
  },

  addProduct: async (id: string, item: Partial<HomeSectionItem>): Promise<HomeSection> => {
    const res = await api.post(`/home-sections/${id}/products`, item);
    return res.data;
  },

  updateProduct: async (
    id: string,
    productId: string,
    item: Partial<HomeSectionItem>
  ): Promise<HomeSection> => {
    const res = await api.put(`/home-sections/${id}/products/${productId}`, item);
    return res.data;
  },

  removeProduct: async (id: string, productId: string): Promise<HomeSection> => {
    const res = await api.delete(`/home-sections/${id}/products/${productId}`);
    return res.data;
  },

  seedDefaults: async (): Promise<{ message: string; results: unknown[] }> => {
    const res = await api.post('/home-sections/seed-defaults');
    return res.data;
  },

  reorder: async (items: { _id: string; order: number }[]): Promise<void> => {
    await api.post('/home-sections/reorder', { items });
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.url || '';
  },
};
