import { Heart, Star, Eye, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/store/cartContext";
import { useQuickView } from "@/store/quickViewContext";
import type { Product } from "@/data/mockData";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  index?: number;
};

export default function ProductCard({ product }: Props) {
  const { add, wishlist, toggleWishlist } = useCart();
  const { open: openQuickView } = useQuickView();
  const liked = wishlist.has(product.id);
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const badgeLabel = product.badge || (discount > 0 ? "Sale" : null);

  return (
    <div className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-elegant transition-shadow duration-300 flex flex-col">
      {/* Image area */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-[4/3] bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {badgeLabel && (
            <span
              className={cn(
                "px-2 py-0.5 text-[10px] font-bold uppercase rounded",
                badgeLabel.toLowerCase() === "sale" || discount > 0
                  ? "bg-[#D31710] text-white"
                  : badgeLabel.toLowerCase() === "new"
                  ? "bg-green-500 text-white"
                  : "bg-[#5D0096] text-white",
              )}
            >
              {badgeLabel}
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#D31710] text-white rounded">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow transition-colors"
          aria-label="Toggle wishlist"
        >
          <Heart className={cn("w-4 h-4 transition-colors", liked ? "fill-[#D31710] text-[#D31710]" : "text-gray-400")} />
        </button>

        {/* Quick view overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-black/60 py-2 text-center text-xs font-semibold text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
          onClick={(e) => { e.preventDefault(); openQuickView(product); }}
        >
          <Eye className="w-3.5 h-3.5" /> Quick View
        </div>
      </Link>

      {/* Product info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        {/* Category */}
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium truncate">
          {product.category || product.brand}
        </p>

        {/* Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium leading-snug line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className="flex">
            {[1,2,3,4,5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-3 h-3",
                  star <= Math.round(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-200",
                )}
              />
            ))}
          </div>
          <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
          <span>({product.reviews.toLocaleString()})</span>
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base font-bold text-foreground">৳{product.price.toLocaleString()}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              ৳{product.originalPrice.toLocaleString()}
            </span>
          )}
          {discount > 0 && (
            <span className="text-xs font-semibold text-[#D31710]">-{discount}%</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={() => add(product)}
          className="mt-2 w-full h-9 rounded bg-[#5D0096] hover:bg-[#4a0078] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
        </button>
      </div>
    </div>
  );
}
