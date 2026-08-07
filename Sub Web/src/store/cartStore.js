import { create } from 'zustand';

const CART_KEY = 'sholok_cart';

const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch {
    return { items: [] };
  }
};

const saveCart = (cart) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
};

const computeTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { items, subtotal, total: subtotal };
};

export const useCartStore = create((set, get) => ({
  cart: loadCart(),
  loading: false,
  error: null,

  fetchCart: () => {
    const cart = loadCart();
    set({ cart });
  },

  // product = full product object, quantity = number
  addToCart: (product, quantity = 1) => {
    const { cart } = get();
    const productId = product._id || product.id;
    const price = product.salePrice || product.regularPrice || product.price || 0;
    const image = product.thumbnail || product.images?.[0] || '';
    const name = product.name || '';

    const existingIndex = cart.items.findIndex((i) => i.productId === productId);
    let newItems;

    if (existingIndex >= 0) {
      newItems = cart.items.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [
        ...cart.items,
        { _id: productId, productId, name, price, image, quantity },
      ];
    }

    const newCart = computeTotals(newItems);
    saveCart(newCart);
    set({ cart: newCart });
    return { success: true };
  },

  updateCartItem: (itemId, quantity) => {
    const { cart } = get();
    const newItems = cart.items.map((item) =>
      item._id === itemId ? { ...item, quantity } : item
    ).filter((item) => item.quantity > 0);
    const newCart = computeTotals(newItems);
    saveCart(newCart);
    set({ cart: newCart });
  },

  removeFromCart: (itemId) => {
    const { cart } = get();
    const newCart = computeTotals(cart.items.filter((item) => item._id !== itemId));
    saveCart(newCart);
    set({ cart: newCart });
  },

  clearCart: () => {
    const newCart = { items: [], subtotal: 0, total: 0 };
    saveCart(newCart);
    set({ cart: newCart });
  },

  applyCoupon: () => {
    return { success: false, message: 'Coupon feature coming soon' };
  },

  getCartItemCount: () => {
    const { cart } = get();
    return cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  },
}));
