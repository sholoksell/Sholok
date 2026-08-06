import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, Truck, Shield, CreditCard, Sparkles } from 'lucide-react';
import OfferSlider from '@/components/OfferSlider';
import ProductCard from '@/components/ProductCard';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories } from '@/contexts/CategoryContext';
import { productService } from '@/services/productService';
import { bannerService } from '@/services/commonService';
import { homeSectionService } from '@/services/homeSectionService';
import CategoryIcon from '@/components/CategoryIcon';
import { formatPrice } from '@/lib/utils';

const HomePage = () => {
  const { t, getLocalizedField, language } = useLanguage();
  const { categories, loading: categoriesLoading } = useCategories();
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [hoveredThirdLevel, setHoveredThirdLevel] = useState(null);
  const [hoveredFourthLevel, setHoveredFourthLevel] = useState(null);
  const [activeTab, setActiveTab] = useState('fresh-vegetables');
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Per-section product states — each loaded from backend with correct category filter
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [breadProducts, setBreadProducts] = useState([]);
  const [cleaningProducts, setCleaningProducts] = useState([]);
  const [cookingProducts, setCookingProducts] = useState([]);
  const [babyProducts, setBabyProducts] = useState([]);
  const [vegetableProducts, setVegetableProducts] = useState([]);
  const [eggsCerealsProducts, setEggsCerealsProducts] = useState([]);
  const [frozenSnacksProducts, setFrozenSnacksProducts] = useState([]);
  const [diabeticProducts, setDiabeticProducts] = useState([]);
  const [snacksProducts, setSnacksProducts] = useState([]);
  const [beverageProducts, setBeverageProducts] = useState([]);
  const [frozenProducts, setFrozenProducts] = useState([]);
  const [gadgetProducts, setGadgetProducts] = useState([]);

  // Admin-managed home sections, keyed by `key` for fast lookup
  const [homeSections, setHomeSections] = useState({});

  // Countdown Timer Effect
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const difference = endOfDay - now;

      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return { hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch each section in parallel from the backend.
        // Each category call uses the backend's recursive CTE — products in any
        // sub-category of the given slug are included automatically.
        const results = await Promise.allSettled([
          bannerService.getAll({ active: true }),                          // 0
          productService.getFeatured(),                                    // 1
          productService.getBestSellers(),                                 // 2
          homeSectionService.getAll(),                                     // 3
          productService.getByCategory('grocery-breakfast', 20),          // 4  bread & more
          productService.getByCategory('cleaning-supplies', 20),          // 5  cleaning
          productService.getByCategory('grocery-cooking', 20),            // 6  cooking
          productService.getByCategory('baby-care', 20),                  // 7  baby
          productService.getByCategory('grocery-fruits-vegetables', 20),  // 8  vegetables
          productService.getByCategory('grocery-dairy-eggs', 20),         // 9  eggs & cereals
          productService.getByCategory('grocery-frozen-canned', 20),      // 10 frozen snacks
          productService.getByCategory('grocery-diabetic-food', 20),      // 11 diabetic
          productService.getByCategory('grocery-snacks', 20),             // 12 snacks
          productService.getByCategory('grocery-beverages', 20),          // 13 beverages
          productService.getByCategory('grocery-frozen-canned', 20),      // 14 frozen foods
          productService.getByCategory('home-kitchen', 20),               // 15 gadgets/home
        ]);

        const ok = (i) => results[i].status === 'fulfilled' ? results[i].value : null;

        const bannersRes   = ok(0);
        const featuredRes  = ok(1);
        const bestSellersRes = ok(2);
        const sectionsRes  = ok(3);

        // Build a key -> section map for quick lookup in render
        const sectionMap = {};
        (sectionsRes || []).forEach((s) => { if (s?.key) sectionMap[s.key] = s; });
        setHomeSections(sectionMap);

        setBanners(bannersRes?.data || bannersRes?.banners || []);

        const featured = featuredRes?.products || [];
        setFeaturedProducts(featured);

        // Recommended: featured products, else newest 12
        const allFeatured = ok(1)?.products || [];
        setRecommendedProducts(allFeatured.length > 0 ? allFeatured.slice(0, 12) : []);

        // Trending: best-sellers, fallback to featured
        const bestSellers = bestSellersRes?.products || [];
        setTrendingProducts(bestSellers.length > 0 ? bestSellers.slice(0, 12) : allFeatured.slice(0, 12));

        // Per-section category products from backend
        const getProducts = (i) => ok(i)?.products || [];
        setBreadProducts(getProducts(4));
        setCleaningProducts(getProducts(5));
        setCookingProducts(getProducts(6));
        setBabyProducts(getProducts(7));
        setVegetableProducts(getProducts(8));
        setEggsCerealsProducts(getProducts(9));
        setFrozenSnacksProducts(getProducts(10));
        setDiabeticProducts(getProducts(11));
        setSnacksProducts(getProducts(12));
        setBeverageProducts(getProducts(13));
        setFrozenProducts(getProducts(14));
        setGadgetProducts(getProducts(15));

      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayCategories = categories.length > 0 ? categories : [];

  // Returns the admin-managed products list for a section key when present
  // (and active with at least one item); otherwise returns the supplied
  // category-based fallback so the storefront keeps working even before any
  // admin data is uploaded.
  // - When the admin explicitly marks the section as inactive, returns []
  //   so the section is fully hidden (built-in blocks rendered with
  //   `.length > 0 &&` guards disappear automatically).
  const sectionProducts = (key, fallback = []) => {
    const s = homeSections[key];
    if (s && s.isActive === false) return [];
    if (s && Array.isArray(s.products) && s.products.length > 0) {
      return s.products;
    }
    return fallback;
  };

  // Returns the admin-managed order for a section key. Used as CSS flex
  // `order` value so dragging in the admin instantly changes section
  // position on the storefront. Higher number = lower on the page.
  const getSectionOrder = (key, fallback) => {
    const s = homeSections[key];
    return typeof s?.order === 'number' && s.order > 0 ? s.order : fallback;
  };

  // Returns bilingual section title: admin's titleBn/title if set, else t() fallback.
  const getSectionTitle = (key, fallbackEn, fallbackBn) => {
    const s = homeSections[key];
    if (language === 'bn') return s?.titleBn || fallbackBn;
    return s?.title || fallbackEn;
  };

  // admin-created section whose key is NOT in this list will render in
  // the generic "Custom Sections" block at the end of the home page in the
  // order set by the admin.
  const BUILT_IN_KEYS = new Set([
    'festival-banner', 'quick-category-buttons',
    'recommended-for-you', 'trending-products', 'bread-and-more',
    'unilever-week', 'unilever-mega-sale', 'weekday-deals',
    'cleaning-essentials', 'snacks-sweets', 'todays-featured-finds',
    'spice-up-cooking', 'happy-hour', 'fresh-vegetables-fruits',
    'beverages', 'frozen-foods', 'gadgets-electronics',
  ]);
  const customSections = Object.values(homeSections)
    .filter((s) => s && s.isActive !== false && !BUILT_IN_KEYS.has(s.key)
      && Array.isArray(s.products) && s.products.length > 0)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar + Hero Section Container */}
      <div className="relative">
        <div className="container mx-auto px-0 lg:px-4">
          <div className="flex">

            {/* Level 1: Main Sidebar (Always Visible on Desktop/Tablet) */}
            <div className="hidden md:block w-60 bg-white shadow-2xl z-40 relative min-h-[400px] border-r border-gray-100">
              <div className="bg-[#E31E24] text-white px-4 py-3 font-bold text-sm uppercase flex items-center gap-2">
                <span>☰</span> {t('shopByCategory')}
              </div>
              <div className="py-2 bg-white min-h-[350px]">
                {displayCategories.length === 0 && (
                  <div className="py-2">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 animate-pulse">
                        <div className="w-5 h-5 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded flex-1"></div>
                      </div>
                    ))}
                  </div>
                )}
                {displayCategories.map((cat, index) => (
                  <div
                    key={cat._id || cat.id}
                    className="group relative"
                    onMouseEnter={() => {
                      setHoveredCategory(cat._id || cat.id);
                      setHoveredSubcategory(null);
                    }}
                    onMouseLeave={() => {
                      setHoveredCategory(null);
                      setHoveredSubcategory(null);
                    }}
                  >
                    <div
                      className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer border-b border-gray-100 transition-colors ${
                        hoveredCategory === (cat._id || cat.id)
                          ? 'bg-[#E31E24] text-white'
                          : 'text-gray-700 hover:bg-gray-100/50 hover:text-[#E31E24]'
                      }`}
                    >
                      <div className="flex items-center gap-3 pointer-events-none">
                        <span className="w-5 h-5 flex items-center justify-center opacity-70">
                          <CategoryIcon icon={cat.icon} image={cat.image} name={cat.name} className="w-5 h-5" />
                        </span>
                        <span className="font-medium">{getLocalizedField(cat, 'name')}</span>
                      </div>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <ChevronRight className={`h-4 w-4 flex-shrink-0 ${hoveredCategory === (cat._id || cat.id) ? 'text-white' : 'text-gray-400'}`} />
                      )}
                    </div>

                    {/* Level 2: Subcategory Flyout - Only show when hovering THIS specific category */}
                    {hoveredCategory === (cat._id || cat.id) && cat.subcategories && cat.subcategories.length > 0 && (
                      <div
                        className="absolute top-0 left-full w-64 bg-white shadow-2xl border border-gray-200 z-[100]"
                        style={{ minHeight: '400px' }}
                        onMouseEnter={() => setHoveredCategory(cat._id || cat.id)}
                        onMouseLeave={() => {
                          setHoveredCategory(null);
                          setHoveredSubcategory(null);
                        }}
                      >
                        <div className="py-2 bg-white">
                          {cat.subcategories.map((subcat, subIndex) => (
                            <div
                              key={subcat._id || subcat.id}
                              className="relative"
                              onMouseEnter={() => setHoveredSubcategory(subcat._id || subcat.id)}
                              onMouseLeave={() => setHoveredSubcategory(null)}
                            >
                              <Link
                                to={`/category/${subcat.slug}`}
                                className={`flex items-center justify-between px-4 py-2.5 text-sm border-b border-gray-100 transition-colors ${
                                  hoveredSubcategory === (subcat._id || subcat.id) && subcat.subcategories && subcat.subcategories.length > 0
                                    ? 'bg-[#E31E24] text-white'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#E31E24]'
                                }`}
                              >
                                <span>{getLocalizedField(subcat, 'name')}</span>
                                {subcat.subcategories && subcat.subcategories.length > 0 && (
                                  <ChevronRight className={`h-4 w-4 ${hoveredSubcategory === (subcat._id || subcat.id) ? 'text-white' : 'text-gray-400'}`} />
                                )}
                              </Link>

                              {/* Level 3: Third Level Flyout */}
                              {hoveredSubcategory === (subcat._id || subcat.id) && subcat.subcategories && subcat.subcategories.length > 0 && (
                                <div
                                  className="absolute top-0 left-full w-56 bg-white shadow-2xl border border-gray-200 z-[110]"
                                  style={{ minHeight: '400px' }}
                                  onMouseEnter={() => setHoveredSubcategory(subcat._id || subcat.id)}
                                  onMouseLeave={() => { setHoveredSubcategory(null); setHoveredThirdLevel(null); }}
                                >
                                  <div className="py-2">
                                    {subcat.subcategories.map((thirdLevel) => (
                                      <div
                                        key={thirdLevel._id || thirdLevel.id}
                                        className="relative"
                                        onMouseEnter={() => setHoveredThirdLevel(thirdLevel._id || thirdLevel.id)}
                                        onMouseLeave={() => setHoveredThirdLevel(null)}
                                      >
                                        <Link
                                          to={`/category/${thirdLevel.slug}`}
                                          className={`block px-4 py-2.5 text-sm border-b border-gray-100 transition-colors ${
                                            hoveredThirdLevel === (thirdLevel._id || thirdLevel.id) && thirdLevel.subcategories?.length > 0
                                              ? 'bg-[#E31E24] text-white'
                                              : 'text-gray-700 hover:text-[#E31E24] hover:bg-gray-50'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between">
                                            <span>{getLocalizedField(thirdLevel, 'name')}</span>
                                            {thirdLevel.subcategories && thirdLevel.subcategories.length > 0 && (
                                              <ChevronRight className={`h-4 w-4 ${hoveredThirdLevel === (thirdLevel._id || thirdLevel.id) ? 'text-white' : 'text-gray-400'}`} />
                                            )}
                                          </div>
                                        </Link>

                                        {/* Level 4: Fourth Level Flyout */}
                                        {hoveredThirdLevel === (thirdLevel._id || thirdLevel.id) && thirdLevel.subcategories?.length > 0 && (
                                          <div
                                            className="absolute top-0 left-full w-52 bg-white shadow-2xl border border-gray-200 z-[120]"
                                            style={{ minHeight: '200px' }}
                                            onMouseEnter={() => setHoveredThirdLevel(thirdLevel._id || thirdLevel.id)}
                                            onMouseLeave={() => { setHoveredThirdLevel(null); setHoveredFourthLevel(null); }}
                                          >
                                            <div className="py-2">
                                              {thirdLevel.subcategories.map((fourthLevel) => (
                                                <div
                                                  key={fourthLevel._id || fourthLevel.id}
                                                  className="relative"
                                                  onMouseEnter={() => setHoveredFourthLevel(fourthLevel._id || fourthLevel.id)}
                                                  onMouseLeave={() => setHoveredFourthLevel(null)}
                                                >
                                                  <Link
                                                    to={`/category/${fourthLevel.slug}`}
                                                    className={`block px-4 py-2.5 text-sm border-b border-gray-100 transition-colors ${
                                                      hoveredFourthLevel === (fourthLevel._id || fourthLevel.id) && fourthLevel.subcategories?.length > 0
                                                        ? 'bg-[#E31E24] text-white'
                                                        : 'text-gray-700 hover:text-[#E31E24] hover:bg-gray-50'
                                                    }`}
                                                  >
                                                    <div className="flex items-center justify-between">
                                                      <span>{getLocalizedField(fourthLevel, 'name')}</span>
                                                      {fourthLevel.subcategories?.length > 0 && (
                                                        <ChevronRight className={`h-4 w-4 ${hoveredFourthLevel === (fourthLevel._id || fourthLevel.id) ? 'text-white' : 'text-gray-400'}`} />
                                                      )}
                                                    </div>
                                                  </Link>

                                                  {/* Level 5: Fifth Level Flyout */}
                                                  {hoveredFourthLevel === (fourthLevel._id || fourthLevel.id) && fourthLevel.subcategories?.length > 0 && (
                                                    <div
                                                      className="absolute top-0 left-full w-52 bg-white shadow-2xl border border-gray-200 z-[130]"
                                                      style={{ minHeight: '100px' }}
                                                      onMouseEnter={() => setHoveredFourthLevel(fourthLevel._id || fourthLevel.id)}
                                                      onMouseLeave={() => setHoveredFourthLevel(null)}
                                                    >
                                                      <div className="py-2">
                                                        {fourthLevel.subcategories.map((fifthLevel) => (
                                                          <Link
                                                            key={fifthLevel._id || fifthLevel.id}
                                                            to={`/category/${fifthLevel.slug}`}
                                                            className="block px-4 py-2.5 text-sm text-gray-700 hover:text-[#E31E24] hover:bg-gray-50 border-b border-gray-100 transition-colors"
                                                          >
                                                            {getLocalizedField(fifthLevel, 'name')}
                                                          </Link>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Slider Area */}
            <div className="flex-1 min-w-0 bg-white lg:ml-0">
              {/* Promotional Text Banner */}
              {(() => {
                const fb = homeSections['festival-banner'];
                if (fb && fb.isActive === false) return null;
                const title = language === 'bn'
                  ? (fb?.titleBn || t('festivalBannerTitle'))
                  : (fb?.title || t('festivalBannerTitle'));
                const subtitle = fb?.subtitle || t('festivalBannerSubtitle');
                const icon = fb?.icon || '🎉';
                const bg = fb?.backgroundColor || 'linear-gradient(to right, #E31E24, #b9151a)';
                const fg = fb?.accentColor || '#ffffff';
                return (
                  <div className="p-4 hidden lg:block" style={{ background: bg }}>
                    <h2 className="text-xl md:text-2xl font-bold animate-fade-in" style={{ color: fg }}>
                      {icon} {title}
                      <span className="block text-lg font-normal mt-1" style={{ color: fg, opacity: 0.9 }}>
                        {subtitle}
                      </span>
                    </h2>
                  </div>
                );
              })()}

              {/* Quick Category Cards - Featured */}
              {(() => {
                const qc = homeSections['quick-category-buttons'];
                if (qc && qc.isActive === false) return null;
                const fallback = [
                  { name: language === 'bn' ? 'ডিম' : 'Eggs', link: '/category/eggs' },
                  { name: language === 'bn' ? 'চা' : 'Tea', link: '/category/tea' },
                  { name: language === 'bn' ? 'সফট ড্রিংকস' : 'Soft Drinks', link: '/category/cola' },
                  { name: language === 'bn' ? 'ফ্রোজেন' : 'Frozen', link: '/category/frozen-foods' },
                  { name: language === 'bn' ? 'কফি' : 'Coffee', link: '/category/coffee' },
                ];
                const items = (qc?.products?.length ? qc.products : fallback);
                const fg = qc?.accentColor || '#000000';
                const bg = qc?.backgroundColor || '#fec400';
                return (
                  <div className="bg-white p-4 lg:p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {items.map((item, i) => (
                        <Link
                          key={item._id || item.link || i}
                          to={item.link || '#'}
                          className="group"
                        >
                          <div
                            className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow h-16 flex items-center justify-center"
                            style={{ background: bg }}
                          >
                            <div className="py-2 px-4">
                              <h3 className="font-bold text-center" style={{ color: fg }}>
                                {language === 'bn' && item.nameBn ? item.nameBn : item.name}
                              </h3>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Offer Slider - Grocery & Spice */}
              <div className="p-4 lg:p-6 bg-white">
                <OfferSlider />
              </div>

              {/* 1. RECOMMENDED FOR YOU */}
              <section className="bg-white p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 uppercase">{t('recommendedProducts')}</h2>
                  <Link to="/category/recommended" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
                    {t('viewAll')} <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sectionProducts('recommended-for-you', recommendedProducts).slice(0, 4).map((product, i) => (
                    <ProductCard key={product._id || product.id || i} product={product} />
                  ))}
                </div>
              </section>

              {/* 2. TRENDING PRODUCTS */}
              <section className="bg-white p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 uppercase">{t('trendingProducts')} 🔥</h2>
                  <Link to="/category/trending" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
                    {t('viewAll')} <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sectionProducts('trending-products', trendingProducts).slice(0, 4).map((product, i) => (
                    <ProductCard key={product._id || product.id || i} product={product} />
                  ))}
                </div>
              </section>

              {/* 3. BREAD & MORE */}
              <section className="bg-white p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 uppercase">
                    {getSectionTitle('bread-and-more', t('breadAndMore'), t('breadAndMore'))}
                  </h2>
                  <Link to="/category/bread" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
                    {t('viewAll')} <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sectionProducts('bread-and-more', breadProducts).slice(0, 4).map((product, i) => (
                    <ProductCard key={product._id || product.id || i} product={product} />
                  ))}
                </div>
              </section>

              {/* 4. UNILEVER WEEK */}
              <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 lg:p-6 border-t-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 uppercase">
                    {getSectionTitle('unilever-week', t('unileverWeek'), t('unileverWeek'))}
                  </h2>
                  <Link to="/category/unilever" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
                    {t('viewAll')} <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sectionProducts('unilever-week', cleaningProducts).slice(0, 4).map((product, i) => (
                    <ProductCard key={product._id || product.id || i} product={product} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12 mt-8 flex flex-col gap-12">

        {/* Feature Cards Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6" style={{ order: 0 }}>
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-[#E31E24]" />
            </div>
            <h3 className="font-bold text-lg mb-2">{t('minsDelivery')}</h3>
            <p className="text-sm text-gray-600">{t('freeShippingOver')}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-[#E31E24]" />
            </div>
            <h3 className="font-bold text-lg mb-2">{t('authorizedProducts')}</h3>
            <p className="text-sm text-gray-600">{t('hundredAuthentic')}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-[#E31E24]" />
            </div>
            <h3 className="font-bold text-lg mb-2">{t('customerSupportLabel')}</h3>
            <p className="text-sm text-gray-600">{t('supportHoursLabel')}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-[#E31E24]" />
            </div>
            <h3 className="font-bold text-lg mb-2">{t('flexiblePayments')}</h3>
            <p className="text-sm text-gray-600">{t('paymentMethods')}</p>
          </div>
        </section>

        {/* UNILEVER MEGA SALE - 80% OFF 🔥 */}
        <section
          className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-2xl p-8 shadow-2xl border-4 border-yellow-400"
          style={{ order: getSectionOrder('unilever-mega-sale', 5) }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white uppercase drop-shadow-lg">
                {getSectionTitle('unilever-mega-sale', t('unileverMegaSaleTitle'), t('unileverMegaSaleTitle'))} 🔥
              </h2>
              <p className="text-xl md:text-2xl font-bold text-yellow-300 mt-2 drop-shadow">
                {t('upTo80Off')}
              </p>
              <p className="text-sm md:text-base text-white/90 mt-2 font-semibold">
                {t('voucherUBL')}
              </p>
            </div>
            <Link to="/category/home-cleaning" className="text-white hover:text-yellow-300 flex items-center gap-2 bg-white/20 backdrop-blur px-6 py-3 rounded-full font-bold text-sm md:text-base transition-all hover:bg-white/30">
              {t('viewAll')} <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {sectionProducts('unilever-mega-sale', cleaningProducts).slice(0, 8).map((product, i) => (
              <ProductCard key={product._id || product.id || i} product={product} />
            ))}
          </div>
        </section>

        {/* 5. WEEKDAY DEALS!!! with Timer */}
        <section
          className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 shadow-lg border-2 border-orange-300"
          style={{ order: getSectionOrder('weekday-deals', 6) }}
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 uppercase">
                {getSectionTitle('weekday-deals', t('weekdayDeals'), t('weekdayDeals'))}
              </h2>
              {/* Timer */}
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
                <div className="flex gap-1">
                  <div className="bg-[#E31E24] text-white px-2 py-1 rounded font-bold text-sm">01</div>
                  <div className="bg-[#E31E24] text-white px-2 py-1 rounded font-bold text-sm">21</div>
                  <div className="bg-[#E31E24] text-white px-2 py-1 rounded font-bold text-sm">42</div>
                  <div className="bg-[#E31E24] text-white px-2 py-1 rounded font-bold text-sm">38</div>
                  <span className="text-xs text-gray-500 ml-1">{t('minutes')}</span>
                </div>
              </div>
            </div>
            {/* Category Tabs */}
            <div className="flex gap-2 flex-wrap mb-4">
              {[
                { key: 'noodlesTab', val: 'Noodles' },
                { key: 'pastaTab', val: 'Pasta' },
                { key: 'fullCreamMilkTab', val: 'Full Cream Milk' },
                { key: 'regularSpiceTab', val: 'Regular Spice' },
                { key: 'biscuitsOthersTab', val: 'Biscuits Others' },
                { key: 'flavouredTeaTab', val: 'Flavored Tea' },
                { key: 'teaEtcTab', val: 'Tea Etc' },
              ].map(({ key, val }) => (
                <button
                  key={val}
                  className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 rounded-full text-sm font-bold transition-colors"
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sectionProducts('weekday-deals', cookingProducts).slice(0, 5).map((product, i) => (
              <ProductCard key={product._id || product.id || i} product={product} />
            ))}
          </div>
        </section>

        {/* 6. EVERYDAY CLEANING ESSENTIALS */}
        <section
          className="bg-white rounded-lg p-6 shadow-sm"
          style={{ order: getSectionOrder('cleaning-essentials', 7) }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 uppercase">
              {getSectionTitle('cleaning-essentials', t('cleaningEssentials'), t('cleaningEssentials'))}
            </h2>
            <Link to="/category/cleaning" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
              {t('viewAll')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sectionProducts('cleaning-essentials', cleaningProducts).slice(0, 6).map((product, i) => (
              <ProductCard key={product._id || product.id || i} product={product} />
            ))}
          </div>
        </section>

        {/* 7. SNACKS & SWEETS 🍪🍫 */}
        <section
          className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 shadow-sm border-2 border-orange-200"
          style={{ order: getSectionOrder('snacks-sweets', 8) }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 uppercase">
              {getSectionTitle('snacks-sweets', t('snacksAndSweets'), t('snacksAndSweets'))}
            </h2>
            <Link to="/category/snacks" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
              {t('viewAll')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {sectionProducts('snacks-sweets', snacksProducts).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {sectionProducts('snacks-sweets', snacksProducts).slice(0, 6).map((product, i) => (
                <ProductCard key={product._id || product.id || i} product={product} />
              ))}
            </div>
          )}
          {sectionProducts('snacks-sweets', snacksProducts).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">{t('noProductsCategory')}</p>
              <p className="text-sm mt-2">{t('checkBackSnacks')}</p>
            </div>
          )}
        </section>

        {/* 8. TODAY'S FEATURED FINDS (Dark Section) */}
        <section
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 shadow-xl"
          style={{ order: getSectionOrder('todays-featured-finds', 9) }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white uppercase">
              {getSectionTitle('todays-featured-finds', t('todaysFeaturedFinds'), t('todaysFeaturedFinds'))}
            </h2>
            <Link to="/featured" className="text-sm font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
              {t('viewAll')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {sectionProducts('todays-featured-finds', featuredProducts).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {sectionProducts('todays-featured-finds', featuredProducts).slice(0, 6).map((product) => (
                <div key={product._id || product.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-1">{t('delivery12Hours')}</p>
                    <h3 className="text-sm font-semibold line-clamp-2 mb-2">
                      {language === 'bn' && product.nameBn ? product.nameBn : product.name}
                    </h3>
                    <p className="text-lg font-bold text-[#E31E24] mb-2">{formatPrice(product.price)}</p>
                    <button className="w-full bg-[#E31E24] hover:bg-[#b9151a] text-white py-2 rounded-full text-sm font-bold transition-colors">
                      {t('addToBagBtn')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 9. SPICE UP YOUR COOKING GAME */}
        <section
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 shadow-xl"
          style={{ order: getSectionOrder('spice-up-cooking', 10) }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white uppercase">
              {getSectionTitle('spice-up-cooking', t('spiceUpCookingTitle'), t('spiceUpCookingTitle'))}
            </h2>
          </div>
          {sectionProducts('spice-up-cooking', cookingProducts).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {sectionProducts('spice-up-cooking', cookingProducts).slice(0, 6).map((product) => (
                <div key={product._id || product.id} className="bg-white rounded-lg overflow-hidden shadow-lg">
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-1">{t('delivery12Hours')}</p>
                    <h3 className="text-sm font-semibold line-clamp-2 mb-2">
                      {language === 'bn' && product.nameBn ? product.nameBn : product.name}
                    </h3>
                    <p className="text-lg font-bold text-[#E31E24] mb-2">{formatPrice(product.price)}</p>
                    <button className="w-full bg-[#E31E24] hover:bg-[#b9151a] text-white py-2 rounded-full text-sm font-bold">
                      {t('addToBagBtn')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 10. HAPPY HOUR with Countdown Timer */}
        <section
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 shadow-lg border-2 border-purple-300"
          style={{ order: getSectionOrder('happy-hour', 11) }}
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 uppercase flex items-center gap-3">
                <span className="text-3xl">⏰</span> {getSectionTitle('happy-hour', t('happyHourTitle'), t('happyHourTitle'))}
              </h2>
              {/* Countdown Timer */}
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <div className="bg-[#E31E24] text-white px-3 py-2 rounded font-bold text-2xl min-w-[50px]">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('hours')}</p>
                  </div>
                  <span className="text-2xl font-bold text-gray-400">:</span>
                  <div className="text-center">
                    <div className="bg-[#E31E24] text-white px-3 py-2 rounded font-bold text-2xl min-w-[50px]">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('minutes')}</p>
                  </div>
                  <span className="text-2xl font-bold text-gray-400">:</span>
                  <div className="text-center">
                    <div className="bg-[#E31E24] text-white px-3 py-2 rounded font-bold text-2xl min-w-[50px]">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('seconds')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {sectionProducts('happy-hour', babyProducts).length > 0 && <FeaturedCarousel products={sectionProducts('happy-hour', babyProducts)} />}
        </section>

        {/* 11. FRESH VEGETABLES (with Tabs) */}
        <section
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 shadow-sm border-2 border-green-200"
          style={{ order: getSectionOrder('fresh-vegetables-fruits', 12) }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 uppercase mb-4">
              {getSectionTitle('fresh-vegetables-fruits', t('freshVegetablesFruitsTitle'), t('freshVegetablesFruitsTitle'))}
            </h2>
            {/* Category Tabs */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-2">
              {[
                { key: 'freshVegetablesTab', id: 'fresh-vegetables' },
                { key: 'eggsCerealsTab', id: 'eggs-&-cereals' },
                { key: 'frozenSnacksTab', id: 'frozen-snacks' },
                { key: 'diabeticCornerTab', id: 'diabetic-corner' },
              ].map(({ key, id }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === id
                      ? 'text-[#E31E24] border-b-2 border-[#E31E24]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>
          {activeTab === 'fresh-vegetables' && sectionProducts('fresh-vegetables-fruits', vegetableProducts).length > 0 && (
            <FeaturedCarousel products={sectionProducts('fresh-vegetables-fruits', vegetableProducts)} />
          )}
          {activeTab === 'eggs-&-cereals' && eggsCerealsProducts.length > 0 && (
            <FeaturedCarousel products={eggsCerealsProducts} />
          )}
          {activeTab === 'frozen-snacks' && frozenSnacksProducts.length > 0 && (
            <FeaturedCarousel products={frozenSnacksProducts} />
          )}
          {activeTab === 'diabetic-corner' && diabeticProducts.length > 0 && (
            <FeaturedCarousel products={diabeticProducts} />
          )}
          {((activeTab === 'fresh-vegetables' && vegetableProducts.length === 0) ||
            (activeTab === 'eggs-&-cereals' && eggsCerealsProducts.length === 0) ||
            (activeTab === 'frozen-snacks' && frozenSnacksProducts.length === 0) ||
            (activeTab === 'diabetic-corner' && diabeticProducts.length === 0)) && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">{t('productsComing')}</p>
            </div>
          )}
        </section>

        {/* 12. SNACKS & SWEETS carousel (duplicate for FeaturedCarousel layout) */}
        <section
          className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 shadow-sm border-2 border-orange-200"
          style={{ order: getSectionOrder('snacks-sweets', 8) + 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 uppercase">
              {getSectionTitle('snacks-sweets', t('snacksAndSweets'), t('snacksAndSweets'))}
            </h2>
            <Link to="/category/snacks" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
              {t('viewAll')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {sectionProducts('snacks-sweets', snacksProducts).length > 0 && (
            <FeaturedCarousel products={sectionProducts('snacks-sweets', snacksProducts)} />
          )}
          {sectionProducts('snacks-sweets', snacksProducts).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">{t('noProductsCategory')}</p>
              <p className="text-sm mt-2">{t('checkBackSnacks')}</p>
            </div>
          )}
        </section>

        {/* 13. BEVERAGES 🥤☕ */}
        <section
          className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6 shadow-sm border-2 border-cyan-200"
          style={{ order: getSectionOrder('beverages', 13) }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 uppercase">
              {getSectionTitle('beverages', t('beveragesTitle'), t('beveragesTitle'))}
            </h2>
            <Link to="/category/beverages" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
              {t('viewAll')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {sectionProducts('beverages', beverageProducts).length > 0 && (
            <FeaturedCarousel products={sectionProducts('beverages', beverageProducts)} />
          )}
          {sectionProducts('beverages', beverageProducts).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">{t('noBeverages')}</p>
              <p className="text-sm mt-2">{t('beveragesComing')}</p>
            </div>
          )}
        </section>

        {/* 14. FROZEN FOODS 🧊🍦 */}
        <section
          className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-6 shadow-sm border-2 border-blue-300"
          style={{ order: getSectionOrder('frozen-foods', 14) }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 uppercase">
              {getSectionTitle('frozen-foods', t('frozenFoodsTitle'), t('frozenFoodsTitle'))}
            </h2>
            <Link to="/category/frozen-foods" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
              {t('viewAll')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {sectionProducts('frozen-foods', frozenProducts).length > 0 && (
            <FeaturedCarousel products={sectionProducts('frozen-foods', frozenProducts)} />
          )}
          {sectionProducts('frozen-foods', frozenProducts).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">{t('noFrozenFoods')}</p>
              <p className="text-sm mt-2">{t('frozenComing')}</p>
            </div>
          )}
        </section>

        {/* 15. GADGETS & ELECTRONICS 📱💻 */}
        <section
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 shadow-sm border-2 border-blue-200"
          style={{ order: getSectionOrder('gadgets-electronics', 15) }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 uppercase">
              {getSectionTitle('gadgets-electronics', t('gadgetsElectronicsTitle'), t('gadgetsElectronicsTitle'))}
            </h2>
            <Link to="/category/gadget" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
              {t('viewAll')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {sectionProducts('gadgets-electronics', gadgetProducts).length > 0 && (
            <FeaturedCarousel products={sectionProducts('gadgets-electronics', gadgetProducts)} />
          )}
          {sectionProducts('gadgets-electronics', gadgetProducts).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">{t('noGadgets')}</p>
              <p className="text-sm mt-2">{t('gadgetsComing')}</p>
            </div>
          )}
        </section>

        {/* CUSTOM ADMIN SECTIONS — any extra section created via the admin
            panel renders here, ordered by its `order` field. */}
        {customSections.map((s) => (
          <section
            key={s._id}
            className="rounded-lg p-6 shadow-sm border-2"
            style={{
              order: typeof s.order === 'number' && s.order > 0 ? s.order : 100,
              background: s.backgroundColor || 'linear-gradient(to right, #f9fafb, #ffffff)',
              borderColor: s.accentColor || '#e5e7eb',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-2xl font-bold uppercase flex items-center gap-2"
                  style={{ color: s.accentColor || '#111827' }}
                >
                  {s.icon && <span>{s.icon}</span>}
                  {language === 'bn' ? (s.titleBn || s.title) : s.title}
                </h2>
                {s.subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{s.subtitle}</p>
                )}
              </div>
            </div>
            {s.layout === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {s.products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            ) : (
              <FeaturedCarousel products={s.products} />
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
