import { motion } from "framer-motion";
import { Database, AlertTriangle, Package, TrendingDown, RefreshCw, Search, Filter } from "lucide-react";

const inventory: { sku: string; name: string; vendor: string; category: string; stock: number; threshold: number; reserved: number; available: number; price: number; value: number; status: string }[] = [];

const statusConfig: Record<string, string> = {
  "Healthy": "badge-active", "Low Stock": "badge-pending", "Out of Stock": "badge-suspended"
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function InventoryPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Inventory Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor stock levels, low alerts and restock requests</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="w-4 h-4" />Sync Inventory
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total SKUs", value: "28,432", icon: Database, color: "text-neon-blue" },
          { label: "Low Stock", value: "89", icon: AlertTriangle, color: "text-neon-orange" },
          { label: "Out of Stock", value: "14", icon: Package, color: "text-destructive" },
          { label: "Inventory Value", value: "৳46.2 Cr", icon: TrendingDown, color: "text-neon-green" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Low Stock Alert Banner */}
      <motion.div variants={itemVariants} className="glass-card p-4 border border-neon-orange/30 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neon-orange/10 shrink-0">
          <AlertTriangle className="w-5 h-5 text-neon-orange" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-neon-orange">Low Stock Alert</p>
          <p className="text-xs text-muted-foreground">89 products are below their minimum threshold. Consider notifying vendors for restocking.</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neon-orange/10 text-neon-orange hover:bg-neon-orange/20 transition-colors shrink-0">
          Notify Vendors
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold shrink-0">Stock Overview</h3>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input placeholder="Search SKU or product..." className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-muted border border-border text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {["SKU", "Product", "Vendor", "Total Stock", "Available", "Threshold", "Unit Value", "Total Value", "Status"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, i) => (
                <motion.tr key={item.sku} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-mono text-xs text-muted-foreground">{item.sku}</td>
                  <td className="p-4">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">{item.vendor}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (item.stock / (item.threshold * 5)) * 100)}%`,
                            background: item.status === "Out of Stock" ? "hsl(0,85%,55%)" : item.status === "Low Stock" ? "hsl(30,100%,55%)" : "hsl(160,100%,50%)"
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.stock}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{item.available}</td>
                  <td className="p-4 text-sm font-mono text-muted-foreground">{item.threshold}</td>
                  <td className="p-4 text-sm">${item.price.toLocaleString()}</td>
                  <td className="p-4 text-sm font-bold text-neon-green">${item.value.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`badge-status ${statusConfig[item.status]}`}>{item.status}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
