import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'bn' | 'en';

const translations: Record<string, Record<Language, string>> = {
  dashboard: { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
  categories: { bn: 'ক্যাটাগরি', en: 'Categories' },
  products: { bn: 'পণ্য', en: 'Products' },
  customers: { bn: 'গ্রাহক', en: 'Customers' },
  orders: { bn: 'অর্ডার', en: 'Orders' },
  payments: { bn: 'পেমেন্ট', en: 'Payments' },
  shipping: { bn: 'শিপিং', en: 'Shipping' },
  reports: { bn: 'রিপোর্ট', en: 'Reports' },
  marketing: { bn: 'মার্কেটিং', en: 'Marketing' },
  reviews: { bn: 'রিভিউ', en: 'Reviews' },
  settings: { bn: 'সেটিংস', en: 'Settings' },
  homePageProduct: { bn: 'হোম পেজ পণ্য', en: 'Home Page Product' },
  logout: { bn: 'লগআউট', en: 'Logout' },
  adminPanel: { bn: 'অ্যাডমিন প্যানেল', en: 'E-Commerce Admin Panel' },

  addNew: { bn: 'নতুন যোগ করুন', en: 'Add New' },
  addCategory: { bn: 'ক্যাটাগরি যোগ করুন', en: 'Add Category' },
  editCategory: { bn: 'ক্যাটাগরি সম্পাদনা', en: 'Edit Category' },
  addProduct: { bn: 'পণ্য যোগ করুন', en: 'Add Product' },
  editProduct: { bn: 'পণ্য সম্পাদনা', en: 'Edit Product' },
  addBanner: { bn: 'ব্যানার যোগ করুন', en: 'Add Banner' },
  editBanner: { bn: 'ব্যানার সম্পাদনা', en: 'Edit Banner' },
  createBanner: { bn: 'ব্যানার তৈরি করুন', en: 'Create Banner' },
  updateBanner: { bn: 'ব্যানার আপডেট করুন', en: 'Update Banner' },
  save: { bn: 'সংরক্ষণ করুন', en: 'Save' },
  saveChanges: { bn: 'পরিবর্তন সংরক্ষণ করুন', en: 'Save Changes' },
  saving: { bn: 'সংরক্ষণ হচ্ছে...', en: 'Saving...' },
  cancel: { bn: 'বাতিল', en: 'Cancel' },
  delete: { bn: 'মুছুন', en: 'Delete' },
  edit: { bn: 'সম্পাদনা', en: 'Edit' },
  actions: { bn: 'কার্যক্রম', en: 'Actions' },
  status: { bn: 'অবস্থা', en: 'Status' },
  active: { bn: 'সক্রিয়', en: 'Active' },
  inactive: { bn: 'নিষ্ক্রিয়', en: 'Inactive' },
  search: { bn: 'খুঁজুন', en: 'Search' },

  name: { bn: 'নাম', en: 'Name' },
  nameBn: { bn: 'নাম (বাংলা)', en: 'Name (Bangla)' },
  nameEn: { bn: 'নাম (ইংরেজি)', en: 'Name (English)' },
  titleBn: { bn: 'শিরোনাম (বাংলা)', en: 'Title (Bangla)' },
  titleEn: { bn: 'শিরোনাম (ইংরেজি)', en: 'Title (English)' },
  description: { bn: 'বিবরণ', en: 'Description' },
  descriptionBn: { bn: 'বিবরণ (বাংলা)', en: 'Description (Bangla)' },
  descriptionEn: { bn: 'বিবরণ (ইংরেজি)', en: 'Description (English)' },

  categoryName: { bn: 'ক্যাটাগরির নাম', en: 'Category Name' },
  urlSlug: { bn: 'ইউআরএল স্লাগ', en: 'URL Slug' },
  parentCategory: { bn: 'প্যারেন্ট ক্যাটাগরি', en: 'Parent Category' },
  displayPosition: { bn: 'প্রদর্শন অবস্থান', en: 'Display Position' },
  featured: { bn: 'বৈশিষ্ট্যযুক্ত', en: 'Featured' },

  table: { bn: 'টেবিল', en: 'Table' },
  image: { bn: 'ছবি', en: 'Image' },
  price: { bn: 'মূল্য', en: 'Price' },
  stock: { bn: 'স্টক', en: 'Stock' },
  sku: { bn: 'এসকেইউ', en: 'SKU' },
  category: { bn: 'ক্যাটাগরি', en: 'Category' },
  noDataFound: { bn: 'কোনো তথ্য পাওয়া যায়নি', en: 'No data found' },
  loading: { bn: 'লোড হচ্ছে...', en: 'Loading...' },
  customer: { bn: 'গ্রাহক', en: 'Customer' },
  total: { bn: 'মোট', en: 'Total' },
  date: { bn: 'তারিখ', en: 'Date' },
};

export type TranslationKey = keyof typeof translations;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'preferredLanguage';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'en' || stored === 'bn' ? stored : 'bn';
    } catch {
      return 'bn';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* ignore */
    }
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  const t = (key: TranslationKey | string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}

export function getLocalizedField<T extends Record<string, any>>(
  obj: T | null | undefined,
  fieldName: string,
  language: Language
): string {
  if (!obj) return '';
  if (language === 'bn') {
    const bnValue = obj[`${fieldName}Bn`];
    if (bnValue) return bnValue;
  }
  if (language === 'en') {
    const enValue = obj[`${fieldName}En`];
    if (enValue) return enValue;
  }
  return obj[fieldName] || '';
}
