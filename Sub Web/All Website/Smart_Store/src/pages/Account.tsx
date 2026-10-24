import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Heart, Settings, LogOut, MapPin, ShoppingBag, Sparkles, Store as StoreIcon, BarChart3 } from "lucide-react";
import { products, user as mockUser, orders as mockOrders } from "@/data/mockData";
import { useCart } from "@/store/cartContext";
import { useAuth } from "@/store/authContext";
import { ordersApi } from "@/lib/api";
import ProductCard from "@/components/marketplace/ProductCard";
import { toast } from "sonner";

const tabs = [
  { id: "orders",    label: "Orders",    icon: Package },
  { id: "wishlist",  label: "Wishlist",  icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "settings",  label: "Settings",  icon: Settings },
] as const;

const statusColor: Record<string, string> = {
  Delivered: "bg-accent-mint/15 text-emerald-700 dark:text-emerald-300",
  Shipped: "bg-accent/15 text-accent",
  Processing: "bg-accent-amber/15 text-amber-700 dark:text-amber-300",
  Cancelled: "bg-destructive/15 text-destructive",
};

export default function AccountPage() {
  const [params, setParams] = useSearchParams();
  const initialTab = (params.get("tab") as typeof tabs[number]["id"]) ?? "orders";
  const [tab, setTab] = useState<typeof tabs[number]["id"]>(initialTab);
  const { wishlist } = useCart();
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const wishlistItems = products.filter((p) => wishlist.has(p.id));

  // Live orders from backend (with mock fallback)
  const [orders, setOrders] = useState<any[]>(mockOrders as any);
  useEffect(() => {
    ordersApi.myOrders()
      .then((res) => setOrders(res?.orders || res?.data || []))
      .catch(() => { /* keep mock fallback */ });
  }, []);

  const u = authUser ? {
    name:   authUser.name,
    email:  authUser.email,
    avatar: (authUser.name?.[0] || "U").toUpperCase(),
    tier:   authUser.role === "seller" ? "Seller" : authUser.role === "admin" ? "Admin" : mockUser.tier,
    points: mockUser.points,
    joined: mockUser.joined,
  } : mockUser;

  useEffect(() => { setParams({ tab }, { replace: true }); }, [tab, setParams]);

  const onLogout = async () => {
    await logout();
    toast("Signed out");
    navigate("/");
  };

  return (
    <div className="container py-8 lg:py-12">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-4xl bg-gradient-soft p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center text-white font-display text-2xl font-bold shadow-glow">
          {u.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl lg:text-3xl font-bold">{u.name}</h1>
            <span className="px-2 py-0.5 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-wider">{u.tier}</span>
          </div>
          <p className="text-sm text-muted-foreground">{u.email}{u.joined ? ` · Member since ${u.joined}` : ""}</p>
          {(authUser?.role === "seller" || authUser?.role === "admin") && (
            <div className="flex gap-2 mt-3 flex-wrap">
              <Link to="/seller" className="text-xs font-semibold inline-flex items-center gap-1 px-3 h-8 rounded-full bg-foreground text-background">
                <BarChart3 className="w-3 h-3" /> Seller dashboard
              </Link>
              <Link to="/seller/customize" className="text-xs font-semibold inline-flex items-center gap-1 px-3 h-8 rounded-full border border-border">
                <StoreIcon className="w-3 h-3" /> Customize store
              </Link>
            </div>
          )}
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Stat label="Points" value={u.points.toLocaleString()} />
          <Stat label="Orders" value={`${orders.length}`} />
          <Stat label="Saved"  value={`${wishlist.size}`} />
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-card rounded-3xl border border-border/60 p-2 shadow-soft sticky top-24">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto scrollbar-hide">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-3 px-4 h-11 rounded-2xl text-sm font-medium transition-colors shrink-0 ${
                    tab === t.id ? "bg-secondary text-foreground" : "text-foreground/70 hover:bg-secondary/40"
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
              <button onClick={onLogout} className="hidden lg:flex items-center gap-3 px-4 h-11 rounded-2xl text-sm font-medium text-muted-foreground hover:bg-secondary/40">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {tab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <h2 className="font-display text-2xl font-bold mb-4">Your orders</h2>
                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <div className="rounded-3xl bg-secondary/40 p-12 text-center">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-semibold mb-1">No orders yet</h3>
                      <p className="text-sm text-muted-foreground">Once you place an order it will appear here.</p>
                    </div>
                  ) : orders.map((o: any, i: number) => {
                    const itemList = (o.items || []).map((it: any) => {
                      const local = products.find((p) => p.id === it.productId);
                      return {
                        id:       it.product || it.productId || it._id || i,
                        name:     it.name || local?.name || "",
                        image:    it.image || local?.image || "",
                        quantity: it.quantity || 1,
                      };
                    });
                    const status = o.orderStatus || o.status || "Processing";
                    const total  = o.totalAmount ?? o.total ?? 0;
                    const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : (o.date || "");
                    const num     = o.orderNumber || o.id || o._id;
                    return (
                      <motion.div
                        key={num || i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -2 }}
                        className="rounded-3xl bg-card border border-border/60 p-5 shadow-soft hover:shadow-elegant transition-shadow"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">{num} {dateStr && `· ${dateStr}`}</p>
                            <p className="font-display font-bold tabular-nums">৳{Number(total).toLocaleString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[status] || "bg-secondary text-foreground"}`}>{status}</span>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                          {itemList.map((it: any, k: number) => (
                            <div key={k} className="flex items-center gap-3 flex-1 min-w-0">
                              {it.image && <img src={it.image} alt={it.name} className="w-14 h-14 rounded-xl object-cover" />}
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{it.name}</p>
                                <p className="text-xs text-muted-foreground">Qty {it.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button className="h-9 px-4 rounded-xl bg-secondary text-xs font-semibold hover:bg-secondary/70">Track order</button>
                          <button className="h-9 px-4 rounded-xl border border-border text-xs font-semibold hover:bg-secondary/40">Reorder</button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {tab === "wishlist" && (
              <motion.div key="w" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <h2 className="font-display text-2xl font-bold mb-4">Saved for later</h2>
                {wishlistItems.length === 0 ? (
                  <div className="rounded-3xl bg-secondary/40 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">No favorites yet</h3>
                    <p className="text-sm text-muted-foreground">Tap the heart on any product to save it here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistItems.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                  </div>
                )}
              </motion.div>
            )}

            {tab === "addresses" && (
              <motion.div key="addr" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <h2 className="font-display text-2xl font-bold mb-4">Addresses</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "Home", line: "221B Baker Street, Brooklyn 11201" },
                    { label: "Work", line: "500 7th Ave, New York 10018" },
                  ].map((a) => (
                    <div key={a.label} className="rounded-3xl bg-card border border-border/60 p-5 shadow-soft">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">{a.label}</span>
                        <button className="text-xs font-semibold text-accent">Edit</button>
                      </div>
                      <p className="text-sm">{a.line}</p>
                    </div>
                  ))}
                  <button className="rounded-3xl border-2 border-dashed border-border p-5 text-sm font-semibold text-muted-foreground hover:bg-secondary/30 transition-colors">
                    + Add new address
                  </button>
                </div>
              </motion.div>
            )}

            {tab === "settings" && (
              <motion.div key="s" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <h2 className="font-display text-2xl font-bold mb-4">Settings</h2>
                <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-soft space-y-5">
                  {[
                    { l: "Email notifications", d: "Order updates, drops, top picks" },
                    { l: "Push notifications",  d: "Live shopping alerts" },
                    { l: "Marketing emails",    d: "Promotions and seasonal sales" },
                    { l: "Personalization",     d: "Use my activity to power recommendations" },
                  ].map((s, i) => (
                    <div key={s.l} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{s.l}</p>
                        <p className="text-xs text-muted-foreground">{s.d}</p>
                      </div>
                      <Toggle defaultOn={i !== 2} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Insight panel */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8 rounded-3xl bg-gradient-night p-6 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-accent-pink/30 blur-3xl" />
            <div className="relative flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-1">Insight</p>
                <h3 className="font-display text-xl font-bold mb-1">You save 23% by following trending stores</h3>
                <p className="text-sm text-white/70">3 stores you follow are running flash sales right now.</p>
              </div>
              <TrendingUp className="w-5 h-5 ml-auto text-white/40" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-2.5 rounded-2xl bg-card border border-border/60 text-center min-w-[80px]">
      <p className="font-display font-bold text-lg">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
    </div>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-foreground" : "bg-secondary"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className={`absolute top-0.5 w-5 h-5 bg-background rounded-full shadow-soft ${on ? "right-0.5" : "left-0.5"}`}
      />
    </button>
  );
}
