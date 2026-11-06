import { createContext, useContext, useState, type ReactNode } from "react";

interface SearchContextType {
  liveQuery: string;
  setLiveQuery: (q: string) => void;
}

const SearchCtx = createContext<SearchContextType>({
  liveQuery: "",
  setLiveQuery: () => {},
});

export const useLiveSearch = () => useContext(SearchCtx);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [liveQuery, setLiveQuery] = useState("");
  return (
    <SearchCtx.Provider value={{ liveQuery, setLiveQuery }}>
      {children}
    </SearchCtx.Provider>
  );
}
