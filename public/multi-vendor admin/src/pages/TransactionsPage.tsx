import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, ArrowUpRight, ArrowDownLeft, RefreshCw, Filter, Download, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import TakaIcon from "@/components/TakaIcon";

const transactions: { id: string; type: string; customer: string; vendor: string; amount: number; fee: number; net: number; method: string; gateway: string; status: string; date: string }[] = [];

const statusConfig: Record<string, string> = { Completed: "badge-active", Processing: "badge-premium", Pending: "badge-pending", Failed: "badge-suspended" };
const typeColor: Record<string, string> = { Sale: "text-neon-green", Refund: "text-destructive", Payout: "text-neon-orange" };

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = transactions.filter(t =>
    (typeFilter === "All" || t.type === typeFilter) &&
    (t.id.toLowerCase().includes(search.toLowerCase()) || t.customer.toLowerCase().includes(search.toLowerCase()) || t.vendor.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Transaction Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete payment transaction history and audit trail</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:text-foreground">
          <Download className="w-4 h-4" />Export
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Today's Volume", value: "৳3.13 Cr", icon: TakaIcon, color: "text-neon-green", sub: "+12.4% vs yesterday" },
          { label: "Transactions", value: "1,847", icon: CreditCard, color: "text-neon-blue", sub: "Last 24 hours" },
          { label: "Total Fees", value: "৳9,27,190", icon: ArrowUpRight, color: "text-neon-orange", sub: "Platform earnings" },
          { label: "Refunds", value: "৳13,31,000", icon: RefreshCw, color: "text-destructive", sub: "Pending + approved" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by TXN ID, customer, vendor..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="flex gap-1.5">
          {["All", "Sale", "Refund", "Payout"].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {["Transaction ID", "Type", "Customer", "Vendor", "Amount", "Fee", "Net", "Method", "Gateway", "Status", "Date"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-mono text-xs text-primary">{t.id}</td>
                  <td className="p-4"><span className={`text-xs font-semibold ${typeColor[t.type] || "text-foreground"}`}>{t.type}</span></td>
                  <td className="p-4 text-sm">{t.customer}</td>
                  <td className="p-4 text-xs text-muted-foreground">{t.vendor}</td>
                  <td className={`p-4 text-sm font-bold ${t.amount < 0 ? "text-destructive" : "text-neon-green"}`}>${Math.abs(t.amount).toFixed(2)}</td>
                  <td className="p-4 text-xs text-muted-foreground">{t.fee > 0 ? `$${t.fee.toFixed(2)}` : "—"}</td>
                  <td className={`p-4 text-sm font-medium ${t.net < 0 ? "text-destructive" : "text-foreground"}`}>${Math.abs(t.net).toFixed(2)}</td>
                  <td className="p-4 text-xs">{t.method}</td>
                  <td className="p-4 text-xs text-muted-foreground">{t.gateway}</td>
                  <td className="p-4"><span className={`badge-status ${statusConfig[t.status]}`}>{t.status}</span></td>
                  <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">{t.date}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
