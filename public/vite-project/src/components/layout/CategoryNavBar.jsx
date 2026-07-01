import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ChevronRight, Store, Phone } from 'lucide-react';
import { useCategories } from '@/contexts/CategoryContext';
import CategoryIcon from '@/components/CategoryIcon';

const NAV_LINKS = [
  { label: 'Summer Fest', href: '/category/summer-fest', highlight: false },
  { label: 'Great Deals', href: '/offers', highlight: true },
  { label: 'Unilever-Stock & Save', href: '/category/unilever', highlight: false },
  { label: 'Buy & Save More', href: '/category/buy-save', highlight: false },
  { label: 'Our Brands', href: '/category/our-brands', highlight: false },
  { label: "Women's Corner", href: '/category/womens-corner', highlight: false },
];

const CategoryNavBar = () => {
  const { categories } = useCategories();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const menuRef = useRef(null);
  const closeTimer = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveCategory(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMenuEnter = () => {
    clearTimeout(closeTimer.current);
    setIsMenuOpen(true);
  };

  const handleMenuLeave = () => {
    closeTimer.current = setTimeout(() => {
      setIsMenuOpen(false);
      setActiveCategory(null);
    }, 150);
  };

  const topCategories = categories.slice(0, 12);
  const activeSubs = activeCategory?.subcategories || activeCategory?.children || [];

  return (
    <div className="hidden lg:block bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-stretch h-11">

          {/* SHOP BY CATEGORY button — always white, no red background */}
          <div
            ref={menuRef}
            className="relative flex-shrink-0"
            onMouseEnter={handleMenuEnter}
            onMouseLeave={handleMenuLeave}
          >
            <button
              className="flex items-center gap-2 h-full px-4 font-bold text-sm text-gray-800 hover:text-[#E31E24] border-r border-gray-200 transition-colors select-none whitespace-nowrap bg-white"
              onClick={() => setIsMenuOpen((v) => !v)}
            >
              <Menu className="w-4 h-4" />
              SHOP BY CATEGORY
            </button>

            {/* Dropdown — no red header, just the category list */}
            {isMenuOpen && (
              <div className="absolute top-full left-0 z-50 flex bg-white shadow-2xl border border-gray-200 rounded-b-lg overflow-hidden min-w-[220px]">
                <ul className="w-56 py-2 border-r border-gray-100 max-h-[420px] overflow-y-auto">
                  {topCategories.map((cat) => (
                    <li key={cat._id}>
                      <Link
                        to={`/category/${cat.slug}`}
                        onClick={() => setIsMenuOpen(false)}
                        onMouseEnter={() => setActiveCategory(cat)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          activeCategory?._id === cat._id
                            ? 'bg-red-50 text-[#E31E24]'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-[#E31E24]'
                        }`}
                      >
                        <span className="text-base w-5 text-center">
                          <CategoryIcon icon={cat.icon} name={cat.name} asText className="w-5 h-5" />
                        </span>
                        <span className="flex-1 font-medium">{cat.name}</span>
                        {(cat.subcategories?.length > 0 || cat.children?.length > 0) && (
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        )}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      to="/categories"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#E31E24] font-semibold hover:bg-red-50 border-t border-gray-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                      All Categories
                    </Link>
                  </li>
                </ul>

                {activeCategory && activeSubs.length > 0 && (
                  <div className="w-64 py-2 bg-white max-h-[420px] overflow-y-auto">
                    <p className="text-xs font-bold text-gray-400 uppercase px-4 pt-2 pb-1 tracking-wide">
                      {activeCategory.name}
                    </p>
                    <ul>
                      {activeSubs.map((sub) => (
                        <li key={sub._id}>
                          <Link
                            to={`/category/${sub.slug}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-[#E31E24] transition-colors border-b border-gray-50"
                          >
                            {sub.icon && (
                              <CategoryIcon icon={sub.icon} name={sub.name} asText className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span>{sub.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Promo nav links */}
          <nav className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide px-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`whitespace-nowrap px-3 py-1.5 text-sm font-semibold rounded transition-colors flex-shrink-0 ${
                  link.highlight
                    ? 'text-[#00b0f0] hover:text-[#0090cc]'
                    : 'text-gray-700 hover:text-[#E31E24]'
                }`}
              >
                {link.label.toUpperCase()}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4 flex-shrink-0 border-l border-gray-200 pl-4">
            <Link
              to="/outlets"
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#E31E24] transition-colors whitespace-nowrap"
            >
              <Store className="w-3.5 h-3.5" />
              Our outlets
            </Link>
            <Link
              to="/help"
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#E31E24] transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5" />
              Help line
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CategoryNavBar;
