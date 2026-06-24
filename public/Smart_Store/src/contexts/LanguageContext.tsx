import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "bn" | "en";

const STORAGE_KEY = "preferredLanguage";

const translations: Record<string, Record<Language, string>> = {
  shop: { bn: "শপ", en: "Shop" },
  stores: { bn: "স্টোর", en: "Stores" },
  groupBuy: { bn: "গ্রুপ বাই", en: "Group buy" },
  live: { bn: "লাইভ", en: "Live" },
  seller: { bn: "বিক্রেতা", en: "Seller" },
  admin: { bn: "অ্যাডমিন", en: "Admin" },
  menu: { bn: "মেনু", en: "Menu" },
  search: { bn: "অনুসন্ধান করুন", en: "Search" },
  go: { bn: "যান", en: "Go" },
  signIn: { bn: "সাইন ইন", en: "Sign in" },
  signOut: { bn: "সাইন আউট", en: "Sign out" },
  myAccount: { bn: "আমার অ্যাকাউন্ট", en: "My account" },
  sellerConsole: { bn: "বিক্রেতা কনসোল", en: "Seller console" },
  customizeStore: { bn: "স্টোর কাস্টমাইজ করুন", en: "Customize store" },
  cart: { bn: "কার্ট", en: "Cart" },
  wishlist: { bn: "পছন্দের তালিকা", en: "Wishlist" },
  addToCart: { bn: "কার্টে যোগ করুন", en: "Add to cart" },
  buyNow: { bn: "এখনই কিনুন", en: "Buy now" },
  outOfStock: { bn: "স্টক নেই", en: "Out of stock" },
  checkout: { bn: "চেকআউট", en: "Checkout" },
  total: { bn: "মোট", en: "Total" },
  subtotal: { bn: "সাবটোটাল", en: "Subtotal" },
  shipping: { bn: "শিপিং", en: "Shipping" },
  free: { bn: "ফ্রি", en: "Free" },
  placeOrder: { bn: "অর্ডার করুন", en: "Place order" },
  emptyCart: { bn: "আপনার কার্ট খালি", en: "Your cart is empty" },
  continueShopping: { bn: "কেনাকাটা চালিয়ে যান", en: "Continue shopping" },
  quantity: { bn: "পরিমাণ", en: "Quantity" },
  remove: { bn: "সরান", en: "Remove" },
  description: { bn: "বিবরণ", en: "Description" },
  reviews: { bn: "রিভিউ", en: "Reviews" },
  questions: { bn: "প্রশ্ন", en: "Questions" },
  relatedProducts: { bn: "সম্পর্কিত পণ্য", en: "Related products" },
  home: { bn: "হোম", en: "Home" },
  contactInfo: { bn: "যোগাযোগের তথ্য", en: "Contact info" },
  shippingAddress: { bn: "শিপিং ঠিকানা", en: "Shipping address" },
  paymentMethod: { bn: "পেমেন্ট পদ্ধতি", en: "Payment method" },
  orderSummary: { bn: "অর্ডার সারাংশ", en: "Order summary" },
  fullName: { bn: "পুরো নাম", en: "Full name" },
  email: { bn: "ইমেইল", en: "Email" },
  phone: { bn: "ফোন", en: "Phone" },
  address: { bn: "ঠিকানা", en: "Address" },
  city: { bn: "শহর", en: "City" },
  postalCode: { bn: "পোস্টাল কোড", en: "Postal code" },
  allRightsReserved: { bn: "সর্বস্বত্ব সংরক্ষিত", en: "All rights reserved" },
  quickView: { bn: "দ্রুত দেখুন", en: "Quick view" },
  subscribe: { bn: "সাবস্ক্রাইব", en: "Subscribe" },
  newsletterPlaceholder: { bn: "আপডেট পেতে ইমেইল দিন", en: "Get drops in your inbox" },
  footerTagline: { bn: "চিন্তাশীল ক্রেতা ও তাদের প্রিয় স্টোরগুলোর জন্য আধুনিক মার্কেটপ্লেস।", en: "The modern marketplace for thoughtful shoppers and the stores they love." },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateField: (field: { en?: string; bn?: string } | string | null | undefined, lang?: Language) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "bn";
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    return stored === "en" || stored === "bn" ? stored : "bn";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  const t = (key: string): string => {
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

export function getLocalizedField<T extends Record<string, any>>(obj: T, fieldName: string, language?: Language): string {
  if (!obj) return "";
  const lang = language || (typeof window !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as Language) : "bn") || "bn";
  const suffix = lang === "bn" ? "Bn" : "En";
  const localizedKey = `${fieldName}${suffix}`;
  const val = obj[localizedKey] || obj[fieldName];
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return (lang === "bn" ? val.bn : val.en) || val.bn || val.en || "";
  return String(val);
}
