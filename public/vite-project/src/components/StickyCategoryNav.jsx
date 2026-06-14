import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';

const StickyCategoryNav = ({ categories }) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categoryIcons = {
    'grocery': '🛒',
    'fruits': '🍎',
    'vegetables': '🥬',
    'meat': '🥩',
    'dairy': '🥛',
    'snacks': '🍿',
    'beverages': '🥤',
    'bakery': '🍞',
    'frozen': '❄️',
    'personal-care': '🧴',
    'household': '🧹',
    'baby': '👶',
  };

  const displayCategories = categories?.slice(0, 10) || [
    { id: 1, name: 'Grocery & Staples', slug: 'grocery', icon: '🛒' },
    { id: 2, name: 'Fresh Fruits', slug: 'fruits', icon: '🍎' },
    { id: 3, name: 'Fresh Vegetables', slug: 'vegetables', icon: '🥬' },
    { id: 4, name: 'Meat & Fish', slug: 'meat', icon: '🥩' },
    { id: 5, name: 'Dairy & Eggs', slug: 'dairy', icon: '🥛' },
    { id: 6, name: 'Snacks', slug: 'snacks', icon: '🍿' },
    { id: 7, name: 'Beverages', slug: 'beverages', icon: '🥤' },
    { id: 8, name: 'Bakery', slug: 'bakery', icon: '🍞' },
  ];

  return (
    <div
      className={`bg-white border-b transition-all duration-300 ${
        isSticky
          ? 'fixed top-0 left-0 right-0 z-40 shadow-lg animate-slide-down'
          : 'relative'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-3">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="flex flex-col items-center gap-1 min-w-[80px] group"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#E31E24]/10 transition-colors shadow-sm">
                <CategoryIcon icon={category.icon || categoryIcons[category.slug]} image={category.image} name={category.name} className="w-7 h-7" />
              </div>
              <span className="text-xs text-center text-gray-700 group-hover:text-[#E31E24] font-medium transition-colors line-clamp-2">
                {category.name}
              </span>
            </Link>
          ))}
          <Link
            to="/categories"
            className="flex flex-col items-center gap-1 min-w-[80px] group"
          >
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#E31E24]/10 transition-colors shadow-sm">
              <ChevronRight className="h-6 w-6 text-gray-600 group-hover:text-[#E31E24]" />
            </div>
            <span className="text-xs text-center text-gray-700 group-hover:text-[#E31E24] font-medium transition-colors">
              View All
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StickyCategoryNav;
