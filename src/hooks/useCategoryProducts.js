import { useState, useEffect } from 'react';
import { productService } from '@/services/productService';

const PRODUCTS_CACHE_KEY = 'sholok_catproducts_cache';
const PRODUCTS_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const readProductCache = () => {
  try {
    const raw = localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < PRODUCTS_CACHE_DURATION) return data;
    return null;
  } catch {
    return null;
  }
};

const writeProductCache = (data) => {
  try {
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
};

// Hook to fetch and cache category products
export const useCategoryProducts = (categories) => {
  const cached = readProductCache();
  const [categoryProducts, setCategoryProducts] = useState(cached || {});
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      setLoading(false);
      return;
    }

    // If cache is valid, show it immediately and refresh in background
    const existingCache = readProductCache();
    if (existingCache) {
      setCategoryProducts(existingCache);
      setLoading(false);
      // Background refresh (silent, no loading state change)
      fetchAllProducts(categories, false);
      return;
    }

    fetchAllProducts(categories, true);
  }, [categories]);

  const fetchAllProducts = async (cats, showLoading) => {
    if (showLoading) setLoading(true);

    try {
      const allSubcategories = [];
      cats.forEach(category => {
        if (category.subcategories && category.subcategories.length > 0) {
          allSubcategories.push(...category.subcategories);
        }
      });

      const batchSize = 15;
      const productMap = {};

      for (let i = 0; i < allSubcategories.length; i += batchSize) {
        const batch = allSubcategories.slice(i, i + batchSize);
        const batchPromises = batch.map(async (subcat) => {
          try {
            const response = await productService.getAll({
              category: subcat.slug,
              limit: 1,
            });
            if (response.products && response.products.length > 0) {
              const product = response.products[0];
              return {
                slug: subcat.slug,
                image: product.thumbnail || product.images?.[0] || null,
                count: response.pagination?.total || response.products.length,
              };
            }
            return { slug: subcat.slug, image: null, count: 0 };
          } catch {
            return { slug: subcat.slug, image: null, count: 0 };
          }
        });

        const results = await Promise.allSettled(batchPromises);
        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            productMap[result.value.slug] = {
              image: result.value.image,
              count: result.value.count,
            };
          }
        });
      }

      setCategoryProducts(productMap);
      writeProductCache(productMap);
    } catch (error) {
      console.error('Error fetching category products:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  return { categoryProducts, loading };
};
