import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, MapPin, ChevronDown, Phone, HelpCircle } from 'lucide-react';
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

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer, isAuthenticated } = useAuth();
  const cartItemCount = useCartStore((state) => state.getCartItemCount());
  const { isMobileMenuOpen, toggleMobileMenu, openCartSidebar } = useUIStore();
  const { t, language, toggleLanguage } = useLanguage();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const { location: deliveryLocation } = useDeliveryLocation();

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.header 
      className="sticky top-0 z-50 bg-[#E31E24] shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
    >
      {/* Location Modal */}
      <DeliveryLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Main Bar */}
      <div className="container mx-auto px-4 py-2 md:py-3">
        <div className="flex items-center gap-4 md:gap-6">
          {/* Mobile Menu Button - Visible Mobile, Hidden Desktop */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-white hover:bg-white/10" 
              onClick={toggleMobileMenu}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* Logo */}
          <div onClick={handleLogoClick} className="flex-shrink-0 mr-2 md:mr-4 cursor-pointer">
            <motion.div 
              className="flex flex-col items-center justify-center bg-white p-1 rounded shadow-lg cursor-pointer"
              whileHover={{ scale: 1.05, rotate: [0, -2, 2, -2, 0] }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#E31E24] tracking-tighter leading-none px-1 select-none">
                Sholok
              </h1>
            </motion.div>
          </div>

          {/* Location Selector (Button Style) */}
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsLocationModalOpen(true)}
            className="hidden lg:flex items-center gap-2 bg-[#b9151a] hover:bg-[#a01217] text-white px-4 py-2 rounded text-sm cursor-pointer transition-all duration-300 border border-white/20 shadow-lg max-w-[260px]"
            title={deliveryLocation?.label || ''}
          >
            <motion.div
              animate={{ 
                y: [0, -3, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <MapPin className="h-4 w-4 flex-shrink-0" />
            </motion.div>
            <span className="truncate">
              {deliveryLocation?.label || t('deliveryLocation')}
            </span>
          </motion.div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-3xl hidden md:block">
            <SmartSearch />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 ml-auto">

            {/* App Download (Desktop) */}
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="hidden xl:flex items-center gap-2 bg-[#fec400] text-black px-3 py-1.5 rounded-sm text-xs font-bold cursor-pointer hover:bg-[#eebb00] transition-all duration-300 shadow-lg"
            >
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📱
              </motion.span>
              <span>{t('downloadApp')}</span>
            </motion.div>

            {/* Language Toggle */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              className="hidden md:flex items-center text-white text-sm font-medium border-r border-white/30 pr-3 cursor-pointer select-none hover:text-gray-200 transition-colors"
            >
              <motion.span
                key={language}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {language === 'en' ? 'বাংলা' : 'English'}
              </motion.span>
            </motion.div>

            <Link to={isAuthenticated ? '/account' : '/login'}>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center gap-2 text-white hover:bg-white/10 px-3 py-1.5 rounded transition-all duration-300"
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  {isAuthenticated ? t('account') : t('signIn')}
                </span>
              </motion.div>
            </Link>

            {/* Cart Button */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="fixed bottom-4 right-4 z-50 md:static md:z-auto bg-[#000] text-white p-3 md:py-2 md:px-4 rounded-full md:rounded-sm shadow-2xl md:shadow-lg flex items-center gap-2 cursor-pointer border-2 border-[#fec400] md:border hover:border-[#fec400] md:hover:bg-[#1a1a1a] transition-all duration-300"
              onClick={openCartSidebar}
              animate={{
                boxShadow: cartItemCount > 0 
                  ? ['0 0 20px rgba(254, 196, 0, 0.5)', '0 0 40px rgba(254, 196, 0, 0.8)', '0 0 20px rgba(254, 196, 0, 0.5)']
                  : '0 10px 25px rgba(0,0,0,0.2)'
              }}
              transition={{ duration: 2, repeat: cartItemCount > 0 ? Infinity : 0 }}
            >
              <div className="relative">
                <motion.div
                  animate={cartItemCount > 0 ? {
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <ShoppingCart className="h-6 w-6 text-[#fec400]" />
                </motion.div>
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center md:hidden shadow-lg"
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="hidden md:flex flex-col text-right leading-none">
                <span className="text-[10px] text-gray-300 uppercase">{t('cart')}</span>
                <motion.span 
                  className="text-sm font-bold text-[#fec400]"
                  key={cartItemCount}
                  initial={{ scale: 1.3, color: '#fff' }}
                  animate={{ scale: 1, color: '#fec400' }}
                  transition={{ duration: 0.3 }}
                >
                  {cartItemCount} {t('items')}
                </motion.span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <motion.div 
        className="md:hidden px-4 pb-3 pt-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SmartSearch />
      </motion.div>

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
            <motion.div 
              className="container mx-auto px-4 py-4 space-y-4"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div
                whileHover={{ x: 5, backgroundColor: "rgba(227, 30, 36, 0.05)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link
                  to="/categories"
                  className="block text-sm font-bold text-gray-800 border-b pb-2"
                  onClick={toggleMobileMenu}
                >
                  {t('allCategories')}
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ x: 5, backgroundColor: "rgba(227, 30, 36, 0.05)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link
                  to="/help"
                  className="block text-sm font-medium hover:text-[#E31E24]"
                  onClick={toggleMobileMenu}
                >
                  {t('helpLine')}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
