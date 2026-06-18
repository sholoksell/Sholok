import { createContext, useContext, useState, useEffect } from "react";

const translations = {
  dashboard: { bn: "ড্যাশবোর্ড", en: "Dashboard" },
  users: { bn: "ব্যবহারকারী", en: "Users" },
  smartStores: { bn: "স্মার্ট স্টোর", en: "Smart Stores" },
  products: { bn: "পণ্য", en: "Products" },
  orders: { bn: "অর্ডার", en: "Orders" },
  categories: { bn: "ক্যাটাগরি", en: "Categories" },
  analytics: { bn: "অ্যানালিটিক্স", en: "Analytics" },
  settings: { bn: "সেটিংস", en: "Settings" },
  viewStore: { bn: "স্টোর দেখুন", en: "View Store" },
  logout: { bn: "লগআউট", en: "Logout" },
  loggedOutSuccess: { bn: "সফলভাবে লগআউট হয়েছে", en: "Logged out successfully" },
  smartStoreOverview: { bn: "স্মার্ট স্টোর — লাইভ ওভারভিউ", en: "Smart_Store_New — Live Overview" },
  totalRevenue: { bn: "মোট আয়", en: "Total Revenue" },
  totalOrders: { bn: "মোট অর্ডার", en: "Total Orders" },
  totalUsers: { bn: "মোট ব্যবহারকারী", en: "Total Users" },
  totalStores: { bn: "মোট স্টোর", en: "Total Stores" },
  totalProducts: { bn: "মোট পণ্য", en: "Products" },
  sellers: { bn: "বিক্রেতা", en: "Sellers" },
  customers: { bn: "গ্রাহক", en: "Customers" },
  pendingOrders: { bn: "অপেক্ষমান অর্ডার", en: "Pending Orders" },
  pending: { bn: "অপেক্ষমান", en: "pending" },
  revenueLast7Days: { bn: "আয় (গত ৭ দিন)", en: "Revenue (Last 7 Days)" },
  topProductsBySold: { bn: "শীর্ষ পণ্য (বিক্রয় অনুসারে)", en: "Top Products (by sold)" },
  noSalesData: { bn: "এখনো কোনো বিক্রয় তথ্য নেই", en: "No sales data yet" },
  noProductsYet: { bn: "এখনো কোনো পণ্য নেই", en: "No products yet" },
  recentOrders: { bn: "সাম্প্রতিক অর্ডার", en: "Recent Orders" },
  noOrdersYet: { bn: "এখনো কোনো অর্ডার নেই", en: "No orders yet" },
  orderNumber: { bn: "অর্ডার নং", en: "Order #" },
  customer: { bn: "গ্রাহক", en: "Customer" },
  amount: { bn: "পরিমাণ", en: "Amount" },
  status: { bn: "অবস্থা", en: "Status" },
  date: { bn: "তারিখ", en: "Date" },
  failedToLoadDashboard: { bn: "ড্যাশবোর্ড লোড করতে ব্যর্থ", en: "Failed to load dashboard" },
  failedToLoadData: { bn: "ডেটা লোড করতে ব্যর্থ। সার্ভার চলছে কি?", en: "Failed to load data. Is the server running?" },
  failedToFetchProducts: { bn: "পণ্য আনতে ব্যর্থ", en: "Failed to fetch products" },
  failedToFetchStores: { bn: "স্টোর আনতে ব্যর্থ", en: "Failed to fetch stores" },
  searchProducts: { bn: "পণ্য খুঁজুন...", en: "Search products…" },
  totalProductsCount: { bn: "মোট পণ্য", en: "total products" },
  product: { bn: "পণ্য", en: "Product" },
  category: { bn: "ক্যাটাগরি", en: "Category" },
  price: { bn: "মূল্য", en: "Price" },
  stock: { bn: "স্টক", en: "Stock" },
  sold: { bn: "বিক্রিত", en: "Sold" },
  rating: { bn: "রেটিং", en: "Rating" },
  store: { bn: "স্টোর", en: "Store" },
  actions: { bn: "কার্যক্রম", en: "Actions" },
  deleteProductConfirm: { bn: "এই পণ্যটি মুছবেন?", en: "Delete this product?" },
  productDeleted: { bn: "পণ্য মুছে ফেলা হয়েছে", en: "Product deleted" },
  deleteFailed: { bn: "মুছে ফেলা ব্যর্থ হয়েছে", en: "Delete failed" },
  noProductsFound: { bn: "কোনো পণ্য পাওয়া যায়নি", en: "No products found" },
  showing: { bn: "প্রদর্শিত", en: "Showing" },
  of: { bn: "এর মধ্যে", en: "of" },
  storesRegistered: { bn: "স্টোর নিবন্ধিত", en: "stores registered" },
  verified: { bn: "যাচাইকৃত", en: "Verified" },
  verify: { bn: "যাচাই করুন", en: "Verify" },
  featured: { bn: "বৈশিষ্ট্যযুক্ত", en: "Featured" },
  feature: { bn: "ফিচার করুন", en: "Feature" },
  storeUpdated: { bn: "স্টোর আপডেট হয়েছে", en: "Store updated" },
  updateFailed: { bn: "আপডেট ব্যর্থ হয়েছে", en: "Update failed" },
  noStoresYet: { bn: "এখনো কোনো স্টোর নেই। স্মার্ট স্টোর তৈরি করতে বিক্রেতা হিসেবে নিবন্ধন করুন।", en: "No stores yet. Register as a seller to create a Smart Store." },
};

const STORAGE_KEY = "preferredLanguage";
const LanguageContext = createContext(undefined);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "en" || stored === "bn" ? stored : "bn";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang) => setLanguageState(lang);

  const t = (key) => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] ?? entry.bn ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}

export function getLocalizedField(obj, fieldName, language) {
  if (!obj) return "";
  const suffix = language === "bn" ? "Bn" : "En";
  const localizedValue = obj[`${fieldName}${suffix}`];
  if (typeof localizedValue === "string" && localizedValue.trim()) return localizedValue;
  const baseValue = obj[fieldName];
  return typeof baseValue === "string" ? baseValue : "";
}
