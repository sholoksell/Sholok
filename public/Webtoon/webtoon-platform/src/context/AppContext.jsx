import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('webtoon-theme');
    return saved ? saved === 'dark' : true;
  });

  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('webtoon-favorites') || '[]'); }
    catch { return []; }
  });

  const [readingHistory, setReadingHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('webtoon-history') || '[]'); }
    catch { return []; }
  });

  const [continueReading, setContinueReading] = useState(() => {
    try { return JSON.parse(localStorage.getItem('webtoon-continue') || '[]'); }
    catch { return []; }
  });

  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('webtoon-searches') || '[]'); }
    catch { return []; }
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('webtoon-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('webtoon-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('webtoon-history', JSON.stringify(readingHistory));
  }, [readingHistory]);

  useEffect(() => {
    localStorage.setItem('webtoon-continue', JSON.stringify(continueReading));
  }, [continueReading]);

  useEffect(() => {
    localStorage.setItem('webtoon-searches', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);

  const toggleFavorite = useCallback((webtoon) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === webtoon.id);
      if (exists) {
        showToast('Removed from favorites', 'info');
        return prev.filter(f => f.id !== webtoon.id);
      } else {
        showToast('Added to favorites! ❤️', 'success');
        return [webtoon, ...prev];
      }
    });
  }, []);

  const isFavorite = useCallback((id) => favorites.some(f => f.id === id), [favorites]);

  const addToHistory = useCallback((webtoon) => {
    setReadingHistory(prev => {
      const filtered = prev.filter(h => h.id !== webtoon.id);
      return [{ ...webtoon, viewedAt: new Date().toISOString() }, ...filtered].slice(0, 50);
    });
  }, []);

  const updateContinueReading = useCallback((webtoon, episodeNumber) => {
    setContinueReading(prev => {
      const filtered = prev.filter(c => c.id !== webtoon.id);
      return [{ ...webtoon, lastEpisode: episodeNumber, updatedAt: new Date().toISOString() }, ...filtered].slice(0, 20);
    });
  }, []);

  const addSearchHistory = useCallback((query) => {
    if (!query.trim()) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(s => s !== query);
      return [query, ...filtered].slice(0, 10);
    });
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AppContext.Provider value={{
      darkMode, toggleDarkMode,
      favorites, toggleFavorite, isFavorite,
      readingHistory, addToHistory,
      continueReading, updateContinueReading,
      searchHistory, addSearchHistory,
      toast, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
