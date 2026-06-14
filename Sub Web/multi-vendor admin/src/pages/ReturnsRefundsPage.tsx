import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, CheckCircle, XCircle, Clock, AlertTriangle, Eye, MessageSquare } from "lucide-react";
import TakaIcon from "@/components/TakaIcon";

const refunds: { id: string; order: string; customer: string; vendor: string; amount: number; reason: string; type: string; submitted: string; status: string; priority: string }[] = [];

const statusConfig: Record<string, string> = {
  "Pending Approval": "badge-pending", Approved: "badge-active", Processing: "badge-premium",
  Resolved: "badge-active", Rejected: "badge-suspended"
};
const priorityConfig: Record<string, string> = { High: "text-destructive", Medium: "text-neon-orange", Low: "text-muted-foreground" };

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function ReturnsRefundsPage() {
  const [tab, setTab] = useState("All");
  const tabs = ["All", "Pending Approval", "Processing", "Resolved", "Rejected"];
  const filtered = refunds.filter(r => tab === "All" || r.status === tab);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text-neon">Returns & Refunds</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage return requests, refund approvals and dispute resolution</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Requests", value: "214", icon: RotateCcw, color: "text-neon-blue" },
          { label: "Pending", value: "47", icon: Clock, color: "text-neon-orange" },
          { label: "Refund Value", value: "৳31,26,200", icon: TakaIcon, color: "text-destructive" },
          { label: "Resolved", value: "156", icon: CheckCircle, color: "text-neon-green" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </motion.div>

      <div className="space-y-3">
        {filtered.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-mono text-primary">{r.id}</span>
                <span className="text-xs text-muted-foreground">{r.order}</span>
                <span className={`text-xs font-medium ${priorityConfig[r.priority]}`}>● {r.priority}</span>
              </div>
              <p className="text-sm font-medium">{r.customer} <span className="text-muted-foreground font-normal">→ {r.vendor}</span></p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.reason}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{r.type}</span>
                <span className="text-xs text-muted-foreground">{r.submitted}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-lg font-bold text-destructive">${r.amount.toLocaleString()}</span>
              <span className={`badge-status ${statusConfig[r.status]}`}>{r.status}</span>
              <div className="flex gap-1">
                {r.status === "Pending Approval" && (
                  <>
                    <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-neon-green/10 text-neon-green hover:bg-neon-green/20">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20">
                      <XCircle className="w-3.5 h-3.5" />
                    </motion.button>
                  </>
                )}
                <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground">
                  <Eye className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground">
                  <MessageSquare className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
