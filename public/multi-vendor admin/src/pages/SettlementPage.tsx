import { motion } from "framer-motion";
import { FileText, Download, TrendingUp, CreditCard, Percent, Calendar, Filter } from "lucide-react";
import TakaIcon from "@/components/TakaIcon";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const settlementData = [
  { month: "Sep", gross: 284000, commission: 22720, payouts: 261280, tax: 13680 },
  { month: "Oct", gross: 312000, commission: 24960, payouts: 287040, tax: 15000 },
  { month: "Nov", gross: 356000, commission: 28480, payouts: 327520, tax: 17100 },
  { month: "Dec", gross: 489000, commission: 39120, payouts: 449880, tax: 23500 },
  { month: "Jan", gross: 298000, commission: 23840, payouts: 274160, tax: 14300 },
  { month: "Feb", gross: 404200, commission: 32336, payouts: 371864, tax: 19400 },
];

const reports = [
  { id: "SR-2026-02", period: "Feb 2026", gross: 404200, commission: 32336, payouts: 371864, tax: 19400, vendors: 89, status: "Finalized" },
  { id: "SR-2026-01", period: "Jan 2026", gross: 298000, commission: 23840, payouts: 274160, tax: 14300, vendors: 84, status: "Finalized" },
  { id: "SR-2025-12", period: "Dec 2025", gross: 489000, commission: 39120, payouts: 449880, tax: 23500, vendors: 91, status: "Finalized" },
  { id: "SR-2025-11", period: "Nov 2025", gross: 356000, commission: 28480, payouts: 327520, tax: 17100, vendors: 78, status: "Finalized" },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function SettlementPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Settlement Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Monthly financial reconciliation, tax reports and export tools</p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.03 }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:text-foreground">
            <Download className="w-4 h-4" />Export PDF
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}>
            <FileText className="w-4 h-4" />Generate Report
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Feb Gross Revenue", value: "৳4.45 Cr", icon: TakaIcon, color: "text-neon-green" },
          { label: "Commission Earned", value: "৳35,56,960", icon: Percent, color: "text-neon-orange" },
          { label: "Total Payouts Sent", value: "৳4.09 Cr", icon: CreditCard, color: "text-neon-blue" },
          { label: "Tax Collected", value: "৳21,34,000", icon: TrendingUp, color: "text-neon-purple" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Trend Chart */}
      <motion.div variants={itemVariants} className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-neon-green" />6-Month Settlement Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={settlementData}>
            <defs>
              <linearGradient id="gross" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160,100%,50%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(160,100%,50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="commission" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(30,100%,55%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(30,100%,55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(225,15%,18%)" />
            <XAxis dataKey="month" tick={{ fill: "hsl(220,10%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(220,10%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v / 1000).toLocaleString()}k`} />
            <Tooltip contentStyle={{ background: "hsl(225,22%,10%)", border: "1px solid hsl(225,15%,18%)", borderRadius: 8, fontSize: 11 }} formatter={(v: number) => `৳${v.toLocaleString()}`} />
            <Area type="monotone" dataKey="gross" stroke="hsl(160,100%,50%)" fill="url(#gross)" strokeWidth={2} />
            <Area type="monotone" dataKey="commission" stroke="hsl(30,100%,55%)" fill="url(#commission)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-green" />Gross Revenue</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-orange" />Commission</span>
        </div>
      </motion.div>

      {/* Settlement Reports Table */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-neon-blue" />Monthly Settlement History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {["Report ID", "Period", "Gross Revenue", "Commission", "Total Payouts", "Tax", "Vendors", "Status", "Export"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-mono text-xs text-primary">{r.id}</td>
                  <td className="p-4 text-sm font-medium">{r.period}</td>
                  <td className="p-4 text-sm font-bold text-neon-green">৳{r.gross.toLocaleString()}</td>
                  <td className="p-4 text-sm text-neon-orange">৳{r.commission.toLocaleString()}</td>
                  <td className="p-4 text-sm">৳{r.payouts.toLocaleString()}</td>
                  <td className="p-4 text-sm text-neon-purple">৳{r.tax.toLocaleString()}</td>
                  <td className="p-4 text-sm">{r.vendors}</td>
                  <td className="p-4"><span className="badge-status badge-active">{r.status}</span></td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {["CSV", "PDF", "XLSX"].map(fmt => (
                        <motion.button key={fmt} whileHover={{ scale: 1.1 }} className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          {fmt}
                        </motion.button>
                      ))}
                    </div>
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
