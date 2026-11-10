import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown, Menu, X } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { useCategories } from '@/contexts/CategoryContext';
import { useLanguage } from '@/contexts/LanguageContext';
import CategoryIcon from '@/components/CategoryIcon';

const ShopByCategoryMenu = () => {
  const { categories, loading } = useCategories();
  const { language } = useLanguage();
  const { pathname } = useLocation();
  const isHomePage = pathname === '/';
  const getCatName = (cat) => language === 'bn' && cat.nameBn ? cat.nameBn : cat.name;

  const [isOpen, setIsOpen] = useState(false);
  const [hoveredL1, setHoveredL1] = useState(null);
  const [hoveredL2, setHoveredL2] = useState(null);
  const menuRef = useRef(null);
  // Track when mouse is inside the dropdown panel
  const closeTimer = useRef(null);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => {
      setIsOpen(false);
      setHoveredL1(null);
      setHoveredL2(null);
    }, 120);
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const closeMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsOpen(false);
    setHoveredL1(null);
    setHoveredL2(null);
  };

  if (loading) {
    return (
      <div className="relative">
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg animate-pulse">
          <Menu className="w-5 h-5" />
          <span className="font-semibold">Loading...</span>
        </button>
      </div>
    );
  }

  const visibleL1 = categories.filter(c => !isHomePage || c.slug !== 'grocery');
  const activeL1 = hoveredL1 ? categories.find(c => (c._id || c.id) === hoveredL1) : null;
  const activeL2 = hoveredL2 && activeL1 ? (activeL1.subcategories || []).find(s => (s._id || s.id) === hoveredL2) : null;

  const hasL2 = activeL1 && activeL1.subcategories && activeL1.subcategories.length > 0;
  const hasL3 = activeL2 && activeL2.subcategories && activeL2.subcategories.length > 0;

  return (
    <div
      className="relative"
      ref={menuRef}
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        onMouseEnter={openMenu}
        className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors border border-white/30"
      >
        <Menu className="w-5 h-5" />
        <span className="font-semibold text-sm">All Categories</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 3-Column Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex overflow-hidden"
          style={{ minWidth: 224 }}
        >
          {/* Column 1: L1 Main Categories */}
          <div className="w-56 bg-white border-r border-gray-100 max-h-[520px] overflow-y-auto flex-shrink-0">
            {visibleL1.map((cat) => {
              const catId = cat._id || cat.id;
              const isActive = hoveredL1 === catId;
              return (
                <div
                  key={catId}
                  onMouseEnter={() => { setHoveredL1(catId); setHoveredL2(null); }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer border-b border-gray-50 transition-colors ${
                    isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-primary-soft hover:text-primary'
                  }`}
                >
                  <span className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {cat.image ? (
                      <img src={getImageUrl(cat.image)} alt={cat.name} className="w-5 h-5 object-contain" />
                    ) : (
                      <CategoryIcon icon={cat.icon} image={cat.image} name={cat.name} className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                    )}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">{getCatName(cat)}</span>
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Column 2: L2 Subcategories (shown when L1 is hovered) */}
          {hasL2 && (
            <div className="w-56 bg-gray-50 border-r border-gray-100 max-h-[520px] overflow-y-auto flex-shrink-0">
              {/* L1 header link */}
              <Link
                to={`/category/${activeL1.slug}`}
                onClick={closeMenu}
                className="block px-3 py-2 text-xs font-bold text-primary uppercase tracking-wide border-b border-gray-200 hover:bg-primary-soft transition-colors"
              >
                All {getCatName(activeL1)}
              </Link>
              {activeL1.subcategories.map((sub) => {
                const subId = sub._id || sub.id;
                const isActive = hoveredL2 === subId;
                return (
                  <div
                    key={subId}
                    onMouseEnter={() => setHoveredL2(subId)}
                    className={`flex items-center justify-between px-3 py-2.5 cursor-pointer border-b border-gray-100 transition-colors ${
                      isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-primary-soft hover:text-primary'
                    }`}
                  >
                    <Link
                      to={`/category/${sub.slug}`}
                      onClick={closeMenu}
                      className="flex-1 text-sm font-medium truncate"
                    >
                      {getCatName(sub)}
                    </Link>
                    {sub.subcategories && sub.subcategories.length > 0 && (
                      <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ml-1 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Column 3: L3 Sub-subcategories (shown when L2 is hovered) */}
          {hasL3 && (
            <div className="w-56 bg-white max-h-[520px] overflow-y-auto flex-shrink-0">
              {/* L2 header link */}
              <Link
                to={`/category/${activeL2.slug}`}
                onClick={closeMenu}
                className="block px-3 py-2 text-xs font-bold text-primary uppercase tracking-wide border-b border-gray-200 hover:bg-primary-soft transition-colors"
              >
                All {getCatName(activeL2)}
              </Link>
              {activeL2.subcategories.map((third) => {
                const thirdId = third._id || third.id;
                return (
                  <Link
                    key={thirdId}
                    to={`/category/${third.slug}`}
                    onClick={closeMenu}
                    className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 border-b border-gray-50 hover:bg-primary-soft hover:text-primary transition-colors"
                  >
                    <span className="truncate">{getCatName(third)}</span>
                    {third.subcategories && third.subcategories.length > 0 && (
                      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 ml-1 text-gray-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopByCategoryMenu;
