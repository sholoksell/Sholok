import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Plus, Check, BadgeCheck, Share2, ArrowLeft, Package, Users, MessageCircle } from "lucide-react";
import { products as mockProducts, stores as mockStores } from "@/data/mockData";
import { storesApi, productsApi } from "@/lib/api";
import { normalizeStore, normalizeProduct } from "@/lib/normalize";
import ProductCard from "@/components/marketplace/ProductCard";

const tabs = ["Products", "About", "Reviews"] as const;

export default function StorePage() {
  const { id } = useParams<{ id: string }>();
  const fallback = mockStores.find((s) => s.id === id) ?? mockStores[0];
  const [store,  setStore]  = useState<any>(fallback);
  const [storeProducts, setStoreProducts] = useState<any[]>(
    mockProducts.filter((p) => p.storeId === fallback.id),
  );
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState<typeof tabs[number]>("Products");

  useEffect(() => {
    if (!id) return;
    storesApi.get(id).then((r) => {
      const s = normalizeStore(r?.store || r?.data || r);
      setStore({ ...fallback, ...s, gradient: s.gradient || fallback.gradient });
    }).catch(() => {});
    productsApi.list({ store: id } as any).then((r) => {
      const list = (r?.products || r?.data || []).map(normalizeProduct);
      if (list.length) setStoreProducts(list);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="container pt-4 lg:pt-6 pb-20">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </Link>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-4xl bg-gradient-to-br ${store.gradient} h-56 lg:h-72`}
      >
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/30 blur-3xl" />
        <motion.div
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{ backgroundImage: "linear-gradient(120deg, rgba(255,255,255,.7), transparent, rgba(255,255,255,.5))", backgroundSize: "200% 100%" }}
        />
      </motion.div>

      {/* Header card */}
      <div className="relative -mt-16 lg:-mt-20 mx-4 lg:mx-12 glass rounded-3xl p-6 lg:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className={`w-20 h-20 lg:w-24 lg:h-24 rounded-3xl bg-gradient-to-br ${store.gradient} shadow-card flex items-center justify-center font-display text-2xl lg:text-3xl font-bold`}>
          {store.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl lg:text-3xl font-bold">{store.name}</h1>
            {store.verified && <BadgeCheck className="w-5 h-5 text-accent" />}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{store.tagline} · Since {store.joined}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-accent-amber text-accent-amber" /> <strong>{store.rating}</strong> ({store.reviews.toLocaleString()})</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><Users className="w-3.5 h-3.5" /> {store.followers} followers</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><Package className="w-3.5 h-3.5" /> {store.products} products</span>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="w-11 h-11 rounded-2xl border border-border hover:bg-secondary flex items-center justify-center" aria-label="Share">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="w-11 h-11 rounded-2xl border border-border hover:bg-secondary flex items-center justify-center" aria-label="Message">
            <MessageCircle className="w-4 h-4" />
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setFollowing((f) => !f)}
            animate={{ backgroundColor: following ? "hsl(var(--secondary))" : "hsl(var(--foreground))", color: following ? "hsl(var(--foreground))" : "hsl(var(--background))" }}
            className="flex-1 md:flex-none h-11 px-6 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-soft"
          >
            <AnimatePresence mode="wait">
              {following ? (
                <motion.span key="f" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> Following
                </motion.span>
              ) : (
                <motion.span key="nf" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Follow
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 mx-4 lg:mx-12">
        <div className="relative inline-flex bg-secondary/60 rounded-2xl p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative z-10 px-5 h-9 rounded-xl text-sm font-semibold transition-colors ${tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab === t && (
                <motion.span layoutId="store-tab" className="absolute inset-0 bg-card rounded-xl shadow-soft" transition={{ type: "spring", damping: 28, stiffness: 320 }} />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 mx-4 lg:mx-12">
        <AnimatePresence mode="wait">
          {tab === "Products" && (
            <motion.div key="p" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {storeProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </motion.div>
          )}
          {tab === "About" && (
            <motion.div key="a" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl space-y-6">
              <p className="text-base leading-relaxed text-foreground/80">{store.description}</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { l: "Products", v: store.products },
                  { l: "Followers", v: store.followers },
                  { l: "Rating", v: `${store.rating}★` },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl bg-secondary/50 p-4">
                    <div className="font-display text-2xl font-bold">{s.v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {tab === "Reviews" && (
            <motion.div key="r" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid lg:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-3xl bg-card border border-border/60 p-5 shadow-soft">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Verified buyer</p>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, k) => (
                          <Star key={k} className="w-3 h-3 fill-accent-amber text-accent-amber" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">Shipping was fast, packaging was beautiful. The piece feels even better than the photos suggest. Already considering a second order.</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
