import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext(null);

function useLocalStorageList(key) {
  const [list, setList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(list));
  }, [key, list]);

  const toggle = (id) =>
    setList((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return [list, toggle];
}

export function AppProvider({ children }) {
  const [favoriteTeams, toggleFavoriteTeam] = useLocalStorageList("kb-fav-teams");
  const [favoritePlayers, toggleFavoritePlayer] = useLocalStorageList("kb-fav-players");
  const [bookmarks, toggleBookmark] = useLocalStorageList("kb-bookmarks");
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kb-recent")) || [];
    } catch {
      return [];
    }
  });
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kb-search-history")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("kb-recent", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem("kb-search-history", JSON.stringify(searchHistory));
  }, [searchHistory]);

  const addRecentlyViewed = (item) => {
    setRecentlyViewed((prev) => [item, ...prev.filter((p) => p.id !== item.id)].slice(0, 20));
  };

  const addSearchTerm = (term) => {
    if (!term.trim()) return;
    setSearchHistory((prev) => [term, ...prev.filter((t) => t !== term)].slice(0, 10));
  };

  return (
    <AppContext.Provider
      value={{
        favoriteTeams,
        toggleFavoriteTeam,
        favoritePlayers,
        toggleFavoritePlayer,
        bookmarks,
        toggleBookmark,
        recentlyViewed,
        addRecentlyViewed,
        searchHistory,
        addSearchTerm,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
