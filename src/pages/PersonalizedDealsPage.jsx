import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Star, Tag, TrendingUp, Store, Zap, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';

function DealCard({ product, badge, badgeColor = 'bg-red-500' }) {
  const price = product.sale_price || product.flash_price || product.regular_price;
  const originalPrice = product.regular_price;
  const discount = originalPrice && price < originalPrice
    ? Math.round((1 - price / originalPrice) * 100)
    : null;

  return (
    <Link to={`/product/${product.slug}`} className="group">
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={product.thumbnail || '/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.src = '/placeholder.png'; }}
          />
          {badge && (
            <span className={`absolute top-2 left-2 ${badgeColor} text-white text-xs font-bold px-2 py-0.5 rounded`}>
              {badge}
            </span>
          )}
          {discount && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              -{discount}%
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.store_name && (
            <p className="text-xs text-gray-400 mt-0.5">{product.store_name}</p>
          )}
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-bold text-gray-900">৳{Number(price).toLocaleString()}</span>
            {discount && (
              <span className="text-xs text-gray-400 line-through">৳{Number(originalPrice).toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, color = 'text-primary', bgColor = 'bg-primary/10', action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${bgColor}`}>
          <Icon size={18} className={color} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export default function PersonalizedDealsPage() {
  const { customer, isAuthenticated } = useAuth();
  const [deals, setDeals] = useState({
    recentlyViewed: [],
    flashProducts: [],
    categoryDeals: [],
    vendorDeals: [],
    forYou: [],
    trending: [],
  });
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);

  const sessionId = (() => {
    let id = localStorage.getItem('session_id');
    if (!id) { id = Math.random().toString(36).substr(2, 12); localStorage.setItem('session_id', id); }
    return id;
  })();

  useEffect(() => {
    const customerId = customer?.id;

    Promise.allSettled([
      // Recently viewed
      api.get('/recommendations/recently-viewed', { params: { customerId, sessionId, limit: 8 } }),
      // Flash sale products
      api.get('/marketing/flash-sale-products/active'),
      // Personalized recommendations
      api.get('/recommendations/for-you', { params: { customerId, limit: 12 } }),
      // Trending
      api.get('/recommendations/trending', { params: { limit: 8 } }),
      // Active coupons (public endpoint)
      api.get('/marketing/coupons/active', { params: { limit: 6 } }),
    ]).then(([recentRes, flashRes, forYouRes, trendingRes, couponsRes]) => {
      setDeals(prev => ({
        ...prev,
        recentlyViewed: recentRes.status === 'fulfilled' ? (recentRes.value.data?.products || []) : [],
        flashProducts: flashRes.status === 'fulfilled' ? (flashRes.value.data?.products?.slice(0, 8) || []) : [],
        forYou: forYouRes.status === 'fulfilled' ? (forYouRes.value.data?.products || []) : [],
        trending: trendingRes.status === 'fulfilled' ? (trendingRes.value.data?.products || []) : [],
      }));
      if (couponsRes.status === 'fulfilled') {
        setCoupons(couponsRes.value.data?.coupons || []);
      }
    }).finally(() => setLoading(false));
  }, [customer?.id]);

  const SkeletonGrid = ({ count = 4 }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="h-56 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center gap-3">
          <Gift size={32} className="text-yellow-300" />
          <div>
            <h1 className="text-2xl font-bold">Your Personalized Deals</h1>
            <p className="text-purple-100 text-sm mt-0.5">
              {isAuthenticated ? `Deals picked just for you, ${customer?.name?.split(' ')[0]}` : 'Sign in for even more personalized deals'}
            </p>
          </div>
        </div>
      </div>

      {/* Coupons Banner */}
      {coupons.length > 0 && (
        <section className="mb-8">
          <SectionHeader
            icon={Tag}
            title="Active Coupons"
            subtitle="Apply at checkout"
            color="text-green-600"
            bgColor="bg-green-50"
            action={<Link to="/offers" className="text-sm text-primary hover:underline">View all →</Link>}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {coupons.slice(0, 6).map(coupon => (
              <div key={coupon.id} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{coupon.description || 'Discount Coupon'}</p>
                    <div className="text-lg font-bold text-green-700 font-mono tracking-wider">{coupon.code}</div>
                    <p className="text-xs text-gray-600 mt-1">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}% off`
                        : `৳${coupon.discount_value} off`}
                      {coupon.min_purchase_amount > 0 ? ` on ৳${coupon.min_purchase_amount}+` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(coupon.code).catch(() => {}); }}
                    className="text-xs bg-green-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-green-700 transition-colors shrink-0"
                  >
                    Copy
                  </button>
                </div>
                {coupon.end_date && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Clock size={10} />
                    Expires {new Date(coupon.end_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Flash Deals */}
      {(loading || deals.flashProducts.length > 0) && (
        <section className="mb-8">
          <SectionHeader
            icon={Zap}
            title="Flash Deals"
            subtitle="Limited time offers"
            color="text-red-600"
            bgColor="bg-red-50"
            action={<Link to="/flash-sales" className="text-sm text-red-600 hover:underline font-medium">View all →</Link>}
          />
          {loading ? <SkeletonGrid /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {deals.flashProducts.map(p => (
                <DealCard key={p.product_id || p.id} product={{ ...p, id: p.product_id }} badge="FLASH" badgeColor="bg-red-500" />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Recently Viewed */}
      {(loading || deals.recentlyViewed.length > 0) && (
        <section className="mb-8">
          <SectionHeader
            icon={Clock}
            title="Recently Viewed"
            subtitle="Continue where you left off"
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          {loading ? <SkeletonGrid /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {deals.recentlyViewed.map(p => (
                <DealCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* For You */}
      {(loading || deals.forYou.length > 0) && (
        <section className="mb-8">
          <SectionHeader
            icon={Star}
            title="Recommended For You"
            subtitle={isAuthenticated ? 'Based on your shopping history' : 'Popular picks'}
            color="text-purple-600"
            bgColor="bg-purple-50"
            action={<Link to="/discover" className="text-sm text-primary hover:underline">Discover more →</Link>}
          />
          {loading ? <SkeletonGrid count={8} /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {deals.forYou.map(p => (
                <DealCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Trending */}
      {(loading || deals.trending.length > 0) && (
        <section className="mb-8">
          <SectionHeader
            icon={TrendingUp}
            title="Trending Right Now"
            subtitle="What everyone's buying"
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
          {loading ? <SkeletonGrid /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {deals.trending.map(p => (
                <DealCard key={p.id} product={p} badge="🔥 HOT" badgeColor="bg-orange-500" />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Guest CTA */}
      {!isAuthenticated && (
        <div className="mt-8 bg-gradient-to-r from-primary/5 to-purple-50 border border-primary/20 rounded-2xl p-6 text-center">
          <Gift size={40} className="mx-auto text-primary mb-3" />
          <h3 className="text-lg font-bold text-gray-800">Get More Personalized Deals</h3>
          <p className="text-gray-500 text-sm mt-1 mb-4">Sign in to unlock deals tailored to your taste</p>
          <Link to="/login" className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
