import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { products } from "@/data/mockData";
import { productsApi } from "@/lib/api";
import { normalizeProduct } from "@/lib/normalize";
import ProductCard from "./ProductCard";

function useCountdown(seconds: number) {
  const [t, setT] = useState(seconds);
  useEffect(() => {
    const i = setInterval(() => setT((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, []);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return { h, m, s };
}

export default function FlashSale() {
  const { h, m, s } = useCountdown(8 * 3600 + 42 * 60);
  const [sale, setSale] = useState<any[]>(
    products.filter((p) => p.originalPrice).slice(0, 4),
  );
  useEffect(() => {
    productsApi.list({ flashSale: 1, limit: 4 } as any)
      .then((r) => {
        const list = (r?.products || r?.data || []).map(normalizeProduct);
        if (list.length) setSale(list);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="container py-16 lg:py-20">
      <div className="relative overflow-hidden rounded-4xl bg-gradient-night p-8 lg:p-12">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-accent-pink/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent/30 blur-3xl" />

        <div className="relative flex items-center justify-between flex-wrap gap-6 mb-8">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl bg-gradient-sunset flex items-center justify-center shadow-glow"
            >
              <Flame className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60 font-semibold mb-1">Limited time</p>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-white">Flash Sale</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[
              { v: h, l: "hrs" },
              { v: m, l: "min" },
              { v: s, l: "sec" },
            ].map((u, idx) => (
              <div key={u.l} className="flex items-center gap-2">
                <motion.div
                  key={u.v}
                  initial={{ scale: 1.1, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="min-w-[60px] h-16 rounded-2xl glass-dark bg-white/10 backdrop-blur-xl flex flex-col items-center justify-center"
                >
                  <span className="font-display text-2xl font-bold text-white tabular-nums">
                    {String(u.v).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase text-white/60">{u.l}</span>
                </motion.div>
                {idx < 2 && <span className="text-white/40 text-xl font-bold">:</span>}
              </div>
            ))}
          </div>

          <Link to="/search?sale=1" className="hidden lg:flex items-center gap-2 px-5 h-12 rounded-2xl bg-white text-foreground font-semibold text-sm hover:scale-105 transition-transform">
            Shop all deals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {sale.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
