import { useState } from "react";
import { motion } from "framer-motion";
import { Percent, Edit2, Save, Store, RefreshCw, BadgeDollarSign, Award, Tag } from "lucide-react";
import TakaIcon from "@/components/TakaIcon";

const vendorRules: { vendor: string; plan: string; rate: number; override: boolean; monthly: number; ytd: number }[] = [];

const categoryRules = [
  { category: "Electronics", baseRate: 8, minRate: 5, maxRate: 12 },
  { category: "Fashion", baseRate: 12, minRate: 8, maxRate: 18 },
  { category: "Food & Beverage", baseRate: 15, minRate: 10, maxRate: 20 },
  { category: "Home & Living", baseRate: 10, minRate: 6, maxRate: 15 },
  { category: "Books & Media", baseRate: 6, minRate: 4, maxRate: 10 },
];

const plans = [
  { name: "Basic", monthly: 0, commission: 12, badge: "—", listing: 50 },
  { name: "Silver", monthly: 29, commission: 10, badge: "Silver Badge", listing: 200 },
  { name: "Gold", monthly: 79, commission: 8, badge: "Gold Badge + Priority", listing: 1000 },
  { name: "Premium", monthly: 199, commission: 6, badge: "Premium + Featured Slots", listing: "Unlimited" },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function CommissionPage() {
  const [globalRate, setGlobalRate] = useState(10);
  const [editing, setEditing] = useState(false);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Commission System</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure global, category, and vendor-specific commission rates</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Commission Earned (MTD)", value: "৳47,12,400", icon: TakaIcon, color: "text-neon-green" },
          { label: "YTD Commission", value: "৳3.44 Cr", icon: BadgeDollarSign, color: "text-neon-blue" },
          { label: "Avg Rate (Platform)", value: "9.3%", icon: Percent, color: "text-neon-orange" },
          { label: "Premium Vendors", value: "48", icon: Award, color: "text-neon-purple" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Global Rate Control */}
      <motion.div variants={itemVariants} className="glass-card p-5 border border-neon-green/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Percent className="w-4 h-4 text-neon-green" />Global Commission Rate</h3>
          {editing ? (
            <motion.button whileHover={{ scale: 1.03 }} onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}>
              <Save className="w-3.5 h-3.5" />Save Changes
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.03 }} onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:text-foreground">
              <Edit2 className="w-3.5 h-3.5" />Edit
            </motion.button>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <input type="range" min={1} max={30} value={globalRate} onChange={e => setGlobalRate(Number(e.target.value))} disabled={!editing}
              className="w-full accent-neon-green" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>1%</span><span>30%</span></div>
          </div>
          <div className="text-center">
            <span className="text-4xl font-bold text-neon-green font-mono">{globalRate}%</span>
            <p className="text-xs text-muted-foreground mt-1">Current Rate</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">This rate applies to all vendors unless overridden by category or vendor-specific rules.</p>
      </motion.div>

      {/* Category Rules */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Tag className="w-4 h-4 text-neon-orange" />Category Commission Rules</h3>
          <span className="text-xs text-muted-foreground">Override global rate per category</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {["Category", "Base Rate", "Min", "Max", "Actions"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categoryRules.map((r, i) => (
                <tr key={r.category} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm font-medium">{r.category}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-neon-green font-bold font-mono">{r.baseRate}%</span>
                      <div className="w-20 bg-muted rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-neon-green" style={{ width: `${(r.baseRate / 20) * 100}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground font-mono">{r.minRate}%</td>
                  <td className="p-4 text-xs text-muted-foreground font-mono">{r.maxRate}%</td>
                  <td className="p-4">
                    <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20">
                      <Edit2 className="w-3 h-3" />
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Subscription Plans */}
      <motion.div variants={itemVariants}>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-neon-purple" />Subscription Plans</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
              className={`glass-card p-5 ${i === 3 ? "border border-neon-green/30" : ""}`}>
              <div className="flex items-center gap-2 mb-3">
                <Award className={`w-5 h-5 ${["text-muted-foreground", "text-neon-blue", "text-neon-orange", "text-neon-green"][i]}`} />
                <span className="text-sm font-bold">{p.name}</span>
              </div>
              <p className="text-2xl font-bold mb-1">${p.monthly}<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
              <div className="space-y-1.5 mt-3 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Commission</span><span className="text-neon-green font-bold">{p.commission}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Listings</span><span>{p.listing}</span></div>
                <div className="flex justify-between text-neon-purple"><span>Badge</span><span>{p.badge}</span></div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Vendor Overrides */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Store className="w-4 h-4 text-neon-blue" />Vendor-specific Commission Overrides</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {["Vendor", "Plan", "Rate", "Override", "MTD Earned", "YTD Earned"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendorRules.map((v, i) => (
                <tr key={v.vendor} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold bg-neon-blue/20 text-neon-blue">{v.vendor[0]}</div>
                      <span className="text-sm font-medium">{v.vendor}</span>
                    </div>
                  </td>
                  <td className="p-4"><span className="text-xs bg-muted px-2 py-0.5 rounded">{v.plan}</span></td>
                  <td className="p-4 text-neon-green font-bold font-mono">{v.rate}%</td>
                  <td className="p-4"><span className={`text-xs font-medium ${v.override ? "text-neon-purple" : "text-muted-foreground"}`}>{v.override ? "Custom" : "Default"}</span></td>
                  <td className="p-4 text-sm text-neon-orange">${v.monthly.toLocaleString()}</td>
                  <td className="p-4 text-sm text-neon-green font-medium">${v.ytd.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
