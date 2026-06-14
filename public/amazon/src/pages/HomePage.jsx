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
import { Link } from 'react-router-dom';

// ── Small deal card used in Today's Deals section ─────────────
const DealCard = ({ product }) => (
  <Link
    to={`/product/${product.id}`}
    className="group bg-white border border-transparent hover:border-amazon-border hover:shadow-amazon transition-all rounded p-2 flex flex-col items-center text-center"
  >
    <div className="w-full aspect-square bg-[#F7F8F8] rounded mb-2 overflow-hidden flex items-center justify-center">
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        onError={(e) => { e.target.src = `https://placehold.co/300x300/EAEDED/565959?text=${encodeURIComponent(product.brand)}`; }}
      />
    </div>
    <p className="text-amazon-red font-bold text-sm">Up to {product.discount}% off</p>
    <p className="text-amazon-dark text-xs line-clamp-2 mt-0.5">{product.title.slice(0, 50)}</p>
    <div className="mt-1 flex items-center gap-1">
      <span className="text-amazon-orange text-xs font-bold">Prime</span>
      <span className="text-amazon-text-gray text-xs">&</span>
      <span className="text-amazon-dark text-xs">FREE delivery</span>
    </div>
  </Link>
);

// ── Category browse tiles ─────────────────────────────────────
const CategoryGrid = () => (
  <section className="bg-white rounded shadow-amazon p-4">
    <h2 className="text-xl font-bold text-amazon-dark mb-4">Shop by Category</h2>
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

// ── Mini deals banner ─────────────────────────────────────────
const DealsBanner = ({ products: deals }) => (
  <section className="bg-white rounded shadow-amazon p-4">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl font-bold text-amazon-dark">
        Today's Deals
        <span className="ml-2 text-xs font-normal text-amazon-text-gray">
          — Limited time offers
        </span>
      </h2>
      <Link to="/search?tag=deals" className="see-more-link">See all deals →</Link>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {deals.slice(0, 6).map((p) => (
        <DealCard key={p.id} product={p} />
      ))}
    </div>
  </section>
);

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
  const fallback = (text) => `https://placehold.co/300x300/EAEDED/565959?text=${encodeURIComponent(text)}`;

  const cards = [
    {
      title: 'Most-loved travel essentials',
      type: 'travel',
      shopLabel: 'Discover more',
      shopLink: '/search?q=travel',
    },
    {
      title: 'Shop Fashion for less',
      type: 'grid',
      items: [
        { label: 'Tops & Tees',  product: fashion[0] },
        { label: 'Bottoms',      product: fashion[1] },
        { label: 'Dresses',      product: fashion[2] },
        { label: 'Footwear',     product: fashion[3] },
      ],
      shopLabel: 'See all fashion',
      shopLink: '/search?category=Fashion',
    },
    {
      title: 'Home & Kitchen Deals',
      type: 'grid',
      items: [
        { label: 'Kitchen',   product: homeKitchen[0] },
        { label: 'Dining',    product: homeKitchen[1] },
        { label: 'Décor',     product: homeKitchen[2] },
        { label: 'Bedding',   product: homeKitchen[3] },
      ],
      shopLabel: 'Shop Home & Kitchen',
      shopLink: '/search?category=Home+%26+Kitchen',
    },
    {
      title: 'Beauty & Wellness',
      type: 'grid',
      items: [
        { label: 'Skincare',  product: beauty[0] },
        { label: 'Haircare',  product: beauty[1] },
        { label: 'Makeup',    product: beauty[2] },
        { label: 'Wellness',  product: beauty[3] },
      ],
      shopLabel: 'Shop Beauty',
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
          title="Best Sellers"
          products={bestSellers}
          seeMoreLink="/search?tag=bestsellers"
          cols={6}
          badge="🔥 Hot"
        />

        {/* Promo Cards */}
        <PromoCards
          fashion={fashion}
          homeKitchen={homeKitchen}
          beauty={beauty}
        />

        {/* Electronics */}
        <ProductSlider
          title="Electronics — Top Picks"
          products={electronics}
          seeMoreLink="/search?category=Electronics"
        />

        {/* Gaming */}
        <ProductSection
          title="Gaming Universe"
          products={gaming}
          seeMoreLink="/search?category=Gaming"
          cols={6}
        />

        {/* Fashion */}
        <ProductSlider
          title="Fashion Favourites"
          products={fashion}
          seeMoreLink="/search?category=Fashion"
        />

        {/* Home & Kitchen */}
        <ProductSection
          title="Home & Kitchen Essentials"
          products={homeKitchen}
          seeMoreLink="/search?category=Home"
          cols={5}
        />

        {/* Beauty */}
        <ProductSection
          title="Beauty & Personal Care"
          products={beauty}
          seeMoreLink="/search?category=Beauty"
          cols={5}
        />

        {/* Sports */}
        <ProductSlider
          title="Sports & Outdoors"
          products={sports}
          seeMoreLink="/search?category=Sports"
        />

        {/* Featured / Recommended */}
        <ProductSlider
          title="Recommended For You"
          products={featured}
          seeMoreLink="/search"
        />

        {/* Recently viewed / browsing history */}
        <ProductSection
          title="Inspired by Your Browsing"
          products={recentlyViewed}
          seeMoreLink="/search"
          cols={6}
        />

      </div>
    </main>
  );
};

export default HomePage;
