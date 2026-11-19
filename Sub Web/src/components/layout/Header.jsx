import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, MapPin, LogOut, Settings, Phone, Heart, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useUIStore } from '@/store/uiStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import SmartSearch from '@/components/SmartSearch';
import HeaderSearchBar from '@/components/HeaderSearchBar';
import DeliveryLocationModal from '@/components/DeliveryLocationModal';
import { useDeliveryLocation } from '@/hooks/useDeliveryLocation';
import MegaMenu from './MegaMenu';
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutAuthModal from '@/components/CheckoutAuthModal';

const Header = () => {
  const navigate = useNavigate();
  const { customer, isAuthenticated, logout } = useAuth();
  const cartItemCount = useCartStore((state) => state.getCartItemCount());
  const { isMobileMenuOpen, toggleMobileMenu, openCartSidebar } = useUIStore();
  const { t, language, toggleLanguage } = useLanguage();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const { location: deliveryLocation } = useDeliveryLocation();
  const [accountDropdown, setAccountDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownRef = useRef(null);
  const wishlistCount = useWishlistStore((s) => s.count);
  const { load: loadWishlist, reset: resetWishlist } = useWishlistStore();
  const isBn = language === 'bn';

  useEffect(() => {
    if (isAuthenticated) loadWishlist();
    else resetWishlist();
  }, [isAuthenticated]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setAccountDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = () => {
    logout();
    setAccountDropdown(false);
    navigate('/');
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.header
      className="sticky top-0 z-50 shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 150, damping: 20 }}
    >
      {/* Modals */}
      <DeliveryLocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
      {showAuthModal && (
        <CheckoutAuthModal onClose={() => setShowAuthModal(false)} onAuthComplete={() => setShowAuthModal(false)} />
      )}

      {/* Promo Bar — Red-Orange */}
      <div className="bg-sale text-white">
        <div className="container mx-auto px-4 h-9 flex items-center text-xs">
          <p className="flex-1 text-center font-semibold text-white">
            {isBn ? t('welcomeMsg') : 'Welcome to Sholok Shopping!'}
          </p>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to="/vendor/apply" className="hidden md:flex items-center gap-1 text-yellow-300 hover:text-yellow-200 text-xs font-semibold border-r border-white/30 pr-3">
              🏪 {isBn ? 'বিক্রেতা হন' : 'Sell on Sholok'}
            </Link>
            <a href="tel:+8801716509407" className="flex items-center gap-1.5 font-medium hover:underline">
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">+8801716509407</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header — Dark Brand */}
      <div className="bg-[#1a0028] text-white">
        <div className="container mx-auto px-3 md:px-4 py-2.5 md:py-3">
          <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10 flex-shrink-0"
              onClick={toggleMobileMenu}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* Logo */}
            <div onClick={handleLogoClick} className="flex-shrink-0 cursor-pointer leading-none select-none">
              <span className="text-xl md:text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
                SHOLOK
              </span>
              <span className="hidden lg:block text-[10px] text-white/60 font-normal tracking-widest -mt-1">
                {isBn ? 'শপিং' : 'SHOPPING'}
              </span>
            </div>

            {/* Delivery Location — desktop */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 text-white hover:text-yellow-300 cursor-pointer transition-colors px-2 py-1 rounded hover:bg-white/10 border border-transparent hover:border-white/20 flex-shrink-0 max-w-[200px]"
              title={deliveryLocation?.label || ''}
            >
              <MapPin className="h-4 w-4 flex-shrink-0 text-yellow-300" />
              <span className="flex flex-col leading-tight text-left">
                <span className="text-[10px] text-white/60">{isBn ? 'ডেলিভারি' : 'Deliver to'}</span>
                <span className="text-xs font-bold truncate max-w-[140px]">
                  {deliveryLocation?.label || (isBn ? 'এলাকা বেছে নিন' : 'Select location')}
                </span>
              </span>
            </motion.div>

            {/* Amazon-style Search Bar — desktop */}
            <div className="flex-1 min-w-0 hidden md:flex justify-center">
              <HeaderSearchBar />
            </div>

            {/* Right Action Group */}
            <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0 ml-auto md:ml-0">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="hidden md:flex flex-col items-start px-2 py-1 rounded hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors leading-tight select-none"
              >
                <span className="text-[10px] text-white/60">{isBn ? 'ভাষা' : 'Language'}</span>
                <span className="text-xs font-bold text-white">{isBn ? 'English' : 'বাংলা'}</span>
              </button>

              {/* Account & Lists */}
              <div className="relative hidden md:block" ref={dropdownRef}>
                {isAuthenticated ? (
                  <button
                    onClick={() => setAccountDropdown(v => !v)}
                    className="flex flex-col items-start px-2 py-1 rounded hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors leading-tight"
                  >
                    <span className="text-[10px] text-white/60">
                      {isBn ? 'হ্যালো, ' : 'Hello, '}{customer?.name?.split(' ')[0] || (isBn ? 'ব্যবহারকারী' : 'User')}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {isBn ? t('accountAndLists') : 'Account & Lists'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex flex-col items-start px-2 py-1 rounded hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors leading-tight"
                  >
                    <span className="text-[10px] text-white/60">
                      {isBn ? t('helloSignIn') : 'Hello, sign in'}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {isBn ? t('accountAndLists') : 'Account & Lists'}
                    </span>
                  </button>
                )}

                <AnimatePresence>
                  {accountDropdown && isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-500">{isBn ? 'সাইন ইন করা হয়েছে' : 'Signed in as'}</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{customer?.name || 'Customer'}</p>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setAccountDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-soft hover:text-primary transition-colors"
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                        {isBn ? 'আমার অ্যাকাউন্ট' : 'My Account'}
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setAccountDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-soft hover:text-primary transition-colors"
                      >
                        <Heart className="h-4 w-4 text-gray-400" />
                        {isBn ? 'উইশলিস্ট' : 'Wishlist'}
                        {wishlistCount > 0 && <span className="ml-auto text-xs font-bold text-sale">{wishlistCount}</span>}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-sale hover:bg-sale-soft transition-colors border-t border-gray-100"
                      >
                        <LogOut className="h-4 w-4" />
                        {isBn ? 'সাইন আউট' : 'Sign Out'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Returns & Orders */}
              <Link
                to="/account/orders"
                className="hidden lg:flex flex-col items-start px-2 py-1 rounded hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors leading-tight"
              >
                <span className="text-[10px] text-white/60">{isBn ? 'রিটার্ন ও' : 'Returns &'}</span>
                <span className="text-xs font-bold text-white">{isBn ? 'অর্ডার' : 'Orders'}</span>
              </Link>

              {/* Wishlist — icon only on medium, hidden on large (it's in the Account dropdown) */}
              <Link
                to="/wishlist"
                className="relative md:flex hidden lg:hidden items-center justify-center p-1.5 rounded hover:bg-white/10 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-6 w-6 text-white" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-sale px-1 text-[10px] font-bold leading-[18px] text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openCartSidebar}
                className="relative flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/10 border border-transparent hover:border-white/30 transition-colors"
                aria-label={`Cart, ${cartItemCount} items`}
              >
                <span className="relative">
                  <ShoppingBag className="h-7 w-7 text-white" />
                  {cartItemCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 grid min-w-[20px] place-items-center rounded-full bg-sale px-1 text-[10px] font-bold leading-[20px] text-white border-2 border-[#1a0028]">
                      {cartItemCount}
                    </span>
                  )}
                </span>
                <span className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-[10px] text-white/60">{isBn ? 'আমার' : 'My'}</span>
                  <span className="text-sm font-bold text-yellow-300">{isBn ? 'কার্ট' : 'Cart'}</span>
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Nav Bar — MegaMenu (purple, desktop) */}
      <div className="hidden md:block">
        <MegaMenu />
      </div>

      {/* Mobile Search Bar */}
      <div className="bg-[#1a0028] md:hidden px-3 pb-3 pt-1">
        <SmartSearch />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden border-t border-white/10 bg-[#1a0028] absolute w-full left-0 shadow-2xl top-full overflow-hidden z-40"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              <Link to="/categories" className="block text-sm font-bold text-white border-b border-white/10 pb-2 hover:text-yellow-300" onClick={toggleMobileMenu}>
                {t('allCategories')}
              </Link>
              <Link to="/account/orders" className="flex items-center gap-2 text-sm font-medium py-2 text-white/80 hover:text-yellow-300" onClick={toggleMobileMenu}>
                <Package className="h-4 w-4" />
                {isBn ? t('returnsAndOrders') : 'Returns & Orders'}
              </Link>
              <Link to="/wishlist" className="flex items-center gap-2 text-sm font-medium py-2 text-white/80 hover:text-yellow-300" onClick={toggleMobileMenu}>
                <Heart className="h-4 w-4" />
                {isBn ? 'উইশলিস্ট' : 'Wishlist'}
                {wishlistCount > 0 && <span className="ml-1 text-xs font-bold text-sale">({wishlistCount})</span>}
              </Link>
              <Link to="/help" className="block text-sm font-medium py-2 text-white/80 hover:text-yellow-300" onClick={toggleMobileMenu}>
                {t('helpLine')}
              </Link>
              <div onClick={() => { toggleLanguage(); toggleMobileMenu(); }} className="block text-sm font-medium py-2 text-white/80 hover:text-yellow-300 cursor-pointer">
                {isBn ? '🌐 View in English' : '🌐 বাংলা তে দেখুন'}
              </div>
              <Link to="/vendor/apply" className="block text-sm font-semibold py-2 text-yellow-300 hover:text-yellow-200" onClick={toggleMobileMenu}>
                🏪 {isBn ? 'বিক্রেতা হন' : 'Sell on Sholok'}
              </Link>
              <div onClick={() => { setIsLocationModalOpen(true); toggleMobileMenu(); }} className="flex items-center gap-2 text-sm py-2 cursor-pointer text-white/80 hover:text-yellow-300">
                <MapPin className="h-4 w-4 text-yellow-300" />
                {deliveryLocation?.label || (isBn ? 'এলাকা বেছে নিন' : 'Select Delivery Location')}
              </div>
              {!isAuthenticated && (
                <button onClick={() => { setShowAuthModal(true); toggleMobileMenu(); }} className="w-full text-left text-sm font-semibold py-2 text-yellow-300 hover:text-yellow-200">
                  {isBn ? 'সাইন ইন / সাইন আপ' : 'Sign in / Sign up'}
                </button>
              )}
              {isAuthenticated && (
                <>
                  <Link to="/account" className="flex items-center gap-2 text-sm font-medium py-2 text-white/80 hover:text-yellow-300" onClick={toggleMobileMenu}>
                    <User className="h-4 w-4" />
                    {isBn ? 'আমার অ্যাকাউন্ট' : 'My Account'}
                  </Link>
                  <button onClick={() => { handleSignOut(); toggleMobileMenu(); }} className="flex items-center gap-2 text-sm font-medium py-2 text-sale hover:text-red-400 w-full text-left">
                    <LogOut className="h-4 w-4" />
                    {isBn ? 'সাইন আউট' : 'Sign Out'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
