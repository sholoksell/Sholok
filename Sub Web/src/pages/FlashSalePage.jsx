import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock } from 'lucide-react';
import api from '@/lib/axios';
import { useFeatureBanner } from '@/hooks/useFeatureBanner';

function CountdownTimer({ endDate }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const update = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) return setTime({ h: 0, m: 0, s: 0 });
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ h, m, s });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return (
    <div className="flex items-center gap-1 text-white font-mono text-sm">
      <span className="bg-red-700 px-2 py-0.5 rounded">
        {String(time.h).padStart(2, '0')}
      </span>
      :
      <span className="bg-red-700 px-2 py-0.5 rounded">
        {String(time.m).padStart(2, '0')}
      </span>
      :
      <span className="bg-red-700 px-2 py-0.5 rounded">
        {String(time.s).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function FlashSalePage() {
  const featureBanner = useFeatureBanner('flash_sales');
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeSale, setActiveSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/marketing/flash-sales/active'),
      api.get('/marketing/flash-sale-products/active'),
    ])
      .then(([salesRes, productsRes]) => {
        const s = salesRes.data || [];
        setSales(Array.isArray(s) ? s : []);
        setProducts(productsRes.data?.products || []);
        if (Array.isArray(s) && s.length > 0) setActiveSale(s[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {featureBanner?.image && (
        <div className="w-full h-44 sm:h-56 overflow-hidden">
          <img src={featureBanner.image} alt={featureBanner.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
        </div>
      )}
      <div className="container mx-auto px-4 py-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Zap size={28} className="text-yellow-300" />
          <h1 className="text-2xl font-bold">Flash Sales</h1>
        </div>
        <p className="text-red-100 text-sm mb-4">
          Limited time deals — grab them before they&apos;re gone!
        </p>
        {activeSale && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-red-100">Ends in:</span>
            <CountdownTimer endDate={activeSale.end_date} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Zap size={48} className="mx-auto text-gray-300 mb-3" />
          <h2 className="text-lg font-semibold text-gray-600">No flash sales right now</h2>
          <p className="text-sm text-gray-400 mt-1">Check back soon for amazing deals!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const discount = Math.round(
              (1 - product.flash_price / product.regular_price) * 100
            );
            return (
              <Link
                key={product.product_id}
                to={`/product/${product.slug}`}
                className="group"
              >
                <div className="bg-white border-2 border-red-100 rounded-xl overflow-hidden hover:border-red-400 hover:shadow-md transition-all">
                  <div className="relative aspect-square bg-gray-50">
                    <img
                      src={product.thumbnail || '/placeholder.png'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      -{discount}%
                    </div>
                    {product.flash_end && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <CountdownTimer endDate={product.flash_end} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <span className="font-bold text-red-600">
                        ৳{product.flash_price?.toFixed(0)}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        ৳{product.regular_price.toLocaleString()}
                      </span>
                    </div>
                    {product.flash_sale_title && (
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        {product.flash_sale_title}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
