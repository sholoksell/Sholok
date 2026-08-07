import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Sparkles, Clock, Star } from 'lucide-react';
import api from '@/lib/axios';

function ProductRow({ title, icon: Icon, products, loading, color = 'text-primary', bgColor = 'bg-primary/10' }) {
  if (loading) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-40 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="w-40 h-52 bg-gray-100 rounded-xl shrink-0 animate-pulse" />
            ))}
        </div>
      </section>
    );
  }

  if (!products?.length) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-1.5 rounded-lg ${bgColor}`}>
          <Icon size={18} className={color} />
        </div>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {products.map((p) => (
          <Link
            key={p.id || p.product_id}
            to={`/product/${p.slug}`}
            className="group shrink-0"
          >
            <div className="w-40 bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-36 bg-gray-50 overflow-hidden">
                <img
                  src={p.thumbnail || '/placeholder.png'}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                  }}
                />
              </div>
              <div className="p-2.5">
                <h3 className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  ৳{(p.sale_price || p.regular_price)?.toLocaleString()}
                </p>
                {p.on_sale && <span className="text-xs text-red-500">On Sale</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function DiscoveryFeedPage() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({
    trending: true,
    newArrivals: true,
    bestSellers: true,
    forYou: true,
  });

  const customerId = (() => {
    try {
      return JSON.parse(localStorage.getItem('customer'))?.id;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    api
      .get('/recommendations/trending')
      .then((r) => {
        setData((d) => ({ ...d, trending: r.data.products }));
        setLoading((l) => ({ ...l, trending: false }));
      })
      .catch(() => setLoading((l) => ({ ...l, trending: false })));

    api
      .get('/recommendations/new-arrivals')
      .then((r) => {
        setData((d) => ({ ...d, newArrivals: r.data.products }));
        setLoading((l) => ({ ...l, newArrivals: false }));
      })
      .catch(() => setLoading((l) => ({ ...l, newArrivals: false })));

    api
      .get('/recommendations/best-sellers')
      .then((r) => {
        setData((d) => ({ ...d, bestSellers: r.data.products }));
        setLoading((l) => ({ ...l, bestSellers: false }));
      })
      .catch(() => setLoading((l) => ({ ...l, bestSellers: false })));

    const params = customerId ? { customerId } : {};
    api
      .get('/recommendations/for-you', { params })
      .then((r) => {
        setData((d) => ({ ...d, forYou: r.data.products }));
        setLoading((l) => ({ ...l, forYou: false }));
      })
      .catch(() => setLoading((l) => ({ ...l, forYou: false })));
  }, [customerId]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Discover</h1>
        <p className="text-gray-500 text-sm mt-1">Personalized picks just for you</p>
      </div>

      <ProductRow
        title="Trending Now"
        icon={TrendingUp}
        products={data.trending}
        loading={loading.trending}
        color="text-orange-500"
        bgColor="bg-orange-50"
      />
      <ProductRow
        title="For You"
        icon={Sparkles}
        products={data.forYou}
        loading={loading.forYou}
        color="text-purple-500"
        bgColor="bg-purple-50"
      />
      <ProductRow
        title="New Arrivals"
        icon={Clock}
        products={data.newArrivals}
        loading={loading.newArrivals}
        color="text-blue-500"
        bgColor="bg-blue-50"
      />
      <ProductRow
        title="Best Sellers"
        icon={Star}
        products={data.bestSellers}
        loading={loading.bestSellers}
        color="text-yellow-500"
        bgColor="bg-yellow-50"
      />
    </div>
  );
}
