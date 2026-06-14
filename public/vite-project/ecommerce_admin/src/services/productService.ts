import api from '@/lib/axios';

export interface ProductVariant {
  id?: string;
  name: string;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  attributes: Record<string, string>;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  regularPrice: number;
  salePrice: number | null;
  sku: string;
  stock: number;
  images: string[];
  variants: ProductVariant[];
  status: 'active' | 'draft' | 'out_of_stock';
  featured: boolean;
  isNew: boolean;
  onSale: boolean;
  tags: string[];
  scheduledPublishDate: string | null;
  availabilityDate: string | null;
  shippingClass: 'standard' | 'express' | 'free' | 'heavy' | 'fragile' | 'custom';
  shippingCharge: number;
  visibility: 'visible' | 'hidden';
  relatedProducts: string[];
  upsellProducts: string[];
  crossSellProducts: string[];
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export const productApi = {
  getAll: async (params?: {
    category?: string;
    status?: string;
    search?: string;
  }): Promise<Product[]> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (data: Partial<Product>): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    await api.post('/products/bulk-delete', { ids });
  },

  bulkUpdate: async (ids: string[], status: string): Promise<void> => {
    await api.post('/products/bulk-update', { ids, status });
  },

  updateStock: async (id: string, stock: number): Promise<Product> => {
    const response = await api.patch(`/products/${id}/stock`, { stock });
    return response.data;
  },
};
