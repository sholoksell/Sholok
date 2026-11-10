import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, MapPin, LogOut, Settings, Phone, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import SmartSearch from '@/components/SmartSearch';
import DeliveryLocationModal from '@/components/DeliveryLocationModal';
import { useDeliveryLocation } from '@/hooks/useDeliveryLocation';
import MegaMenu from './MegaMenu';
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutAuthModal from '@/components/CheckoutAuthModal';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer, isAuthenticated, logout } = useAuth();
  const cartItemCount = useCartStore((state) => state.getCartItemCount());
  const { isMobileMenuOpen, toggleMobileMenu, openCartSidebar } = useUIStore();
  const { t, language, toggleLanguage } = useLanguage();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const { location: deliveryLocation } = useDeliveryLocation();
  const [accountDropdown, setAccountDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAccountDropdown(false);
      }
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
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
    >
      {/* Location Modal */}
      <DeliveryLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Top Bar — Deep Purple */}
      <div className="bg-primary-deep text-white">
        <div className="container mx-auto px-4 h-9 flex items-center justify-between gap-4 text-xs">
          <p className="truncate">
            <span className="font-semibold">Welcome to Sholok Shopping!</span>
            <span className="ml-2 hidden sm:inline opacity-80">Discover products you'll love.</span>
          </p>
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Language Toggle */}
            <div
              onClick={toggleLanguage}
              className="hidden md:flex items-center text-white text-xs font-medium cursor-pointer hover:text-gray-200 border-r border-white/30 pr-3 select-none"
            >
              {language === 'en' ? 'বাংলা' : 'English'}
            </div>
            {/* Sell on Sholok */}
            <Link to="/vendor/apply" className="hidden md:flex items-center gap-1 text-yellow-300 hover:text-yellow-200 text-xs font-semibold border-r border-white/30 pr-3">
              🏪 Sell on Sholok
            </Link>
            {/* Phone */}
            <a href="tel:+8801000000000" className="flex items-center gap-1.5 font-medium hover:underline">
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">+880 1XXX-XXXXXX</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header — White */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center gap-3 md:gap-4 lg:gap-5">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-700 hover:bg-primary-soft hover:text-primary"
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
            <div onClick={handleLogoClick} className="flex-shrink-0 cursor-pointer flex flex-col leading-none">
              <span className="text-2xl md:text-[28px] font-extrabold tracking-tight text-primary">
                SHOLOK<span className="text-sale">.</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground mt-0.5">Shopping</span>
            </div>

            {/* Location Selector */}
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden lg:flex items-center gap-2 border border-border hover:border-primary hover:bg-primary-soft text-gray-700 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 max-w-[240px]"
              title={deliveryLocation?.label || ''}
            >
              <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="flex flex-col leading-tight text-left">
                <span className="text-[11px] text-muted-foreground">Deliver to</span>
                <span className="text-sm font-semibold truncate max-w-[160px]">
                  {deliveryLocation?.label || t('deliveryLocation')}
                </span>
              </span>
            </motion.div>

            {/* Search Bar */}
            <div className="flex-1 min-w-0 hidden md:block">
              <SmartSearch />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Auth modal for sign-in */}
              {showAuthModal && (
                <CheckoutAuthModal
                  onClose={() => setShowAuthModal(false)}
                  onAuthComplete={() => setShowAuthModal(false)}
                />
              )}

              {isAuthenticated ? (
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAccountDropdown(v => !v)}
                    className="flex items-center gap-2 text-gray-700 hover:bg-primary-soft hover:text-primary px-2 xl:px-3 py-1.5 rounded-lg transition-all duration-200"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden xl:flex flex-col text-left leading-tight">
                      <span className="text-[11px] text-muted-foreground">Login</span>
                      <span className="text-sm font-semibold">{t('account')}</span>
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {accountDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs text-gray-500">Signed in as</p>
                          <p className="text-sm font-semibold text-gray-800 truncate">{customer?.name || 'Customer'}</p>
                        </div>
                        <Link
                          to="/account"
                          onClick={() => setAccountDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-soft hover:text-primary transition-colors"
                        >
                          <Settings className="h-4 w-4 text-gray-400" />
                          My Account
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-sale hover:bg-sale-soft transition-colors border-t border-gray-100"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuthModal(true)}
                  className="hidden md:flex items-center gap-2 text-gray-700 hover:bg-primary-soft hover:text-primary border border-border px-3 py-1.5 rounded-lg transition-all duration-200 text-sm"
                >
                  <User className="h-5 w-5" />
                  <span className="flex flex-col text-left leading-tight">
                    <span className="text-[11px] text-muted-foreground">Login</span>
                    <span className="text-sm font-semibold">My Account</span>
                  </span>
                </motion.button>
              )}

              {/* Wishlist Button */}
              <Link
                to="/wishlist"
                className="relative hidden md:flex items-center gap-2 text-gray-700 hover:bg-primary-soft hover:text-primary p-1.5 rounded-lg transition-all duration-200"
                aria-label="Wishlist"
              >
                <span className="relative">
                  <Heart className="h-6 w-6" />
                  <span className="absolute -right-2 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-sale px-1 text-[10px] font-bold leading-[18px] text-white">0</span>
                </span>
                <span className="hidden xl:flex flex-col text-left leading-tight">
                  <span className="text-[11px] text-muted-foreground">My</span>
                  <span className="text-sm font-semibold">Wishlist</span>
                </span>
              </Link>

              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={openCartSidebar}
                className="relative flex items-center gap-2 text-gray-700 hover:bg-primary-soft hover:text-primary p-1.5 rounded-lg transition-all duration-200"
                aria-label={`Cart, ${cartItemCount} items`}
              >
                <span className="relative">
                  <ShoppingBag className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -right-2 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-sale px-1 text-[10px] font-bold leading-[18px] text-white">
                      {cartItemCount}
                    </span>
                  )}
                </span>
                <span className="hidden xl:flex flex-col text-left leading-tight">
                  <span className="text-[11px] text-muted-foreground">Your Cart</span>
                  <span className="text-sm font-semibold">$0.00</span>
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* MegaMenu — SHOP BY CATEGORY nav bar, desktop only — DO NOT MODIFY */}
      <div className="hidden md:block">
        <MegaMenu />
      </div>

      {/* Mobile Search Bar */}
      <div className="bg-white md:hidden px-3 pb-3 pt-1">
        <SmartSearch />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden border-t bg-white absolute w-full left-0 shadow-2xl top-full overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              <Link
                to="/categories"
                className="block text-sm font-bold text-gray-800 border-b pb-2 hover:text-primary"
                onClick={toggleMobileMenu}
              >
                {t('allCategories')}
              </Link>
              <Link
                to="/help"
                className="block text-sm font-medium py-2 hover:text-primary"
                onClick={toggleMobileMenu}
              >
                {t('helpLine')}
              </Link>
              <div
                onClick={() => { toggleLanguage(); toggleMobileMenu(); }}
                className="block text-sm font-medium py-2 hover:text-primary cursor-pointer"
              >
                {language === 'en' ? 'বাংলা তে দেখুন' : 'View in English'}
              </div>
              <Link to="/vendor/apply" className="block text-sm font-semibold py-2 text-yellow-600 hover:text-yellow-700" onClick={toggleMobileMenu}>
                🏪 Sell on Sholok
              </Link>
              <div
                onClick={() => { setIsLocationModalOpen(true); toggleMobileMenu(); }}
                className="flex items-center gap-2 text-sm py-2 cursor-pointer hover:text-primary"
              >
                <MapPin className="h-4 w-4 text-primary" />
                {deliveryLocation?.label || 'Select Delivery Location'}
              </div>
              {!isAuthenticated && (
                <button
                  onClick={() => { setShowAuthModal(true); toggleMobileMenu(); }}
                  className="w-full text-left text-sm font-semibold py-2 text-primary hover:underline"
                >
                  Sign in / Sign up
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
