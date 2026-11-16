import React, { useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { EmptyCart } from '@/components/EmptyStates';
import { AnimatePresence, motion } from 'framer-motion';

const CartSidebar = () => {
  const { cart, removeFromCart, updateCartItem } = useCartStore();
  const { isCartSidebarOpen, openCartSidebar, closeCartSidebar, toggleCartSidebar } = useUIStore();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  const isCheckoutPage = location.pathname === '/checkout' || location.pathname.startsWith('/checkout');

  // Auto-close sidebar when navigating to checkout page
  useEffect(() => {
    if (isCheckoutPage && isCartSidebarOpen) {
      closeCartSidebar();
    }
  }, [isCheckoutPage, isCartSidebarOpen, closeCartSidebar]);

  // Listen for openCart custom event (dispatched by MobileBottomNav)
  useEffect(() => {
    const handleOpenCart = () => {
      useUIStore.getState().openCartSidebar();
    };
    window.addEventListener('openCart', handleOpenCart);
    return () => window.removeEventListener('openCart', handleOpenCart);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartSidebarOpen) {
        closeCartSidebar();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCartSidebarOpen, closeCartSidebar]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isCartSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCartSidebarOpen]);

  const handleCheckout = () => {
    closeCartSidebar();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    closeCartSidebar();
    navigate('/checkout');
  };

  const handleUpdateQuantity = (itemId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity >= 1) {
      updateCartItem(itemId, newQuantity);
    }
  };

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || 1)), 0);
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Don't render anything on checkout page (sidebar + orbit cart)
  if (isCheckoutPage) return null;

  return (
    <>
      {/* ── Orbit Cart floating widget — hidden on checkout page ── */}
      {!isCartSidebarOpen && !isCheckoutPage && (
        <div className="orbit-cart-wrap">
          <button
            className="orbit-cart-btn"
            onClick={openCartSidebar}
            aria-label={`Open cart — ${totalItems} items`}
          >
            <span className="orbit-cart-face">
              {/* ShoppingBasket icon — exact 7-path SVG from Design No. 10 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 30, height: 30 }}
                aria-hidden="true"
              >
                <path d="m15 11-1 9" />
                <path d="m19 11-4-7" />
                <path d="M2 11h20" />
                <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
                <path d="M4.5 15.5h15" />
                <path d="m5 11 4-7" />
                <path d="m9 11 1 9" />
              </svg>
              <span className="orbit-cart-items">{totalItems} items</span>
              {totalItems > 0 && (
                <span className="orbit-cart-badge" aria-hidden="true">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </span>
            <span className="orbit-cart-total">৳{subtotal.toFixed(0)}</span>
          </button>
        </div>
      )}

    <AnimatePresence>
      {isCartSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            onClick={closeCartSidebar}
          />

          {/* Sidebar */}
          <motion.div
            key="sidebar"
            ref={sidebarRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#5D0096] to-[#7a00c4] text-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6" />
                <div>
                  <h2 className="font-bold text-lg">Shopping Cart</h2>
                  <p className="text-xs text-white/80">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); closeCartSidebar(); }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <EmptyCart onClose={closeCartSidebar} />
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-3 p-3 border rounded-xl hover:shadow-md transition-all duration-200 bg-white"
                  >
                    {/* Product image */}
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border bg-gray-50">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-semibold text-sm line-clamp-2 text-gray-800 leading-snug">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0 p-0.5"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {item.variation && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.variation}</p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-gray-300 rounded-lg bg-white h-8 shadow-sm">
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity, -1)}
                            className="px-2.5 hover:bg-gray-100 disabled:opacity-40 h-full flex items-center transition-colors rounded-l-lg"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3 text-gray-600" />
                          </button>
                          <div className="w-9 text-center text-sm font-semibold select-none">
                            {item.quantity}
                          </div>
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity, 1)}
                            className="px-2.5 hover:bg-gray-100 h-full flex items-center transition-colors rounded-r-lg"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3 text-gray-600" />
                          </button>
                        </div>
                        {/* Line subtotal */}
                        <div className="font-bold text-[#5D0096] text-sm">
                          ৳{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 mt-1">
                        ৳{parseFloat(item.price).toFixed(2)} each
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t bg-gray-50 p-4 space-y-3 flex-shrink-0">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-bold text-gray-900 text-base">৳{subtotal.toFixed(2)}</span>
                </div>

                <p className="text-xs text-gray-500">
                  Shipping calculated at checkout
                </p>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <Button
                    className="w-full bg-sale hover:bg-sale/90 text-white font-bold py-5 text-base shadow-md hover:shadow-lg transition-all"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <button
                    onClick={handleViewCart}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-[#5D0096] border border-[#5D0096] rounded-lg hover:bg-[#5D0096] hover:text-white transition-all duration-200"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    View Full Cart
                  </button>

                  <button
                    onClick={closeCartSidebar}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors py-1"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
};

export default CartSidebar;
