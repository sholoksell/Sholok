import React, { createContext, useContext, useState, useEffect } from 'react';
import { categoryService } from '@/services/categoryService';

const CategoryContext = createContext();

const CACHE_KEY = 'sholok_categories_cache_v2'; // v2 = bust old cache
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const INVALIDATE_KEY = 'sholok_categories_invalidate'; // cross-tab signal

// Static fallback categories — shown when API is unavailable
const FALLBACK_CATEGORIES = [
  { _id: 'f1', name: 'Grocery & Staples', nameBn: 'মুদিখানা ও দানাদার', slug: 'grocery-staples', icon: '🛒', subcategories: [
    { _id: 'f1a', name: 'Rice', nameBn: 'চাল', slug: 'rice', icon: '🍚' },
    { _id: 'f1b', name: 'Atta & Flour', nameBn: 'আটা ও ময়দা', slug: 'atta-flour', icon: '🌾' },
    { _id: 'f1c', name: 'Lentils (Dal)', nameBn: 'ডাল', slug: 'lentils-dal', icon: '🫘' },
    { _id: 'f1d', name: 'Edible Oil', nameBn: 'ভোজ্য তেল', slug: 'edible-oil', icon: '🛢️' },
    { _id: 'f1e', name: 'Spices', nameBn: 'মসলা', slug: 'spices', icon: '🌶️' },
  ]},
  { _id: 'f2', name: 'Fresh Produce', nameBn: 'তাজা পণ্য', slug: 'fresh-produce', icon: '🥬', subcategories: [
    { _id: 'f2a', name: 'Fresh Vegetables', nameBn: 'তাজা সবজি', slug: 'fresh-vegetables', icon: '🥕' },
    { _id: 'f2b', name: 'Fresh Fruits', nameBn: 'তাজা ফল', slug: 'fresh-fruits', icon: '🍎' },
    { _id: 'f2c', name: 'Fresh Meat', nameBn: 'তাজা মাংস', slug: 'fresh-meat', icon: '🥩' },
    { _id: 'f2d', name: 'Chicken', nameBn: 'মুরগি', slug: 'chicken', icon: '🍗' },
    { _id: 'f2e', name: 'Fish', nameBn: 'মাছ', slug: 'fish', icon: '🐟' },
  ]},
  { _id: 'f3', name: 'Dairy & Frozen', nameBn: 'দুগ্ধজাত ও হিমায়িত', slug: 'dairy-frozen', icon: '🥛', subcategories: [
    { _id: 'f3a', name: 'Milk', nameBn: 'দুধ', slug: 'milk', icon: '🥛' },
    { _id: 'f3b', name: 'Yogurt', nameBn: 'দই', slug: 'yogurt', icon: '🍶' },
    { _id: 'f3c', name: 'Butter & Ghee', nameBn: 'মাখন ও ঘি', slug: 'butter-ghee', icon: '🧈' },
    { _id: 'f3d', name: 'Frozen Snacks', nameBn: 'ফ্রোজেন স্ন্যাকস', slug: 'frozen-snacks', icon: '❄️' },
  ]},
  { _id: 'f4', name: 'Beverages', nameBn: 'পানীয়', slug: 'beverages', icon: '🥤', subcategories: [
    { _id: 'f4a', name: 'Soft Drinks', nameBn: 'কোল্ড ড্রিংকস', slug: 'soft-drinks', icon: '🥤' },
    { _id: 'f4b', name: 'Juice', nameBn: 'জুস', slug: 'juice', icon: '🧃' },
    { _id: 'f4c', name: 'Tea', nameBn: 'চা', slug: 'tea', icon: '🍵' },
    { _id: 'f4d', name: 'Coffee', nameBn: 'কফি', slug: 'coffee', icon: '☕' },
  ]},
  { _id: 'f5', name: 'Snacks & Confectionery', nameBn: 'স্ন্যাকস ও মিষ্টি', slug: 'snacks-confectionery', icon: '🍪', subcategories: [
    { _id: 'f5a', name: 'Biscuits', nameBn: 'বিস্কুট', slug: 'biscuits', icon: '🍪' },
    { _id: 'f5b', name: 'Chips', nameBn: 'চিপস', slug: 'chips', icon: '🥔' },
    { _id: 'f5c', name: 'Chocolates', nameBn: 'চকলেট', slug: 'chocolates', icon: '🍫' },
    { _id: 'f5d', name: 'Nuts', nameBn: 'বাদাম', slug: 'nuts', icon: '🥜' },
  ]},
  { _id: 'f6', name: 'Personal Care', nameBn: 'ব্যক্তিগত যত্ন', slug: 'personal-care', icon: '🧴', subcategories: [
    { _id: 'f6a', name: 'Soap', nameBn: 'সাবান', slug: 'soap', icon: '🧼' },
    { _id: 'f6b', name: 'Shampoo', nameBn: 'শ্যাম্পু', slug: 'shampoo', icon: '🧴' },
    { _id: 'f6c', name: 'Toothpaste', nameBn: 'টুথপেস্ট', slug: 'toothpaste', icon: '🪥' },
  ]},
  { _id: 'f7', name: 'Baby Care', nameBn: 'শিশু যত্ন', slug: 'baby-care', icon: '👶', subcategories: [
    { _id: 'f7a', name: 'Baby Food', nameBn: 'শিশু খাবার', slug: 'baby-food', icon: '🍼' },
    { _id: 'f7b', name: 'Baby Diapers', nameBn: 'ডায়াপার', slug: 'baby-diapers', icon: '👶' },
  ]},
  { _id: 'f8', name: 'Household & Cleaning', nameBn: 'গৃহস্থালি ও পরিষ্কার', slug: 'household-cleaning', icon: '🧹', subcategories: [
    { _id: 'f8a', name: 'Detergent', nameBn: 'ডিটারজেন্ট', slug: 'detergent', icon: '🧺' },
    { _id: 'f8b', name: 'Dishwashing', nameBn: 'বাসন ধোয়া', slug: 'dishwashing', icon: '🫧' },
  ]},
  { _id: 'f9', name: 'Health & Wellness', nameBn: 'স্বাস্থ্য ও সুস্থতা', slug: 'health-wellness', icon: '💊', subcategories: [
    { _id: 'f9a', name: 'Vitamins', nameBn: 'ভিটামিন', slug: 'vitamins', icon: '💊' },
    { _id: 'f9b', name: 'First Aid', nameBn: 'প্রাথমিক চিকিৎসা', slug: 'first-aid', icon: '🩹' },
  ]},
  { _id: 'f10', name: 'Gadget', nameBn: 'গ্যাজেট', slug: 'gadget', icon: '📱', subcategories: [
    { _id: 'f10a', name: 'Mobile Accessories', nameBn: 'মোবাইল আনুষঙ্গিক', slug: 'mobile-accessories', icon: '📱' },
    { _id: 'f10b', name: 'Headphones', nameBn: 'হেডফোন', slug: 'headphones', icon: '🎧' },
  ]},
  { _id: 'f11', name: 'Fish & Meat', nameBn: 'মাছ ও মাংস', slug: 'fish-meat', icon: '🐟', subcategories: [
    { _id: 'f11a', name: 'Fish', nameBn: 'মাছ', slug: 'fish-kh', icon: '🐟' },
    { _id: 'f11b', name: 'Meat', nameBn: 'মাংস', slug: 'meat-kh', icon: '🥩' },
    { _id: 'f11c', name: 'Chicken', nameBn: 'মুরগি', slug: 'chicken-kh', icon: '🍗' },
    { _id: 'f11d', name: 'Seafood', nameBn: 'সামুদ্রিক খাবার', slug: 'seafood', icon: '🦐' },
  ]},
  { _id: 'f12', name: 'Fruits & Vegetable', nameBn: 'ফল ও সবজি', slug: 'fruits-vegetable', icon: '🥦', subcategories: [
    { _id: 'f12a', name: 'Fresh Fruits', nameBn: 'তাজা ফল', slug: 'fresh-fruits-kh', icon: '🍎' },
    { _id: 'f12b', name: 'Fresh Vegetable', nameBn: 'তাজা সবজি', slug: 'fresh-vegetable', icon: '🥦' },
    { _id: 'f12c', name: 'Dry Fruits', nameBn: 'শুকনো ফল', slug: 'dry-fruits', icon: '🍇' },
  ]},
  { _id: 'f13', name: 'Cooking Essentials', nameBn: 'রান্নার প্রয়োজনীয়তা', slug: 'cooking-essentials', icon: '🍳', subcategories: [
    { _id: 'f13a', name: 'Flour', nameBn: 'আটা', slug: 'flour-kh', icon: '🌾' },
    { _id: 'f13b', name: 'Oil', nameBn: 'তেল', slug: 'oil-kh', icon: '🫙' },
    { _id: 'f13c', name: 'Spices & Masala', nameBn: 'মসলা', slug: 'spices-masala', icon: '🌶️' },
  ]},
  { _id: 'f14', name: 'Biscuits & Cakes', nameBn: 'বিস্কুট ও কেক', slug: 'biscuits-cakes', icon: '🍪', subcategories: [
    { _id: 'f14a', name: 'Biscuits', nameBn: 'বিস্কুট', slug: 'biscuits-kh', icon: '🍪' },
    { _id: 'f14b', name: 'Cakes', nameBn: 'কেক', slug: 'cakes-kh', icon: '🎂' },
    { _id: 'f14c', name: 'Bread', nameBn: 'রুটি', slug: 'bread', icon: '🍞' },
  ]},
  { _id: 'f15', name: 'Household Tools', nameBn: 'গৃহস্থালি সরঞ্জাম', slug: 'household-tools', icon: '🔧', subcategories: [
    { _id: 'f15a', name: 'Kitchen Tools', nameBn: 'রান্নাঘরের সরঞ্জাম', slug: 'kitchen-tools-kh', icon: '🍴' },
    { _id: 'f15b', name: 'Storage & Organisation', nameBn: 'স্টোরেজ', slug: 'storage-organisation', icon: '📦' },
    { _id: 'f15c', name: 'Pest Control', nameBn: 'কীটনাশক', slug: 'pest-control', icon: '🪲' },
  ]},
  { _id: 'f16', name: 'Pet Care', nameBn: 'পোষা প্রাণীর যত্ন', slug: 'pet-care', icon: '🐾', subcategories: [
    { _id: 'f16a', name: 'Dog Food', nameBn: 'কুকুরের খাবার', slug: 'dog-food', icon: '🐶' },
    { _id: 'f16b', name: 'Cat Food', nameBn: 'বিড়ালের খাবার', slug: 'cat-food', icon: '🐱' },
  ]},
  { _id: 'f17', name: 'Beauty & Healths', nameBn: 'সৌন্দর্য ও স্বাস্থ্য', slug: 'beauty-healths', icon: '💄', subcategories: [
    { _id: 'f17a', name: 'Skin Care', nameBn: 'ত্বকের যত্ন', slug: 'skin-care', icon: '🧴' },
    { _id: 'f17b', name: 'Hair Care', nameBn: 'চুলের যত্ন', slug: 'hair-care', icon: '💇' },
    { _id: 'f17c', name: 'Makeup', nameBn: 'মেকআপ', slug: 'makeup', icon: '💄' },
  ]},
  { _id: 'f18', name: 'Jam & Jelly', nameBn: 'জ্যাম ও জেলি', slug: 'jam-jelly', icon: '🍓', subcategories: [
    { _id: 'f18a', name: 'Fruit Jam', nameBn: 'ফলের জ্যাম', slug: 'fruit-jam', icon: '🍓' },
    { _id: 'f18b', name: 'Honey', nameBn: 'মধু', slug: 'honey', icon: '🍯' },
    { _id: 'f18c', name: 'Spreads', nameBn: 'স্প্রেড', slug: 'spreads', icon: '🥜' },
  ]},
  { _id: 'f19', name: 'Milk & Dairy', nameBn: 'দুধ ও দুগ্ধজাত', slug: 'milk-dairy', icon: '🥛', subcategories: [
    { _id: 'f19a', name: 'Milk', nameBn: 'দুধ', slug: 'milk-kh', icon: '🥛' },
    { _id: 'f19b', name: 'Butter & Ghee', nameBn: 'মাখন ও ঘি', slug: 'butter-ghee-kh', icon: '🧈' },
    { _id: 'f19c', name: 'Cheese', nameBn: 'পনির', slug: 'cheese-kh', icon: '🧀' },
  ]},
  { _id: 'f20', name: 'Drinks', nameBn: 'পানীয়', slug: 'drinks', icon: '🥤', subcategories: [
    { _id: 'f20a', name: 'Soft Drinks', nameBn: 'কোল্ড ড্রিংকস', slug: 'soft-drinks-kh', icon: '🥤' },
    { _id: 'f20b', name: 'Juice', nameBn: 'জুস', slug: 'juice-kh', icon: '🧃' },
    { _id: 'f20c', name: 'Water', nameBn: 'পানি', slug: 'water', icon: '💧' },
  ]},
  { _id: 'f21', name: 'Breakfast', nameBn: 'সকালের নাস্তা', slug: 'breakfast', icon: '🍳', subcategories: [
    { _id: 'f21a', name: 'Cereals', nameBn: 'সিরিয়াল', slug: 'cereals', icon: '🥣' },
    { _id: 'f21b', name: 'Oats & Porridge', nameBn: 'ওটস', slug: 'oats-porridge', icon: '🌾' },
    { _id: 'f21c', name: 'Eggs', nameBn: 'ডিম', slug: 'eggs-kh', icon: '🥚' },
    { _id: 'f21d', name: 'Bread & Butter', nameBn: 'রুটি ও মাখন', slug: 'bread-butter', icon: '🍞' },
  ]},
  { _id: 'f22', name: 'Home & Kitchen', nameBn: 'ঘর ও রান্নাঘর', slug: 'home-kitchen', icon: '🏠', subcategories: [
    { _id: 'f22a', name: 'Cookware', nameBn: 'রান্নার পাত্র', slug: 'cookware', icon: '🍳' },
    { _id: 'f22b', name: 'Storage Containers', nameBn: 'স্টোরেজ কন্টেইনার', slug: 'storage-containers', icon: '📦' },
  ]},
];

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (!Array.isArray(data)) return null;
    if (Date.now() - timestamp < CACHE_DURATION) return data;
    return null;
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoryProvider');
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  const cached = readCache();
  const [categories, setCategories] = useState(cached || FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(false); // start false — fallback shown immediately
  const [error, setError] = useState(null);

  const fetchCategories = async (force = false) => {
    if (!force) {
      const cached = readCache();
      if (cached) {
        setCategories(cached);
        setLoading(false);
        return cached;
      }
    }
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getPublicAll();
      const arr = Array.isArray(data) && data.length > 0 ? data : FALLBACK_CATEGORIES;
      setCategories(arr);
      if (Array.isArray(data) && data.length > 0) writeCache(arr);
      return arr;
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err);
      // Keep existing categories (fallback or cached) on error
      return categories;
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount — uses cache first, then tries API, falls back to static data
  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setCategories(cached);
      setLoading(false);
      // Background refresh without showing loading
      categoryService.getPublicAll()
        .then(data => {
          const arr = Array.isArray(data) && data.length > 0 ? data : null;
          if (arr) { setCategories(arr); writeCache(arr); }
        })
        .catch(() => {});
    } else {
      fetchCategories();
    }

    // ── Live invalidation: refresh when tab becomes visible / focused
    const refreshFromServer = async () => {
      try {
        const data = await categoryService.getPublicAll();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          writeCache(data);
        }
      } catch {}
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') refreshFromServer();
    };
    const onFocus = () => refreshFromServer();

    // Cross-tab signal: admin app on same origin can call
    //   localStorage.setItem('sholok_categories_invalidate', Date.now())
    // to force every open storefront tab to refetch immediately.
    const onStorage = (e) => {
      if (e.key === INVALIDATE_KEY) {
        try { localStorage.removeItem(CACHE_KEY); } catch {}
        refreshFromServer();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const value = {
    categories,
    loading,
    error,
    refetch: () => fetchCategories(true),
    getCategoryBySlug: (slug) => {
      // Search in all categories and subcategories
      for (const cat of categories) {
        if (cat.slug === slug) return cat;
        if (cat.subcategories) {
          const found = cat.subcategories.find(sub => sub.slug === slug);
          if (found) return found;
        }
      }
      return null;
    }
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};
