import { useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, Plus, Edit2, Trash2, Eye, EyeOff, Clock, Tag, Globe, TrendingUp, Search, BookOpen } from "lucide-react";

const news: { id: string; title: string; category: string; author: string; views: number; date: string; status: string; featured: boolean; tags: string[] }[] = [];

const categories = ["All", "Market", "Business", "Platform", "Industry", "Technology"];
const statusConfig: Record<string, string> = { Published: "badge-active", Scheduled: "badge-premium", Draft: "badge-pending" };

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function PortalNewsPage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = news.filter(n => (category === "All" || n.category === category) && n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">News Module</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage portal news, articles, editorial, and content moderation</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}>
          <Plus className="w-4 h-4" />Write Article
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Published Articles", value: "1,284", icon: Globe, color: "text-neon-green" },
          { label: "Total Views", value: "8.4M", icon: Eye, color: "text-neon-blue" },
          { label: "Trending Today", value: "42", icon: TrendingUp, color: "text-neon-orange" },
          { label: "Scheduled", value: "18", icon: Clock, color: "text-neon-purple" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." className="w-full pl-9 pr-4 py-2 rounded-lg glass-card text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{c}</button>
          ))}
        </div>
      </motion.div>

      <div className="space-y-3">
        {filtered.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-4 flex items-start gap-4 hover-card-float">
            {/* Category Icon */}
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--gradient-purple)" }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`badge-status ${statusConfig[n.status]}`}>{n.status}</span>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{n.category}</span>
                {n.featured && <span className="text-xs bg-neon-orange/20 text-neon-orange px-1.5 py-0.5 rounded">⭐ Featured</span>}
              </div>
              <h3 className="text-sm font-semibold leading-snug mb-1">{n.title}</h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1.5">
                <span>{n.author}</span>
                <span><Clock className="w-3 h-3 inline mr-0.5" />{n.date}</span>
                {n.views > 0 && <span><Eye className="w-3 h-3 inline mr-0.5" />{n.views.toLocaleString()} views</span>}
              </div>
              <div className="flex gap-1 flex-wrap">
                {n.tags.map(t => <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{t}</span>)}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20"><Edit2 className="w-3.5 h-3.5" /></motion.button>
              <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground">
                {n.status === "Published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </motion.button>
              <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5" /></motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
