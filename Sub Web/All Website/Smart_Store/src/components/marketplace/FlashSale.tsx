import { useEffect, useState } from "react";
import { Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { productsApi } from "@/lib/api";
import { normalizeProduct } from "@/lib/normalize";
import ProductCard from "./ProductCard";
import type { Product } from "@/data/mockData";

function useCountdown(endTime: string | null) {
  const getSeconds = () => {
    if (!endTime) return 2 * 86400 + 8 * 3600 + 42 * 60;
    return Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000));
  };
  const [remaining, setRemaining] = useState(getSeconds);

  useEffect(() => {
    if (endTime) setRemaining(getSeconds());
    const i = setInterval(() => setRemaining((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, [endTime]);

  return {
    d: Math.floor(remaining / 86400),
    h: Math.floor((remaining % 86400) / 3600),
    m: Math.floor((remaining % 3600) / 60),
    s: remaining % 60,
  };
}

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-w-[52px] h-14 bg-card border border-sale/20 rounded-lg">
      <span className="text-xl font-bold text-foreground tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">{label}</span>
    </div>
  );
}

export default function FlashSale() {
  const [endTime, setEndTime] = useState<string | null>(null);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (productsApi as any).flashSale?.()
      .then((r: any) => {
        const et = r?.endTime || r?.end_time || r?.data?.endTime || null;
        if (et) setEndTime(et);
      })
      .catch(() => {});

    productsApi.list({ onSale: "true", limit: 6 } as any)
      .then((r: any) => {
        const list = (r?.products || r?.data || []).map(normalizeProduct).filter(Boolean) as Product[];
        if (list.length >= 2) { setSaleProducts(list); setLoading(false); return; }
        return productsApi.list({ limit: 6 } as any);
      })
      .then((r: any) => {
        if (!r) return;
        const list = (r?.products || r?.data || []).map(normalizeProduct).filter(Boolean) as Product[];
        if (list.length) setSaleProducts(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const { d, h, m, s } = useCountdown(endTime);

  return (
    <section className="container py-6" id="flash-sale">
      <div className="rounded-2xl border border-sale/20 bg-sale-soft p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D31710] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground leading-tight">Flash Sale</h2>
              <p className="text-xs text-muted-foreground">Don't miss these amazing deals!</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Ends in</span>
            <div className="flex items-center gap-1.5">
              <CountUnit value={d} label="Days" />
              <span className="text-muted-foreground font-bold">:</span>
              <CountUnit value={h} label="Hrs" />
              <span className="text-muted-foreground font-bold">:</span>
              <CountUnit value={m} label="Min" />
              <span className="text-muted-foreground font-bold">:</span>
              <CountUnit value={s} label="Sec" />
            </div>
          </div>

          <Link
            to="/search?onSale=1"
            className="hidden lg:flex items-center gap-2 px-4 h-9 rounded-lg bg-[#D31710] text-white text-sm font-semibold hover:brightness-90 transition-all"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg h-64 animate-pulse border border-border" />
              ))
            : saleProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
        </div>
      </div>
    </section>
  );
}
