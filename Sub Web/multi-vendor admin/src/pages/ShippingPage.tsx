import { motion } from "framer-motion";
import { Truck, MapPin, Clock, CheckCircle, AlertTriangle, Package, Globe, Search } from "lucide-react";

const shipments: { id: string; order: string; customer: string; vendor: string; carrier: string; tracking: string; origin: string; dest: string; status: string; eta: string; updated: string }[] = [];

const statusConfig: Record<string, string> = {
  "In Transit": "badge-premium", "Delivered": "badge-active", "Out for Delivery": "badge-pending",
  "Pending Pickup": "badge-status", "Delayed": "badge-suspended"
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function ShippingPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text-neon">Shipping & Tracking</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor all active shipments and delivery status</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Shipments", value: "1,284", icon: Truck, color: "text-neon-blue" },
          { label: "Out for Delivery", value: "347", icon: MapPin, color: "text-neon-green" },
          { label: "Delayed", value: "23", icon: AlertTriangle, color: "text-neon-orange" },
          { label: "Delivered Today", value: "892", icon: CheckCircle, color: "text-neon-purple" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center gap-3">
          <h3 className="text-sm font-semibold flex-1">Active Shipments</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input placeholder="Track shipment..." className="pl-8 pr-4 py-1.5 rounded-lg bg-muted border border-border text-xs w-48 focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {["Shipment", "Customer", "Carrier", "Tracking", "Route", "ETA", "Status", "Updated"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shipments.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <p className="text-xs font-mono text-primary">{s.id}</p>
                    <p className="text-[10px] text-muted-foreground">{s.order}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{s.customer}</p>
                    <p className="text-xs text-muted-foreground">{s.vendor}</p>
                  </td>
                  <td className="p-4 text-xs">{s.carrier}</td>
                  <td className="p-4 text-xs font-mono text-muted-foreground">{s.tracking}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-xs">
                      <span>{s.origin}</span><Globe className="w-3 h-3 text-muted-foreground" /><span>{s.dest}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-medium">{s.eta}</td>
                  <td className="p-4"><span className={`badge-status ${statusConfig[s.status]}`}>{s.status}</span></td>
                  <td className="p-4 text-xs text-muted-foreground">{s.updated}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Carrier Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { name: "CJ Logistics", onTime: 96.2, volume: 4821, rating: 4.8 },
          { name: "Lotte Logistics", onTime: 94.7, volume: 3241, rating: 4.6 },
          { name: "Hanjin Express", onTime: 91.3, volume: 2109, rating: 4.4 },
        ].map(c => (
          <motion.div variants={itemVariants} key={c.name} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-neon-blue" />
              <span className="text-sm font-medium">{c.name}</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">On-time delivery</span>
                  <span className="font-medium text-neon-green">{c.onTime}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${c.onTime}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-1.5 rounded-full bg-neon-green" />
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Volume</span><span>{c.volume.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Rating</span><span className="text-neon-orange">{c.rating} ★</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
