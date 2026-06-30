import { createContext, useContext, useState } from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const pushToast = (message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <UIContext.Provider
      value={{
        sidebarOpen, setSidebarOpen,
        commandPaletteOpen, setCommandPaletteOpen,
        toasts, pushToast, dismissToast,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
