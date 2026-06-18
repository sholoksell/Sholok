import { createContext, useContext, useState, useCallback } from 'react';
import { en } from './en';
import { bn } from './bn';

const translations = { en, bn };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sholok-lang') || 'bn';
    }
    return 'bn';
  });

  const toggleLanguage = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'en' ? 'bn' : 'en';
      localStorage.setItem('sholok-lang', next);
      document.documentElement.lang = next === 'bn' ? 'bn' : 'en';
      return next;
    });
  }, []);

  const setLanguage = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem('sholok-lang', newLang);
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback(
    (key) => {
      const keys = key.split('.');
      let value = translations[lang];
      for (const k of keys) {
        value = value?.[k];
      }
      return value || key;
    },
    [lang]
  );

  /** Resolve a localized string from a nested { en, bn } object or plain string */
  const translateField = useCallback((field, overrideLang = lang) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[overrideLang] || field.bn || field.en || '';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage, setLanguage, translateField }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
