import { motion } from "framer-motion";
import { Globe, Search, ToggleLeft, ToggleRight, Users, BarChart3, Settings, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface PortalModule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  users: string;
  contentCount: number;
  category: string;
}

const initialModules: PortalModule[] = [
  { id: "search", name: "Search", description: "Platform-wide search engine", active: true, users: "12.4M", contentCount: 0, category: "Core" },
  { id: "news", name: "News", description: "News aggregation and publishing", active: true, users: "6.8M", contentCount: 24500, category: "Content" },
  { id: "blog", name: "Blog / Cafe", description: "Community blogs and cafes", active: true, users: "5.1M", contentCount: 890000, category: "Community" },
  { id: "shopping", name: "Shopping", description: "Marketplace shopping module", active: true, users: "8.2M", contentCount: 24891, category: "Commerce" },
  { id: "smartstore", name: "Smart Store", description: "Vendor smart store system", active: true, users: "1.2M", contentCount: 1247, category: "Commerce" },
  { id: "pay", name: "Pay", description: "Payment processing system", active: true, users: "4.9M", contentCount: 0, category: "Finance" },
  { id: "maps", name: "Maps", description: "Location and map services", active: true, users: "3.7M", contentCount: 0, category: "Utility" },
  { id: "qa", name: "Q&A", description: "Knowledge base Q&A system", active: true, users: "2.8M", contentCount: 1200000, category: "Community" },
  { id: "webtoon", name: "Webtoon", description: "Digital comics platform", active: true, users: "3.2M", contentCount: 4500, category: "Entertainment" },
  { id: "ebooks", name: "eBooks / Series", description: "Digital books and series", active: true, users: "1.8M", contentCount: 12000, category: "Entertainment" },
  { id: "video", name: "Video / TV", description: "Video streaming platform", active: true, users: "2.5M", contentCount: 8900, category: "Entertainment" },
  { id: "music", name: "Music", description: "Music streaming service", active: false, users: "2.1M", contentCount: 45000, category: "Entertainment" },
  { id: "translator", name: "Translator", description: "Multi-language translation", active: true, users: "1.5M", contentCount: 0, category: "Utility" },
  { id: "dictionary", name: "Dictionary", description: "Online dictionary service", active: true, users: "1.2M", contentCount: 350000, category: "Utility" },
  { id: "finance", name: "Finance", description: "Financial data and tools", active: true, users: "980K", contentCount: 0, category: "Finance" },
  { id: "sports", name: "Sports", description: "Sports scores and news", active: true, users: "1.8M", contentCount: 15000, category: "Content" },
  { id: "weather", name: "Weather", description: "Weather forecasting", active: true, users: "3.4M", contentCount: 0, category: "Utility" },
  { id: "realestate", name: "Real Estate", description: "Property listings", active: false, users: "890K", contentCount: 23000, category: "Commerce" },
];

const categories = ["All", "Core", "Content", "Community", "Commerce", "Finance", "Entertainment", "Utility"];

export default function PortalModulesPage() {
  const [modules, setModules] = useState(initialModules);
  const [filter, setFilter] = useState("All");

  const toggleModule = (id: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const filtered = filter === "All" ? modules : modules.filter(m => m.category === filter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text-neon flex items-center gap-2"><Globe className="w-6 h-6" /> Portal Services</h1>
        <p className="text-sm text-muted-foreground mt-1">Naver-style module control — enable, disable, and manage platform services</p>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === cat ? "text-primary-foreground neon-glow" : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
            style={filter === cat ? { background: "var(--gradient-neon)" } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((mod, i) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ y: -2 }}
            className={`glass-card-hover p-5 ${!mod.active ? "opacity-60" : ""}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{mod.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
              </div>
              <button onClick={() => toggleModule(mod.id)} className="transition-colors">
                {mod.active
                  ? <ToggleRight className="w-6 h-6 text-neon-green" />
                  : <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                }
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {mod.users}</span>
              {mod.contentCount > 0 && <span className="font-mono">{mod.contentCount.toLocaleString()} items</span>}
              <span className="badge-status bg-muted text-muted-foreground">{mod.category}</span>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
              <button className="flex-1 text-center py-1.5 rounded text-xs bg-muted hover:bg-secondary transition-colors text-muted-foreground">Manage</button>
              <button className="flex-1 text-center py-1.5 rounded text-xs bg-muted hover:bg-secondary transition-colors text-muted-foreground">Analytics</button>
              <button className="p-1.5 rounded bg-muted hover:bg-secondary transition-colors text-muted-foreground"><Settings className="w-3 h-3" /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
