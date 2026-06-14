import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Plus, Copy, Edit2, Trash2, Percent, Users, Clock, CheckCircle, Search } from "lucide-react";
import TakaIcon from "@/components/TakaIcon";

const coupons: { code: string; type: string; value: number; minOrder: number; uses: number; maxUses: number | null; vendor: string; category: string; start: string; end: string; active: boolean; orders: number }[] = [];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function CouponsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Coupon Codes</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage discount codes, promotions, and usage analytics</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}>
          <Plus className="w-4 h-4" />Create Coupon
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Coupons", value: "23", icon: Star, color: "text-neon-orange" },
          { label: "Total Uses", value: "10,958", icon: Users, color: "text-neon-blue" },
          { label: "Revenue Generated", value: "৳1.56 Cr", icon: TakaIcon, color: "text-neon-green" },
          { label: "Expiring Soon", value: "5", icon: Clock, color: "text-destructive" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass-card p-5 border border-neon-green/20">
            <h3 className="text-sm font-semibold mb-4">Create New Coupon</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Coupon Code", placeholder: "e.g. SUMMER30", type: "text" },
                { label: "Discount Type", placeholder: "Percentage / Fixed", type: "select", opts: ["Percentage", "Fixed"] },
                { label: "Discount Value", placeholder: "e.g. 20 or 15.00", type: "number" },
                { label: "Minimum Order Amount", placeholder: "৳5,500", type: "number" },
                { label: "Max Uses", placeholder: "Leave empty for unlimited", type: "number" },
                { label: "Applicable Vendor", placeholder: "Platform-wide", type: "select", opts: ["Platform-wide", "TechMart Korea", "Fashion Seoul", "FoodExpress"] },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs text-muted-foreground mb-1.5 block">{f.label}</label>
                  {f.type === "select" ? (
                    <select className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                      {f.opts?.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} placeholder={f.placeholder} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <motion.button whileHover={{ scale: 1.02 }} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}>Create Coupon</motion.button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground bg-muted hover:text-foreground">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coupon codes..." className="w-full pl-9 pr-4 py-2.5 rounded-lg glass-card text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c, i) => (
          <motion.div key={c.code} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-5 hover-card-float">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-base font-bold font-mono text-primary tracking-wider">{c.code}</code>
                  <motion.button whileHover={{ scale: 1.2 }} onClick={() => handleCopy(c.code)} className="p-1 rounded text-muted-foreground hover:text-foreground">
                    {copied === c.code ? <CheckCircle className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
                  </motion.button>
                </div>
                <p className="text-xs text-muted-foreground">{c.vendor} • {c.category}</p>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-8 h-4 rounded-full relative cursor-pointer ${c.active ? "bg-neon-green" : "bg-muted"}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${c.active ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Value</p>
                <p className="text-lg font-bold text-destructive">{c.type === "Percentage" ? `${c.value}%` : `$${c.value}`}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Used</p>
                <p className="text-lg font-bold">{c.uses.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Orders</p>
                <p className="text-lg font-bold text-neon-green">{c.orders.toLocaleString()}</p>
              </div>
            </div>
            {c.maxUses && (
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Usage Limit</span>
                  <span className="font-mono">{c.uses}/{c.maxUses}</span>
                </div>
                <div className="h-1 bg-muted rounded-full">
                  <div className="h-1 rounded-full bg-neon-orange" style={{ width: `${(c.uses / c.maxUses) * 100}%` }} />
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{c.start} → {c.end}</span>
              <div className="flex gap-1">
                <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20"><Edit2 className="w-3 h-3" /></motion.button>
                <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20"><Trash2 className="w-3 h-3" /></motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
