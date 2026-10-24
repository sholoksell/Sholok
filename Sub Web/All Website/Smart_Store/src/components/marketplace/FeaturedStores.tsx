import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { stores as mockStores } from "@/data/mockData";
import { storesApi } from "@/lib/api";
import { normalizeStore } from "@/lib/normalize";

export default function FeaturedStores() {
  const [stores, setStores] = useState<any[]>(mockStores as any);
  useEffect(() => {
    storesApi.list({ featured: 1 } as any)
      .then((r) => {
        const list = (r?.stores || r?.data || []).map(normalizeStore);
        if (list.length) {
          setStores(list.map((s: any, idx: number) => ({
            ...s,
            id:        s.id || s.slug || `s${idx}`,
            gradient:  s.gradient || mockStores[idx % mockStores.length].gradient,
            tagline:   s.tagline   || s.description || "",
            followers: s.followers || "",
          })));
        }
      })
      .catch(() => {});
  }, []);
  return (
    <section className="container py-16 lg:py-20">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Smart Stores</p>
          <h2 className="font-display text-3xl lg:text-4xl font-bold">Featured vendors</h2>
          <p className="text-sm text-muted-foreground mt-1">Hand-picked stores with stellar ratings.</p>
        </div>
      </div>

      <div className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6 snap-x snap-mandatory">
        {stores.map((store, i) => (
          <motion.div
            key={store.id}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            whileHover={{ y: -6 }}
            className="snap-start shrink-0 w-72 lg:w-80 group"
          >
            <Link to={`/store/${store.id}`} className="block">
              <div className="relative h-44 rounded-3xl overflow-hidden mb-4">
                <div className={`absolute inset-0 bg-gradient-to-br ${store.gradient}`} />
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, white 0%, transparent 60%)' }} />
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute bottom-4 right-4 h-10 px-4 rounded-full bg-foreground text-background text-xs font-semibold flex items-center gap-1.5 shadow-elegant"
                >
                  <Plus className="w-3.5 h-3.5" /> Follow
                </motion.span>
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full glass text-[10px] font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-accent-amber text-accent-amber" />
                  {store.rating}
                </div>
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-lg">{store.name}</h3>
                  <p className="text-sm text-muted-foreground">{store.tagline}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 mt-1">{store.followers}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
