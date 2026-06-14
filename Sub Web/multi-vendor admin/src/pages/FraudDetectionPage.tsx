import { motion } from "framer-motion";
import { Lock, AlertTriangle, Globe, CreditCard, User, Eye, Ban, Shield, Activity, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const fraudEvents: { id: string; type: string; user?: string; vendor?: string; ip: string; location: string; risk: number; action: string; time: string; status: string }[] = [];

const fraudTrend: { day: string; events: number }[] = [];

const statusConfig: Record<string, string> = { Blocked: "badge-suspended", "Under Review": "badge-premium", Investigating: "badge-pending", Resolved: "badge-active" };

const riskColor = (score: number) => {
  if (score >= 90) return "text-destructive";
  if (score >= 70) return "text-neon-orange";
  return "text-neon-yellow";
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function FraudDetectionPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Fraud Detection</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered fraud monitoring, risk scoring and IP tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-neon-green">
            <span className="w-2 h-2 rounded-full bg-neon-green pulse-dot" />AI Shield Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Fraud Events (7D)", value: "39", icon: AlertTriangle, color: "text-destructive" },
          { label: "Auto-Blocked", value: "28", icon: Ban, color: "text-neon-orange" },
          { label: "Under Review", value: "7", icon: Eye, color: "text-neon-blue" },
          { label: "Loss Prevented", value: "৳92,62,000", icon: Shield, color: "text-neon-green" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-destructive" />Fraud Event Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={fraudTrend}>
              <defs>
                <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0,85%,55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0,85%,55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225,15%,18%)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(220,10%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220,10%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(225,22%,10%)", border: "1px solid hsl(225,15%,18%)", borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="events" stroke="hsl(0,85%,55%)" fill="url(#fraudGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-neon-orange" />Blocked IP Regions</h3>
          <div className="space-y-2.5">
            {[
              { country: "Russia", ips: 48, risk: "Critical" },
              { country: "Unknown VPN", ips: 34, risk: "Critical" },
              { country: "Germany", ips: 12, risk: "Medium" },
              { country: "UAE", ips: 8, risk: "Medium" },
              { country: "China", ips: 6, risk: "Low" },
            ].map(r => (
              <div key={r.country} className="flex items-center gap-2">
                <span className="text-xs flex-1">{r.country}</span>
                <div className="w-20 bg-muted rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-destructive" style={{ width: `${(r.ips / 50) * 100}%` }} />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-6 text-right">{r.ips}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Lock className="w-4 h-4 text-destructive" />Recent Fraud Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {["Event ID", "Type", "User / Entity", "IP / Location", "Risk Score", "Action Taken", "Time", "Status"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fraudEvents.map((e, i) => (
                <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-mono text-xs text-primary">{e.id}</td>
                  <td className="p-4">
                    <span className="text-xs font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-destructive" />{e.type}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{e.user || (e as any).vendor || "—"}</td>
                  <td className="p-4">
                    <p className="text-xs font-mono">{e.ip}</p>
                    <p className="text-[10px] text-muted-foreground">{e.location}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-muted rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-destructive" style={{ width: `${e.risk}%` }} />
                      </div>
                      <span className={`text-sm font-bold font-mono ${riskColor(e.risk)}`}>{e.risk}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs">{e.action}</td>
                  <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">{e.time}</td>
                  <td className="p-4"><span className={`badge-status ${statusConfig[e.status]}`}>{e.status}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
