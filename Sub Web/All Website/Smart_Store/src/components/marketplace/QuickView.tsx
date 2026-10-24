import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ShoppingBag, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/store/cartContext";
import { useQuickView } from "@/store/quickViewContext";

export default function QuickView() {
  const { add, wishlist, toggleWishlist } = useCart();
  const { product, close } = useQuickView();

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="pointer-events-auto bg-card rounded-4xl shadow-elegant w-full max-w-3xl overflow-hidden grid sm:grid-cols-2"
            >
              <div className="relative aspect-square bg-muted">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <button
                  onClick={close}
                  className="sm:hidden absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 sm:p-8 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{product.brand}</p>
                  <button
                    onClick={close}
                    className="hidden sm:flex w-9 h-9 rounded-full hover:bg-secondary items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="font-display text-2xl font-bold leading-tight mb-3">{product.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Star className="w-4 h-4 fill-accent-amber text-accent-amber" />
                  <span className="font-semibold text-foreground">{product.rating}</span>
                  <span>· {product.reviews.toLocaleString()} reviews</span>
                </div>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="font-display text-3xl font-bold">৳{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">৳{product.originalPrice.toLocaleString()}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {product.description}
                </p>

                <div className="mt-auto flex flex-col gap-2">
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { add(product); close(); }}
                      className="flex-1 h-12 rounded-2xl bg-gradient-primary text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-elegant"
                    >
                      <ShoppingBag className="w-4 h-4" /> Add to cart
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleWishlist(product.id)}
                      className="w-12 h-12 rounded-2xl border border-border hover:bg-secondary flex items-center justify-center"
                    >
                      <Heart className={wishlist.has(product.id) ? "fill-accent-pink text-accent-pink w-4 h-4" : "w-4 h-4"} />
                    </motion.button>
                  </div>
                  <Link
                    to={`/product/${product.id}`}
                    onClick={close}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 self-end"
                  >
                    See full details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
