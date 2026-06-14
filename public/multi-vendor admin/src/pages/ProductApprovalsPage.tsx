import { useState, type ElementType } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, XCircle, Eye, Clock, AlertTriangle, Star, Search, Filter, ImageOff } from "lucide-react";

const products: { id: string; name: string; vendor: string; category: string; price: number; stock: number; images: number; submitted: string; status: string; rating: number | null; featured: boolean; tags: string[] }[] = [];

const statusConfig: Record<string, { cls: string; icon: ElementType }> = {
  Pending: { cls: "badge-pending", icon: Clock },
  "Under Review": { cls: "badge-premium", icon: Eye },
  Approved: { cls: "badge-active", icon: CheckCircle },
  Rejected: { cls: "badge-suspended", icon: XCircle },
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function ProductApprovalsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const tabs = ["All", "Pending", "Under Review", "Approved", "Rejected"];
  const filtered = products.filter(p =>
    (filter === "All" || p.status === filter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text-neon">Product Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and approve vendor product submissions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Pending Review", value: "47", cls: "text-neon-orange", icon: Clock },
          { label: "Under Review", value: "12", cls: "text-neon-purple", icon: Eye },
          { label: "Approved Today", value: "34", cls: "text-neon-green", icon: CheckCircle },
          { label: "Rejected Today", value: "3", cls: "text-destructive", icon: XCircle },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-7 h-7 ${s.cls}`} />
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {tabs.map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p, i) => {
          const Cfg = statusConfig[p.status];
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-4 hover-card-float space-y-3"
            >
              {/* Image Placeholder */}
              <div className="w-full h-32 rounded-lg bg-muted flex items-center justify-center relative overflow-hidden">
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-lg"
                  style={{ background: "var(--gradient-neon)", opacity: 0.04 }}
                />
                <ImageOff className="w-8 h-8 text-muted-foreground/30" />
                <span className="absolute top-2 right-2 text-[10px] bg-muted/80 px-1.5 py-0.5 rounded-md font-mono">{p.images} imgs</span>
                {p.featured && (
                  <span className="absolute top-2 left-2 text-[10px] bg-neon-orange/20 text-neon-orange px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-neon-orange" />Featured
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold leading-snug line-clamp-2">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.vendor} • {p.category}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-neon-green">${p.price.toLocaleString()}</span>
                <span className={`badge-status ${Cfg.cls} flex items-center gap-1`}><Cfg.icon className="w-3 h-3" />{p.status}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {p.tags.map(t => <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{t}</span>)}
              </div>
              <div className="text-xs text-muted-foreground">Submitted: {p.submitted} • Stock: {p.stock}</div>
              {(p.status === "Pending" || p.status === "Under Review") && (
                <div className="flex gap-2 pt-1">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1" style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}>
                    <CheckCircle className="w-3 h-3" />Approve
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center gap-1">
                    <XCircle className="w-3 h-3" />Reject
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} className="py-1.5 px-2 rounded-lg text-xs bg-muted text-muted-foreground hover:text-foreground">
                    <Eye className="w-3 h-3" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
