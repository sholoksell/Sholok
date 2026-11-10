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
import HomeBannerCarousel from '@/components/HomeBannerCarousel';
import PromotionalBannerGrid from '@/components/PromotionalBannerGrid';
import FlashSaleSection from '@/components/FlashSaleSection';
import ShopByCategorySection from '@/components/ShopByCategorySection';
import CampaignBanner from '@/components/CampaignBanner';
import TrendingSection from '@/components/TrendingSection';

const HomePage = () => {
  const { t, getLocalizedField, language } = useLanguage();
  const { categories, loading: categoriesLoading } = useCategories();
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [hoveredThirdLevel, setHoveredThirdLevel] = useState(null);
  const [hoveredFourthLevel, setHoveredFourthLevel] = useState(null);
  // Per-section product states
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [gadgetProducts, setGadgetProducts] = useState([]);

  // Admin-managed home sections, keyed by `key` for fast lookup
  const [homeSections, setHomeSections] = useState({});

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
          productService.getByCategory('home-kitchen', 20),               // 4 gadgets/home
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

        const getProducts = (i) => ok(i)?.products || [];
        setGadgetProducts(getProducts(4));

      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayCategories = (categories.length > 0 ? categories : []).filter(c => c.slug !== 'grocery');

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
            <div className="hidden md:block w-64 bg-white shadow-sm z-40 relative min-h-[400px] border-r border-gray-100 rounded-br-xl">
              <div className="px-4 py-3 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">All Categories</span>
              </div>
              <div className="py-1 bg-white min-h-[350px]">
                {displayCategories.length === 0 && (
                  <div className="py-2">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 animate-pulse">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
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
                    <Link
                      to={`/category/${cat.slug || cat._id || cat.id}`}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm border-b border-gray-50 transition-colors ${
                        hoveredCategory === (cat._id || cat.id)
                          ? 'bg-primary-soft text-primary'
                          : 'text-gray-700 hover:bg-primary-soft hover:text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-soft text-primary flex-shrink-0">
                          <CategoryIcon icon={cat.icon} image={cat.image} name={cat.name} className="w-4 h-4" />
                        </span>
                        <span className="font-medium">{getLocalizedField(cat, 'name')}</span>
                      </div>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-primary" />
                      )}
                    </Link>

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
              {/* Hero Banner Carousel */}
              <HomeBannerCarousel language={language} />

              {/* Promotional Banner Grid - 4 category cards */}
              <div className="p-4 lg:p-6 bg-white">
                <PromotionalBannerGrid />
              </div>

              {/* Offer Slider */}
              <div className="p-4 lg:p-6 bg-white">
                <OfferSlider />
              </div>

              {/* Flash Sale */}
              {sectionProducts('recommended-for-you', recommendedProducts).length > 0 && (
                <div className="p-4 lg:p-6 bg-white">
                  <FlashSaleSection products={sectionProducts('recommended-for-you', recommendedProducts)} />
                </div>
              )}

              {/* Trending Items with category filter tabs */}
              <TrendingSection products={sectionProducts('trending-products', trendingProducts)} />

              {/* Campaign Banner - EVERYDAY STYLE */}
              <div className="p-4 lg:p-6 bg-white">
                <CampaignBanner />
              </div>

              {/* Shop by Category icon grid */}
              <div className="p-4 lg:p-6 bg-gray-50">
                <ShopByCategorySection />
              </div>

              {/* New Arrivals */}
              <section className="bg-white p-4 lg:p-6">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
                    <p className="mt-1 text-sm text-gray-500">Fresh additions across the store.</p>
                  </div>
                  <Link to="/category/new-arrivals" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                    View All <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {sectionProducts('recommended-for-you', recommendedProducts).slice(0, 10).map((product, i) => (
                    <ProductCard key={product._id || product.id || i} product={product} />
                  ))}
                </div>
              </section>

              {/* More to Love / Trending Products */}
              <section className="bg-white p-4 lg:p-6">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-primary" /> More to Love
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Popular picks worth discovering.</p>
                  </div>
                  <Link to="/category/trending" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                    View All <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {sectionProducts('trending-products', trendingProducts).slice(0, 15).map((product, i) => (
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
            <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">{t('minsDelivery')}</h3>
            <p className="text-sm text-gray-600">{t('freeShippingOver')}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">{t('authorizedProducts')}</h3>
            <p className="text-sm text-gray-600">{t('hundredAuthentic')}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">{t('customerSupportLabel')}</h3>
            <p className="text-sm text-gray-600">{t('supportHoursLabel')}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">{t('flexiblePayments')}</h3>
            <p className="text-sm text-gray-600">{t('paymentMethods')}</p>
          </div>
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
