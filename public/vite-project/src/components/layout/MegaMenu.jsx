import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { categoryService } from '@/services/categoryService';
import CategoryIcon from '@/components/CategoryIcon';

const MegaMenu = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showMegaMenu, setShowMegaMenu] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data || []);
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
      'food': '🍽️',
      'fruits': '🍎',
      'vegetables': '🥬',
      'meat': '🥩',
      'fish': '🐟',
      'dairy': '🥛',
      'beverages': '☕',
      'drinks': '🥤',
      'snacks': '🍪',
      'frozen': '🧊',
      'baby': '👶',
      'cleaning': '🧹',
      'pet': '🐾',
      'beauty': '💄',
      'health': '💊',
      'fashion': '👗',
      'home': '🏠',
      'kitchen': '🍳',
      'stationery': '📝',
      'toys': '🎮',
      'sports': '⚽',
      'gadget': '📱',
    };

    const key = Object.keys(iconMap).find(k => 
      category.name.toLowerCase().includes(k) || 
      category.slug.toLowerCase().includes(k)
    );

    return category.icon || iconMap[key] || '📦';
  };

  // Get top level categories (limit to 10 for display)
  const mainCategories = categories.slice(0, 10);

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
                <span>{category.name}</span>
                {category.children && category.children.length > 0 && (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </Link>

              {/* Mega Menu Dropdown */}
              {category.children && category.children.length > 0 && (
                <div
                  className={`absolute left-0 top-full w-screen max-w-screen-xl bg-white shadow-xl border border-border z-50 transition-all duration-200 ${
                    showMegaMenu && activeCategory?._id === category._id
                      ? 'opacity-100 visible'
                      : 'opacity-0 invisible'
                  }`}
                  onMouseEnter={() => handleMouseEnter(category)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="p-6">
                    <div className="grid grid-cols-4 gap-6">
                      {category.children.map((subcat) => (
                        <div key={subcat._id}>
                          <Link
                            to={`/category/${subcat.slug}`}
                            className="font-semibold text-foreground hover:text-primary flex items-center gap-2 mb-3 group/link"
                          >
                            {subcat.name}
                            <ChevronRight className="w-4 h-4 opacity-0 -ml-1 group-hover/link:opacity-100 group-hover/link:ml-0 transition-all" />
                          </Link>
                          {subcat.children && subcat.children.length > 0 && (
                            <ul className="space-y-2">
                              {subcat.children.slice(0, 6).map((childcat) => (
                                <li key={childcat._id}>
                                  <Link
                                    to={`/category/${childcat.slug}`}
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    {childcat.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
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
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:text-primary hover:bg-muted/50 transition-colors ml-auto"
            >
              <span>All Categories</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MegaMenu;
