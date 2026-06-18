import React, { useMemo } from 'react';
import HeroCarousel from '../components/Hero/HeroCarousel';
import ProductSection from '../components/Product/ProductSection';
import ProductSlider from '../components/Product/ProductSlider';
import {
  products,
  getBestSellers,
  getTodaysDeals,
  getProductsByCategory,
  getFeaturedProducts,
} from '../data/products';
import { categories } from '../data/categories';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

// ── Small deal card used in Today's Deals section ─────────────
const DealCard = ({ product }) => {
  const { t, getLocalizedField } = useLanguage();
  const title = getLocalizedField(product, 'title');
  return (
  <Link
    to={`/product/${product.id}`}
    className="group bg-white border border-transparent hover:border-amazon-border hover:shadow-amazon transition-all rounded p-2 flex flex-col items-center text-center"
  >
    <div className="w-full aspect-square bg-[#F7F8F8] rounded mb-2 overflow-hidden flex items-center justify-center">
      <img
        src={product.image}
        alt={title}
        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        onError={(e) => { e.target.src = `https://placehold.co/300x300/EAEDED/565959?text=${encodeURIComponent(product.brand)}`; }}
      />
    </div>
    <p className="text-amazon-red font-bold text-sm">{t('upTo')} {product.discount}{t('off')}</p>
    <p className="text-amazon-dark text-xs line-clamp-2 mt-0.5">{title.slice(0, 50)}</p>
    <div className="mt-1 flex items-center gap-1">
      <span className="text-amazon-orange text-xs font-bold">{t('prime')}</span>
      <span className="text-amazon-text-gray text-xs">&</span>
      <span className="text-amazon-dark text-xs">{t('freeDelivery')}</span>
    </div>
  </Link>
  );
};

// ── Category browse tiles ─────────────────────────────────────
const CategoryGrid = () => {
  const { t } = useLanguage();
  return (
  <section className="bg-white rounded shadow-amazon p-4">
    <h2 className="text-xl font-bold text-amazon-dark mb-4">{t('shopByCategory')}</h2>
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to={`/search?category=${encodeURIComponent(cat.name)}`}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border border-amazon-border hover:border-amazon-orange hover:shadow-amazon transition-all group"
        >
          <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
          <span className="text-amazon-dark text-xs font-medium text-center leading-tight">{cat.name}</span>
        </Link>
      ))}
    </div>
  </section>
  );
};

// ── Mini deals banner ─────────────────────────────────────────
const DealsBanner = ({ products: deals }) => {
  const { t } = useLanguage();
  return (
  <section className="bg-white rounded shadow-amazon p-4">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl font-bold text-amazon-dark">
        {t('todaysDeals')}
        <span className="ml-2 text-xs font-normal text-amazon-text-gray">
          {t('limitedTimeOffers')}
        </span>
      </h2>
      <Link to="/search?tag=deals" className="see-more-link">{t('seeAllDeals')}</Link>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {deals.slice(0, 6).map((p) => (
        <DealCard key={p.id} product={p} />
      ))}
    </div>
  </section>
  );
};

// ── Promo Cards (Amazon-style 4-up) ──────────────────────────
const travelItems = [
  {
    label: 'Backpacks',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop&auto=format',
    link: '/search?q=backpack',
  },
  {
    label: 'Suitcases',
    image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=300&h=300&fit=crop&auto=format',
    link: '/search?q=suitcase',
  },
  {
    label: 'Accessories',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=300&h=300&fit=crop&auto=format',
    link: '/search?q=travel+accessories',
  },
  {
    label: 'Handbags',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop&auto=format',
    link: '/search?q=handbag',
  },
];

