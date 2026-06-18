import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * CategoryCard Component
 * Displays a single category with icon, name, and item count
 * Used in Shop By Category page
 */
const CategoryCard = ({
  category,
  showSubcategories = false,
  size = 'default',
  className = ''
}) => {
  const { t, getLocalizedField } = useLanguage();
  const { icon, slug, subcategories = [] } = category;
  const name = getLocalizedField(category, 'name') || category.name;

  const sizeClasses = {
    small: 'p-3',
    default: 'p-4 md:p-6',
    large: 'p-6 md:p-8'
  };

  const iconSizes = {
    small: 'text-3xl',
    default: 'text-4xl md:text-5xl',
    large: 'text-5xl md:text-6xl'
  };

  const subcategoryCount = subcategories?.length || 0;

  return (
    <Link 
      to={`/category/${slug}`}
      className={`group block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#E31E24] overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Icon */}
        <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 rounded-full group-hover:scale-110 transition-transform duration-300">
          <span className={iconSizes[size]}>{icon || '📦'}</span>
        </div>

        {/* Category Name */}
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-800 text-base md:text-lg group-hover:text-[#E31E24] transition-colors line-clamp-2">
            {name}
          </h3>
          
          {/* Subcategory Count */}
          {subcategoryCount > 0 && (
            <p className="text-xs md:text-sm text-gray-500">
              {subcategoryCount} {t('items')}
            </p>
          )}
        </div>

        {/* View All Link */}
        <div className="flex items-center gap-1 text-[#E31E24] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>{t('viewAll')}</span>
          <ChevronRight className="w-4 h-4" />
        </div>

        {/* Subcategories List (Optional) */}
        {showSubcategories && subcategories && subcategories.length > 0 && (
          <div className="w-full pt-3 border-t border-gray-100 mt-3">
            <div className="text-xs text-gray-600 space-y-1">
              {subcategories.slice(0, 3).map((sub, idx) => (
                <div key={idx} className="truncate">• {getLocalizedField(sub, 'name') || sub.name}</div>
              ))}
              {subcategories.length > 3 && (
                <div className="text-[#E31E24] font-medium">
                  +{subcategories.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

/**
 * CategoryCardGrid Component
 * Grid layout for displaying multiple CategoryCards
 */
export const CategoryCardGrid = ({ 
  categories = [], 
  columns = 4,
  showSubcategories = false,
  size = 'default',
  loading = false 
}) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
  };

  if (loading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-4 md:gap-6`}>
        {[...Array(columns * 2)].map((_, idx) => (
          <div 
            key={idx} 
            className="bg-gray-100 rounded-xl h-48 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Categories Found
        </h3>
        <p className="text-gray-500">
          Categories will appear here once they are added
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4 md:gap-6`}>
      {categories.map((category) => (
        <CategoryCard
          key={category._id || category.id || category.slug}
          category={category}
          showSubcategories={showSubcategories}
          size={size}
        />
      ))}
    </div>
  );
};

export default CategoryCard;
