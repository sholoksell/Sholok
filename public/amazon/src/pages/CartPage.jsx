import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import PrimeBadge from '../components/common/PrimeBadge';
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiTag } from 'react-icons/fi';
import { BsBoxSeam } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';

const CartItem = ({ item, onRemove, onUpdate }) => {
  const [imgError, setImgError] = useState(false);
  const { t, getLocalizedField } = useLanguage();
  const title = getLocalizedField(item, 'title');
  const fallback = `https://placehold.co/120x120/EAEDED/565959?text=${encodeURIComponent(item.brand || 'Item')}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="flex gap-4 py-4 border-b border-amazon-border last:border-0"
    >
      {/* Image */}
      <Link to={`/product/${item.id}`} className="shrink-0">
        <img
          src={!item.image || imgError ? fallback : item.image}
          alt={title}
          onError={() => setImgError(true)}
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded border border-amazon-border p-1 bg-[#F7F8F8]"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/product/${item.id}`}
          className="text-amazon-dark text-sm font-medium line-clamp-2 hover:text-amazon-orange transition-colors leading-snug"
        >
          {title}
        </Link>
        <p className="text-amazon-text-gray text-xs mt-0.5">{item.brand}</p>

        <p className="text-amazon-green text-xs mt-1">
          {item.inStock ? t('inStock') : t('outOfStock')}
        </p>

        {item.isPrime && (
          <div className="flex items-center gap-1.5 mt-1">
            <PrimeBadge />
            <span className="text-xs text-amazon-dark">{t('freeDelivery')}</span>
          </div>
        )}

        {/* Qty + actions */}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {/* Quantity */}
          <div className="flex items-center border border-amazon-border rounded overflow-hidden">
            <button
              onClick={() => onUpdate(item.id, item.quantity - 1)}
              className="px-2 py-1 bg-[#F0F2F2] hover:bg-[#E0E0E0] text-amazon-dark transition-colors text-sm"
              aria-label="Decrease"
            >
              <FiMinus size={12} />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-amazon-dark border-x border-amazon-border bg-white min-w-[36px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              className="px-2 py-1 bg-[#F0F2F2] hover:bg-[#E0E0E0] text-amazon-dark transition-colors text-sm"
              aria-label="Increase"
            >
              <FiPlus size={12} />
            </button>
          </div>

          <span className="text-amazon-text-gray text-xs">|</span>

          <button
            onClick={() => onRemove(item.id)}
            className="flex items-center gap-1 text-amazon-blue hover:text-red-500 text-xs hover:underline transition-colors"
          >
            <FiTrash2 size={12} /> Delete
          </button>

          <span className="text-amazon-text-gray text-xs">|</span>

          <button className="text-amazon-blue hover:text-amazon-blue-dark text-xs hover:underline transition-colors">
            Save for later
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        <p className="text-lg font-bold text-amazon-dark">
          ৳{Math.round(item.price * item.quantity * 110).toLocaleString()}
        </p>
        {item.quantity > 1 && (
          <p className="text-xs text-amazon-text-gray">৳{Math.round(item.price * 110).toLocaleString()} each</p>
        )}
      </div>
    </motion.div>
  );
};

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const handleRemove = (id) => {
    removeFromCart(id);
    addToast('Item removed from cart', 'info');
  };

  const applyCoupon = () => {
    if (coupon.trim().toLowerCase() === 'save10') {
      setCouponApplied(true);
      addToast('Coupon applied! 10% off your order.', 'success');
    } else {
      addToast('Invalid coupon code', 'error');
    }
  };

  const discount   = couponApplied ? totalPrice * 0.1 : 0;
  const shipping   = totalPrice >= 25 || cartItems.some(i => i.isPrime) ? 0 : 5.99;
  const finalTotal = totalPrice - discount + shipping;

  const handleCheckout = () => {
    addToast('Checkout is a demo — no payment processed.', 'info');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-12 text-center">
        <div className="inline-flex flex-col items-center gap-4">
          <FiShoppingCart size={64} className="text-amazon-text-gray" />
          <h1 className="text-2xl font-bold text-amazon-dark">Your ShopZone Cart is empty</h1>
          <p className="text-amazon-text-gray text-sm">
            You have no items in your shopping cart.
          </p>
          <Link to="/" className="amazon-btn px-8 py-2 text-base">
            Continue Shopping
          </Link>
          <p className="text-sm text-amazon-dark">
            Already a customer?{' '}
            <Link to="/login" className="text-amazon-blue hover:underline">Sign in</Link>{' '}
            to see your cart.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

        {/* Left – Cart items */}
        <div className="bg-white rounded shadow-amazon p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-medium text-amazon-dark">Shopping Cart</h1>
            <button
              onClick={() => {
                clearCart();
                addToast('Cart cleared', 'info');
              }}
              className="text-xs text-amazon-blue hover:underline"
            >
              Deselect all items
            </button>
          </div>

          <p className="text-sm text-amazon-text-gray text-right mb-2">Price</p>
          <hr className="border-amazon-border mb-2" />

          <AnimatePresence>
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onUpdate={updateQuantity}
              />
            ))}
          </AnimatePresence>

          <div className="text-right mt-4 pt-3 border-t border-amazon-border">
            <p className="text-lg text-amazon-dark">
              Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''}):{' '}
              <span className="font-bold">৳{Math.round(totalPrice * 110).toLocaleString()}</span>
            </p>
          </div>

          {/* Coupon */}
          <div className="mt-4 pt-4 border-t border-amazon-border">
            <p className="text-sm font-bold text-amazon-dark mb-2 flex items-center gap-1.5">
              <FiTag size={14} /> Have a coupon code?
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder='Try "SAVE10"'
                className="flex-1 border border-amazon-border rounded px-3 py-1.5 text-sm text-amazon-dark focus:outline-none focus:border-amazon-orange"
              />
              <button onClick={applyCoupon} className="amazon-btn-secondary px-4 text-sm">
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Right – Order summary */}
        <div>
          <div className="bg-white rounded shadow-amazon p-4 sticky top-20">
            {/* Prime eligible message */}
            {cartItems.some(i => i.isPrime) && (
              <div className="bg-[#F5F5F5] border border-[#E4E4E4] rounded p-2 mb-3 text-xs text-amazon-dark flex items-start gap-1.5">
                <span className="shrink-0">✓</span>
                <p>
                  Your order qualifies for <strong>FREE Delivery</strong>.{' '}
                  <Link to="/" className="text-amazon-blue hover:underline">Choose this option</Link> at checkout.
                </p>
              </div>
            )}

            <h2 className="text-lg text-amazon-dark mb-3">
              Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''}):
              <span className="font-bold"> ৳{Math.round(totalPrice * 110).toLocaleString()}</span>
            </h2>

            <div className="space-y-1.5 text-sm text-amazon-dark mb-3">
              <div className="flex justify-between">
                <span>Items ({totalItems}):</span>
                <span>৳{Math.round(totalPrice * 110).toLocaleString()}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-amazon-green font-medium">
                  <span>Coupon discount (10%):</span>
                  <span>-৳{Math.round(discount * 110).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className={shipping === 0 ? 'text-amazon-green' : ''}>
                  {shipping === 0 ? 'FREE' : `৳${Math.round(shipping * 110).toLocaleString()}`}
                </span>
              </div>
              <hr className="border-amazon-border my-2" />
              <div className="flex justify-between font-bold text-base">
                <span>Order Total:</span>
                <span className="text-amazon-red">৳{Math.round(finalTotal * 110).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full amazon-btn py-2.5 text-sm font-medium mb-2"
            >
              Proceed to Checkout
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-amazon-text-gray mt-2">
              <BsBoxSeam size={12} />
              <span>Secure checkout • SSL encrypted</span>
            </div>

            {/* Payment icons */}
            <div className="flex items-center justify-center gap-2 mt-3 text-xl">
              {['💳', '🏦', '💰', '📱'].map((icon, i) => (
                <span key={i} title="Payment method">{icon}</span>
              ))}
            </div>
          </div>

          {/* Savings box */}
          <div className="bg-white rounded shadow-amazon p-3 mt-3 text-center">
            <p className="text-xs text-amazon-text-gray">
              You Save:{' '}
              <span className="text-amazon-red font-bold">
                ৳{Math.round(cartItems.reduce((s, i) => s + ((i.originalPrice - i.price) * i.quantity), 0) * 110).toLocaleString()}
              </span>{' '}
              with discount
            </p>
          </div>
        </div>
      </div>

      {/* Continue shopping */}
      <div className="mt-6 text-center">
        <Link to="/" className="text-amazon-blue hover:underline text-sm">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default CartPage;
