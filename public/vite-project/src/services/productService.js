import api from '../lib/axios';

// Flatten admin-backend products (name:{en,bn}, regularPrice) to storefront shape
function resolveStr(v) {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return v.en || v.bn || '';
  return String(v);
}

function normalizeProd(p) {
  if (!p) return p;
  const name = resolveStr(p.name);
  const description = resolveStr(p.description);
  const shortDescription = resolveStr(p.shortDescription);
  const categoryName = p.categoryId?.name ? resolveStr(p.categoryId.name) : undefined;
  const basePrice = (typeof p.price === 'number' && p.price > 0) ? p.price : (p.regularPrice ?? 0);
  const price = (p.salePrice && p.salePrice > 0) ? p.salePrice : basePrice;
  return {
    ...p,
    name,
    description,
    shortDescription,
    categoryId: p.categoryId ? { ...p.categoryId, name: categoryName ?? p.categoryId.name } : p.categoryId,
    price,
  };
}

const toProductsObj = (d) => {
  if (Array.isArray(d)) return { products: d.map(normalizeProd) };
  if (d && typeof d === 'object') {
    if (d.products) return { ...d, products: d.products.map(normalizeProd) };
    return d;
  }
  return { products: [] };
};

export const productService = {
  getAll: async (params) => {
    try {
      const response = await api.get('/products/public', { params });
      return toProductsObj(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      return { products: [] };
    }
  },

  getByCategory: async (categorySlug, limit = 12) => {
    try {
      const response = await api.get('/products/public', {
        params: { category: categorySlug, limit }
      });
      return toProductsObj(response.data);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return { products: [] };
    }
  },

  getBySlug: async (slug) => {
    try {
      const response = await api.get(`/products/public/slug/${slug}`);
      return response.data ? normalizeProd(response.data) : null;
    } catch (error) {
      console.error('Error fetching product by slug:', error);
      return null;
    }
  },

  // Try multiple endpoints to fetch a product whose identifier may be a slug or a Mongo _id
  getByAny: async (identifier) => {
    if (!identifier) return null;

    // 1) Try slug endpoint
    try {
      const r = await api.get(`/products/public/slug/${identifier}`);
      if (r?.data) return { product: normalizeProd(r.data) };
    } catch (_) {}

    // 2) Try id-based endpoints (different common conventions)
    const idEndpoints = [
      `/products/public/${identifier}`,
      `/products/${identifier}`,
      `/products/public/id/${identifier}`,
    ];
    for (const url of idEndpoints) {
      try {
        const r = await api.get(url);
        if (r?.data) return { product: normalizeProd(r.data) };
      } catch (_) {}
    }

    // 3) Last resort — search all products and filter
    try {
      const r = await api.get('/products/public', { params: { limit: 1000 } });
      const list = Array.isArray(r.data) ? r.data : (r.data?.products || []);
      const found = list.find(
        (p) => p.slug === identifier || p._id === identifier || p.id === identifier
      );
      if (found) return { product: normalizeProd(found) };
    } catch (_) {}

    return null;
  },

  getFeatured: async () => {
    try {
      const response = await api.get('/products/featured/list');
      return toProductsObj(response.data);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return { products: [] };
    }
  },

  getDeals: async () => {
    try {
      const response = await api.get('/products/deals/list');
      return toProductsObj(response.data);
    } catch (error) {
      console.error('Error fetching deals:', error);
      return { products: [] };
    }
  },

  getNewArrivals: async () => {
    try {
      const response = await api.get('/products/new-arrivals/list');
      return toProductsObj(response.data);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      return { products: [] };
    }
  },

  getBestSellers: async () => {
    try {
      const response = await api.get('/products/best-sellers/list');
      return toProductsObj(response.data);
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      return { products: [] };
    }
  },
};
