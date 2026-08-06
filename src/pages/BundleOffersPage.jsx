import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl, formatPrice } from '@/lib/utils';

const API_BASE = '/api';

const BADGE_STYLES = {
  bundle: 'bg-purple-100 text-purple-700 border-purple-200',
  bogo: 'bg-green-100 text-green-700 border-green-200',
  buy_x_get_y: 'bg-blue-100 text-blue-700 border-blue-200',
};

const TYPE_LABELS = {
  bundle: 'BUNDLE',
  bogo: 'BOGO',
  buy_x_get_y: 'BUY X GET Y',
};

const ProductThumbnail = ({ product, label }) => {
  if (!product) return null;
  return (
    <div className="flex flex-col items-center gap-1 min-w-0">
      <div className="w-14 h-14 rounded-lg border bg-white overflow-hidden flex-shrink-0">
        <img
          src={getImageUrl(product.thumbnail_url)}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
      {label && <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</span>}
      <span className="text-xs font-medium text-center line-clamp-2 max-w-[80px]">{product.name}</span>
      {product.price && (
        <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
      )}
    </div>
  );
};

const BundleCard = ({ offer }) => {
  const badgeClass = BADGE_STYLES[offer.offer_type] || BADGE_STYLES.bundle;
  const typeLabel = TYPE_LABELS[offer.offer_type] || offer.offer_type;

  const firstProductSlug =
    offer.buy_product?.slug ||
    (offer.bundle_products_detail?.[0]?.product?.slug) ||
    null;

  const renderDeal = () => {
    if (offer.offer_type === 'bogo' || offer.offer_type === 'buy_x_get_y') {
      const pct = parseFloat(offer.get_discount_percent) || 100;
      return (
        <div className="text-sm font-semibold text-green-700 bg-green-50 rounded-lg px-3 py-2 text-center">
          {pct === 100
            ? `Buy ${offer.buy_quantity > 1 ? offer.buy_quantity + 'x ' : ''}${offer.buy_product?.name || '…'}, Get ${offer.get_quantity > 1 ? offer.get_quantity + 'x ' : ''}${offer.get_product?.name || '…'} FREE`
            : `Buy ${offer.buy_quantity > 1 ? offer.buy_quantity + 'x ' : ''}${offer.buy_product?.name || '…'}, Get ${offer.get_quantity > 1 ? offer.get_quantity + 'x ' : ''}${offer.get_product?.name || '…'} at ${pct}% off`}
        </div>
      );
    }

    if (offer.offer_type === 'bundle') {
      const savings = offer.discount_type === 'percentage' && offer.discount_value > 0
        ? `${offer.discount_value}% off`
        : offer.bundle_price != null
          ? `Bundle price: ${formatPrice(offer.bundle_price)}`
          : offer.discount_type === 'fixed' && offer.discount_value > 0
            ? `Save ${formatPrice(offer.discount_value)}`
            : null;
      return savings ? (
        <div className="text-sm font-semibold text-purple-700 bg-purple-50 rounded-lg px-3 py-2 text-center">
          {savings}
        </div>
      ) : null;
    }
    return null;
  };

  const renderProducts = () => {
    if (offer.offer_type === 'bogo' || offer.offer_type === 'buy_x_get_y') {
      return (
        <div className="flex items-center justify-center gap-4">
          <ProductThumbnail product={offer.buy_product} label="Buy" />
          <div className="text-2xl font-bold text-muted-foreground">+</div>
          <ProductThumbnail product={offer.get_product} label="Get Free" />
        </div>
      );
    }

    if (offer.offer_type === 'bundle' && offer.bundle_products_detail?.length > 0) {
      return (
        <div className="flex items-center justify-center flex-wrap gap-3">
          {offer.bundle_products_detail.map((bp, i) => (
            <React.Fragment key={bp.product_id}>
              <ProductThumbnail product={bp.product} label={bp.quantity > 1 ? `x${bp.quantity}` : null} />
              {i < offer.bundle_products_detail.length - 1 && (
                <div className="text-xl font-bold text-muted-foreground">+</div>
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`inline-flex items-center border text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
            {typeLabel}
          </span>
          <h3 className="mt-1.5 text-base font-bold line-clamp-2">{offer.name}</h3>
          {offer.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{offer.description}</p>
          )}
        </div>
        <span className="text-3xl select-none flex-shrink-0">🎁</span>
      </div>

      {/* Products visual */}
      <div className="bg-muted/30 rounded-xl p-4 flex items-center justify-center min-h-[96px]">
        {renderProducts()}
      </div>

      {/* Deal summary */}
      {renderDeal()}

      {/* Validity */}
      {(offer.start_date || offer.end_date) && (
        <p className="text-xs text-muted-foreground text-center">
          {offer.start_date && `From ${offer.start_date}`}
          {offer.start_date && offer.end_date && ' · '}
          {offer.end_date && `Until ${offer.end_date}`}
        </p>
      )}

      {/* CTA */}
      {firstProductSlug ? (
        <Link
          to={`/product/${firstProductSlug}`}
          className="mt-auto block w-full text-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg py-2.5 text-sm font-semibold"
        >
          Shop Now
        </Link>
      ) : (
        <Link
          to="/"
          className="mt-auto block w-full text-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg py-2.5 text-sm font-semibold"
        >
          Shop Now
        </Link>
      )}
    </div>
  );
};

const BundleOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/bundle-offers/active`);
        if (!res.ok) throw new Error('Failed to load offers');
        const data = await res.json();
        setOffers(data);
      } catch (err) {
        console.error('BundleOffersPage:', err);
        setError('Could not load bundle offers. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const filtered = filter === 'all'
    ? offers
    : offers.filter(o => o.offer_type === filter);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl">🎁</span>
          <h1 className="text-3xl font-bold">Bundle & BOGO Offers</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Save more with our exclusive bundle deals and Buy-One-Get-One promotions.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {[
          { value: 'all', label: 'All Offers' },
          { value: 'bundle', label: '📦 Bundles' },
          { value: 'bogo', label: '2-for-1 BOGO' },
          { value: 'buy_x_get_y', label: 'Buy X Get Y' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              filter === tab.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-16 mb-2" />
              <div className="h-5 bg-muted rounded w-3/4 mb-4" />
              <div className="h-24 bg-muted rounded-xl mb-4" />
              <div className="h-9 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-16 text-destructive">
          <p className="text-5xl mb-4">⚠️</p>
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-5xl mb-4">🎁</p>
          <p className="font-semibold text-lg">No offers available right now</p>
          <p className="text-sm mt-1">Check back soon for exciting deals!</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(offer => (
            <BundleCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BundleOffersPage;
