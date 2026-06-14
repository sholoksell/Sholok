import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes, Plus, Edit2, Trash2, ChevronRight, Package, Tag, Percent, Eye
} from "lucide-react";

interface Category {
  id: string; name: string; slug: string; parent: string | null;
  products: number; commission: number; active: boolean; icon: string;
  children?: Category[];
}

const categories: Category[] = [
  { id: "c1", name: "Electronics", slug: "electronics", parent: null, products: 4821, commission: 8, active: true, icon: "💻", children: [
    { id: "c1a", name: "Smartphones", slug: "smartphones", parent: "c1", products: 1243, commission: 7, active: true, icon: "📱" },
    { id: "c1b", name: "Laptops", slug: "laptops", parent: "c1", products: 892, commission: 8, active: true, icon: "💻" },
    { id: "c1c", name: "Tablets", slug: "tablets", parent: "c1", products: 421, commission: 7, active: true, icon: "📋" },
  ]},
  { id: "c2", name: "Fashion", slug: "fashion", parent: null, products: 8934, commission: 12, active: true, icon: "👗", children: [
    { id: "c2a", name: "Men's Wear", slug: "mens-wear", parent: "c2", products: 3241, commission: 12, active: true, icon: "👔" },
    { id: "c2b", name: "Women's Wear", slug: "womens-wear", parent: "c2", products: 4102, commission: 13, active: true, icon: "👗" },
  ]},
  { id: "c3", name: "Home & Living", slug: "home-living", parent: null, products: 3210, commission: 10, active: true, icon: "🏠" },
  { id: "c4", name: "Food & Beverage", slug: "food-bev", parent: null, products: 1892, commission: 15, active: true, icon: "🍎" },
  { id: "c5", name: "Books & Media", slug: "books-media", parent: null, products: 5634, commission: 6, active: true, icon: "📚" },
  { id: "c6", name: "Sports", slug: "sports", parent: null, products: 2341, commission: 9, active: false, icon: "⚽" },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

function CategoryRow({ cat, depth = 0 }: { cat: Category; depth?: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr className="border-b border-border/20 hover:bg-muted/20 transition-colors group">
        <td className="p-4">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
            {cat.children?.length ? (
              <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground transition-colors">
                <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.div>
              </button>
            ) : <span className="w-3.5" />}
            <span className="text-lg">{cat.icon}</span>
            <span className="text-sm font-medium">{cat.name}</span>
          </div>
        </td>
        <td className="p-4 text-xs text-muted-foreground font-mono">{cat.slug}</td>
        <td className="p-4 text-sm">{cat.products.toLocaleString()}</td>
        <td className="p-4">
          <div className="flex items-center gap-1 text-sm">
            <Percent className="w-3 h-3 text-neon-orange" />
            <span className="text-neon-orange font-medium">{cat.commission}%</span>
          </div>
        </td>
        <td className="p-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked={cat.active} className="sr-only peer" readOnly />
            <div className="w-9 h-5 bg-muted peer-checked:bg-neon-green rounded-full transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
          </label>
        </td>
        <td className="p-4">
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 transition-colors">
              <Edit2 className="w-3 h-3" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
              <Trash2 className="w-3 h-3" />
            </motion.button>
          </div>
        </td>
      </tr>
      <AnimatePresence>
        {expanded && cat.children?.map(child => (
          <motion.tr key={child.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="border-b border-border/20 hover:bg-muted/20 transition-colors group">
            <td className="p-4">
              <div className="flex items-center gap-2" style={{ paddingLeft: (depth + 1) * 20 }}>
                <span className="w-3.5" />
                <span className="text-base">{child.icon}</span>
                <span className="text-sm">{child.name}</span>
              </div>
            </td>
            <td className="p-4 text-xs text-muted-foreground font-mono">{child.slug}</td>
            <td className="p-4 text-sm">{child.products.toLocaleString()}</td>
            <td className="p-4"><div className="flex items-center gap-1 text-sm"><Percent className="w-3 h-3 text-neon-orange" /><span className="text-neon-orange font-medium">{child.commission}%</span></div></td>
            <td className="p-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={child.active} className="sr-only peer" readOnly />
                <div className="w-9 h-5 bg-muted peer-checked:bg-neon-green rounded-full transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
              </label>
            </td>
            <td className="p-4">
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 transition-colors"><Edit2 className="w-3 h-3" /></motion.button>
                <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"><Trash2 className="w-3 h-3" /></motion.button>
              </div>
            </td>
          </motion.tr>
        ))}
      </AnimatePresence>
    </>
  );
}

export default function ProductCategoriesPage() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Product Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage catalog structure, commission rates, and visibility</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}
        >
          <Plus className="w-4 h-4" /> Add Category
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Categories", value: "48", icon: Boxes, color: "text-neon-blue" },
          { label: "Total Products", value: "26,832", icon: Package, color: "text-neon-green" },
          { label: "Avg Commission", value: "9.8%", icon: Percent, color: "text-neon-orange" },
          { label: "Active", value: "44", icon: Eye, color: "text-neon-purple" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Category Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-neon-green" />Create New Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Category Name</label>
                <input className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" placeholder="e.g. Electronics" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Slug</label>
                <input className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" placeholder="e.g. electronics" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Parent Category</label>
                <select className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option>None (Root)</option>
                  {categories.map(c => <option key={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Commission Rate (%)</label>
                <input type="number" defaultValue={10} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <motion.button whileHover={{ scale: 1.02 }} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}>
                Create Category
              </motion.button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground bg-muted hover:text-foreground transition-colors">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Table */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Tag className="w-4 h-4 text-neon-orange" />Category Tree</h3>
          <span className="text-xs text-muted-foreground">{categories.length} root categories</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {["Category", "Slug", "Products", "Commission", "Active", "Actions"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => <CategoryRow key={cat.id} cat={cat} />)}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
