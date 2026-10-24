import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Search as SearchIcon, Sparkles, Star } from "lucide-react";
import { categories, products } from "@/data/mockData";
import { productsApi } from "@/lib/api";
import { normalizeProduct } from "@/lib/normalize";
import ProductCard from "@/components/marketplace/ProductCard";

const sortOptions = [
  { id: "relevance", label: "Most relevant" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
  { id: "newest", label: "Newest" },
] as const;

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const initialCat = params.get("cat") ?? "";
  const onSale = params.get("sale") === "1";

  const [q, setQ] = useState(initialQ);
  const [activeCats, setActiveCats] = useState<Set<string>>(new Set(initialCat ? [initialCat] : []));
  const [price, setPrice] = useState<[number, number]>([0, 66000]);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<typeof sortOptions[number]["id"]>("relevance");
  const [filterOpen, setFilterOpen] = useState(false);
  const [serverList, setServerList] = useState<any[] | null>(null);

  // Server-side search with mock fallback
  useEffect(() => {
    const cat = activeCats.size === 1 ? [...activeCats][0] : undefined;
    productsApi.list({ q, category: cat, sale: onSale ? 1 : undefined, sort } as any)
      .then((r) => {
        const list = (r?.products || r?.data || []).map(normalizeProduct);
        setServerList(list.length ? list : null);
      })
      .catch(() => setServerList(null));
  }, [q, activeCats, onSale, sort]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (activeCats.size === 1) next.set("cat", [...activeCats][0]);
    if (onSale) next.set("sale", "1");
    setParams(next, { replace: true });
  }, [q, activeCats, onSale, setParams]);

  const filtered = useMemo(() => {
    let list = (serverList && serverList.length ? serverList : products).slice();
    if (q.trim()) {
      const ql = q.toLowerCase();
      list = list.filter((p: any) => (p.name || "").toLowerCase().includes(ql) || (p.brand || "").toLowerCase().includes(ql) || (p.category || "").toLowerCase().includes(ql) || p.tags?.some((t: string) => t.includes?.(ql)));
    }
    if (activeCats.size) list = list.filter((p: any) => activeCats.has(p.category));
    list = list.filter((p: any) => (p.price ?? 0) >= price[0] && (p.price ?? 0) <= price[1]);
    if (minRating > 0) list = list.filter((p: any) => (p.rating ?? 0) >= minRating);
    if (onSale) list = list.filter((p: any) => p.originalPrice);

    switch (sort) {
      case "price-asc":  list.sort((a: any, b: any) => a.price - b.price); break;
      case "price-desc": list.sort((a: any, b: any) => b.price - a.price); break;
      case "rating":     list.sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case "newest":     list.reverse(); break;
    }
    return list;
  }, [q, activeCats, price, minRating, sort, onSale, serverList]);

  const toggleCat = (c: string) =>
    setActiveCats((s) => {
      const n = new Set(s);
      n.has(c) ? n.delete(c) : n.add(c);
      return n;
    });

  return (
    <div className="container py-8 lg:py-12">
      {/* Heading + search */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 gradient-text" /> Smart Store Search
        </p>
        <h1 className="font-display text-3xl lg:text-5xl font-bold mb-5">Find anything you'll love</h1>
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder=""
            className="w-full h-14 pl-12 pr-32 rounded-2xl bg-card border border-border shadow-soft text-base focus:outline-none focus:ring-2 focus:ring-accent transition"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-gradient-primary text-white text-[10px] font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Go
          </span>
        </div>

        {/* Category chips */}
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((c) => (
            <motion.button
              key={c.name}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleCat(c.name)}
              className={`px-4 h-9 rounded-full text-xs font-semibold border transition-all ${
                activeCats.has(c.name) ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:border-foreground/40"
              }`}
            >
              {c.name}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterPanel price={price} setPrice={setPrice} minRating={minRating} setMinRating={setMinRating} />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{filtered.length}</strong> results{q && <> for "<span className="text-foreground">{q}</span>"</>}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setFilterOpen(true)} className="lg:hidden h-10 px-3 rounded-xl border border-border text-xs font-semibold flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="h-10 px-3 rounded-xl bg-card border border-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {sortOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-3xl bg-secondary/40 p-12 text-center">
              <div className="w-20 h-20 rounded-3xl bg-card flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Nothing matches yet</h3>
              <p className="text-sm text-muted-foreground">Try removing a filter or searching for something else.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {filtered.map((p, i) => (<ProductCard key={p.id} product={p} index={i} />))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFilterOpen(false)} className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm lg:hidden" />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 z-50 h-full w-80 bg-background shadow-elegant flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <span className="font-display font-bold text-lg">Filters</span>
                <button onClick={() => setFilterOpen(false)} className="w-9 h-9 rounded-xl hover:bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto">
                <FilterPanel price={price} setPrice={setPrice} minRating={minRating} setMinRating={setMinRating} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterPanel({
  price, setPrice, minRating, setMinRating,
}: {
  price: [number, number]; setPrice: (p: [number, number]) => void;
  minRating: number; setMinRating: (n: number) => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <h4 className="text-xs uppercase tracking-widest font-bold mb-3">Price</h4>
        <div className="flex items-center gap-2">
          <input type="number" value={price[0]} onChange={(e) => setPrice([Number(e.target.value), price[1]])} className="w-20 h-10 px-3 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-accent" />
          <span className="text-muted-foreground text-xs">to</span>
          <input type="number" value={price[1]} onChange={(e) => setPrice([price[0], Number(e.target.value)])} className="w-20 h-10 px-3 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <input type="range" min={0} max={66000} step={1000} value={price[1]} onChange={(e) => setPrice([price[0], Number(e.target.value)])} className="w-full mt-3 accent-foreground" />
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-widest font-bold mb-3">Rating</h4>
        <div className="flex flex-col gap-1.5">
          {[4.5, 4, 3.5, 0].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`flex items-center gap-2 h-9 px-3 rounded-xl text-xs font-medium transition-colors ${minRating === r ? "bg-secondary" : "hover:bg-secondary/50"}`}
            >
              <Star className="w-3.5 h-3.5 fill-accent-amber text-accent-amber" />
              {r === 0 ? "Any rating" : `${r}+ stars`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-widest font-bold mb-3">Quick suggestions</h4>
        <div className="space-y-2">
          {["under ৳5500", "best for gifts", "trending today", "premium picks"].map((s) => (
            <button key={s} className="w-full text-left px-3 h-9 rounded-xl bg-gradient-soft text-xs font-medium hover:shadow-soft transition-shadow flex items-center gap-2">
              <Sparkles className="w-3 h-3 gradient-text" /> {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
