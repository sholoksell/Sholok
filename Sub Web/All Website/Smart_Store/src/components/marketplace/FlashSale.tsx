import { useEffect, useState } from "react";
import { Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { products } from "@/data/mockData";
import { productsApi } from "@/lib/api";
import { normalizeProduct } from "@/lib/normalize";
import ProductCard from "./ProductCard";

function useCountdownFromEnd(endTime: string | null) {
  const getSeconds = () => {
    if (!endTime) return 8 * 3600 + 42 * 60;
    const diff = Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000));
    return diff;
  };
  const [remaining, setRemaining] = useState(getSeconds);

  useEffect(() => {
    if (endTime) setRemaining(getSeconds());
    const i = setInterval(() => setRemaining((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, [endTime]);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return { h, m, s };
}

export default function FlashSale() {
  const [endTime, setEndTime] = useState<string | null>(null);
  const [saleProducts, setSaleProducts] = useState(() =>
    products.filter((p) => p.originalPrice).slice(0, 4),
  );

  useEffect(() => {
    (productsApi as any).flashSale?.()
      .then((r: any) => {
        const et = r?.endTime || r?.end_time || r?.data?.endTime || null;
        if (et) setEndTime(et);
      })
      .catch(() => {});

    productsApi.list({ onSale: true, limit: 4 } as any)
      .then((r: any) => {
        const list = (r?.products || r?.data || []).map(normalizeProduct).filter(Boolean);
        if (list.length) setSaleProducts(list as any);
      })
      .catch(() => {});
  }, []);

  const { h, m, s } = useCountdownFromEnd(endTime);

  return (
    <section className="container py-8" id="flash-sale">
      <div className="bg-gradient-night rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D31710] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/50 font-semibold">Don't miss out</p>
              <h2 className="text-2xl font-bold text-white">Flash Sale</h2>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white/60 mr-1">Ends in</span>
            {[
              { v: h, l: "H" },
              { v: m, l: "M" },
              { v: s, l: "S" },
            ].map((u, idx) => (
              <div key={u.l} className="flex items-center gap-1.5">
                <div className="min-w-[48px] h-12 bg-white/10 rounded flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white tabular-nums leading-none">
                    {String(u.v).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-white/50 uppercase">{u.l}</span>
                </div>
                {idx < 2 && <span className="text-white/40 font-bold">:</span>}
              </div>
            ))}
          </div>

          <Link
            to="/search?onSale=1"
            className="hidden lg:flex items-center gap-2 px-4 h-9 rounded bg-white text-foreground text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product grid */}
        <div className="px-4 pb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {saleProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
