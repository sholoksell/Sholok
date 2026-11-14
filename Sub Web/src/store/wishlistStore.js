import { create } from 'zustand';
import api from '@/lib/axios';

export const useWishlistStore = create((set, get) => ({
  productIds: new Set(),
  count: 0,
  loaded: false,

  load: async () => {
    try {
      const { data } = await api.get('/wishlist');
      const raw = data?.items || data?.wishlist || data?.data || data || [];
      const items = Array.isArray(raw) ? raw : [];
      const ids = new Set(
        items.map(item => {
          if (typeof item === 'number' || typeof item === 'string') return String(item);
          return String(
            item.productId || item.product_id || item.product?._id || item.product?.id ||
            item._id || item.id || ''
          );
        }).filter(Boolean)
      );
      set({ productIds: ids, count: ids.size, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  add: (productId) => {
    const ids = new Set(get().productIds);
    ids.add(String(productId));
    set({ productIds: ids, count: ids.size });
  },

  remove: (productId) => {
    const ids = new Set(get().productIds);
    ids.delete(String(productId));
    set({ productIds: ids, count: ids.size });
  },

  has: (productId) => get().productIds.has(String(productId)),

  reset: () => set({ productIds: new Set(), count: 0, loaded: false }),
}));
