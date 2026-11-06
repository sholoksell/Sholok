import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "bn";

const T: Record<string, Record<Lang, string>> = {
  // TopBar
  welcome:            { en: "Welcome to Sholok",                    bn: "শোলোকে স্বাগতম" },
  english:            { en: "English",                               bn: "ইংরেজি" },
  bangla:             { en: "বাংলা",                                 bn: "বাংলা" },

  // NavBar
  home:               { en: "Home",                                  bn: "হোম" },
  shop:               { en: "Shop",                                  bn: "শপ" },
  flash_sale:         { en: "Flash Sale",                            bn: "ফ্ল্যাশ সেল" },
  trending:           { en: "Trending",                              bn: "ট্রেন্ডিং" },
  offers:             { en: "Offers",                                bn: "অফার" },
  become_seller:      { en: "Become a Seller",                       bn: "বিক্রেতা হন" },
  shop_by_category:   { en: "SHOP BY CATEGORY",                      bn: "ক্যাটাগরি অনুযায়ী" },
  loading_categories: { en: "Loading categories…",                   bn: "ক্যাটাগরি লোড হচ্ছে…" },
  view_all:           { en: "View all →",                            bn: "সব দেখুন →" },

  // Header
  deliver_to:         { en: "Deliver to",                            bn: "ডেলিভারি" },
  sign_in:            { en: "Sign in",                               bn: "সাইন ইন" },
  wishlist:           { en: "Wishlist",                              bn: "উইশলিস্ট" },
  cart:               { en: "Cart",                                  bn: "কার্ট" },
  search_btn:         { en: "Search",                                bn: "খুঁজুন" },
  search_ph:          { en: "Search for products, brands and more…", bn: "পণ্য, ব্র্যান্ড খুঁজুন…" },
  search_ph_mob:      { en: "Search products…",                      bn: "পণ্য খুঁজুন…" },
  account:            { en: "Account",                               bn: "অ্যাকাউন্ট" },
  my_account:         { en: "My Account",                            bn: "আমার অ্যাকাউন্ট" },
  seller_console:     { en: "Seller Console",                        bn: "সেলার কনসোল" },
  admin:              { en: "Admin",                                  bn: "অ্যাডমিন" },
  sign_out:           { en: "Sign Out",                              bn: "সাইন আউট" },
  create_account:     { en: "Create Account",                        bn: "অ্যাকাউন্ট তৈরি করুন" },
  all_products:       { en: "All Products",                          bn: "সব পণ্য" },
  my_wishlist:        { en: "My Wishlist",                           bn: "আমার উইশলিস্ট" },
  my_orders:          { en: "My Orders",                             bn: "আমার অর্ডার" },

  // Product / buttons
  add_to_cart:        { en: "Add to Cart",                           bn: "কার্টে যোগ করুন" },
  shop_now:           { en: "Shop Now",                              bn: "এখনই কিনুন" },
  explore:            { en: "Explore",                               bn: "দেখুন" },
  free_delivery:      { en: "Free delivery on orders over",          bn: "৳১,৫০০ এর উপরে অর্ডারে বিনামূল্যে ডেলিভারি" },
};

export const t = (key: string, lang: Lang): string =>
  T[key]?.[lang] ?? T[key]?.en ?? key;

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string }
const LangContext = createContext<LangCtx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try { return (localStorage.getItem("sholok_lang") as Lang) || "en"; } catch { return "en"; }
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("sholok_lang", l); } catch {}
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: (key) => t(key, lang) }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
