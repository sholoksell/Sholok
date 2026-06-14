import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingUp, Search, Heart, ShoppingBag, Eye, Zap } from "lucide-react";

const aiFeatures = [
  { title: "Product Recommendations", description: "ML-powered personalized product suggestions based on browsing history and purchase patterns", icon: Sparkles, status: "Schema Ready", color: "neon-green" },
  { title: "Personalized Feed", description: "AI-curated content feed unique to each user combining shopping, news, and community", icon: Eye, status: "Schema Ready", color: "neon-purple" },
  { title: "Trending Algorithm", description: "Real-time trending product detection using velocity scoring and social signals", icon: TrendingUp, status: "Schema Ready", color: "neon-blue" },
  { title: "Behavior Tracking", description: "Customer journey analytics with session recording and heatmap-ready data", icon: Search, status: "Schema Ready", color: "neon-orange" },
  { title: "Wishlist Analytics", description: "Conversion prediction from wishlists with price sensitivity analysis", icon: Heart, status: "Schema Ready", color: "neon-pink" },
  { title: "Search Intelligence", description: "Search query analysis, autocomplete optimization, and zero-result tracking", icon: Search, status: "Schema Ready", color: "neon-yellow" },
];

export default function AIInsightsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text-purple flex items-center gap-2"><Brain className="w-6 h-6" /> AI & Personalization</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-ready infrastructure for intelligent marketplace experiences</p>
      </div>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10" style={{ background: "var(--gradient-purple)" }} />
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl" style={{ background: "var(--gradient-purple)" }}>
            <Zap className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">AI Engine Status</h2>
            <p className="text-sm text-muted-foreground">Database schemas are prepared for AI/ML integration. Connect your recommendation engine to activate.</p>
          </div>
          <button className="ml-auto px-4 py-2 rounded-lg text-sm font-medium text-accent-foreground" style={{ background: "var(--gradient-purple)" }}>
            Configure Engine
          </button>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiFeatures.map((feat, i) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            className="glass-card-hover p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg bg-${feat.color}/10`}>
                <feat.icon className={`w-5 h-5 text-${feat.color}`} />
              </div>
              <span className="badge-active text-[10px]">{feat.status}</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{feat.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Data Schema Preview */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Database Schema (AI Collections)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            "user_behavior_events", "search_history", "product_views",
            "recommendation_scores", "trending_cache", "wishlist_analytics",
            "session_recordings", "ab_test_results"
          ].map((table, i) => (
            <motion.div
              key={table}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.03 }}
              className="p-3 rounded-lg bg-muted font-mono text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              📊 {table}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
