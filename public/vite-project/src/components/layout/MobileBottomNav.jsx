import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3x3, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const cartItemCount = useCartStore((state) => state.getCartItemCount());
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    {
      icon: Home,
      label: t('home'),
      path: '/',
      active: location.pathname === '/',
    },
    {
      icon: Grid3x3,
      label: t('categories'),
      path: '/categories',
      active: location.pathname.startsWith('/category'),
    },
    {
      icon: ShoppingCart,
      label: t('cart'),
      path: '#',
      badge: cartItemCount,
      active: false,
      isCart: true,
    },
    {
      icon: User,
      label: isAuthenticated ? t('account') : t('login'),
      path: isAuthenticated ? '/account' : '/login',
      active: location.pathname === '/account' || location.pathname === '/login',
    },
  ];

  const handleCartClick = (e) => {
    e.preventDefault();
    // Open cart sidebar
    const event = new CustomEvent('openCart');
    window.dispatchEvent(event);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return item.isCart ? (
            <button
              key={item.label}
              onClick={handleCartClick}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                item.active
                  ? 'text-[#E31E24]'
                  : 'text-gray-600 hover:text-[#E31E24]'
              }`}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#E31E24] text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {item.active && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#E31E24] rounded-b-full" />
              )}
            </button>
          ) : (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                item.active
                  ? 'text-[#E31E24]'
                  : 'text-gray-600 hover:text-[#E31E24]'
              }`}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#E31E24] text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {item.active && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#E31E24] rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
