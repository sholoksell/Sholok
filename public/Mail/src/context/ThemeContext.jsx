import { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const theme = "dark";
  const setTheme = () => {};
  const toggleTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
