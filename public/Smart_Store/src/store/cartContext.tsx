import { createContext, useContext, useState, ReactNode } from "react";
import type { Product } from "@/data/mockData";

type CartItem = Product & { quantity: number };

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (product: Product) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, q: number) => void;
  total: number;
  count: number;
  wishlist: Set<string>;
  toggleWishlist: (id: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const add = (product: Product) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === product.id);
      if (found) return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const setQuantity = (id: string, q: number) => {
    if (q <= 0) return remove(id);
    setItems((p) => p.map((i) => (i.id === id ? { ...i, quantity: q } : i)));
  };

  const toggleWishlist = (id: string) =>
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false), add, remove, setQuantity, total, count, wishlist, toggleWishlist }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