const PromoCards = ({ fashion, homeKitchen, beauty }) => {
  const { t } = useLanguage();
  const fallback = (text) => `https://placehold.co/300x300/EAEDED/565959?text=${encodeURIComponent(text)}`;

  const cards = [
    {
      title: t('travelEssentials'),
      type: 'travel',
      shopLabel: t('discoverMore'),
      shopLink: '/search?q=travel',
    },
    {
      title: t('shopFashionForLess'),
      type: 'grid',
      items: [
        { label: t('tops'),     product: fashion[0] },
        { label: t('bottoms'),  product: fashion[1] },
        { label: t('dresses'),  product: fashion[2] },
        { label: t('footwear'), product: fashion[3] },
      ],
      shopLabel: t('seeAllFashion'),
      shopLink: '/search?category=Fashion',
    },
    {
      title: t('homeKitchenDeals'),
      type: 'grid',
      items: [
        { label: t('kitchen'), product: homeKitchen[0] },
        { label: t('dining'),  product: homeKitchen[1] },
        { label: t('decor'),   product: homeKitchen[2] },
        { label: t('bedding'), product: homeKitchen[3] },
      ],
      shopLabel: t('shopHomeKitchen'),
      shopLink: '/search?category=Home+%26+Kitchen',
    },
    {
      title: t('beautyWellness'),
      type: 'grid',
      items: [
        { label: t('skincare'), product: beauty[0] },
        { label: t('haircare'), product: beauty[1] },
        { label: t('makeup'),   product: beauty[2] },
        { label: t('wellness'), product: beauty[3] },
      ],
      shopLabel: t('shopBeauty'),
      shopLink: '/search?category=Beauty',
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded shadow-amazon p-4 flex flex-col">
          {/* Title */}
          <h2 className="text-base font-bold text-amazon-dark mb-3 leading-tight">{card.title}</h2>

          {/* Travel 2×2 grid with static images */}
          {card.type === 'travel' && (
            <div className="grid grid-cols-2 gap-2 flex-1 mb-3">
              {travelItems.map(({ label, image, link }) => (
                <Link key={label} to={link} className="group flex flex-col">
                  <div className="bg-[#F7F8F8] rounded overflow-hidden aspect-square flex items-center justify-center mb-1">
                    <img
                      src={image}
                      alt={label}
                      onError={(e) => { e.target.src = fallback(label); }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-amazon-dark text-xs leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* 2×2 grid with product images */}
          {card.type === 'grid' && (
            <div className="grid grid-cols-2 gap-2 flex-1 mb-3">
              {card.items.map(({ label, product }) => (
                <Link
                  key={label}
                  to={product ? `/product/${product.id}` : card.shopLink}
                  className="group flex flex-col"
                >
                  <div className="bg-[#F7F8F8] rounded overflow-hidden aspect-square flex items-center justify-center mb-1">
                    <img
                      src={product?.image || fallback(label)}
                      alt={label}
                      onError={(e) => { e.target.src = fallback(label); }}
                      className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-amazon-dark text-xs leading-tight line-clamp-1">{label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Shop link */}
          <Link
            to={card.shopLink}
            className="text-amazon-blue text-sm hover:text-amazon-orange hover:underline transition-colors mt-auto"
          >
            {card.shopLabel} →
          </Link>
        </div>
      ))}
    </section>
  );
};

// ── Main HomePage ─────────────────────────────────────────────
const HomePage = () => {
  const { t } = useLanguage();
  const bestSellers    = useMemo(() => getBestSellers(12), []);
  const todaysDeals    = useMemo(() => getTodaysDeals(12), []);
  const electronics    = useMemo(() => getProductsByCategory('Electronics').slice(0, 12), []);
  const fashion        = useMemo(() => getProductsByCategory('Fashion').slice(0, 12), []);
  const gaming         = useMemo(() => getProductsByCategory('Gaming').slice(0, 12), []);
  const homeKitchen    = useMemo(() => getProductsByCategory('Home & Kitchen').slice(0, 10), []);
  const beauty         = useMemo(() => getProductsByCategory('Beauty').slice(0, 10), []);
  const sports         = useMemo(() => getProductsByCategory('Sports').slice(0, 10), []);
  const featured       = useMemo(() => getFeaturedProducts(20), []);
  const recentlyViewed = useMemo(() => products.slice(40, 52), []);

  return (
    <main className="min-h-screen">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Content wrapper */}
      <div className="max-w-[1800px] mx-auto px-2 sm:px-4 py-4 space-y-4">

        {/* Today's Deals */}
        <DealsBanner products={todaysDeals} />

        {/* Category Grid */}
        <CategoryGrid />

        {/* Best Sellers */}
        <ProductSection
          title={t('bestSellers')}
          products={bestSellers}
          seeMoreLink="/search?tag=bestsellers"
          cols={6}
          badge={t('hot')}
        />

        {/* Promo Cards */}
        <PromoCards
          fashion={fashion}
          homeKitchen={homeKitchen}
          beauty={beauty}
        />

        {/* Electronics */}
        <ProductSlider
          title={t('electronicsTopPicks')}
          products={electronics}
          seeMoreLink="/search?category=Electronics"
        />

        {/* Gaming */}
        <ProductSection
          title={t('gamingUniverse')}
          products={gaming}
          seeMoreLink="/search?category=Gaming"
          cols={6}
        />

        {/* Fashion */}
        <ProductSlider
          title={t('fashionFavourites')}
          products={fashion}
          seeMoreLink="/search?category=Fashion"
        />

        {/* Home & Kitchen */}
        <ProductSection
          title={t('homeKitchenEssentials')}
          products={homeKitchen}
          seeMoreLink="/search?category=Home"
          cols={5}
        />

        {/* Beauty */}
        <ProductSection
          title={t('beautyPersonalCare')}
          products={beauty}
          seeMoreLink="/search?category=Beauty"
          cols={5}
        />

        {/* Sports */}
        <ProductSlider
          title={t('sportsOutdoors')}
          products={sports}
          seeMoreLink="/search?category=Sports"
        />

        {/* Featured / Recommended */}
        <ProductSlider
          title={t('recommendedForYou')}
          products={featured}
          seeMoreLink="/search"
        />

        {/* Recently viewed / browsing history */}
        <ProductSection
          title={t('inspiredByBrowsing')}
          products={recentlyViewed}
          seeMoreLink="/search"
          cols={6}
        />

      </div>
    </main>
  );
};

export default HomePage;
