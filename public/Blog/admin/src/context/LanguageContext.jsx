import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  bn: {
    dashboard: 'ড্যাশবোর্ড',
    posts: 'পোস্ট',
    users: 'ব্যবহারকারী',
    categories: 'বিভাগ',
    analytics: 'অ্যানালিটিক্স',
    adminPanel: 'অ্যাডমিন প্যানেল',
    logout: 'লগআউট',
    loggedOut: 'লগআউট হয়েছে',
    titleBn: 'শিরোনাম (বাংলা)',
    titleEn: 'শিরোনাম (ইংরেজি)',
    contentBn: 'বিষয়বস্তু (বাংলা)',
    contentEn: 'বিষয়বস্তু (ইংরেজি)',
    excerptBn: 'সংক্ষিপ্তসার (বাংলা)',
    excerptEn: 'সংক্ষিপ্তসার (ইংরেজি)',
    nameBn: 'নাম (বাংলা)',
    nameEn: 'নাম (ইংরেজি)',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    create: 'তৈরি করুন',
    update: 'আপডেট করুন',
    delete: 'মুছুন',
    edit: 'সম্পাদনা করুন',
  },
  en: {
    dashboard: 'Dashboard',
    posts: 'Posts',
    users: 'Users',
    categories: 'Categories',
    analytics: 'Analytics',
    adminPanel: 'Admin Panel',
    logout: 'Logout',
    loggedOut: 'Logged out',
    titleBn: 'Title (Bangla)',
    titleEn: 'Title (English)',
    contentBn: 'Content (Bangla)',
    contentEn: 'Content (English)',
    excerptBn: 'Excerpt (Bangla)',
    excerptEn: 'Excerpt (English)',
    nameBn: 'Name (Bangla)',
    nameEn: 'Name (English)',
    save: 'Save',
    cancel: 'Cancel',
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
    edit: 'Edit',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => localStorage.getItem('preferredLanguage') || 'bn');

  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  const setLanguage = (lang) => setLanguageState(lang);
  const toggleLanguage = () => setLanguageState((prev) => (prev === 'bn' ? 'en' : 'bn'));

  const t = (key) => translations[language]?.[key] ?? translations.bn[key] ?? key;

  const getLocalizedField = (obj, fieldName) => {
    if (!obj) return '';
    const suffix = language === 'bn' ? 'Bn' : 'En';
    const localized = obj[`${fieldName}${suffix}`];
    if (localized) return localized;
    return obj[fieldName] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, getLocalizedField }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
