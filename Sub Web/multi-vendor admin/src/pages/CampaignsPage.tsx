import { useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Plus, Play, Pause, Trash2, Eye, Calendar, Target, TrendingUp, Zap } from "lucide-react";
import TakaIcon from "@/components/TakaIcon";

const campaigns: { id: string; name: string; type: string; vendor: string; discount: string; budget: number; spent: number; impressions: string; clicks: string; orders: number; start: string; end: string; status: string }[] = [];

const statusConfig: Record<string, string> = { Active: "badge-active", Scheduled: "badge-premium", Ended: "badge-status", Rejected: "badge-suspended" };

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function CampaignsPage() {
  const [tab, setTab] = useState("All");

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Marketing Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage promotions, flash sales, and vendor campaign approvals</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}>
          <Plus className="w-4 h-4" />New Campaign
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Campaigns", value: "8", icon: Zap, color: "text-neon-green" },
          { label: "Total Impressions", value: "12.4M", icon: Eye, color: "text-neon-blue" },
          { label: "Revenue from Ads", value: "৳3.12 Cr", icon: TakaIcon, color: "text-neon-orange" },
          { label: "Conversion Rate", value: "6.8%", icon: Target, color: "text-neon-purple" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="flex gap-1.5">
        {["All", "Active", "Scheduled", "Ended"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {campaigns.filter(c => tab === "All" || c.status === tab).map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-5 hover-card-float">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge-status ${statusConfig[c.status]}`}>{c.status}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">{c.type}</span>
                </div>
                <h3 className="text-sm font-semibold">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.vendor}</p>
              </div>
              <div className="flex gap-1">
                {c.status === "Active" ? (
                  <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-neon-orange/10 text-neon-orange hover:bg-neon-orange/20"><Pause className="w-3.5 h-3.5" /></motion.button>
                ) : c.status === "Scheduled" ? (
                  <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-neon-green/10 text-neon-green hover:bg-neon-green/20"><Play className="w-3.5 h-3.5" /></motion.button>
                ) : null}
                <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></motion.button>
                <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5" /></motion.button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Discount</p>
                <p className="text-lg font-bold text-destructive">{c.discount}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Impressions</p>
                <p className="text-lg font-bold text-neon-blue">{c.impressions}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Orders</p>
                <p className="text-lg font-bold text-neon-green">{c.orders.toLocaleString()}</p>
              </div>
            </div>

            {/* Budget Progress */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Budget Used</span>
                <span className="font-mono">${c.spent.toLocaleString()} / ${c.budget.toLocaleString()}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.spent / c.budget) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="h-1.5 rounded-full"
                  style={{ background: "var(--gradient-neon)" }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />{c.start} → {c.end}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
