import { createContext, useContext, useState, ReactNode } from "react";
import type { Product } from "@/data/mockData";

type Ctx = {
  product: Product | null;
  open: (p: Product) => void;
  close: () => void;
};

const QuickViewContext = createContext<Ctx | null>(null);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  return (
    <QuickViewContext.Provider value={{ product, open: setProduct, close: () => setProduct(null) }}>
      {children}
    </QuickViewContext.Provider>
  );
}

export const useQuickView = () => {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView must be used within QuickViewProvider");
  return ctx;
};
