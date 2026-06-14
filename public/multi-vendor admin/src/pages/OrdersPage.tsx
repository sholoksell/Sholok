import { motion } from "framer-motion";
import { ShoppingCart, Search, Filter, MoreHorizontal, Eye, Truck, RefreshCw } from "lucide-react";

const orders: { id: string; customer: string; vendor: string; items: number; total: string; payment: string; status: string; date: string }[] = [];

const statusBadge = (s: string) => {
  switch (s) {
    case "Delivered": return "badge-active";
    case "Processing": return "badge-pending";
    case "Shipped": return "badge-premium";
    case "Pending": return "badge-status bg-neon-orange/15 text-neon-orange";
    case "Refunded": return "badge-suspended";
    default: return "badge-status";
  }
};

export default function OrdersPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Order Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage all marketplace orders</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Orders", value: "14,582", icon: ShoppingCart },
          { label: "Processing", value: "234", icon: RefreshCw },
          { label: "Shipped", value: "1,890", icon: Truck },
          { label: "Refund Requests", value: "45", icon: RefreshCw },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted"><stat.icon className="w-4 h-4 text-muted-foreground" /></div>
            <div>
              <p className="text-lg font-bold font-mono text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search orders..." className="bg-transparent flex-1 outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground"><Filter className="w-4 h-4" /> Filters</button>
        </div>
        <table className="data-grid">
          <thead>
            <tr><th>Order ID</th><th>Customer</th><th>Vendor</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th></th></tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.03 }}>
                <td className="font-mono text-primary text-xs">{o.id}</td>
                <td>{o.customer}</td>
                <td className="text-muted-foreground">{o.vendor}</td>
                <td className="font-mono">{o.items}</td>
                <td className="font-mono">{o.total}</td>
                <td><span className="badge-status bg-muted text-muted-foreground">{o.payment}</span></td>
                <td><span className={statusBadge(o.status)}>{o.status}</span></td>
                <td className="text-xs font-mono text-muted-foreground">{o.date}</td>
                <td><button className="p-1 rounded hover:bg-muted transition-colors"><Eye className="w-4 h-4 text-muted-foreground" /></button></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
