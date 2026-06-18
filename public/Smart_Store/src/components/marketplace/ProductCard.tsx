import { motion } from "framer-motion";
import { Heart, Star, Eye, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/store/cartContext";
import { useQuickView } from "@/store/quickViewContext";
import type { Product } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useLanguage, getLocalizedField } from "@/contexts/LanguageContext";

type Props = {
  product: Product;
  index?: number;
};

export default function ProductCard({ product, index = 0 }: Props) {
  const { add, wishlist, toggleWishlist } = useCart();
  const { open: openQuickView } = useQuickView();
  const { language, t } = useLanguage();
  const liked = wishlist.has(product.id);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const productName = getLocalizedField(product, "name", language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -6 }}
      className="group relative bg-card rounded-3xl overflow-hidden shadow-soft hover:shadow-elegant transition-shadow duration-500"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <motion.img
            src={product.image}
            alt={productName}
            loading="lazy"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.badge && (
              <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-gradient-primary text-white rounded-full shadow-sm">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="px-2.5 py-1 text-[10px] font-bold bg-foreground text-background rounded-full">
                -{discount}%
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center shadow-soft"
            aria-label="Toggle wishlist"
          >
            <Heart className={cn("w-4 h-4 transition-all", liked ? "fill-accent-pink text-accent-pink scale-110" : "text-foreground")} />
          </motion.button>

          <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }}
              className="flex-1 h-10 glass rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-background transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> {t("quickView")}
            </button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); add(product); }}
              className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center hover:bg-accent transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <div className="p-4 space-y-1.5">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{product.brand}</p>
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">{productName}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="w-3 h-3 fill-accent-amber text-accent-amber" />
            <span className="font-medium text-foreground">{product.rating}</span>
            <span>({product.reviews.toLocaleString()})</span>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-lg font-bold">৳{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">৳{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
