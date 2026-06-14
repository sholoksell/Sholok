import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, User, Shield, Settings, AlertTriangle, Globe, Clock, Filter, Download, Search, Eye } from "lucide-react";

const logs: { id: string; admin: string; role: string; action: string; target: string; ip: string; location: string; time: string; severity: string }[] = [];

const severityConfig: Record<string, string> = { Info: "badge-status", Warning: "badge-pending", Critical: "badge-suspended" };
const severityColor: Record<string, string> = { Info: "text-neon-blue", Warning: "text-neon-orange", Critical: "text-destructive" };

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function ActivityLogsPage() {
  const [severity, setSeverity] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = logs.filter(l =>
    (severity === "All" || l.severity === severity) &&
    (l.action.toLowerCase().includes(search.toLowerCase()) || l.admin.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Admin Activity Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete audit trail of all admin actions and system events</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:text-foreground">
          <Download className="w-4 h-4" />Export Audit Log
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Events (24h)", value: "4,281", icon: Activity, color: "text-neon-blue" },
          { label: "Critical Events", value: "12", icon: AlertTriangle, color: "text-destructive" },
          { label: "Admin Actions", value: "287", icon: User, color: "text-neon-green" },
          { label: "Suspicious IPs", value: "3", icon: Globe, color: "text-neon-orange" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Suspicious Login Alert */}
      <motion.div variants={itemVariants} className="glass-card p-4 border border-destructive/30 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-destructive">Suspicious Login Attempt Detected</p>
          <p className="text-xs text-muted-foreground">Failed login from IP 45.152.89.201 (Moscow, RU) at 08:12 UTC. Account locked for 15 minutes.</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} className="px-3 py-1.5 text-xs font-medium bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 shrink-0">Block IP</motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="w-full pl-9 pr-4 py-2 rounded-lg glass-card text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="flex gap-1.5">
          {["All", "Info", "Warning", "Critical"].map(s => (
            <button key={s} onClick={() => setSeverity(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${severity === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{s}</button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {["Log ID", "Admin", "Action", "Target", "IP / Location", "Time", "Severity"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className={`border-b border-border/20 hover:bg-muted/20 transition-colors ${l.severity === "Critical" ? "border-l-2 border-l-destructive/50" : ""}`}>
                  <td className="p-4 font-mono text-xs text-primary">{l.id}</td>
                  <td className="p-4">
                    <p className="text-xs font-medium">{l.admin}</p>
                    <p className="text-[10px] text-muted-foreground">{l.role}</p>
                  </td>
                  <td className="p-4 text-xs">{l.action}</td>
                  <td className="p-4 text-xs text-muted-foreground max-w-[180px] truncate">{l.target}</td>
                  <td className="p-4">
                    <p className="text-xs font-mono">{l.ip}</p>
                    <p className="text-[10px] text-muted-foreground">{l.location}</p>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">{l.time}</td>
                  <td className="p-4">
                    <span className={`badge-status ${severityConfig[l.severity]} flex items-center gap-1`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${l.severity === "Info" ? "bg-neon-blue" : l.severity === "Warning" ? "bg-neon-orange" : "bg-destructive"}`} />
                      {l.severity}
                    </span>
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
