import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Plus, Edit2, Trash2, Eye, EyeOff, Link, Calendar, Monitor, Smartphone, ArrowUpDown } from "lucide-react";

const banners: { id: string; name: string; placement: string; target: string; startDate: string; endDate: string; clicks: number; impressions: number; ctr: string; device: string; active: boolean; priority: number }[] = [];

const placements = ["Homepage Hero", "Category Banner", "Sidebar Banner", "Bottom Strip", "Footer Banner", "Pop-up"];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function BannersPage() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Banner Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Control homepage banners, promotional displays and ad placements</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}>
          <Plus className="w-4 h-4" />Add Banner
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Banners", value: "12", icon: Image, color: "text-neon-green" },
          { label: "Total Impressions", value: "5.8M", icon: Eye, color: "text-neon-blue" },
          { label: "Total Clicks", value: "154K", icon: Link, color: "text-neon-orange" },
          { label: "Avg CTR", value: "2.65%", icon: ArrowUpDown, color: "text-neon-purple" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Available Placements */}
      <motion.div variants={itemVariants} className="glass-card p-4">
        <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Available Placements</h3>
        <div className="flex flex-wrap gap-2">
          {placements.map(p => (
            <motion.div key={p} whileHover={{ scale: 1.05 }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground cursor-pointer hover:text-foreground hover:bg-secondary transition-colors">
              {p}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass-card p-5 border border-neon-purple/20">
            <h3 className="text-sm font-semibold mb-4">Create New Banner</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><label className="text-xs text-muted-foreground mb-1.5 block">Banner Name</label>
                <input className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" placeholder="e.g. Summer Sale Hero" /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">Placement</label>
                <select className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  {placements.map(p => <option key={p}>{p}</option>)}
                </select></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">Target Audience</label>
                <input className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" placeholder="All Users / Category" /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">Start Date</label>
                <input type="date" className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">End Date</label>
                <input type="date" className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">Device Target</label>
                <select className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option>All Devices</option><option>Desktop Only</option><option>Mobile Only</option>
                </select></div>
            </div>
            <div className="mt-4 border-2 border-dashed border-border/50 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors">
              <Image className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload banner image</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB • Recommended: 1920×480px</p>
            </div>
            <div className="flex gap-2 mt-4">
              <motion.button whileHover={{ scale: 1.02 }} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}>Create Banner</motion.button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground bg-muted hover:text-foreground">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banners List */}
      <div className="space-y-3">
        {banners.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Fake banner preview */}
            <div className="w-24 h-14 rounded-lg flex items-center justify-center shrink-0 overflow-hidden" style={{ background: `linear-gradient(${45 + i * 30}deg, hsl(${160 + i * 40},60%,20%), hsl(${200 + i * 30},80%,15%))` }}>
              <Image className="w-5 h-5 text-white/30" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-medium">{b.name}</span>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{b.placement}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {b.device === "mobile" ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}{b.device}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{b.target} • {b.startDate} → {b.endDate}</p>
              <div className="flex gap-4 mt-1.5 text-xs">
                <span className="text-muted-foreground">Impressions: <span className="text-foreground font-medium">{b.impressions > 0 ? b.impressions.toLocaleString() : "—"}</span></span>
                <span className="text-muted-foreground">Clicks: <span className="text-neon-green font-medium">{b.clicks > 0 ? b.clicks.toLocaleString() : "—"}</span></span>
                <span className="text-muted-foreground">CTR: <span className="text-neon-orange font-medium">{b.ctr}</span></span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-medium flex items-center gap-1 ${b.active ? "text-neon-green" : "text-muted-foreground"}`}>
                {b.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}{b.active ? "Live" : "Hidden"}
              </span>
              <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20"><Edit2 className="w-3 h-3" /></motion.button>
              <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20"><Trash2 className="w-3 h-3" /></motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
