import React, { useState, memo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { formatPrice, getDiscountPercentage, getImageUrl } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { wishlistService } from '@/services/wishlistService';
import { toast } from 'sonner';

const ProductCard = memo(({ product }) => {
  const { t, getLocalizedField } = useLanguage();
  const { customer } = useAuth();
  const addToCart = useCartStore((state) => state.addToCart);
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (customer && product) {
      const pid = product._id || product.id;
      wishlistService.check(pid).then(isInWishlist => {
        if (isInWishlist) setIsWishlisted(true);
      }).catch(() => {});
    }
  }, [customer, product]);

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    const result = await addToCart(product, 1);
    setIsLoading(false);
    if (result.success) {
      toast.success(`${getLocalizedField(product, 'name')} ${t('addedToCart')}`);
    } else {
      toast.error(result.message || t('failedToAddToCart'));
    }
  }, [product, addToCart, t, getLocalizedField]);

  const handleWishlist = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!customer) { toast.error(t('loginToWishlist')); return; }
    const pid = product._id || product.id;
    try {
      if (isWishlisted) {
        await wishlistService.remove(pid);
        setIsWishlisted(false);
      } else {
        await wishlistService.add(pid);
        setIsWishlisted(true);
      }
    } catch { toast.error(t('failedToUpdateWishlist')); }
  }, [isWishlisted, customer, product, t]);

  const displayPrice = product.price || product.salePrice || product.regularPrice;
  const comparePrice = product.comparePrice || product.regularPrice;
  const discount = getDiscountPercentage(comparePrice, displayPrice);
  const productImage = product.image || product.images?.[0] || product.thumbnail || '';
  const productName = getLocalizedField(product, 'name') || product.name;
  const unit = product.unit || product.unitType || 'Per Piece';
  const minQty = product.minOrderQuantity || product.minQty;
  const brandName = product.brand || product.brandName || '';
  const rating = product.rating || product.averageRating || 0;
  const reviewCount = product.reviewCount || product.numReviews || 0;
  const stars = Math.round(rating);

  const takaOff = comparePrice && displayPrice ? Math.round(comparePrice - displayPrice) : 0;

  return (
    <Link to={`/product/${product.slug || product._id || product.id}`}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">

        {/* Discount Badge - top LEFT (matches reference design) */}
        {takaOff > 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-sale px-2 py-0.5 text-[11px] font-bold text-white">
            {formatPrice(takaOff)} OFF{minQty ? ` Max.${minQty}` : ''}
          </span>
        )}
        {!takaOff && discount > 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-sale px-2 py-0.5 text-[11px] font-bold text-white">
            {discount}% OFF
          </span>
        )}

        {/* Wishlist heart - top RIGHT */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors hover:border-sale"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-sale text-sale' : 'text-gray-400'}`} />
        </button>

        {/* Product Image */}
        <div className="relative aspect-square bg-white p-3 flex items-center justify-center">
          {productImage ? (
            <img
              src={getImageUrl(productImage)}
              alt={productName}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { e.currentTarget.src = ''; e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-x-0 bottom-0 bg-gray-900/70 py-1 text-center text-xs font-semibold text-white">
              {t('outOfStock')}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col gap-1.5 border-t border-gray-100 px-3 pt-2.5 pb-3">
          {/* Brand name */}
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 min-h-[14px]">
            {brandName}
          </span>

          {/* Product Name */}
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-gray-800">
            {productName}
          </h3>

          {/* Star ratings */}
          <div className="flex items-center gap-1">
            {rating > 0 ? (
              <>
                <div className="flex">
                  {[1,2,3,4,5].map((n) => (
                    <svg key={n} className={`h-3 w-3 ${n <= stars ? 'text-sale' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                {reviewCount > 0 && <span className="text-[10px] text-gray-400">({reviewCount})</span>}
              </>
            ) : <div className="h-3" />}
          </div>

          {/* Price */}
          <div className="mt-auto pt-1">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-base font-bold text-primary">{formatPrice(displayPrice)}</span>
              {comparePrice && comparePrice > displayPrice && (
                <>
                  <span className="text-xs text-gray-400 line-through">{formatPrice(comparePrice)}</span>
                  {discount > 0 && !takaOff && <span className="text-xs font-semibold text-sale">-{discount}%</span>}
                </>
              )}
            </div>
            <p className="text-[11px] text-gray-500">
              {unit}{minQty ? ` (Min. ${minQty})` : ''}
            </p>
          </div>

          {/* Add to Cart Button */}
          <button
            className="mt-1.5 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-primary text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            {isLoading ? t('adding') : product.stock === 0 ? t('outOfStock') : t('addToBagBtn')}
          </button>
        </div>
      </article>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
