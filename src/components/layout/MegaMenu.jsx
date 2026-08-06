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

  const mainCategories = categories.filter((c) => !c.parentId).slice(0, 10);

  return (
    <nav className="bg-white border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1">
          {mainCategories.map((category) => (
            <div
              key={category._id}
              className="relative group"
              onMouseEnter={() => handleMouseEnter(category)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to={`/category/${category.slug}`}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:text-primary hover:bg-muted/50 transition-colors"
              >
                <span className="inline-flex w-4 h-4 items-center justify-center">
                  <CategoryIcon
                    icon={category.icon || getCategoryIcon(category)}
                    name={category.name}
                    className="w-4 h-4"
                    asText
                  />
                </span>
                <span>{getCatName(category)}</span>
                {category.subcategories && category.subcategories.length > 0 && (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </Link>

              {/* Mega Menu Dropdown */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div
                  className={`absolute left-0 top-full w-screen max-w-screen-xl bg-white shadow-xl border border-border z-50 transition-all duration-200 ${
                    showMegaMenu && activeCategory?._id === category._id
                      ? 'opacity-100 visible'
                      : 'opacity-0 invisible'
                  }`}
                  onMouseEnter={() => handleMouseEnter(category)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-4 gap-6">
                      {category.subcategories.map((subcat) => (
                        <div key={subcat._id}>
                          {/* L2 column header */}
                          <Link
                            to={`/category/${subcat.slug}`}
                            className="font-semibold text-foreground hover:text-primary flex items-center gap-2 mb-2 group/link"
                          >
                            {getCatName(subcat)}
                            <ChevronRight className="w-4 h-4 opacity-0 -ml-1 group-hover/link:opacity-100 group-hover/link:ml-0 transition-all" />
                          </Link>

                          {/* L3+ recursive items — no depth limit, no slice */}
                          {subcat.subcategories?.length > 0 && (
                            <RecursiveSubItems
                              items={subcat.subcategories}
                              depth={0}
                              getCatName={getCatName}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {categories.length > 10 && (
            <Link
              to="/categories"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:text-primary hover:bg-muted/50 transition-colors"
            >
              <span>All Categories</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}

          <div className="ml-auto flex items-center">
            <Link to="/live" className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              Live
            </Link>
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MegaMenu;
