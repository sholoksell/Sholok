import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Users, Store as StoreIcon, ShoppingBag, DollarSign, AlertTriangle, Search, X, Check, Sparkles, BarChart3, Settings as Cog } from "lucide-react";
import { adminUsers, stores, products, orders } from "@/data/mockData";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { sellerSales } from "@/data/mockData";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "stores", label: "Stores", icon: StoreIcon },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "settings", label: "Settings", icon: Cog },
] as const;

const stats = [
  { l: "Total revenue", v: "৳3,13,41,310", icon: DollarSign, gradient: "from-violet-500 to-fuchsia-500" },
  { l: "Active users", v: "12,408", icon: Users, gradient: "from-pink-500 to-rose-500" },
  { l: "Stores", v: "1,284", icon: StoreIcon, gradient: "from-amber-500 to-orange-500" },
  { l: "Reports", v: "12", icon: AlertTriangle, gradient: "from-cyan-500 to-blue-500" },
];

export default function AdminPage() {
  const [view, setView] = useState<typeof navItems[number]["id"]>("dashboard");
  const [filter, setFilter] = useState("");
  const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(null);

  const filteredUsers = adminUsers.filter((u) => u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-card border-r border-border/60 p-4 sticky top-20 h-[calc(100vh-5rem)]">
        <div className="flex items-center gap-2 px-2 py-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-sm">Admin Panel</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={`relative flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium transition-colors ${view === n.id ? "bg-secondary" : "text-foreground/70 hover:bg-secondary/40"}`}
            >
              {view === n.id && <motion.span layoutId="admin-pill" className="absolute inset-0 bg-secondary rounded-xl" transition={{ type: "spring", damping: 26, stiffness: 320 }} />}
              <span className="relative flex items-center gap-3">
                <n.icon className="w-4 h-4" />
                {n.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0 p-6 lg:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Sholok Smart Store · Admin</p>
            <h1 className="font-display text-2xl lg:text-3xl font-bold capitalize">{view}</h1>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search…" className="w-56 h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-primary text-white flex items-center justify-center font-bold text-xs shadow-glow">A</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === "dashboard" && (
            <motion.div key="d" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((s, i) => (
                  <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }} className="relative bg-card rounded-3xl border border-border/60 p-5 shadow-soft hover:shadow-glow transition-all overflow-hidden">
                    <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${s.gradient} opacity-20 blur-2xl`} />
                    <div className={`relative w-9 h-9 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3`}>
                      <s.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{s.l}</p>
                    <p className="font-display text-2xl font-bold mt-1 tabular-nums">{s.v}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-card rounded-3xl border border-border/60 p-6 shadow-soft">
                  <h3 className="font-display font-bold text-lg mb-1">Platform revenue</h3>
                  <p className="text-xs text-muted-foreground mb-4">Last 7 days</p>
                  <div className="h-64">
                    <ResponsiveContainer>
                      <AreaChart data={sellerSales} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--accent-pink))" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="hsl(var(--accent-pink))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent-pink))" strokeWidth={2.5} fill="url(#rev2)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gradient-night text-white rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-accent-pink/30 blur-3xl" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-3">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Insight</p>
                    <h3 className="font-display text-xl font-bold mt-1 mb-2">3 stores need review</h3>
                    <p className="text-sm text-white/70 mb-4">Anomalous order spikes detected. We recommend a quick audit.</p>
                    <button className="h-9 px-4 rounded-xl bg-white text-foreground text-xs font-semibold">Review now</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === "users" && (
            <motion.div key="u" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-card rounded-3xl border border-border/60 shadow-soft overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="px-6 py-3 font-semibold">User</th>
                    <th className="px-6 py-3 font-semibold">Role</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Joined</th>
                    <th className="px-6 py-3 font-semibold w-32"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <motion.tr key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-border/40 hover:bg-secondary/30">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-primary text-white text-xs font-bold flex items-center justify-center">{u.name.charAt(0)}</div>
                          <div>
                            <p className="font-semibold">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-xs"><span className="px-2.5 py-1 rounded-full bg-secondary font-semibold">{u.role}</span></td>
                      <td className="px-6 py-3 text-xs">
                        <span className={`px-2.5 py-1 rounded-full font-semibold ${u.status === "Active" ? "bg-accent-mint/15 text-emerald-700 dark:text-emerald-300" : "bg-destructive/15 text-destructive"}`}>{u.status}</span>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground text-xs">{u.joined}</td>
                      <td className="px-6 py-3">
                        <button onClick={() => setConfirm({ id: u.id, name: u.name })} className="text-xs font-semibold text-destructive hover:underline">Suspend</button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {view === "stores" && (
            <motion.div key="s" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((s) => (
                <div key={s.id} className="bg-card rounded-3xl border border-border/60 p-5 shadow-soft">
                  <div className={`h-24 rounded-2xl bg-gradient-to-br ${s.gradient} mb-4`} />
                  <h3 className="font-display font-bold">{s.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{s.tagline}</p>
                  <div className="flex justify-between text-xs">
                    <span>{s.products} products</span>
                    <span>{s.followers} followers</span>
                    <span>{s.rating}★</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {view === "orders" && (
            <motion.div key="o" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-card rounded-3xl border border-border/60 shadow-soft overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="px-6 py-3 font-semibold">Order</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Items</th>
                    <th className="px-6 py-3 font-semibold">Total</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-border/40 hover:bg-secondary/30">
                      <td className="px-6 py-3 font-mono text-xs">{o.id}</td>
                      <td className="px-6 py-3 text-xs">{o.date}</td>
                      <td className="px-6 py-3 text-xs">{o.items.length}</td>
                      <td className="px-6 py-3 font-semibold tabular-nums">৳{o.total.toLocaleString()}</td>
                      <td className="px-6 py-3 text-xs"><span className="px-2.5 py-1 rounded-full bg-secondary font-semibold">{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {view === "settings" && (
            <motion.div key="set" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="max-w-2xl bg-card rounded-3xl border border-border/60 p-6 shadow-soft">
              <h3 className="font-display font-bold text-lg mb-4">Platform settings</h3>
              <p className="text-sm text-muted-foreground">Marketplace-wide configuration lives here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirm(null)} className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="pointer-events-auto bg-card rounded-3xl shadow-elegant p-6 max-w-sm w-full">
                <div className="w-12 h-12 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center mb-3">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl font-bold mb-1">Suspend {confirm.name}?</h3>
                <p className="text-sm text-muted-foreground mb-5">They won't be able to place orders or post until reinstated.</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setConfirm(null)} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold flex items-center gap-1.5"><X className="w-3.5 h-3.5" /> Cancel</button>
                  <button onClick={() => setConfirm(null)} className="h-10 px-4 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Confirm</button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
