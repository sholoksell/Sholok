import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Menu, X } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { useCategories } from '@/contexts/CategoryContext';
import CategoryIcon from '@/components/CategoryIcon';

const ShopByCategoryMenu = () => {
  const { categories, loading } = useCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setHoveredCategory(null);
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

  return (
    <div className="relative" ref={menuRef}>
      {/* Toggle Button */}
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 px-4 py-2 bg-[#E31E24] hover:bg-[#c41920] text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        <span className="font-semibold">SHOP BY CATEGORY</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden min-w-[600px]">
          <div className="flex">
            {/* Main Categories List - Left Panel */}
            <div className="w-72 bg-white border-r border-gray-200 max-h-[500px] overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category._id}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => !isMobile && setHoveredCategory(null)}
                  onClick={() => isMobile && setHoveredCategory(category)}
                  className="relative"
                >
                  <div
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 cursor-pointer ${
                      hoveredCategory?._id === category._id ? 'bg-green-50' : ''
                    }`}
                  >
                    {/* Category Icon/Image */}
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      {category.image ? (
                        <img
                          src={getImageUrl(category.image)}
                          alt={category.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <CategoryIcon icon={category.icon} image={category.image} name={category.name} className="w-7 h-7" />
                      )}
                    </div>

                    {/* Category Name */}
                    <div className="flex-1">
                      <span className="font-medium text-gray-800 text-base">
                        {category.name}
                      </span>
                    </div>

                    {/* Arrow Icon - Always show if has subcategories */}
                    {category.subcategories && category.subcategories.length > 0 && (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Subcategories Panel - Right Panel */}
            {hoveredCategory && hoveredCategory.subcategories && hoveredCategory.subcategories.length > 0 && (
              <div className="flex-1 bg-white p-0 max-h-[500px] overflow-y-auto min-w-[300px]">
                {hoveredCategory.subcategories.map((subcat, index) => (
                  <Link
                    key={subcat._id}
                    to={`/category/${subcat.slug}`}
                    onClick={closeMenu}
                    className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group ${
                      index !== hoveredCategory.subcategories.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    {/* Subcategory Name */}
                    <span className="text-base text-gray-700 group-hover:text-green-600 transition-colors">
                      {subcat.name}
                    </span>

                    {/* Arrow Icon */}
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-green-600 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopByCategoryMenu;
