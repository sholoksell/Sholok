import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "bn" | "en";

const translations: Record<string, Record<Language, string>> = {
  dashboard: { bn: "ড্যাশবোর্ড", en: "Dashboard" },
  welcomeBack: { bn: "ফিরে আসার জন্য স্বাগতম, সুপার অ্যাডমিন। এখানে যা ঘটছে।", en: "Welcome back, Super Admin. Here's what's happening." },
  live: { bn: "লাইভ", en: "LIVE" },
  totalRevenue: { bn: "মোট আয়", en: "Total Revenue" },
  totalOrders: { bn: "মোট অর্ডার", en: "Total Orders" },
  activeVendors: { bn: "সক্রিয় বিক্রেতা", en: "Active Vendors" },
  totalUsers: { bn: "মোট ব্যবহারকারী", en: "Total Users" },
  revenueOverview: { bn: "আয়ের সারসংক্ষেপ", en: "Revenue Overview" },
  revenue: { bn: "আয়", en: "Revenue" },
  orders: { bn: "অর্ডার", en: "Orders" },
  categoryPerformance: { bn: "ক্যাটাগরি পারফরম্যান্স", en: "Category Performance" },
  recentOrders: { bn: "সাম্প্রতিক অর্ডার", en: "Recent Orders" },
  viewAll: { bn: "সব দেখুন", en: "View All" },
  orderId: { bn: "অর্ডার আইডি", en: "Order ID" },
  customer: { bn: "গ্রাহক", en: "Customer" },
  vendor: { bn: "বিক্রেতা", en: "Vendor" },
  amount: { bn: "পরিমাণ", en: "Amount" },
  status: { bn: "অবস্থা", en: "Status" },
  noOrdersYet: { bn: "এখনো কোনো অর্ডার নেই", en: "No orders yet" },
  portalModules: { bn: "পোর্টাল মডিউল", en: "Portal Modules" },
  topVendorsBySales: { bn: "বিক্রয় অনুসারে শীর্ষ বিক্রেতা", en: "Top Vendors by Sales" },
  viewAllVendors: { bn: "সব বিক্রেতা দেখুন", en: "View All Vendors" },
  searchAnything: { bn: "যেকোনো কিছু খুঁজুন...", en: "Search anything..." },
  logout: { bn: "লগআউট", en: "Logout" },
  dashboardNav: { bn: "ড্যাশবোর্ড", en: "Dashboard" },
  usersAndVendors: { bn: "ব্যবহারকারী ও বিক্রেতা", en: "Users & Vendors" },
  allUsers: { bn: "সকল ব্যবহারকারী", en: "All Users" },
  vendorApplications: { bn: "বিক্রেতার আবেদন", en: "Vendor Applications" },
  kycVerification: { bn: "কেওয়াইসি যাচাই", en: "KYC Verification" },
  vendorPerformance: { bn: "বিক্রেতার কার্যক্ষমতা", en: "Vendor Performance" },
  products: { bn: "পণ্য", en: "Products" },
  allProducts: { bn: "সকল পণ্য", en: "All Products" },
  categories: { bn: "ক্যাটাগরি", en: "Categories" },
  approvals: { bn: "অনুমোদন", en: "Approvals" },
  inventory: { bn: "ইনভেন্টরি", en: "Inventory" },
  ordersAndShipping: { bn: "অর্ডার ও শিপিং", en: "Orders & Shipping" },
  allOrders: { bn: "সকল অর্ডার", en: "All Orders" },
  shipping: { bn: "শিপিং", en: "Shipping" },
  returnsRefunds: { bn: "রিটার্ন ও রিফান্ড", en: "Returns & Refunds" },
  payments: { bn: "পেমেন্ট", en: "Payments" },
  transactions: { bn: "লেনদেন", en: "Transactions" },
  commission: { bn: "কমিশন", en: "Commission" },
  payouts: { bn: "পরিশোধ", en: "Payouts" },
  settlement: { bn: "নিষ্পত্তি", en: "Settlement" },
  analytics: { bn: "অ্যানালিটিক্স", en: "Analytics" },
  marketing: { bn: "মার্কেটিং", en: "Marketing" },
  campaigns: { bn: "ক্যাম্পেইন", en: "Campaigns" },
  coupons: { bn: "কুপন", en: "Coupons" },
  banners: { bn: "ব্যানার", en: "Banners" },
  portalServices: { bn: "পোর্টাল সেবা", en: "Portal Services" },
  aiInsights: { bn: "এআই ইনসাইট", en: "AI & Insights" },
  security: { bn: "নিরাপত্তা", en: "Security" },
  activityLogs: { bn: "কার্যকলাপ লগ", en: "Activity Logs" },
  platformRules: { bn: "প্ল্যাটফর্ম নিয়ম", en: "Platform Rules" },
  fraudDetection: { bn: "প্রতারণা সনাক্তকরণ", en: "Fraud Detection" },
  settings: { bn: "সেটিংস", en: "Settings" },
  productCatalog: { bn: "পণ্য তালিকা", en: "Product Catalog" },
  manageVendorProducts: { bn: "সকল বিক্রেতার পণ্য, ক্যাটাগরি এবং ইনভেন্টরি পরিচালনা করুন", en: "Manage all vendor products, categories, and inventory" },
  filters: { bn: "ফিল্টার", en: "Filters" },
  addProduct: { bn: "পণ্য যোগ করুন", en: "Add Product" },
  active: { bn: "সক্রিয়", en: "Active" },
  pendingApproval: { bn: "অনুমোদনের অপেক্ষায়", en: "Pending Approval" },
  outOfStock: { bn: "স্টক নেই", en: "Out of Stock" },
  searchProducts: { bn: "পণ্য খুঁজুন...", en: "Search products..." },
  product: { bn: "পণ্য", en: "Product" },
  category: { bn: "ক্যাটাগরি", en: "Category" },
  price: { bn: "মূল্য", en: "Price" },
  stock: { bn: "স্টক", en: "Stock" },
  vendorApplicationsTitle: { bn: "বিক্রেতার আবেদন", en: "Vendor Applications" },
  reviewVendorOnboarding: { bn: "বিক্রেতা অন্তর্ভুক্তির অনুরোধ পর্যালোচনা এবং পরিচালনা করুন", en: "Review and manage vendor onboarding requests" },
  searchVendors: { bn: "বিক্রেতা খুঁজুন...", en: "Search vendors..." },
  selectVendorApplication: { bn: "একটি বিক্রেতার আবেদন নির্বাচন করুন", en: "Select a vendor application" },
  approve: { bn: "অনুমোদন", en: "Approve" },
  reject: { bn: "প্রত্যাখ্যান", en: "Reject" },
  total: { bn: "মোট", en: "Total" },
  pending: { bn: "অপেক্ষমান", en: "Pending" },
  approved: { bn: "অনুমোদিত", en: "Approved" },
  rejected: { bn: "প্রত্যাখ্যাত", en: "Rejected" },
  news: { bn: "সংবাদ", en: "News" },
  blogCafe: { bn: "ব্লগ / ক্যাফে", en: "Blog / Cafe" },
  shopping: { bn: "শপিং", en: "Shopping" },
  maps: { bn: "মানচিত্র", en: "Maps" },
  qa: { bn: "প্রশ্নোত্তর", en: "Q&A" },
  ebooksWebtoon: { bn: "ইবুক / ওয়েবটুন", en: "eBooks / Webtoon" },
  videoTv: { bn: "ভিডিও / টিভি", en: "Video / TV" },
  music: { bn: "সংগীত", en: "Music" },
  translator: { bn: "অনুবাদক", en: "Translator" },
  finance: { bn: "অর্থনীতি", en: "Finance" },
  weather: { bn: "আবহাওয়া", en: "Weather" },
  realEstate: { bn: "রিয়েল এস্টেট", en: "Real Estate" },
  jobPortal: { bn: "চাকরির পোর্টাল", en: "Job Portal" },
  search: { bn: "খুঁজুন...", en: "Search..." },
  totalProducts: { bn: "মোট পণ্য", en: "Total Products" },
};

type TranslationKey = keyof typeof translations;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string) => string;
  translateField: (field: { en?: string; bn?: string } | string | null | undefined, lang?: Language) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "preferredLanguage";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "en" || stored === "bn" ? stored : "bn";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  const t = (key: TranslationKey | string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] ?? entry.bn ?? key;
  };

  /** Resolve a localized string from a nested { en, bn } object or plain string */
  const translateField = (
    field: { en?: string; bn?: string } | string | null | undefined,
    lang: Language = language
  ): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] || field.bn || field.en || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateField }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}

export function getLocalizedField<T extends Record<string, unknown>>(
  obj: T | null | undefined,
  fieldName: string,
  language: Language
): string {
  if (!obj) return "";
  const suffix = language === "bn" ? "Bn" : "En";
  const localizedKey = `${fieldName}${suffix}`;
  const localizedValue = obj[localizedKey];
  if (typeof localizedValue === "string" && localizedValue.trim()) return localizedValue;
  const baseValue = obj[fieldName];
  return typeof baseValue === "string" ? baseValue : "";
}
