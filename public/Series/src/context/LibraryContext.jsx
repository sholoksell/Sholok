import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const LibraryContext = createContext(null);

function readLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function LibraryProvider({ children }) {
  const [favorites, setFavorites] = useState(() => readLS('favorites', []));
  const [bookmarks, setBookmarks] = useState(() => readLS('bookmarks', []));
  const [history, setHistory] = useState(() => readLS('history', []));
  const [continueReading, setContinueReading] = useState(() => readLS('continueReading', []));
  const [searchHistory, setSearchHistory] = useState(() => readLS('searchHistory', []));

  useEffect(() => localStorage.setItem('favorites', JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem('bookmarks', JSON.stringify(bookmarks)), [bookmarks]);
  useEffect(() => localStorage.setItem('history', JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem('continueReading', JSON.stringify(continueReading)), [continueReading]);
  useEffect(() => localStorage.setItem('searchHistory', JSON.stringify(searchHistory)), [searchHistory]);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  const toggleBookmark = useCallback((bookId, chapterInfo = null) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.bookId === bookId);
      if (exists) return prev.filter((b) => b.bookId !== bookId);
      return [...prev, { bookId, chapterInfo, addedAt: Date.now() }];
    });
  }, []);

  const isBookmarked = useCallback((bookId) => bookmarks.some((b) => b.bookId === bookId), [bookmarks]);

  const addToHistory = useCallback((bookId) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.bookId !== bookId);
      return [{ bookId, viewedAt: Date.now() }, ...filtered].slice(0, 50);
    });
  }, []);

  const updateContinueReading = useCallback((bookId, progress) => {
    setContinueReading((prev) => {
      const filtered = prev.filter((c) => c.bookId !== bookId);
      return [{ bookId, progress, updatedAt: Date.now() }, ...filtered].slice(0, 20);
    });
  }, []);

  const addSearchHistory = useCallback((term) => {
    if (!term || !term.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((t) => t !== term);
      return [term, ...filtered].slice(0, 10);
    });
  }, []);

  const clearSearchHistory = useCallback(() => setSearchHistory([]), []);

  return (
    <LibraryContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        history,
        addToHistory,
        continueReading,
        updateContinueReading,
        searchHistory,
        addSearchHistory,
        clearSearchHistory,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
