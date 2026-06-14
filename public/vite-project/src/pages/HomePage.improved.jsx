import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, Truck, Shield, CreditCard } from 'lucide-react';
import HeroBanner from '@/components/HeroBanner';
import OfferSlider from '@/components/OfferSlider';
import CategorySection from '@/components/CategorySection';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import ShopByCategory from '@/components/ShopByCategory';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories } from '@/contexts/CategoryContext';
import { productService } from '@/services/productService';
import { bannerService } from '@/services/commonService';
import { motion } from 'framer-motion';

const HomePage = () => {
  const { t, getLocalizedField } = useLanguage();
  const { categories, loading: categoriesLoading } = useCategories();
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  // Category-wise products state
  const [productsByCategory, setProductsByCategory] = useState({
    recommended: [],
    trending: [],
    chocolate: [],
    bread: [],
    cleaning: [],
    cooking: [],
    spices: [],
    baby: [],
    vegetables: [],
    snacks: [],
    beverages: [],
    frozen: [],
    featured: []
  });
  
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
        
        // Fetch banners and all products
        const [bannersRes, allProductsRes] = await Promise.all([
          bannerService.getAll({ active: true }).catch(err => ({ data: [] })),
          productService.getAll({ limit: 100 }).catch(err => ({ products: [] }))
        ]);

        setBanners(bannersRes.data || bannersRes.banners || []);
        const products = allProductsRes.products || [];

        // Organize products by category
        const organized = {
          recommended: products.filter(p => 
            p.tags?.includes('recommended') || p.isFeatured
          ).slice(0, 6),
          
          trending: products.filter(p => 
            p.tags?.includes('trending') || p.tags?.includes('hot')
          ).slice(0, 6),
          
          chocolate: products.filter(p => 
            p.categoryId?.slug?.includes('chocolate') || p.tags?.includes('chocolate')
          ).slice(0, 6),
          
          bread: products.filter(p => 
            p.categoryId?.slug?.includes('bread') || 
            p.categoryId?.slug?.includes('egg') ||
            p.categoryId?.slug?.includes('cereal')
          ).slice(0, 6),
          
          cleaning: products.filter(p => 
            p.categoryId?.slug?.includes('detergent') || 
            p.categoryId?.slug?.includes('cleaning') ||
            p.categoryId?.slug?.includes('dish')
          ).slice(0, 8),
          
          cooking: products.filter(p => 
            p.categoryId?.slug?.includes('rice') || 
            p.categoryId?.slug?.includes('oil') ||
            p.categoryId?.slug?.includes('flour')
          ).slice(0, 6),
          
          spices: products.filter(p => 
            p.categoryId?.slug?.includes('spice') || 
            p.brand?.toLowerCase().includes('radhuni')
          ).slice(0, 6),
          
          baby: products.filter(p => 
            p.categoryId?.slug?.includes('baby') || 
            p.categoryId?.slug?.includes('diaper')
          ).slice(0, 6),
          
          vegetables: products.filter(p => 
            p.categoryId?.slug?.includes('vegetable') || 
            p.categoryId?.slug?.includes('fruit')
          ).slice(0, 8),
          
          snacks: products.filter(p => 
            p.categoryId?.slug?.includes('chip') || 
            p.categoryId?.slug?.includes('snack') ||
            p.categoryId?.slug?.includes('noodle')
          ).slice(0, 6),
          
          beverages: products.filter(p => 
            p.categoryId?.slug?.includes('cola') || 
            p.categoryId?.slug?.includes('juice') ||
            p.categoryId?.slug?.includes('tea') ||
            p.categoryId?.slug?.includes('coffee')
          ).slice(0, 6),
          
          frozen: products.filter(p => 
            p.categoryId?.slug?.includes('frozen') || 
            p.categoryId?.slug?.includes('ice-cream')
          ).slice(0, 6),
          
          featured: products.filter(p => p.isFeatured).slice(0, 6)
        };

        setProductsByCategory(organized);

      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayCategories = categories.length > 0 ? categories : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar + Hero Section Container */}
      <div className="relative">
        <div className="container mx-auto px-0 lg:px-4">
          <div className="flex">
            {/* Level 1: Main Sidebar (Always Visible on Desktop/Tablet) */}
            <div className="hidden md:block w-60 bg-white shadow-2xl z-40 relative min-h-[400px] border-r border-gray-100">
              <div className="bg-[#E31E24] text-white px-4 py-3 font-bold text-sm uppercase flex items-center gap-2">
                <span>â˜°</span> SHOP BY CATEGORY
              </div>
              <div className="py-2 bg-white min-h-[350px] max-h-[600px] overflow-y-auto">
                {displayCategories.length === 0 && (
                  <div className="p-4 text-sm text-gray-500 text-center">Loading categories...</div>
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
                        <span className="w-5 text-center text-lg opacity-70">{cat.icon || 'ðŸ“¦'}</span>
                        <span className="font-medium">{getLocalizedField(cat, 'name')}</span>
                      </div>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <ChevronRight className={`h-4 w-4 flex-shrink-0 ${hoveredCategory === (cat._id || cat.id) ? 'text-white' : 'text-gray-400'}`} />
                      )}
                    </div>

                    {/* Level 2: Subcategory Flyout */}
                    {hoveredCategory === (cat._id || cat.id) && cat.subcategories && cat.subcategories.length > 0 && (
                      <div 
                        className="absolute top-0 left-full w-64 bg-white shadow-2xl border border-gray-200 z-[100]"
                        style={{ minHeight: '400px', maxHeight: '600px', overflowY: 'auto' }}
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
                                  style={{ minHeight: '400px', maxHeight: '600px', overflowY: 'auto' }}
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
              <div className="bg-gradient-to-r from-[#E31E24] to-[#b9151a] p-4 hidden lg:block">
                <motion.h2 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl md:text-2xl font-bold text-white"
                >
                  ðŸŽ‰ Festival Special Offers! 
                  <span className="block text-lg font-normal text-white/90 mt-1">
                    Save up to 50% on fresh groceries & more
                  </span>
                </motion.h2>
              </div>

              <div className="p-0 lg:p-4 bg-gray-50 lg:bg-white">
                {banners.length > 0 && <HeroBanner banners={banners} />}
              </div>

              {/* Offer Slider - Grocery & Spice */}
              <div className="p-4 lg:p-6 bg-white">
                <OfferSlider />
              </div>

              {/* Quick Category Cards */}
              <div className="bg-white p-4 lg:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {[
                  ].map((cat) => (
                    <Link key={cat.slug} to={`/category/${cat.slug}`} className="group">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
                      >
                        <img 
                          src={cat.image} 
                          alt={cat.name} 
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-[#fec400] py-2 px-4">
                          <h3 className="text-black font-bold text-center">
                            {t('language') === 'bn' ? cat.nameBn : cat.name}
                          </h3>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12 space-y-8 mt-8">
        {/* Shop By Category Section */}
        <ShopByCategory />

        {/* Feature Cards Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: Truck, title: '60 Mins Delivery', desc: 'Free shipping over à§³1000', color: 'from-red-50 to-red-100' },
            { icon: Shield, title: 'Authorized Products', desc: '100% Authentic', color: 'from-blue-50 to-blue-100' },
            { icon: Clock, title: 'Customer Support', desc: '8am - 10pm', color: 'from-green-50 to-green-100' },
            { icon: CreditCard, title: 'Flexible Payments', desc: 'Credit Cards & Mobile Banking', color: 'from-purple-50 to-purple-100' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${feature.color} rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all hover:-translate-y-2`}
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <feature.icon className="h-8 w-8 text-[#E31E24]" />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* RECOMMENDED FOR YOU */}
        <CategorySection
          title="RECOMMENDED FOR YOU"
          titleBn="à¦†à¦ªà¦¨à¦¾à¦° à¦œà¦¨à§à¦¯ à¦¸à§à¦ªà¦¾à¦°à¦¿à¦¶à¦•à§ƒà¦¤"
          products={productsByCategory.recommended}
          viewAllLink="/category/recommended"
          bgColor="bg-white"
        />

        {/* SWEET MOMENTS, CHOCOLATE MEMORIES */}
        <CategorySection
          title="SWEET MOMENTS, CHOCOLATE MEMORIES"
          titleBn="à¦®à¦¿à¦·à§à¦Ÿà¦¿ à¦®à§à¦¹à§‚à¦°à§à¦¤, à¦šà¦•à¦²à§‡à¦Ÿ à¦¸à§à¦®à§ƒà¦¤à¦¿"
          emoji="ðŸ«"
          products={productsByCategory.chocolate}
          viewAllLink="/category/chocolate"
          bgColor="from-pink-50 to-rose-50"
          gradient={true}
        />

        {/* HOT & TRENDING RIGHT NOW */}
        <CategorySection
          title="HOT & TRENDING RIGHT NOW"
          titleBn="à¦œà¦¨à¦ªà§à¦°à¦¿à¦¯à¦¼ à¦ªà¦£à§à¦¯"
          emoji="ðŸ”¥"
          products={productsByCategory.trending}
          viewAllLink="/category/trending"
          bgColor="bg-white"
        />

        {/* BREAD & MORE */}
        <CategorySection
          title="BREAD & MORE"
          titleBn="à¦¬à§à¦°à§‡à¦¡ à¦à¦¬à¦‚ à¦†à¦°à¦“"
          emoji="ðŸž"
          products={productsByCategory.bread}
          viewAllLink="/category/bread"
          bgColor="from-amber-50 to-yellow-50"
          gradient={true}
        />

        {/* UNILEVER WEEK - MEGA SALE */}
        <section className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-2xl p-8 shadow-2xl border-4 border-yellow-400">
          <div className="flex items-center justify-between mb-6">
            <div>
              <motion.h2 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-3xl md:text-4xl font-extrabold text-white uppercase drop-shadow-lg"
              >
                {t('language') === 'bn' ? 'à¦‡à¦‰à¦¨à¦¿à¦²à¦¿à¦­à¦¾à¦° à¦®à§‡à¦²à¦¾' : 'UNILEVER MEGA SALE'} ðŸ”¥
              </motion.h2>
              <p className="text-xl md:text-2xl font-bold text-yellow-300 mt-2 drop-shadow">
                {t('language') === 'bn' ? 'à§®à§¦% à¦ªà¦°à§à¦¯à¦¨à§à¦¤ à¦›à¦¾à¦¡à¦¼' : 'UP TO 80% OFF'}
              </p>
              <p className="text-sm md:text-base text-white/90 mt-2 font-semibold">
                {t('language') === 'bn' 
                  ? 'à§§à§¦à§¦à§¦ à¦Ÿà¦¾à¦•à¦¾à¦° à¦‰à¦ªà¦°à§‡ à§§à§¦à§¦ à¦Ÿà¦¾à¦•à¦¾ à¦­à¦¾à¦‰à¦šà¦¾à¦° - VOUCHER: UBL100' 
                  : 'à§³100 Voucher on à§³1000+ - VOUCHER: UBL100'}
              </p>
            </div>
            <Link to="/category/home-cleaning" className="text-white hover:text-yellow-300 flex items-center gap-2 bg-white/20 backdrop-blur px-6 py-3 rounded-full font-bold text-sm md:text-base transition-all hover:bg-white/30 hover:scale-105">
              {t('viewAll')} <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {productsByCategory.cleaning.map((product, i) => (
              <motion.div
                key={product._id || i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <CategorySection products={[product]} maxProducts={1} bgColor="bg-transparent" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* WEEKDAY DEALS with Timer */}
        <section className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 shadow-lg border-2 border-orange-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 uppercase">Weekday Deals!!!</h2>
            {/* Timer */}
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
          <CategorySection products={productsByCategory.cooking} maxProducts={5} bgColor="bg-transparent" />
        </section>

        {/* EVERYDAY CLEANING ESSENTIALS */}
        <CategorySection
          title="EVERYDAY CLEANING ESSENTIALS"
          titleBn="à¦ªà§à¦°à¦¤à¦¿à¦¦à¦¿à¦¨à§‡à¦° à¦ªà¦°à¦¿à¦·à§à¦•à¦¾à¦°à§‡à¦° à¦œà¦¿à¦¨à¦¿à¦¸"
          emoji="ðŸ§¹"
          products={productsByCategory.cleaning}
          viewAllLink="/category/cleaning"
          bgColor="from-blue-50 to-indigo-50"
          gradient={true}
        />

        {/* SNACKS, NOODLES & MORE */}
        <CategorySection
          title="SNACKS, NOODLES & MORE"
          titleBn="à¦¸à§à¦¨à§à¦¯à¦¾à¦•à¦¸, à¦¨à§à¦¡à¦²à¦¸ à¦à¦¬à¦‚ à¦†à¦°à¦“"
          emoji="ðŸœ"
          products={productsByCategory.snacks}
          viewAllLink="/category/snacks"
          bgColor="bg-white"
        />

        {/* TODAY'S FEATURED FINDS (Dark Section) */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white uppercase flex items-center gap-2">
              <span className="text-3xl">âœ¨</span>
              Today's Featured Finds
            </h2>
            <Link to="/featured" className="text-sm font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {productsByCategory.featured.map((product, i) => (
              <motion.div
                key={product._id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CategorySection products={[product]} maxProducts={1} bgColor="bg-white" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* SPICE UP YOUR COOKING GAME */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white uppercase">ðŸŒ¶ï¸ Spice Up Your Cooking Game</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {productsByCategory.spices.map((product, i) => (
              <motion.div
                key={product._id || i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <CategorySection products={[product]} maxProducts={1} bgColor="bg-white" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* HAPPY HOUR - COMFORT FOR BABY */}
        {productsByCategory.baby.length > 0 && (
          <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg border-2 border-purple-300">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 uppercase flex items-center gap-3">
                  <span className="text-3xl">â°</span> Happy Hour - Comfort for Baby
                </h2>
              </div>
            </div>
            <FeaturedCarousel products={productsByCategory.baby} />
          </section>
        )}

        {/* FRESH VEGETABLES */}
        <CategorySection
          title="FRESH VEGETABLES"
          titleBn="à¦¤à¦¾à¦œà¦¾ à¦¸à¦¬à¦œà¦¿"
          emoji="ðŸ¥¬"
          products={productsByCategory.vegetables}
          viewAllLink="/category/fresh-vegetables"
          bgColor="from-green-50 to-emerald-50"
          gradient={true}
          maxProducts={8}
        />

        {/* BEVERAGES */}
        <CategorySection
          title="BEVERAGES"
          titleBn="à¦ªà¦¾à¦¨à§€à¦¯à¦¼"
          emoji="ðŸ¥¤"
          products={productsByCategory.beverages}
          viewAllLink="/category/beverages"
          bgColor="from-cyan-50 to-blue-50"
          gradient={true}
        />

        {/* FROZEN FOODS */}
        {productsByCategory.frozen.length > 0 && (
          <CategorySection
            title="FROZEN FOODS"
            titleBn="à¦¹à¦¿à¦®à¦¾à¦¯à¦¼à¦¿à¦¤ à¦–à¦¾à¦¬à¦¾à¦°"
            emoji="ðŸ§Š"
            products={productsByCategory.frozen}
            viewAllLink="/category/frozen-foods"
            bgColor="from-blue-100 to-indigo-100"
            gradient={true}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
