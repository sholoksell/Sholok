import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Tag, Clock, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

function CountdownTimer({ endDate }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) return setTime({ d: 0, h: 0, m: 0, s: 0 });
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  const pad = n => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-1">
      {time.d > 0 && <><span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded font-bold text-sm">{time.d}d</span><span className="text-yellow-200 font-bold">:</span></>}
      <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded font-bold text-sm">{pad(time.h)}</span>
      <span className="text-yellow-200 font-bold">:</span>
      <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded font-bold text-sm">{pad(time.m)}</span>
      <span className="text-yellow-200 font-bold">:</span>
      <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded font-bold text-sm">{pad(time.s)}</span>
    </div>
  );
}

function ProductCard({ product, discountType, discountValue }) {
  const base = Number(product.sale_price || product.regular_price);
  let price = base;
  if (discountType === 'percentage' && discountValue > 0) price = base * (1 - discountValue / 100);
  else if (discountType === 'fixed' && discountValue > 0) price = base - discountValue;
  price = Math.max(0, Math.round(price));
  const hasDiscount = price < base;
  const pct = hasDiscount ? Math.round((1 - price / base) * 100) : 0;

  return (
    <Link to={`/product/${product.slug}`} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img src={product.thumbnail || '/placeholder.png'} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = '/placeholder.png'; }} />
        {pct > 0 && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            -{pct}%
          </span>
        )}
        <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
          ☀️ FEST
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-orange-500 transition-colors">{product.name}</h3>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="font-bold text-gray-900">৳{price.toLocaleString()}</span>
          {hasDiscount && <span className="text-xs text-gray-400 line-through">৳{base.toLocaleString()}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function SummerFestPage() {
  const [campaign, setCampaign] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/campaigns/active', { params: { type: 'summer_fest' } })
      .then(r => {
        const camps = Array.isArray(r.data) ? r.data : [];
        if (camps.length > 0) {
          setCampaign(camps[0]);
          return api.get(`/campaigns/${camps[0].id}/products`);
        }
        return null;
      })
      .then(r => { if (r) setProducts(r.data?.products || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <Sun className="w-16 h-16 text-yellow-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">No Active Summer Fest</h1>
        <p className="text-gray-500 mb-6">Summer Fest deals are coming soon. Stay tuned!</p>
        <Link to="/" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-orange-500 to-yellow-400 overflow-hidden">
        {campaign.image && (
          <img src={campaign.image} alt={campaign.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="relative container mx-auto px-4 py-16 text-center text-white">
          <div className="flex justify-center mb-4">
            <Sun className="w-16 h-16 text-yellow-200 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">{campaign.name}</h1>
          {campaign.description && <p className="text-lg text-orange-100 max-w-xl mx-auto mb-6">{campaign.description}</p>}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {campaign.discountType !== 'none' && (
              <div className="bg-white/20 backdrop-blur rounded-xl px-5 py-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="font-bold">
                  {campaign.discountType === 'percentage' ? `${campaign.discountValue}% OFF` : `৳${campaign.discountValue} OFF`}
                </span>
              </div>
            )}
            {campaign.couponCode && (
              <div className="bg-white text-orange-600 rounded-xl px-5 py-2 font-bold text-sm border-2 border-orange-200">
                Code: {campaign.couponCode}
              </div>
            )}
            {campaign.endDate && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-200" />
                <CountdownTimer endDate={campaign.endDate} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Sun className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-800">Summer Fest Deals</h2>
          {products.length > 0 && <span className="text-sm text-gray-400">({products.length} products)</span>}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Sun className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Products coming soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(p => (
              <ProductCard key={p.id} product={p} discountType={campaign.discountType} discountValue={campaign.discountValue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
