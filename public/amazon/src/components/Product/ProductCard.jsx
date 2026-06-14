import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import StarRating from '../common/StarRating';
import PrimeBadge from '../common/PrimeBadge';
import { FiShoppingCart } from 'react-icons/fi';

const ProductCard = ({ product, compact = false }) => {
  const [imgError, setImgError] = useState(false);
  const { addToCart, isInCart } = useCart();
  const { addToast } = useToast();

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    addToast(`"${product.title.slice(0, 40)}..." added to cart`, 'success');
  };

  const fallback = `https://placehold.co/400x400/EAEDED/565959?text=${encodeURIComponent(product.brand || 'Product')}`;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white border border-transparent hover:border-amazon-border hover:shadow-amazon-md transition-all duration-200 rounded overflow-hidden flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#F7F8F8] flex items-center justify-center aspect-square">
        {product.isSponsored && (
          <span className="absolute top-1.5 left-1.5 bg-white/90 text-[10px] text-amazon-text-gray px-1 rounded z-10">
            Sponsored
          </span>
        )}
        {product.badge && (
          <span className="absolute top-1.5 right-1.5 bg-amazon-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-10 leading-none">
            {product.badge}
          </span>
        )}
        <img
          src={!product.image || imgError ? fallback : product.image}
          alt={product.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {/* Title */}
        <p className="text-amazon-dark text-sm leading-snug line-clamp-2 mb-1 hover:text-amazon-orange transition-colors">
          {product.title}
        </p>

        {/* Brand */}
        <p className="text-amazon-text-gray text-xs mb-1">{product.brand}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-1">
          <StarRating rating={product.rating} size="xs" />
          <span className="text-amazon-blue text-xs hover:underline">
            {product.reviewCount?.toLocaleString()}
          </span>
        </div>

        {/* Bought count */}
        {product.boughtCount && !compact && (
          <p className="text-xs text-amazon-text-gray mb-1">
            {product.boughtCount} bought past month
          </p>
        )}

        {/* Price */}
        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-amazon-red text-xs align-top">-{product.discount}%</span>
            <span className="text-amazon-dark font-bold text-lg leading-none">
              ৳{Math.round(product.price * 110).toLocaleString()}
            </span>
          </div>
          {product.originalPrice && (
            <p className="text-xs text-amazon-text-gray">
              Was:{' '}
              <span className="line-through">৳{Math.round(product.originalPrice * 110).toLocaleString()}</span>
            </p>
          )}

          {/* Prime + delivery */}
          {!compact && (
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {product.isPrime && <PrimeBadge />}
              {product.freeDelivery && (
                <span className="text-xs text-amazon-green font-medium">FREE delivery</span>
              )}
            </div>
          )}

          {/* Delivery date */}
          {product.deliveryDate && !compact && (
            <p className="text-xs text-amazon-dark mt-0.5">
              Get it <span className="font-bold">{product.deliveryDate}</span>
            </p>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAdd}
            className={`mt-2 w-full text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1.5 font-medium ${
              isInCart(product.id)
                ? 'bg-[#E7F4EB] text-amazon-green border border-amazon-green'
                : 'amazon-btn'
            }`}
          >
            <FiShoppingCart size={13} />
            {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
