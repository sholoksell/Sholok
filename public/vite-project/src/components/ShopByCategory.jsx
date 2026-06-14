import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { useCategories } from '@/contexts/CategoryContext';
import { useCategoryProducts } from '@/hooks/useCategoryProducts';
import CategoryCard, { CategoryCardGrid } from './CategoryCard';
import CategoryIcon from '@/components/CategoryIcon';

// Subcategory Card with Product Image (Optimized)
const SubcategoryCard = ({ subcat, productData }) => {
  const [imageError, setImageError] = useState(false);
  
  const productImage = productData?.image;
  const productCount = productData?.count || 0;
  const hasSubcategories = subcat.subcategories && subcat.subcategories.length > 0;
  
  // Use product image if available, otherwise category image
  const displayImage = productImage || subcat.image;

  return (
    <Link
      to={`/category/${subcat.slug}`}
      className="group bg-white rounded-xl p-3 md:p-4 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#E31E24] flex flex-col items-center text-center relative overflow-hidden"
    >
      {/* Hover Effect Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 w-full">
        {/* Product/Category Image or Icon */}
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {!imageError && displayImage ? (
            <img
              src={getImageUrl(displayImage)}
              alt={subcat.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <CategoryIcon icon={subcat.icon} image={subcat.image} name={subcat.name} className="w-8 h-8 md:w-10 md:h-10" fallbackEmoji="🏷️" asText />
          )}
        </div>

        {/* Name */}
        <h4 className="text-xs md:text-sm font-semibold text-gray-900 group-hover:text-[#E31E24] transition-colors line-clamp-2 mb-2">
          {subcat.name}
        </h4>

        {/* Product Count or Child Category Count with Status Indicators */}
        {productCount > 0 ? (
          <div className="text-xs text-white bg-gradient-to-r from-emerald-500 to-emerald-600 px-2.5 py-1 rounded-full inline-flex items-center gap-1 font-medium shadow-sm">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            {productCount} {productCount === 1 ? 'item' : 'items'}
          </div>
        ) : hasSubcategories ? (
          <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <span>{subcat.subcategories.length} types</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        ) : productData === undefined ? (
          <div className="text-xs text-blue-500 font-medium">Loading...</div>
        ) : (
          <div className="text-xs text-amber-600 font-medium">Coming soon</div>
        )}
      </div>
    </Link>
  );
};

const ShopByCategory = () => {
  const { categories, loading: categoriesLoading } = useCategories();
  const { categoryProducts, loading: productsLoading } = useCategoryProducts(categories);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const loading = categoriesLoading;

  if (loading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="h-32 bg-gray-300 rounded mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              🛍️ Shop by Category
            </h2>
            <p className="text-gray-600">
              Browse our wide range of products organized by categories
            </p>
          </div>
        </div>

        {/* Categories Grid with Expandable Sections */}
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category._id} className="category-section">
              {/* Main Category Header */}
              <div className="mb-6 flex items-center justify-between">
                <Link
                  to={`/category/${category.slug}`}
                  className="group inline-flex items-center gap-3 hover:text-[#E31E24] transition-colors"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    {category.image ? (
                      <img
                        src={getImageUrl(category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CategoryIcon icon={category.icon} image={category.image} name={category.name} className="w-10 h-10 md:w-12 md:h-12" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-[#E31E24] transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-1 hidden md:block">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-6 h-6 ml-2 text-gray-400 group-hover:text-[#E31E24] group-hover:translate-x-1 transition-all" />
                </Link>

                {/* Subcategory Count Badge */}
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="bg-[#E31E24] text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {category.subcategories.length} {category.subcategories.length === 1 ? 'item' : 'items'}
                  </div>
                )}
              </div>

              {/* Subcategories Grid */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                  {category.subcategories
                    .slice(0, expandedCategory === category._id ? undefined : 12)
                    .map((subcat) => (
                      <SubcategoryCard 
                        key={subcat._id} 
                        subcat={subcat}
                        productData={categoryProducts[subcat.slug]}
                      />
                    ))}
                </div>
              )}

              {/* View More Button */}
              {category.subcategories && category.subcategories.length > 12 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() =>
                      setExpandedCategory(
                        expandedCategory === category._id ? null : category._id
                      )
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#E31E24] text-[#E31E24] font-semibold rounded-lg hover:bg-[#E31E24] hover:text-white transition-all shadow-sm hover:shadow-md"
                  >
                    {expandedCategory === category._id ? (
                      <>
                        <span>Show Less</span>
                        <ChevronUp className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        <span>
                          View All {category.subcategories.length} Subcategories
                        </span>
                        <ChevronDown className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Browse All Categories Link */}
        <div className="mt-12 text-center">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#E31E24] to-[#c41920] text-white font-bold rounded-lg hover:from-[#c41920] hover:to-[#a01519] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span>Browse All Categories</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopByCategory;
