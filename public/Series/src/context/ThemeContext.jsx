import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);

const DEFAULT_READING_PREFS = {
  mode: 'day', // day | night | sepia
  fontSize: 18,
  fontFamily: 'Hind Siliguri',
  lineHeight: 1.8,
};

function readLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function ThemeProvider({ children }) {
  const [theme] = useState('dark');
  const [readingPrefs, setReadingPrefs] = useState(() => readLS('readingPrefs', DEFAULT_READING_PREFS));

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', JSON.stringify('dark'));
  }, []);

  useEffect(() => {
    localStorage.setItem('readingPrefs', JSON.stringify(readingPrefs));
  }, [readingPrefs]);

  const toggleTheme = useCallback(() => {
    // Theme is locked to dark — toggling is disabled.
  }, []);

  const updateReadingPrefs = useCallback((patch) => {
    setReadingPrefs((prev) => ({ ...prev, ...patch }));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, readingPrefs, updateReadingPrefs }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
