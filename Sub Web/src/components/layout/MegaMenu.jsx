import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { categoryService } from '@/services/categoryService';
import CategoryIcon from '@/components/CategoryIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/axios';
import ShopByCategoryMenu from '@/components/ShopByCategoryMenu';

// Recursive renderer for depth 3+ (L4, L5, ...)
const RecursiveSubItems = ({ items, depth, getCatName }) => (
  <ul className={depth === 0 ? 'space-y-2 mt-2' : 'ml-3 mt-1 space-y-1 border-l border-border pl-2'}>
    {items.map((item) => (
      <li key={item._id}>
        <Link
          to={`/category/${item.slug}`}
          className={`block transition-colors hover:text-primary ${
            depth === 0
              ? 'text-sm text-muted-foreground'
              : 'text-xs text-muted-foreground/80'
          }`}
        >
          {getCatName(item)}
        </Link>
        {item.subcategories?.length > 0 && (
          <RecursiveSubItems
            items={item.subcategories}
            depth={depth + 1}
            getCatName={getCatName}
          />
        )}
      </li>
    ))}
  </ul>
);

// feature_key → route (fallback if DB has no link)
const FEATURE_ROUTES = {
  flash_sales: '/flash-sales', discover: '/discover', offers: '/offers',
  bundles: '/bundles', summer_fest: '/summer-fest', great_deals: '/deals',
  buy_save: '/buy-save', our_brands: '/brands',
};

const MegaMenu = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [features, setFeatures] = useState([]);
  const { language } = useLanguage();

  useEffect(() => {
    api.get('/megamenu-features/public')
      .then(r => setFeatures(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  const getCatName = (cat) => language === 'bn' && cat.nameBn ? cat.nameBn : cat.name;

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getPublicAll();
      const normalize = (nodes) => (nodes || []).map((n) => ({
        ...n, subcategories: normalize(n.children || n.subcategories || []),
      }));
      setCategories(normalize(data) || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleMouseEnter = (category) => {
    setActiveCategory(category);
    setShowMegaMenu(true);
  };

  const handleMouseLeave = () => {
    setShowMegaMenu(false);
    setActiveCategory(null);
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'food': '🍽️', 'fruits': '🍎', 'vegetables': '🥬', 'meat': '🥩',
      'fish': '🐟', 'dairy': '🥛', 'beverages': '☕', 'drinks': '🥤',
      'snacks': '🍪', 'frozen': '🧊', 'baby': '👶', 'cleaning': '🧹',
      'pet': '🐾', 'beauty': '💄', 'health': '💊', 'fashion': '👗',
      'home': '🏠', 'kitchen': '🍳', 'stationery': '📝', 'toys': '🎮',
      'sports': '⚽', 'gadget': '📱',
    };
    const key = Object.keys(iconMap).find(
      (k) => category.name.toLowerCase().includes(k) || category.slug.toLowerCase().includes(k)
    );
    return category.icon || iconMap[key] || '📦';
  };

  const mainCategories = categories.filter((c) => !c.parentId && c.slug !== 'grocery').slice(0, 10);

  // Build a map of feature_key → feature for quick lookup
  const featureMap = Object.fromEntries(features.map(f => [f.feature_key, f]));

  // Render a feature link with optional icon_image (Place 1)
  const FeatureLink = ({ featureKey, defaultEmoji, defaultLabel, defaultTo, className }) => {
    const f = featureMap[featureKey];
    const to = f?.link || defaultTo;
    const label = f?.name || defaultLabel;
    const emoji = f?.emoji || defaultEmoji;
    return (
      <Link to={to} className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium hover:bg-muted/50 transition-colors whitespace-nowrap ${className}`}>
        {f?.icon_image ? (
          <img src={f.icon_image} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" onError={e => { e.target.style.display='none'; }} />
        ) : (
          <span>{emoji}</span>
        )}
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-primary">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-0">
          <div className="flex-shrink-0 py-2 pr-3 border-r border-white/20 mr-2 relative z-50">
            <ShopByCategoryMenu />
          </div>
          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide flex-1">
            <Link to="/" className="px-4 py-3 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">Home</Link>
            <Link to="/categories" className="px-4 py-3 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">Shop</Link>
            <Link to="/flash-sales" className="px-4 py-3 text-sm font-semibold text-yellow-300 hover:text-yellow-200 hover:bg-white/10 transition-colors whitespace-nowrap">Flash Sale</Link>
            <Link to="/category/trending" className="px-4 py-3 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">Trending</Link>
            <Link to="/category/new-arrivals" className="px-4 py-3 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">New Arrivals</Link>
            <Link to="/offers" className="px-4 py-3 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">Offers</Link>
          </div>
          <div className="flex-shrink-0 py-2 pl-3 border-l border-white/20">
            <Link to="/vendor/apply" className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white border border-white/40 rounded-full hover:bg-white hover:text-primary transition-colors whitespace-nowrap">
              🛍 Become a Seller
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MegaMenu;
