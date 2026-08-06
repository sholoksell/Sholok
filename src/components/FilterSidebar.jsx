import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';

const FilterSidebar = ({ filters, onFilterChange, onClearFilters }) => {
  const { language, t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
    discount: false,
    brand: false,
  });

  const [priceRange, setPriceRange] = useState([0, 10000]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
    if (onFilterChange) {
      onFilterChange('price', { min: value[0], max: value[1] });
    }
  };

  const handleCategoryChange = (categoryId) => {
    if (onFilterChange) {
      onFilterChange('category', categoryId);
    }
  };

  const handleRatingChange = (rating) => {
    if (onFilterChange) {
      onFilterChange('rating', rating);
    }
  };

  const handleDiscountChange = (discount) => {
    if (onFilterChange) {
      onFilterChange('discount', discount);
    }
  };

  const categories = [
    { id: 'grocery', name: 'Grocery & Staples', nameBn: 'মুদিখানা ও দানাদার', count: 234 },
    { id: 'fruits', name: 'Fresh Fruits', nameBn: 'তাজা ফল', count: 156 },
    { id: 'vegetables', name: 'Fresh Vegetables', nameBn: 'তাজা শাকসবজি', count: 198 },
    { id: 'meat', name: 'Meat & Fish', nameBn: 'মাংস ও মাছ', count: 87 },
    { id: 'dairy', name: 'Dairy & Eggs', nameBn: 'দুগ্ধজাত ও ডিম', count: 112 },
    { id: 'snacks', name: 'Snacks & Beverages', nameBn: 'স্ন্যাকস ও পানীয়', count: 289 },
  ];

  const discounts = [
    { id: '10', labelKey: 'discount10', value: 10 },
    { id: '20', labelKey: 'discount20', value: 20 },
    { id: '30', labelKey: 'discount30', value: 30 },
    { id: '50', labelKey: 'discount50', value: 50 },
  ];

  const brands = [
    { id: 'pran', name: 'PRAN', count: 45 },
    { id: 'arong', name: 'Arong', count: 32 },
    { id: 'fresh', name: 'Fresh', count: 28 },
    { id: 'meena', name: 'Meena', count: 22 },
    { id: 'radhuni', name: 'Radhuni', count: 38 },
  ];

  const FilterSection = ({ title, section, children }) => (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full text-left font-semibold text-gray-900 hover:text-[#E31E24] transition-colors"
      >
        <span>{title}</span>
        {expandedSections[section] ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {expandedSections[section] && <div className="mt-3">{children}</div>}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <h3 className="text-lg font-bold text-gray-900">{t('filters')}</h3>
        {onClearFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-[#E31E24] hover:text-[#b9151a] hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            {t('clearAll')}
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <FilterSection title={t('categories')} section="category">
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#E31E24] focus:ring-[#E31E24]"
                  onChange={() => handleCategoryChange(category.id)}
                />
                <span className="text-sm text-gray-700">
                  {language === 'bn' && category.nameBn ? category.nameBn : category.name}
                </span>
              </div>
              <span className="text-xs text-gray-400">({category.count})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range Filter */}
      <FilterSection title={t('priceRange')} section="price">
        <div className="space-y-4">
          <Slider
            defaultValue={[0, 10000]}
            max={10000}
            step={100}
            value={priceRange}
            onValueChange={handlePriceChange}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">৳{priceRange[0]}</span>
            <span className="text-gray-400">{t('or')}</span>
            <span className="font-semibold">৳{priceRange[1]}</span>
          </div>
        </div>
      </FilterSection>

      {/* Rating Filter */}
      <FilterSection title={t('customerRatings')} section="rating">
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className="flex items-center gap-2 w-full hover:bg-gray-50 p-2 rounded transition-colors"
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">{t('andAbove')}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Discount Filter */}
      <FilterSection title={t('discount')} section="discount">
        <div className="space-y-2">
          {discounts.map((d) => (
            <label
              key={d.id}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            >
              <input
                type="radio"
                name="discount"
                className="text-[#E31E24] focus:ring-[#E31E24]"
                onChange={() => handleDiscountChange(d.value)}
              />
              <span className="text-sm text-gray-700">{t(d.labelKey)}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Brand Filter */}
      <FilterSection title={t('brands')} section="brand">
        <div className="space-y-2">
          {brands.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#E31E24] focus:ring-[#E31E24]"
                />
                <span className="text-sm text-gray-700">{brand.name}</span>
              </div>
              <span className="text-xs text-gray-400">({brand.count})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Apply Button */}
      <div className="mt-6">
        <Button className="w-full bg-[#E31E24] hover:bg-[#b9151a] text-white font-semibold">
          {t('applyFilters')}
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;
