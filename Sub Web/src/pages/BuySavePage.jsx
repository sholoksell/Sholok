import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Loader2, TrendingDown } from 'lucide-react';
import api from '@/lib/axios';
import { useFeatureBanner } from '@/hooks/useFeatureBanner';

function computeTierDiscount(price, qty, tiers) {
  if (!tiers || !tiers.length) return { price, label: null, pct: 0 };
  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
  const match = sorted.find(t => qty >= t.minQty);
  if (!match) return { price, label: null, pct: 0 };
  let discounted = price;
  if (match.discountType === 'percentage') discounted = price * (1 - match.discountValue / 100);
  else if (match.discountType === 'fixed') discounted = price - match.discountValue;
  discounted = Math.max(0, Math.round(discounted));
  const pct = Math.round((1 - discounted / price) * 100);
  return { price: discounted, label: match.label || `${match.discountValue}${match.discountType === 'percentage' ? '%' : '৳'} off`, pct };
}

function TierBadges({ tiers }) {
  if (!tiers || !tiers.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {[...tiers].sort((a, b) => a.minQty - b.minQty).map((t, i) => (
        <span key={i} className="bg-green-50 border border-green-200 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
          {t.label || `Buy ${t.minQty}+`}: {t.discountValue}{t.discountType === 'percentage' ? '%' : '৳'} off
        </span>
      ))}
    </div>
  );
}

function ProductCard({ product, tiers }) {
  const [qty, setQty] = useState(1);
  const base = Number(product.sale_price || product.regular_price);
  const { price, label, pct } = computeTierDiscount(base, qty, tiers);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img src={product.thumbnail || '/placeholder.png'} alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.src = '/placeholder.png'; }} />
          {pct > 0 && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              Save {pct}%
            </span>
          )}
        </div>
      </Link>
      <div className="p-3">
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-green-600 transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="font-bold text-gray-900">৳{price.toLocaleString()}</span>
          {pct > 0 && <span className="text-xs text-gray-400 line-through">৳{base.toLocaleString()}</span>}
          {label && <span className="text-xs text-green-600 font-medium">({label})</span>}
        </div>
        {tiers && tiers.length > 0 && (
          <div className="mt-2">
            <label className="text-xs text-gray-500">Preview qty:</label>
            <div className="flex items-center gap-2 mt-1">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-6 h-6 rounded border text-gray-600 hover:bg-gray-100 text-sm font-bold flex items-center justify-center">-</button>
              <span className="text-sm font-medium w-6 text-center">{qty}</span>
              <button onClick={() => setQty(q => q + 1)}
                className="w-6 h-6 rounded border text-gray-600 hover:bg-gray-100 text-sm font-bold flex items-center justify-center">+</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuySavePage() {
  const featureBanner = useFeatureBanner('buy_save');
  const [campaign, setCampaign] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/campaigns/active', { params: { type: 'buy_save' } })
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
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  const tiers = campaign?.tiers || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Feature Banner (Place 2 — admin managed) */}
      {featureBanner?.image && (
        <div className="w-full h-44 sm:h-56 overflow-hidden">
          <img src={featureBanner.image} alt={featureBanner.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
        </div>
      )}
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-teal-500 text-white py-14">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-3">
            <TrendingDown className="w-14 h-14 text-green-200" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            {campaign?.name || 'Buy & Save More'}
          </h1>
          <p className="text-green-100 text-lg max-w-lg mx-auto mb-6">
            {campaign?.description || 'Buy more, save more! The more you buy, the bigger your discount.'}
          </p>
          {tiers.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {[...tiers].sort((a, b) => a.minQty - b.minQty).map((tier, i) => (
                <div key={i} className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
                  <div className="text-xs text-green-200 font-medium">Buy {tier.minQty}+</div>
                  <div className="text-lg font-extrabold">
                    {tier.discountValue}{tier.discountType === 'percentage' ? '%' : '৳'} OFF
                  </div>
                  {tier.label && <div className="text-xs text-green-100">{tier.label}</div>}
                </div>
              ))}
            </div>
          )}
          {campaign?.couponCode && (
            <div className="mt-4">
              <span className="bg-white text-green-700 px-4 py-1.5 rounded-full text-sm font-bold border-2 border-green-200">
                Code: {campaign.couponCode}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingBag className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Buy More & Save More</h2>
          {products.length > 0 && <span className="text-sm text-gray-400">({products.length} products)</span>}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            {campaign ? (
              <>
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Products coming soon</p>
              </>
            ) : (
              <>
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">No Active Buy & Save Campaign</h2>
                <p className="text-gray-500 mb-6">Check back soon for quantity discount deals!</p>
                <Link to="/" className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  Back to Home
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            {tiers.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-green-800 mb-2">Savings Tiers — adjust quantity in each card to preview your savings:</h3>
                <TierBadges tiers={tiers} />
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map(p => (
                <ProductCard key={p.id} product={p} tiers={tiers} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
