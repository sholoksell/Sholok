import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Language = "bn" | "en";

const STORAGE_KEY = "preferredLanguage";

const translations: Record<string, Record<Language, string>> = {
  appName: { bn: "শ্লোক ওয়াচিং", en: "Sholok Watching" },
  search_placeholder: { bn: "ভিডিও, চ্যানেল, নির্মাতা খুঁজুন...", en: "Search videos, channels, creators..." },
  sign_in: { bn: "সাইন ইন", en: "Sign In" },
  sign_out: { bn: "সাইন আউট", en: "Sign Out" },
  profile: { bn: "প্রোফাইল", en: "Profile" },
  admin_dashboard: { bn: "অ্যাডমিন ড্যাশবোর্ড", en: "Admin Dashboard" },
  notifications: { bn: "বিজ্ঞপ্তি", en: "Notifications" },
  mark_all_read: { bn: "সব পঠিত করুন", en: "Mark all read" },
  clear: { bn: "মুছুন", en: "Clear" },
  sign_in_notifications: { bn: "বিজ্ঞপ্তি দেখতে সাইন ইন করুন", en: "Sign in to see your notifications" },
  loading: { bn: "লোড হচ্ছে...", en: "Loading..." },
  no_notifications: { bn: "এখনো কোনো বিজ্ঞপ্তি নেই", en: "No notifications yet" },
  home: { bn: "হোম", en: "Home" },
  shorts: { bn: "শর্টস", en: "Shorts" },
  trending: { bn: "ট্রেন্ডিং", en: "Trending" },
  live: { bn: "লাইভ", en: "Live" },
  you: { bn: "আপনি", en: "You" },
  history: { bn: "ইতিহাস", en: "History" },
  playlists: { bn: "প্লেলিস্ট", en: "Playlists" },
  liked: { bn: "পছন্দের", en: "Liked" },
  upload: { bn: "আপলোড", en: "Upload" },
  your_channel: { bn: "আপনার চ্যানেল", en: "Your Channel" },
  explore: { bn: "অন্বেষণ", en: "Explore" },
  music: { bn: "সঙ্গীত", en: "Music" },
  gaming: { bn: "গেমিং", en: "Gaming" },
  movies: { bn: "মুভি", en: "Movies" },
  k_drama: { bn: "কে-ড্রামা", en: "K-Drama" },
  software_related: { bn: "সফটওয়্যার সম্পর্কিত", en: "Software Related" },
  natural_related: { bn: "প্রাকৃতিক সম্পর্কিত", en: "Natural Related" },
  upload_video_title: { bn: "একটি ভিডিও আপলোড করুন", en: "Upload a video" },
  upload_subtitle: { bn: "লক্ষ লক্ষ মানুষের সাথে আপনার গল্প শেয়ার করুন। শুরু করতে নিচে আপনার ভিডিও দিন।", en: "Share your story with millions. Drop your video below to get started." },
  drag_drop: { bn: "ভিডিও ফাইল টেনে আনুন", en: "Drag and drop video files" },
  select_files: { bn: "ফাইল নির্বাচন করুন", en: "Select files" },
  video_selected: { bn: "ভিডিও নির্বাচিত হয়েছে", en: "Video Selected" },
  change_file: { bn: "ফাইল পরিবর্তন করুন", en: "Change File" },
  title_bn: { bn: "শিরোনাম (বাংলা)", en: "Title (Bangla)" },
  title_en: { bn: "শিরোনাম (ইংরেজি)", en: "Title (English)" },
  description_bn: { bn: "বিবরণ (বাংলা)", en: "Description (Bangla)" },
  description_en: { bn: "বিবরণ (ইংরেজি)", en: "Description (English)" },
  category: { bn: "বিভাগ", en: "Category" },
  tags: { bn: "ট্যাগ (কমা দিয়ে আলাদা করুন)", en: "Tags (comma-separated)" },
  thumbnail: { bn: "থাম্বনেইল", en: "Thumbnail" },
  is_short: { bn: "এটি একটি শর্ট (উল্লম্ব ভিডিও)", en: "This is a Short (vertical video)" },
  publish_video: { bn: "ভিডিও প্রকাশ করুন", en: "Publish Video" },
  uploading: { bn: "আপলোড হচ্ছে...", en: "Uploading..." },
  video_uploaded: { bn: "ভিডিও আপলোড হয়েছে!", en: "Video Uploaded!" },
  admin_panel: { bn: "অ্যাডমিন প্যানেল", en: "Admin Panel" },
  overview: { bn: "ওভারভিউ", en: "Overview" },
  videos: { bn: "ভিডিও", en: "Videos" },
  users: { bn: "ব্যবহারকারী", en: "Users" },
  video_controls_admin: { bn: "ভিডিও কন্ট্রোল অ্যাডমিন", en: "Video Controls Admin" },
  total_users: { bn: "মোট ব্যবহারকারী", en: "Total Users" },
  total_videos: { bn: "মোট ভিডিও", en: "Total Videos" },
  active_reports: { bn: "সক্রিয় রিপোর্ট", en: "Active Reports" },
  total_views: { bn: "মোট ভিউ", en: "Total Views" },
  total_channels: { bn: "মোট চ্যানেল", en: "Total Channels" },
  comments: { bn: "মন্তব্য", en: "Comments" },
  all_videos: { bn: "সব ভিডিও", en: "All Videos" },
  video: { bn: "ভিডিও", en: "Video" },
  channel: { bn: "চ্যানেল", en: "Channel" },
  views: { bn: "ভিউ", en: "Views" },
  status: { bn: "অবস্থা", en: "Status" },
  controls: { bn: "কন্ট্রোল", en: "Controls" },
  action: { bn: "অ্যাকশন", en: "Action" },
  manage: { bn: "পরিচালনা করুন", en: "Manage" },
  remove: { bn: "মুছুন", en: "Remove" },
  edit_video: { bn: "ভিডিও সম্পাদনা করুন", en: "Edit Video" },
  delete_video: { bn: "ভিডিও মুছুন?", en: "Delete Video?" },
  save: { bn: "সংরক্ষণ করুন", en: "Save" },
  cancel: { bn: "বাতিল করুন", en: "Cancel" },
  delete: { bn: "মুছুন", en: "Delete" },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateField: (field: { en?: string; bn?: string } | string | null | undefined, lang?: Language) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "bn";
    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    return stored === "en" || stored === "bn" ? stored : "bn";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
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
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
};

export function getLocalizedField<T extends Record<string, any>>(
  obj: T,
  fieldName: string,
  language?: Language
): string {
  if (!obj) return "";
  const lang = language || (typeof window !== "undefined"
    ? (window.localStorage.getItem(STORAGE_KEY) as Language | null) || "bn"
    : "bn");
  const suffix = lang === "bn" ? "Bn" : "En";
  const localizedKey = `${fieldName}${suffix}`;
  const fallbackSuffix = lang === "bn" ? "En" : "Bn";
  const fallbackKey = `${fieldName}${fallbackSuffix}`;
  return obj[localizedKey] || obj[fallbackKey] || obj[fieldName] || "";
}
