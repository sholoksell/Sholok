import { useState, useMemo, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, ShoppingBag, ArrowLeft, Truck, Shield, RotateCcw, Sparkles, Minus, Plus } from "lucide-react";
import { products, stores } from "@/data/mockData";
import { useCart } from "@/store/cartContext";
import ProductCard from "@/components/marketplace/ProductCard";
import ProductReviews from "@/components/marketplace/ProductReviews";
import ProductQA from "@/components/marketplace/ProductQA";
import { productsApi } from "@/lib/api";
import { normalizeProduct } from "@/lib/normalize";
import type { Product } from "@/data/mockData";
import { toast } from "sonner";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const fallback = products.find((p) => p.id === id) ?? products[0];
  const [product, setProduct] = useState<Product>(fallback);
  const [productLoaded, setProductLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProduct(fallback);
    setProductLoaded(false);
    if (!id) return;
    productsApi.get(id)
      .then((res) => {
        const live = normalizeProduct(res?.product || res?.data || res);
        if (live && !cancelled) setProduct(live);
      })
      .catch(() => { /* keep mock fallback */ })
      .finally(() => { if (!cancelled) setProductLoaded(true); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const store = stores.find((s) => s.id === product.storeId);
  const related = useMemo(() => products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4), [product]);
  const aiPicks = useMemo(() => products.filter((p) => p.id !== product.id).slice(0, 4), [product]);

  const { add, wishlist, toggleWishlist } = useCart();
  const liked = wishlist.has(product.id);

  const gallery = product.gallery ?? [product.image];
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [variantSel, setVariantSel] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.variants?.forEach((v) => (initial[v.name] = v.values[0]));
    return initial;
  });

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) add(product);
    toast.success(`${qty} × ${product.name} added`, { description: Object.values(variantSel).join(" · ") });
  };

  return (
    <div className="container pt-4 pb-24">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Home</Link>
        <span>/</span>
        <Link to="/search" className="hover:text-foreground">{product.category}</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square rounded-4xl overflow-hidden bg-muted shadow-card">
            <AnimatePresence mode="wait">
              <motion.img
                key={imgIdx}
                src={gallery[imgIdx]}
                alt={product.name}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider bg-gradient-primary text-white rounded-full">
                {product.badge}
              </span>
            )}
          </div>
          <div className="mt-3 flex gap-3">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-muted transition-all ${i === imgIdx ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : "opacity-70 hover:opacity-100"}`}
              >
                <img src={g} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="lg:pt-2">
          <Link to={`/store/${store?.id}`} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground font-semibold mb-3">
            {product.brand}
          </Link>
          <h1 className="font-display text-3xl lg:text-4xl font-bold leading-tight mb-3">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm mb-5">
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-accent-amber text-accent-amber" /> <strong>{product.rating}</strong> <span className="text-muted-foreground">({product.reviews.toLocaleString()} reviews)</span></span>
            {product.stock !== undefined && product.stock < 25 && (
              <span className="px-2 py-0.5 rounded-full bg-accent-pink/10 text-accent-pink text-xs font-semibold">Only {product.stock} left</span>
            )}
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-4xl font-bold">৳{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <>
                <span className="text-base text-muted-foreground line-through">৳{product.originalPrice.toLocaleString()}</span>
                <span className="px-2 py-0.5 rounded-full bg-foreground text-background text-xs font-bold">-{discount}%</span>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.description}</p>

          {/* Variants */}
          {product.variants?.map((v) => (
            <div key={v.name} className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">{v.name}</p>
                <p className="text-xs font-medium">{variantSel[v.name]}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {v.values.map((val) => (
                  <motion.button
                    key={val}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setVariantSel((s) => ({ ...s, [v.name]: val }))}
                    className={`relative px-4 h-10 rounded-2xl border text-sm font-medium transition-all ${
                      variantSel[v.name] === val
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/40"
                    }`}
                  >
                    {val}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">Quantity</p>
            <div className="inline-flex items-center bg-secondary rounded-2xl p-1">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-xl hover:bg-card flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
              <motion.span key={qty} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="w-10 text-center text-sm font-semibold tabular-nums">{qty}</motion.span>
              <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 rounded-xl hover:bg-card flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-2 mb-6">
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              className="flex-1 h-13 py-4 rounded-2xl bg-gradient-primary text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-elegant"
            >
              <ShoppingBag className="w-4 h-4" /> Add to cart · ৳{(product.price * qty).toLocaleString()}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => toggleWishlist(product.id)}
              className="w-13 h-13 px-4 rounded-2xl border border-border hover:bg-secondary flex items-center justify-center"
            >
              <Heart className={liked ? "fill-accent-pink text-accent-pink w-4 h-4" : "w-4 h-4"} />
            </motion.button>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { icon: Truck, label: "Free shipping" },
              { icon: RotateCcw, label: "30-day returns" },
              { icon: Shield, label: "2-year warranty" },
            ].map((t) => (
              <div key={t.label} className="rounded-2xl bg-secondary/40 p-3 flex flex-col items-center text-center gap-1">
                <t.icon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky add-to-cart bar (mobile) */}
      <motion.div
        initial={{ y: 100 }} animate={{ y: 0 }}
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass border-t border-border/40 p-3 flex gap-2"
      >
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{product.brand}</p>
          <p className="font-bold tabular-nums">৳{(product.price * qty).toLocaleString()}</p>
        </div>
        <button onClick={handleAdd} className="h-11 px-5 rounded-xl bg-gradient-primary text-white text-sm font-semibold flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4" /> Add
        </button>
      </motion.div>

      {/* Reviews */}
      <section className="mt-20">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <h2 className="font-display text-2xl lg:text-3xl font-bold">What buyers say</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4 fill-accent-amber text-accent-amber" />
            <span><strong className="text-foreground">{product.rating}</strong> · {product.reviews.toLocaleString()} reviews</span>
          </div>
        </div>
        <ProductReviews productId={product.id} />
      </section>

      {/* Q&A */}
      <section className="mt-16">
        <ProductQA productId={product.id} />
      </section>

      {/* Suggestions */}
      <section className="mt-20">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold gradient-text">Pairs Well With</p>
            <h2 className="font-display text-2xl lg:text-3xl font-bold">You may also love</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {aiPicks.map((p, i) => (<ProductCard key={p.id} product={p} index={i} />))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl lg:text-3xl font-bold mb-6">More from {product.category}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.map((p, i) => (<ProductCard key={p.id} product={p} index={i} />))}
          </div>
        </section>
      )}
    </div>
  );
}
