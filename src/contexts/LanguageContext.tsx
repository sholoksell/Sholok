
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { translations, Language } from '@/lib/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_STORAGE_KEY = 'sholok-language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        try {
            const saved = localStorage.getItem(LANG_STORAGE_KEY);
            if (saved === 'EN' || saved === 'BN') return saved;
        } catch {
            // localStorage unavailable
        }
        return 'BN'; // Default: Bangla
    });

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        try {
            localStorage.setItem(LANG_STORAGE_KEY, lang);
        } catch {
            // localStorage unavailable
        }
    }, []);

    const t = useCallback((key: string): string => {
        // @ts-ignore
        return translations[language][key] || key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
