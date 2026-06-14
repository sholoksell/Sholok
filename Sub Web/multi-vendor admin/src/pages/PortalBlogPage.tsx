import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users, Heart, Eye, Flag, CheckCircle, XCircle, Clock, Plus, Search, TrendingUp } from "lucide-react";

const posts: { id: string; title: string; type: string; author: string; community: string; likes: number; views: number; comments: number; reported: number; flags: string[]; date: string; status: string }[] = [];

const statusConfig: Record<string, string> = { Published: "badge-active", "Under Review": "badge-premium", Flagged: "badge-suspended", Draft: "badge-pending" };

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function PortalBlogPage() {
  const [tab, setTab] = useState("All");

  const filtered = posts.filter(p => tab === "All" || p.status === tab || (tab === "Flagged" && p.reported > 0));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Blog & Cafe (Community)</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage user-generated content, community moderation, and blog publishing</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}>
          <Plus className="w-4 h-4" />New Post
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Published Posts", value: "8,421", icon: MessageSquare, color: "text-neon-green" },
          { label: "Active Communities", value: "142", icon: Users, color: "text-neon-blue" },
          { label: "Flagged Content", value: "23", icon: Flag, color: "text-destructive" },
          { label: "Engagement Rate", value: "4.8%", icon: TrendingUp, color: "text-neon-orange" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Flagged Alert */}
      {posts.some(p => p.reported > 5) && (
        <motion.div variants={itemVariants} className="glass-card p-4 border border-destructive/30 flex items-center gap-3">
          <Flag className="w-5 h-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">Content Moderation Alert</p>
            <p className="text-xs text-muted-foreground">1 post has been reported 48 times and requires immediate review.</p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} className="px-3 py-1.5 text-xs font-medium bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20">Review Now</motion.button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex gap-1.5 flex-wrap">
        {["All", "Published", "Under Review", "Flagged", "Draft"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </motion.div>

      <div className="space-y-3">
        {filtered.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className={`glass-card p-4 flex items-start gap-4 hover-card-float ${p.reported > 5 ? "border border-destructive/30" : ""}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`badge-status ${statusConfig[p.status]}`}>{p.status}</span>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.type}</span>
                <span className="text-xs text-muted-foreground">{p.community}</span>
                {p.reported > 0 && (
                  <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Flag className="w-2.5 h-2.5" />{p.reported} reports
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold leading-snug mb-1">{p.title}</h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{p.author}</span>
                <span>{p.date}</span>
                <span><Heart className="w-3 h-3 inline mr-0.5 text-neon-pink" />{p.likes.toLocaleString()}</span>
                <span><Eye className="w-3 h-3 inline mr-0.5" />{p.views.toLocaleString()}</span>
                <span><MessageSquare className="w-3 h-3 inline mr-0.5" />{p.comments}</span>
              </div>
              {p.flags.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {p.flags.map(f => <span key={f} className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">⚠ {f}</span>)}
                </div>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              {p.status === "Flagged" || p.reported > 5 ? (
                <>
                  <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-neon-green/10 text-neon-green hover:bg-neon-green/20"><CheckCircle className="w-3.5 h-3.5" /></motion.button>
                  <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20"><XCircle className="w-3.5 h-3.5" /></motion.button>
                </>
              ) : null}
              <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
