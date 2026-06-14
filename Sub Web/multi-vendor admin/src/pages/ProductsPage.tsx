import { motion } from "framer-motion";
import { Package, Search, Filter, MoreHorizontal, Plus, Eye, EyeOff, Star } from "lucide-react";

const products: { id: number; name: string; vendor: string; category: string; price: string; stock: number; status: string; featured: boolean }[] = [];

const statusBadge = (status: string) => {
  switch (status) {
    case "Active": return "badge-active";
    case "Pending": return "badge-pending";
    case "Out of Stock": return "badge-suspended";
    case "Low Stock": return "badge-status bg-neon-orange/15 text-neon-orange";
    default: return "badge-status";
  }
};

export default function ProductsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Product Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all vendor products, categories, and inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground hover:bg-secondary transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground" style={{ background: "var(--gradient-neon)" }}>
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Products", value: "24,891" },
          { label: "Active", value: "22,450" },
          { label: "Pending Approval", value: "342" },
          { label: "Out of Stock", value: "89" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <p className="text-lg font-bold font-mono text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Products Table */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search products..." className="bg-transparent flex-1 outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
        </div>
        <table className="data-grid">
          <thead>
            <tr>
              <th>Product</th>
              <th>Vendor</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.03 }}>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Package className="w-4 h-4 text-muted-foreground" /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground flex items-center gap-1">
                        {p.name} {p.featured && <Star className="w-3 h-3 text-neon-yellow fill-neon-yellow" />}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="text-muted-foreground">{p.vendor}</td>
                <td><span className="badge-status bg-muted text-muted-foreground">{p.category}</span></td>
                <td className="font-mono">{p.price}</td>
                <td className="font-mono">{p.stock}</td>
                <td><span className={statusBadge(p.status)}>{p.status}</span></td>
                <td><button className="p-1 rounded hover:bg-muted transition-colors"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
