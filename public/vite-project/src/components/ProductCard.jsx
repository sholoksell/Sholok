import React, { useState, memo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      wishlistService.check(pid).then(data => {
        if (data.isInWishlist) setIsWishlisted(true);
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
      toast.success(`${getLocalizedField(product, 'name')} added to cart`);
    } else {
      toast.error(result.message || 'Failed to add to cart');
    }
  }, [product, addToCart, t, getLocalizedField]);

  const handleWishlist = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!customer) { toast.error('Please login to add to wishlist'); return; }
    const pid = product._id || product.id;
    try {
      if (isWishlisted) {
        await wishlistService.remove(pid);
        setIsWishlisted(false);
      } else {
        await wishlistService.add(pid);
        setIsWishlisted(true);
      }
    } catch { toast.error('Failed to update wishlist'); }
  }, [isWishlisted, customer, product]);

  const displayPrice = product.price || product.salePrice || product.regularPrice;
  const comparePrice = product.comparePrice || product.regularPrice;
  const discount = getDiscountPercentage(comparePrice, displayPrice);
  const productImage = product.image || product.images?.[0] || product.thumbnail || '';
  const productName = getLocalizedField(product, 'name') || product.name;
  const unit = product.unit || product.unitType || t('perPiece');
  const minQty = product.minOrderQuantity || product.minQty;

  // Calculate taka off amount
  const takaOff = comparePrice && displayPrice ? Math.round(comparePrice - displayPrice) : 0;

  return (
    <Link to={`/product/${product.slug || product._id || product.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full relative">

        {/* Discount Badge - top right corner */}
        {takaOff > 0 && (
          <div className="absolute top-0 right-0 z-10">
            <div className="bg-[#E31E24] text-white text-[10px] font-bold leading-tight px-2 py-1 rounded-bl-lg text-center min-w-[44px]">
              <div>{formatPrice(takaOff)}</div>
              <div>OFF</div>
              {minQty && <div className="text-[9px]">Max.{minQty}pc</div>}
            </div>
          </div>
        )}
        {!takaOff && discount > 0 && (
          <div className="absolute top-0 right-0 z-10">
            <div className="bg-[#E31E24] text-white text-[10px] font-bold leading-tight px-2 py-1 rounded-bl-lg text-center min-w-[44px]">
              <div>{discount}%</div>
              <div>OFF</div>
            </div>
          </div>
        )}

        {/* Product Image */}
        <div className="relative bg-white flex items-center justify-center" style={{ minHeight: '160px', height: '160px' }}>
          {productImage ? (
            <img
              src={getImageUrl(productImage)}
              alt={productName}
              className="w-full h-full object-contain p-2"
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
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-gray-500 font-semibold text-sm border border-gray-400 px-3 py-1 rounded-full">{t('outOfStock')}</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="flex flex-col flex-1 px-3 pt-2 pb-3 gap-1">
          {/* Delivery text */}
          <p className="text-[11px] text-gray-400 italic">{t('delivery12Hours')}</p>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] leading-tight">
            {productName}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-base font-bold text-[#E31E24]">{formatPrice(displayPrice)}</span>
            {comparePrice && comparePrice > displayPrice && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(comparePrice)}</span>
            )}
          </div>
          <p className="text-[11px] text-gray-500">
            {unit}{minQty ? ` (Min. ${minQty})` : ''}
          </p>

          {/* Add to Bag Button */}
          <button
            className="mt-auto w-full bg-[#E31E24] hover:bg-[#b9151a] disabled:bg-gray-300 text-white font-bold text-sm py-2 rounded-full transition-colors duration-200 flex items-center justify-center gap-1"
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {t('addToCart')}...
              </span>
            ) : product.stock === 0 ? (
              t('outOfStock')
            ) : (
              <span>+ {t('addToBag')}</span>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;