import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const sidebarRef = useRef(null);

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
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* ── Floating Cart Button (right-side sticky FAB) ── */}
      {!isCartSidebarOpen && (
        <motion.button
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.4 }}
          whileHover={{ scale: 1.08, x: -4 }}
          whileTap={{ scale: 0.93 }}
          onClick={openCartSidebar}
          aria-label={`Open cart — ${totalItems} items`}
          className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-[55] flex-col items-center gap-1 py-4 px-2.5 rounded-l-2xl shadow-2xl cursor-pointer select-none"
          style={{ background: 'linear-gradient(180deg, #5D0096 0%, #7a00c4 100%)' }}
        >
          {/* Pulsing ring when cart has items */}
          {totalItems > 0 && (
            <motion.span
              className="absolute inset-0 rounded-l-2xl"
              animate={{ boxShadow: ['0 0 0 0 rgba(93,0,150,0.5)', '0 0 0 10px rgba(93,0,150,0)', '0 0 0 0 rgba(93,0,150,0)'] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          )}

          {/* Bag icon with float animation */}
          <div className="relative">
            <motion.div
              animate={totalItems > 0 ? { y: [0, -4, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ShoppingBag className="h-7 w-7 text-white" />
            </motion.div>
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full bg-sale text-white text-[10px] font-bold flex items-center justify-center leading-none shadow"
              >
                {totalItems > 9 ? '9+' : totalItems}
              </motion.span>
            )}
          </div>

          {/* Subtotal pill */}
          {totalItems > 0 && (
            <span className="text-[9px] font-bold text-white/90 leading-tight">
              ৳{subtotal.toFixed(0)}
            </span>
          )}

          <span className="text-[9px] font-semibold text-white/70 tracking-wide uppercase" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            Cart
          </span>
        </motion.button>
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
                onClick={closeCartSidebar}
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
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 mt-1">
                        ৳{item.price.toFixed(2)} each
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
