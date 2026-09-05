import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { categoryService } from '@/services/categoryService';
import CategoryIcon from '@/components/CategoryIcon';
import { useLanguage } from '@/contexts/LanguageContext';

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

const MegaMenu = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const { language } = useLanguage();

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

  return (
    <nav className="bg-white border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1">
          <Link to="/flash-sales" className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors">
            ⚡ Flash Sales
          </Link>
          <Link to="/discover" className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors">
            ✨ Discover
          </Link>
          <Link to="/offers" className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium hover:text-primary hover:bg-muted/50 transition-colors">
            🏷️ Offers
          </Link>
          <Link to="/bundles" className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors">
            🎁 Bundles
          </Link>
          <Link to="/summer-fest" className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors whitespace-nowrap">
            ☀️ Summer Fest
          </Link>
          <Link to="/deals" className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap">
            🔥 Great Deals
          </Link>
          <Link to="/buy-save" className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors whitespace-nowrap">
            💰 Buy &amp; Save More
          </Link>
          <Link to="/brands" className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
            🏪 Our Brands
          </Link>
          <Link to="/vendor/apply" className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors whitespace-nowrap">
            🏪 Become a Seller
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default MegaMenu;
