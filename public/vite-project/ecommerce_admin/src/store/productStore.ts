import { create } from 'zustand';
import { productApi, Product as ApiProduct } from '@/services/productService';

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  attributes: Record<string, string>; // e.g., { color: 'Red', size: 'M' }
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string | null;
  brand: string;
  regularPrice: number;
  salePrice: number | null;
  sku: string;
  barcode: string;
  stock: number;
  lowStockThreshold: number;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  images: string[];
  videoUrl: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  status: 'draft' | 'published' | 'out_of_stock' | 'archived';
  featured: boolean;
  isNew: boolean;
  onSale: boolean;
  visibility: 'visible' | 'hidden';
  scheduledPublishDate: string | null;
  availabilityDate: string | null;
  shippingClass: 'standard' | 'express' | 'free' | 'heavy' | 'fragile' | 'custom';
  shippingCharge: number;
  relatedProducts: string[];
  upsellProducts: string[];
  crossSellProducts: string[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  fetchProducts: (params?: { category?: string; status?: string; search?: string }) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkUpdateStatus: (ids: string[], status: Product['status']) => Promise<void>;
  updateStock: (id: string, stock: number) => Promise<void>;
}

const mapApiProduct = (apiProd: ApiProduct): Product => ({
  id: apiProd._id,
  name: apiProd.name,
  slug: apiProd.slug,
  description: apiProd.description,
  categoryId: (apiProd.categoryId && typeof apiProd.categoryId === 'object') ? (apiProd.categoryId as any)._id : apiProd.categoryId,
  brand: '',
  regularPrice: apiProd.regularPrice,
  salePrice: apiProd.salePrice,
  sku: apiProd.sku,
  barcode: '',
  stock: apiProd.stock,
  lowStockThreshold: 10,
  weight: 0,
  dimensions: { length: 0, width: 0, height: 0 },
  images: apiProd.images,
  videoUrl: '',
  tags: apiProd.tags,
  metaTitle: apiProd.name,
  metaDescription: apiProd.shortDescription,
  status: apiProd.status === 'active' ? 'published' : apiProd.status === 'draft' ? 'draft' : 'out_of_stock',
  featured: apiProd.featured,
  isNew: apiProd.isNew || false,
  onSale: apiProd.onSale || !!apiProd.salePrice,
  visibility: apiProd.visibility || 'visible',
  scheduledPublishDate: apiProd.scheduledPublishDate || null,
  availabilityDate: apiProd.availabilityDate || null,
  shippingClass: apiProd.shippingClass || 'standard',
  shippingCharge: apiProd.shippingCharge || 0,
  relatedProducts: (apiProd.relatedProducts || []).map((id: any) =>
    typeof id === 'object' ? id._id : id
  ),
  upsellProducts: (apiProd.upsellProducts || []).map((id: any) =>
    typeof id === 'object' ? id._id : id
  ),
  crossSellProducts: (apiProd.crossSellProducts || []).map((id: any) =>
    typeof id === 'object' ? id._id : id
  ),
  variants: apiProd.variants.map(v => ({
    id: v.id || crypto.randomUUID(),
    name: v.name,
    sku: v.sku,
    price: v.price,
    salePrice: v.salePrice,
    stock: v.stock,
    attributes: v.attributes as any as Record<string, string>,
  })),
  createdAt: apiProd.createdAt,
  updatedAt: apiProd.updatedAt,
});

export const useProductStore = create<ProductState>()((set) => ({
  products: [],
  loading: false,

  fetchProducts: async (params) => {
    set({ loading: true });
    try {
      const data = await productApi.getAll(params);
      const products = data.map(mapApiProduct);
      set({ products, loading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ loading: false });
    }
  },

  addProduct: async (product) => {
    try {
      const data = await productApi.create({
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.description.substring(0, 160),
        categoryId: product.categoryId || '',
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        sku: product.sku,
        stock: product.stock,
        images: product.images,
        variants: product.variants.map(v => ({
          name: v.name,
          sku: v.sku,
          price: v.price,
          salePrice: v.salePrice,
          stock: v.stock,
          attributes: v.attributes,
        })),
        status: product.status === 'published' ? 'active' : product.status === 'out_of_stock' ? 'out_of_stock' : 'draft',
        featured: product.featured,
        tags: product.tags,
        availabilityDate: product.availabilityDate || null,
        shippingClass: product.shippingClass || 'standard',
        shippingCharge: product.shippingCharge || 0,
      });
      set((state) => ({
        products: [...state.products, mapApiProduct(data)],
      }));
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.slug) updateData.slug = updates.slug;
      if (updates.description) updateData.description = updates.description;
      if (updates.categoryId) updateData.categoryId = updates.categoryId;
      if (updates.regularPrice) updateData.regularPrice = updates.regularPrice;
      if (updates.salePrice !== undefined) updateData.salePrice = updates.salePrice;
      if (updates.sku) updateData.sku = updates.sku;
      if (updates.stock !== undefined) updateData.stock = updates.stock;
      if (updates.images) updateData.images = updates.images;
      if (updates.variants) updateData.variants = updates.variants;
      if (updates.status) {
        updateData.status = updates.status === 'published' ? 'active' : updates.status === 'out_of_stock' ? 'out_of_stock' : 'draft';
      }
      if (updates.featured !== undefined) updateData.featured = updates.featured;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.availabilityDate !== undefined) updateData.availabilityDate = updates.availabilityDate;
      if (updates.shippingClass) updateData.shippingClass = updates.shippingClass;
      if (updates.shippingCharge !== undefined) updateData.shippingCharge = updates.shippingCharge;

      const data = await productApi.update(id, updateData);
      set((state) => ({
        products: state.products.map((prod) =>
          prod.id === id ? mapApiProduct(data) : prod
        ),
      }));
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      await productApi.delete(id);
      set((state) => ({
        products: state.products.filter((prod) => prod.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  bulkDelete: async (ids) => {
    try {
      await productApi.bulkDelete(ids);
      set((state) => ({
        products: state.products.filter((prod) => !ids.includes(prod.id)),
      }));
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      throw error;
    }
  },

  bulkUpdateStatus: async (ids, status) => {
    try {
      const apiStatus = status === 'published' ? 'active' : status === 'out_of_stock' ? 'out_of_stock' : 'draft';
      await productApi.bulkUpdate(ids, apiStatus);
      set((state) => ({
        products: state.products.map((prod) =>
          ids.includes(prod.id) ? { ...prod, status } : prod
        ),
      }));
    } catch (error) {
      console.error('Error bulk updating products:', error);
      throw error;
    }
  },

  updateStock: async (id, stock) => {
    try {
      const data = await productApi.updateStock(id, stock);
      set((state) => ({
        products: state.products.map((prod) =>
          prod.id === id ? mapApiProduct(data) : prod
        ),
      }));
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },
}));
