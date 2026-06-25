import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, Truck, Shield, CreditCard, Sparkles } from 'lucide-react';
import OfferSlider from '@/components/OfferSlider';
import ProductCard from '@/components/ProductCard';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import ImageDebugger from '@/components/ImageDebugger';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories } from '@/contexts/CategoryContext';
import { productService } from '@/services/productService';
import { bannerService } from '@/services/commonService';
import { homeSectionService } from '@/services/homeSectionService';
import CategoryIcon from '@/components/CategoryIcon';
import { formatPrice } from '@/lib/utils';

const HomePage = () => {
  const { t, getLocalizedField } = useLanguage();
  const { categories, loading: categoriesLoading } = useCategories();
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [activeTab, setActiveTab] = useState('fresh-vegetables');
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  // Category-wise products state
  const [allProducts, setAllProducts] = useState([]);
  const [newArrivalsProducts, setNewArrivalsProducts] = useState([]);
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
        
        // Fetch banners and products (categories come from context)
        const [bannersRes, allProductsRes, featuredRes, bestSellersRes, sectionsRes] = await Promise.all([
          bannerService.getAll({ active: true }).catch(err => ({ data: [] })),
          productService.getAll({ limit: 500 }).catch(err => ({ products: [] })),
          productService.getFeatured().catch(err => ({ products: [] })),
          productService.getBestSellers().catch(err => ({ products: [] })),
          homeSectionService.getAll().catch(() => [])
        ]);

        // Build a key -> section map for quick lookup in render
        const sectionMap = {};
        (sectionsRes || []).forEach((s) => {
          if (s?.key) sectionMap[s.key] = s;
        });
        setHomeSections(sectionMap);

        setBanners(bannersRes.data || bannersRes.banners || []);
        setAllProducts(allProductsRes.products || []);
        setFeaturedProducts(featuredRes.products || []);

        // Demo product fallback (when API returns empty)
        const demoProducts = [
          { _id: 'demo-1', slug: 'kazifarms-paratha', name: 'KaziFarms Kitchen Plain Paratha 1300gm', price: 250, comparePrice: 320, image: '/products/paratha.jpg', stock: 50, unit: 'Per Piece' },
          { _id: 'demo-2', slug: 'aci-puffed-rice', name: 'ACI Pure Puffed Rice 500gm', price: 75, image: '/products/rice.jpg', stock: 100, unit: 'Per Piece' },
          { _id: 'demo-3', slug: 'wow-noodles', name: 'Wow! Masala Instant Noodles 496gm', price: 109, comparePrice: 175, image: '/products/noodles.jpg', stock: 80, unit: 'Per Piece' },
          { _id: 'demo-4', slug: 'mojo-cola', name: 'Mojo 2000ml (Plastic Bot)', price: 103, comparePrice: 120, image: '/products/mojo.jpg', stock: 60, unit: 'Per Piece' },
          { _id: 'demo-5', slug: 'kolson-shemai', name: 'Kolson Lachha Shemai 180gm', price: 50, image: '/products/shemai.jpg', stock: 70, unit: 'Per Piece' },
          { _id: 'demo-6', slug: 'starship-milk', name: 'Starship Full Cream Milk Power 500gm', price: 360, comparePrice: 375, image: '/products/milk.jpg', stock: 40, unit: 'Per Piece' },
          { _id: 'demo-7', slug: 'colgate-toothpaste', name: 'Colgate Max Fresh Red Gel Toothpaste 150gm', price: 170, comparePrice: 200, image: '/products/colgate.jpg', stock: 90, unit: 'Per Piece' },
          { _id: 'demo-8', slug: 'rupchanda-oil', name: 'Rupchanda Soyabean Oil 5Ltr.', price: 975, image: '/products/oil.jpg', stock: 30, unit: 'Per Piece' },
        ];

        // Fetch category-specific products
        const products = allProductsRes.products && allProductsRes.products.length > 0
          ? allProductsRes.products
          : demoProducts;
        // Helper: get category slug from product (handles both populated object and string id)
        // Strips -kh suffix so both hierarchies (standard + kh-market) match the same filters
        const getCatSlug = (p) => {
          const slug = p.categoryId?.slug || p.category?.slug || p.categorySlug || '';
          const parentSlug = p.categoryId?.parentSlug || '';
          return [slug, slug.replace(/-kh$/, ''), parentSlug].filter(Boolean);
        };

        // Helper: filter with fallback to allProducts
        // Returns products whose category slug matches ANY of the given slugs
        const filterOrFallback = (slugs, limit = 12) => {
          const slugSet = new Set(slugs);
          const filtered = products.filter(p => getCatSlug(p).some(s => slugSet.has(s)));
          return filtered.length > 0 ? filtered.slice(0, limit) : products.slice(0, limit);
        };

        // New Arrivals — always show the newest products regardless of category
        setNewArrivalsProducts(products.slice(0, 12));

        // Filter products by category slugs (includes both standard and -kh variants)
        setRecommendedProducts(filterOrFallback([
          'fresh-fruits', 'fresh-fruits-kh', 'fresh-vegetables', 'fresh-vegetable',
          'fresh-produce', 'fruits-vegetable', 'milk', 'milk-kh', 'bread', 'bread-butter', 'eggs', 'eggs-kh'
        ]));

        // Trending Products: Use best sellers or sort by soldCount
        const bestSellers = bestSellersRes.products || [];
        if (bestSellers.length > 0) {
          setTrendingProducts(bestSellers.slice(0, 12));
        } else {
          const sortedBySales = [...products]
            .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
            .slice(0, 12);
          setTrendingProducts(sortedBySales.length > 0 ? sortedBySales : products.slice(0, 12));
        }

        // Bread & More
        setBreadProducts(filterOrFallback([
          'bread', 'bread-butter', 'eggs', 'eggs-kh',
          'cereals', 'breakfast-cereals', 'oats-porridge', 'baby-food', 'baby-food-kh', 'breakfast'
        ]));

        // Cleaning Products
        setCleaningProducts(filterOrFallback([
          'home-cleaning', 'household-cleaning', 'household-tools',
          'dishwashing', 'laundry-detergent', 'detergent', 'toilet-cleaner',
          'floor-cleaner', 'glass-cleaner', 'cleaning-tools-kh', 'tissue-napkins', 'garbage-bags'
        ]));

        // Cooking Products
        setCookingProducts(filterOrFallback([
          'rice', 'atta-flour', 'flour-kh', 'edible-oil', 'cooking-oil', 'oil-kh',
          'spices', 'spices-masala', 'salt-sugar', 'salt-sugar-kh', 'ready-mix',
          'noodles-pasta', 'sauces-ketchup', 'vinegar-sauce', 'grocery-staples', 'cooking-essentials'
        ]));

        // Baby Products
        setBabyProducts(filterOrFallback([
          'baby-food', 'baby-food-kh', 'baby-food-and-care', 'baby-care',
          'baby-diapers', 'baby-wipes', 'baby-bath-and-skin', 'baby-lotion', 'baby-soap', 'baby-shampoo'
        ]));

        // Vegetables & Fruits
        setVegetableProducts(filterOrFallback([
          'fresh-vegetables', 'fresh-vegetable', 'fresh-fruits', 'fresh-fruits-kh',
          'fresh-produce', 'fruits-vegetable', 'dry-fruits'
        ]));

        // Eggs & Cereals
        setEggsCerealsProducts(filterOrFallback([
          'eggs', 'eggs-kh', 'brown-eggs', 'white-eggs', 'duck-eggs', 'quail-eggs',
          'cereals', 'breakfast-cereals', 'oats-porridge', 'breakfast'
        ]));

        // Frozen Snacks / Dairy
        setFrozenSnacksProducts(filterOrFallback([
          'dairy-frozen', 'dairy-and-frozen', 'ice-cream', 'frozen-vegetables',
          'frozen-snacks', 'frozen-meat', 'yogurt', 'yogurt-kh',
          'milk', 'milk-kh', 'butter-ghee', 'butter-ghee-kh', 'cheese', 'cheese-kh'
        ]));

        // Health / Beauty / Diabetic
        setDiabeticProducts(filterOrFallback([
          'health-supplements', 'beauty-and-health', 'health-wellness',
          'beauty-healths', 'skin-care', 'hair-care', 'vitamins', 'vitamins-supplements',
          'first-aid', 'personal-care'
        ]));

        // Snacks & Sweets
        setSnacksProducts(filterOrFallback([
          'snacks', 'snacks-confectionery', 'biscuits-cakes',
          'biscuits', 'biscuits-kh', 'biscuits-and-cookies',
          'cakes', 'cakes-kh', 'chips', 'chips-crisps', 'wafers-snacks',
          'chocolate', 'chocolates', 'candy', 'nuts', 'traditional-sweets', 'cake-mix'
        ]));

        // Beverages
        setBeverageProducts(filterOrFallback([
          'beverages', 'drinks',
          'soft-drinks', 'soft-drinks-kh', 'juice', 'juice-kh',
          'tea', 'coffee', 'tea-coffee', 'tea-and-coffee', 'energy-drinks',
          'mineral-water', 'water', 'lassi-shakes', 'powder-drinks',
          'milk', 'milk-kh', 'cola'
        ]));

        // Frozen Foods
        setFrozenProducts(filterOrFallback([
          'dairy-frozen', 'dairy-and-frozen', 'ice-cream', 'frozen-vegetables',
          'frozen-snacks', 'frozen-meat', 'yogurt', 'yogurt-kh'
        ]));

        // Gadgets & Electronics
        setGadgetProducts(filterOrFallback([
          'gadget', 'mobile-accessories', 'audio', 'smart-devices',
          'computer-accessories', 'camera-photo', 'headphones-and-earphones',
          'headphones', 'power-banks', 'power-bank', 'smart-watches', 'smart-watch',
          'chargers', 'small-electronics'
        ]));

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
      {/* Debug component - remove after fixing images */}
      {allProducts.length > 0 && <ImageDebugger products={allProducts} />}

      {/* Sidebar + Hero Section Container */}
      <div className="relative">
        <div className="container mx-auto px-0 lg:px-4">
          <div className="flex">

            {/* Level 1: Main Sidebar (Always Visible on Desktop/Tablet) */}
            <div className="hidden md:block w-60 bg-white shadow-2xl z-40 relative min-h-[400px] border-r border-gray-100">
              <div className="bg-[#E31E24] text-white px-4 py-3 font-bold text-sm uppercase flex items-center gap-2">
                <span>☰</span> SHOP BY CATEGORY
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
                                <span>{subcat.name}</span>
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
                                  onMouseLeave={() => setHoveredSubcategory(null)}
                                >
                                  <div className="py-2">
                                    {subcat.subcategories.map((thirdLevel) => (
                                      <div key={thirdLevel._id || thirdLevel.id}>
                                        <Link
                                          to={`/category/${thirdLevel.slug}`}
                                          className="block px-4 py-2.5 text-sm text-gray-700 hover:text-[#E31E24] hover:bg-gray-50 border-b border-gray-100 transition-colors"
                                        >
                                          <div className="flex items-center justify-between">
                                            <span>{thirdLevel.name}</span>
                                            {thirdLevel.subcategories && thirdLevel.subcategories.length > 0 && (
                                              <ChevronRight className="h-4 w-4 text-gray-400" />
                                            )}
                                          </div>
                                        </Link>
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
                const title = fb?.title || 'Festival Special Offers!';
                const subtitle = fb?.subtitle || 'Save up to 50% on fresh groceries & more';
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
                  { name: t('language') === 'bn' ? 'ডিম' : 'Eggs', link: '/category/eggs' },
                  { name: t('language') === 'bn' ? 'চা' : 'Tea', link: '/category/tea' },
                  { name: t('language') === 'bn' ? 'সফট ড্রিংকস' : 'Soft Drinks', link: '/category/cola' },
                  { name: t('language') === 'bn' ? 'ফ্রোজেন' : 'Frozen', link: '/category/frozen-foods' },
                  { name: t('language') === 'bn' ? 'কফি' : 'Coffee', link: '/category/coffee' },
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
                                {item.name}
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

              {/* 0. NEW ARRIVALS — always shows the latest uploaded products */}
              {newArrivalsProducts.filter(p => !p._id?.startsWith('demo')).length > 0 && (
                <section className="bg-white p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 uppercase">🆕 নতুন পণ্য</h2>
                    <Link to="/search?q=" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
                      সব দেখুন <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {newArrivalsProducts.filter(p => !p._id?.startsWith('demo')).slice(0, 8).map((product, i) => (
                      <ProductCard key={product._id || product.id || i} product={product} />
                    ))}
                  </div>
                </section>
              )}

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
                  <h2 className="text-2xl font-bold text-gray-900 uppercase">Bread & More</h2>
                  <Link to="/category/bread" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
                    View All <ChevronRight className="h-4 w-4" />
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
                  <h2 className="text-2xl font-bold text-gray-900 uppercase">Unilever Week</h2>
                  <Link to="/category/unilever" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
                    View All <ChevronRight className="h-4 w-4" />
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
            <h3 className="font-bold text-lg mb-2">60 Mins Delivery</h3>
            <p className="text-sm text-gray-600">Free shipping over ৳1000</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-[#E31E24]" />
            </div>
            <h3 className="font-bold text-lg mb-2">Authorized Products</h3>
            <p className="text-sm text-gray-600">100% Authentic</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-[#E31E24]" />
            </div>
            <h3 className="font-bold text-lg mb-2">Customer Support</h3>
            <p className="text-sm text-gray-600">8am - 10pm</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-[#E31E24]" />
            </div>
            <h3 className="font-bold text-lg mb-2">Flexible Payments</h3>
            <p className="text-sm text-gray-600">Credit Cards & Mobile Banking</p>
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
                {t('language') === 'bn' ? 'ইউনিলিভার মেলা' : 'UNILEVER MEGA SALE'} 🔥
              </h2>
              <p className="text-xl md:text-2xl font-bold text-yellow-300 mt-2 drop-shadow">
                {t('language') === 'bn' ? '৮০% পর্যন্ত ছাড়' : 'UP TO 80% OFF'}
              </p>
              <p className="text-sm md:text-base text-white/90 mt-2 font-semibold">
                {t('language') === 'bn' 
                  ? '১০০০ টাকার উপরে ১০০ টাকা ভাউচার - VOUCHER: UBL100' 
                  : '৳100 Voucher on ৳1000+ - VOUCHER: UBL100'}
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
              <h2 className="text-2xl font-bold text-gray-900 uppercase">Weekday Deals!!!</h2>
              {/* Timer */}
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
                <div className="flex gap-1">
                  <div className="bg-[#E31E24] text-white px-2 py-1 rounded font-bold text-sm">01</div>
                  <div className="bg-[#E31E24] text-white px-2 py-1 rounded font-bold text-sm">21</div>
                  <div className="bg-[#E31E24] text-white px-2 py-1 rounded font-bold text-sm">42</div>
                  <div className="bg-[#E31E24] text-white px-2 py-1 rounded font-bold text-sm">38</div>
                  <span className="text-xs text-gray-500 ml-1">min</span>
                </div>
              </div>
            </div>
            {/* Category Tabs */}
            <div className="flex gap-2 flex-wrap mb-4">
              {['Noodles', 'Pasta', 'Full Cream Milk', 'Regular Spice', 'Biscuits Others', 'Flavored Tea', 'Tea Etc'].map((cat) => (
                <button
                  key={cat}
                  className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 rounded-full text-sm font-bold transition-colors"
                >
                  {cat}
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
            <h2 className="text-2xl font-bold text-gray-900 uppercase">Everyday Cleaning Essentials</h2>
            <Link to="/category/cleaning" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
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
            <h2 className="text-2xl font-bold text-gray-900 uppercase">🍪 Snacks & Sweets 🍫</h2>
            <Link to="/category/snacks" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
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
              <p className="text-lg">No products available in this category yet.</p>
              <p className="text-sm mt-2">Check back soon for delicious snacks and sweets!</p>
            </div>
          )}
        </section>

        {/* 8. TODAY'S FEATURED FINDS (Dark Section) */}
        <section
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 shadow-xl"
          style={{ order: getSectionOrder('todays-featured-finds', 9) }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white uppercase">Today's Featured Finds</h2>
            <Link to="/featured" className="text-sm font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {sectionProducts('todays-featured-finds', featuredProducts).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {sectionProducts('todays-featured-finds', featuredProducts).slice(0, 6).map((product) => (
                <div key={product._id || product.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-1">Delivery 1-2 hours</p>
                    <h3 className="text-sm font-semibold line-clamp-2 mb-2">{product.name}</h3>
                    <p className="text-lg font-bold text-[#E31E24] mb-2">{formatPrice(product.price)}</p>
                    <button className="w-full bg-[#E31E24] hover:bg-[#b9151a] text-white py-2 rounded-full text-sm font-bold transition-colors">
                      + Add to Bag
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
            <h2 className="text-2xl font-bold text-white uppercase">🌶️ Spice Up Your Cooking Game</h2>
          </div>
          {sectionProducts('spice-up-cooking', cookingProducts).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {sectionProducts('spice-up-cooking', cookingProducts).slice(0, 6).map((product) => (
                <div key={product._id || product.id} className="bg-white rounded-lg overflow-hidden shadow-lg">
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-1">Delivery 1-2 hours</p>
                    <h3 className="text-sm font-semibold line-clamp-2 mb-2">{product.name}</h3>
                    <p className="text-lg font-bold text-[#E31E24] mb-2">{formatPrice(product.price)}</p>
                    <button className="w-full bg-[#E31E24] hover:bg-[#b9151a] text-white py-2 rounded-full text-sm font-bold">
                      + Add to Bag
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 10. HAPPY HOUR (COMFORT FOR BABY) with Countdown Timer */}
        {/* 10. HAPPY HOUR (COMFORT FOR BABY) with Countdown Timer */}
        <section
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 shadow-lg border-2 border-purple-300"
          style={{ order: getSectionOrder('happy-hour', 11) }}
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 uppercase flex items-center gap-3">
                <span className="text-3xl">⏰</span> Happy Hour
              </h2>
              {/* Countdown Timer */}
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <div className="bg-[#E31E24] text-white px-3 py-2 rounded font-bold text-2xl min-w-[50px]">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Hours</p>
                  </div>
                  <span className="text-2xl font-bold text-gray-400">:</span>
                  <div className="text-center">
                    <div className="bg-[#E31E24] text-white px-3 py-2 rounded font-bold text-2xl min-w-[50px]">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minutes</p>
                  </div>
                  <span className="text-2xl font-bold text-gray-400">:</span>
                  <div className="text-center">
                    <div className="bg-[#E31E24] text-white px-3 py-2 rounded font-bold text-2xl min-w-[50px]">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Seconds</p>
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
            <h2 className="text-2xl font-bold text-gray-900 uppercase mb-4">🥬 Fresh Vegetables & Fruits 🍎</h2>
            {/* Category Tabs */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-2">
              {['Fresh Vegetables', 'Eggs & Cereals', 'Frozen Snacks', 'Diabetic Corner'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase().replace(/ /g, '-'))}
                  className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.toLowerCase().replace(/ /g, '-')
                      ? 'text-[#E31E24] border-b-2 border-[#E31E24]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
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
              <p className="text-sm">Products coming soon!</p>
            </div>
          )}
        </section>

        {/* 12. SNACKS & SWEETS 🍪🍫 */}
        <section
          className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 shadow-sm border-2 border-orange-200"
          style={{ order: getSectionOrder('snacks-sweets', 8) + 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 uppercase">🍪 Snacks & Sweets 🍫</h2>
            <Link to="/category/snacks" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {(snacksProducts.length > 0 || babyProducts.length > 0 || homeSections['snacks-sweets']?.products?.length > 0) && (
            <FeaturedCarousel products={sectionProducts('snacks-sweets', snacksProducts.length > 0 ? snacksProducts : babyProducts)} />
          )}
          {snacksProducts.length === 0 && babyProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No products available in this category yet.</p>
              <p className="text-sm mt-2">Check back soon for delicious snacks and sweets!</p>
            </div>
          )}
        </section>

        {/* 13. BEVERAGES 🥤☕ */}
        <section
          className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6 shadow-sm border-2 border-cyan-200"
          style={{ order: getSectionOrder('beverages', 13) }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 uppercase">🥤 Beverages ☕</h2>
            <Link to="/category/beverages" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {sectionProducts('beverages', beverageProducts).length > 0 && (
            <FeaturedCarousel products={sectionProducts('beverages', beverageProducts)} />
          )}
          {sectionProducts('beverages', beverageProducts).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No beverages available yet.</p>
              <p className="text-sm mt-2">Coming soon: Tea, Coffee, Juice and more!</p>
            </div>
          )}
        </section>

        {/* 14. FROZEN FOODS 🧊🍦 */}
        <section
          className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-6 shadow-sm border-2 border-blue-300"
          style={{ order: getSectionOrder('frozen-foods', 14) }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 uppercase">🧊 Frozen Foods 🍦</h2>
            <Link to="/category/frozen-foods" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {sectionProducts('frozen-foods', frozenProducts).length > 0 && (
            <FeaturedCarousel products={sectionProducts('frozen-foods', frozenProducts)} />
          )}
          {sectionProducts('frozen-foods', frozenProducts).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No frozen foods available yet.</p>
              <p className="text-sm mt-2">Coming soon: Ice cream, Frozen vegetables and more!</p>
            </div>
          )}
        </section>

        {/* 15. GADGETS & ELECTRONICS 📱💻 */}
        <section
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 shadow-sm border-2 border-blue-200"
          style={{ order: getSectionOrder('gadgets-electronics', 15) }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 uppercase">📱 Gadgets & Electronics 💻</h2>
            <Link to="/category/gadget" className="text-sm font-bold text-[#E31E24] hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {sectionProducts('gadgets-electronics', gadgetProducts).length > 0 && (
            <FeaturedCarousel products={sectionProducts('gadgets-electronics', gadgetProducts)} />
          )}
          {sectionProducts('gadgets-electronics', gadgetProducts).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No gadgets available yet.</p>
              <p className="text-sm mt-2">Coming soon: Mobile accessories, Smart devices and more!</p>
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
                  {s.title}
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
