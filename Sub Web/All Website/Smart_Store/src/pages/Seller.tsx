import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import { ArrowUp, ArrowDown, DollarSign, ShoppingBag, Eye, Users, Plus, Edit2, Trash2, MoreVertical, TrendingUp, Palette } from "lucide-react";
import { products as mockProducts, sellerSales as mockSales } from "@/data/mockData";
import { analyticsApi, productsApi, storesApi } from "@/lib/api";
import { normalizeStore, normalizeProduct } from "@/lib/normalize";

export default function SellerPage() {
  const [store,    setStore]    = useState<any>(null);
  const [list,     setList]     = useState<any[]>(mockProducts.filter((p) => p.storeId === "s2"));
  const [series,   setSeries]   = useState<any[]>(mockSales as any);
  const [analytics,setAnalytics]= useState<any | null>(null);

  useEffect(() => {
    storesApi.me().then((r) => setStore(normalizeStore(r?.store || r?.data || r))).catch(() => {});
    productsApi.myProducts().then((r) => {
      const arr = (r?.products || r?.data || []).map(normalizeProduct);
      if (arr.length) setList(arr);
    }).catch(() => {});
    analyticsApi.seller().then((r) => {
      const a = r?.analytics || r?.data || r;
      if (a) {
        setAnalytics(a);
        if (Array.isArray(a.salesByDay) && a.salesByDay.length) setSeries(a.salesByDay);
      }
    }).catch(() => {});
  }, []);

  const kpis = useMemo(() => [
    { label: "Revenue (7d)", value: analytics?.revenue7d   != null ? `৳${Number(analytics.revenue7d).toLocaleString()}`  : "৳1,72,92,000", trend: analytics?.revenueTrend ?? 12.4, icon: DollarSign,  gradient: "from-violet-500 to-fuchsia-500" },
    { label: "Orders",       value: analytics?.orders      != null ? `${analytics.orders}`                              : "218",          trend: analytics?.ordersTrend  ?? 8.1,  icon: ShoppingBag, gradient: "from-pink-500 to-rose-500" },
    { label: "Visitors",     value: analytics?.visitors    != null ? Number(analytics.visitors).toLocaleString()        : "12,408",       trend: analytics?.visitorsTrend?? -2.3, icon: Eye,         gradient: "from-amber-500 to-orange-500" },
    { label: "Followers",    value: analytics?.followers   != null ? `${analytics.followers}`                           : "342K",         trend: analytics?.followersTrend?? 4.7, icon: Users,       gradient: "from-cyan-500 to-blue-500" },
  ], [analytics]);

  const sellerProducts = list;
  const storeName = store?.name || "My Store";

  return (
    <div className="container py-8 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Seller Console</p>
          <h1 className="font-display text-3xl lg:text-4xl font-bold">{storeName}</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/seller/customize" className="h-11 px-5 rounded-2xl border border-border text-sm font-semibold flex items-center gap-1.5">
            <Palette className="w-4 h-4" /> Customize
          </Link>
          <button className="h-11 px-5 rounded-2xl bg-gradient-primary text-white text-sm font-semibold flex items-center gap-1.5 shadow-elegant">
            <Plus className="w-4 h-4" /> Add product
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="relative bg-card rounded-3xl border border-border/60 p-5 shadow-soft hover:shadow-glow transition-all overflow-hidden group"
          >
            <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${k.gradient} opacity-20 group-hover:opacity-30 blur-2xl transition-opacity`} />
            <div className={`relative w-10 h-10 rounded-2xl bg-gradient-to-br ${k.gradient} flex items-center justify-center mb-4 shadow-soft`}>
              <k.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{k.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <Counter value={k.value} />
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${k.trend > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                {k.trend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(k.trend)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-card rounded-3xl border border-border/60 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-lg">Revenue this week</h3>
              <p className="text-xs text-muted-foreground">+18.2% vs previous week</p>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Live</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-3xl border border-border/60 p-6 shadow-soft">
          <h3 className="font-display font-bold text-lg mb-1">Orders</h3>
          <p className="text-xs text-muted-foreground mb-4">By day</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "hsl(var(--secondary))", radius: 10 }} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="orders" fill="hsl(var(--foreground))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Products table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl border border-border/60 shadow-soft overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="font-display font-bold text-lg">Products</h3>
            <p className="text-xs text-muted-foreground">{sellerProducts.length} active listings</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-6 py-3 font-semibold">Product</th>
                <th className="px-6 py-3 font-semibold">Price</th>
                <th className="px-6 py-3 font-semibold">Stock</th>
                <th className="px-6 py-3 font-semibold">Rating</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody>
              {sellerProducts.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/40 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <p className="font-semibold line-clamp-1">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-semibold tabular-nums">৳{p.price.toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className={`tabular-nums font-medium ${(p.stock ?? 0) < 25 ? "text-accent-pink" : ""}`}>{p.stock}</span>
                  </td>
                  <td className="px-6 py-3 tabular-nums">{p.rating} ★</td>
                  <td className="px-6 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-mint/15 text-emerald-700 dark:text-emerald-300">Active</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-1">
                      <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                      <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"><MoreVertical className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function Counter({ value }: { value: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="font-display text-2xl font-bold tabular-nums"
    >
      {value}
    </motion.span>
  );
}
