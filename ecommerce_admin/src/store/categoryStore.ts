import { create } from 'zustand';
import { categoryApi, Category as ApiCategory } from '@/services/categoryService';

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  description: string;
  parentId: string | null;
  image: string | null;
  banner: string | null;
  icon: string | null;
  level: number;
  keywords: string;
  metaTitle: string;
  metaDescription: string;
  status: 'active' | 'inactive';
  featured: boolean;
  position: number;
  showOnMenu: boolean;
  showOnHomepage: boolean;
  showInSearch: boolean;
  productCount: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  restoreCategory: (id: string) => Promise<void>;
  bulkDelete: (ids: string[], permanent?: boolean) => Promise<void>;
  bulkUpdateStatus: (ids: string[], status: 'active' | 'inactive') => Promise<void>;
  reorderCategories: (reorderedCategories: Category[]) => void;
}

const mapApiCategory = (apiCat: ApiCategory): Category => ({
  id:              apiCat._id,
  name:            apiCat.name || '',
  nameBn:          apiCat.nameBn || '',
  slug:            apiCat.slug || '',
  description:     apiCat.description || '',
  parentId:        (apiCat.parentId && typeof apiCat.parentId === 'object')
                     ? (apiCat.parentId as any)._id
                     : (apiCat.parentId || null),
  image:           apiCat.image || null,
  banner:          apiCat.banner || null,
  icon:            apiCat.icon || null,
  level:           apiCat.level || 1,
  keywords:        apiCat.keywords || '',
  metaTitle:       apiCat.metaTitle || '',
  metaDescription: apiCat.metaDescription || '',
  status:          apiCat.isActive ? 'active' : 'inactive',
  featured:        apiCat.featured || false,
  position:        apiCat.order ?? 0,
  showOnMenu:      apiCat.showOnMenu ?? true,
  showOnHomepage:  apiCat.showOnHomepage ?? true,
  showInSearch:    apiCat.showInSearch ?? true,
  productCount:    apiCat.productCount || 0,
  deletedAt:       apiCat.deletedAt || null,
  createdAt:       apiCat.createdAt,
  updatedAt:       apiCat.updatedAt,
});

const STOREFRONT_INVALIDATE_KEY = 'sholok_categories_invalidate';
const STOREFRONT_CACHE_KEY      = 'sholok_categories_cache';
const notifyStorefront = () => {
  try {
    localStorage.removeItem(STOREFRONT_CACHE_KEY);
    localStorage.setItem(STOREFRONT_INVALIDATE_KEY, String(Date.now()));
  } catch { /* ignore */ }
};

export const useCategoryStore = create<CategoryState>()((set) => ({
  categories: [],
  loading:    false,

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const data = await categoryApi.getAll();
      set({ categories: data.map(mapApiCategory), loading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ loading: false });
    }
  },

  addCategory: async (category) => {
    try {
      const data = await categoryApi.create({
        name:            category.name,
        nameBn:          category.nameBn || '',
        slug:            category.slug,
        description:     category.description,
        image:           category.image || '',
        banner:          category.banner || '',
        icon:            category.icon || '',
        parentId:        category.parentId || null,
        isActive:        category.status === 'active',
        featured:        category.featured || false,
        order:           category.position,
        keywords:        category.keywords || '',
        metaTitle:       category.metaTitle || '',
        metaDescription: category.metaDescription || '',
        showOnMenu:      category.showOnMenu,
        showOnHomepage:  category.showOnHomepage,
        showInSearch:    category.showInSearch,
      });
      set((state) => ({ categories: [...state.categories, mapApiCategory(data)] }));
      notifyStorefront();
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  updateCategory: async (id, updates) => {
    try {
      const data = await categoryApi.update(id, {
        name:            updates.name,
        nameBn:          updates.nameBn !== undefined ? (updates.nameBn || '') : undefined,
        slug:            updates.slug,
        description:     updates.description,
        image:           updates.image || '',
        banner:          updates.banner || '',
        icon:            updates.icon || '',
        parentId:        updates.parentId,
        isActive:        updates.status !== undefined ? updates.status === 'active' : undefined,
        featured:        updates.featured,
        order:           updates.position,
        keywords:        updates.keywords !== undefined ? updates.keywords : undefined,
        metaTitle:       updates.metaTitle,
        metaDescription: updates.metaDescription,
        showOnMenu:      updates.showOnMenu,
        showOnHomepage:  updates.showOnHomepage,
        showInSearch:    updates.showInSearch,
      });
      set((state) => ({
        categories: state.categories.map((cat) => cat.id === id ? mapApiCategory(data) : cat),
      }));
      notifyStorefront();
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      await categoryApi.delete(id);
      const data = await categoryApi.getAll();
      set({ categories: data.map(mapApiCategory) });
      notifyStorefront();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  restoreCategory: async (id) => {
    try {
      await categoryApi.restore(id);
      const data = await categoryApi.getAll();
      set({ categories: data.map(mapApiCategory) });
      notifyStorefront();
    } catch (error) {
      console.error('Error restoring category:', error);
      throw error;
    }
  },

  bulkDelete: async (ids, permanent = false) => {
    try {
      await categoryApi.bulkDelete(ids, permanent);
      const data = await categoryApi.getAll();
      set({ categories: data.map(mapApiCategory) });
      notifyStorefront();
    } catch (error) {
      console.error('Error bulk deleting categories:', error);
      throw error;
    }
  },

  bulkUpdateStatus: async (ids, status) => {
    try {
      await categoryApi.bulkUpdate(ids, status === 'active');
      set((state) => ({
        categories: state.categories.map((cat) =>
          ids.includes(cat.id) ? { ...cat, status } : cat
        ),
      }));
      notifyStorefront();
    } catch (error) {
      console.error('Error bulk updating categories:', error);
      throw error;
    }
  },

  reorderCategories: (reorderedCategories) => set({ categories: reorderedCategories }),
}));
