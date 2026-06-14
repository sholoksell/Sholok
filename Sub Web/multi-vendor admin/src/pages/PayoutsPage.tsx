import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, CheckCircle, Clock, Send, AlertTriangle, Building, CreditCard } from "lucide-react";
import TakaIcon from "@/components/TakaIcon";

const payouts: { id: string; vendor: string; amount: number; fee: number; net: number; method: string; bank: string; period: string; status: string; date: string }[] = [];

const statusConfig: Record<string, string> = { Completed: "badge-active", "Pending Approval": "badge-pending", Processing: "badge-premium" };

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function PayoutsPage() {
  const [schedule, setSchedule] = useState("Monthly");

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Vendor Payouts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage vendor payout schedules and approve disbursements</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}>
          <Send className="w-4 h-4" />Process Batch Payout
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Pending Payouts", value: "৳1.05 Cr", icon: Clock, color: "text-neon-orange" },
          { label: "Paid This Month", value: "৳3.09 Cr", icon: CheckCircle, color: "text-neon-green" },
          { label: "Total YTD Payouts", value: "৳20.2 Cr", icon: TakaIcon, color: "text-neon-blue" },
          { label: "Vendors Pending", value: "12", icon: AlertTriangle, color: "text-destructive" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Payout Schedule Config */}
      <motion.div variants={itemVariants} className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-neon-blue" />Payout Schedule</h3>
        <div className="flex gap-2 flex-wrap">
          {["Daily", "Weekly", "Bi-Weekly", "Monthly"].map(s => (
            <button key={s} onClick={() => setSchedule(s)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${schedule === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{s}</button>
          ))}
          <span className="flex items-center gap-2 pl-4 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />Current: <strong className="text-foreground">{schedule}</strong>
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-muted/50 border border-border/30">
            <p className="text-muted-foreground mb-1">Minimum Payout</p>
            <p className="font-bold text-lg">৳5,500</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border/30">
            <p className="text-muted-foreground mb-1">Processing Time</p>
            <p className="font-bold text-lg">1-3 Days</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border/30">
            <p className="text-muted-foreground mb-1">Transaction Fee</p>
            <p className="font-bold text-lg">1% (max ৳11,000)</p>
          </div>
        </div>
      </motion.div>

      {/* Payout Table */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Wallet className="w-4 h-4 text-neon-green" />Payout Requests — Feb 2026</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {["Payout ID", "Vendor", "Gross Amount", "Fee", "Net Payout", "Bank Account", "Period", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payouts.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-mono text-xs text-primary">{p.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold bg-neon-green/20 text-neon-green">{p.vendor[0]}</div>
                      <span className="text-sm">{p.vendor}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-neon-green">${p.amount.toLocaleString()}</td>
                  <td className="p-4 text-xs text-destructive">-${p.fee.toLocaleString()}</td>
                  <td className="p-4 text-sm font-bold">${p.net.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building className="w-3 h-3" />{p.bank}
                    </div>
                  </td>
                  <td className="p-4 text-xs">{p.period}</td>
                  <td className="p-4"><span className={`badge-status ${statusConfig[p.status]}`}>{p.status}</span></td>
                  <td className="p-4">
                    {p.status === "Pending Approval" ? (
                      <div className="flex gap-1">
                        <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-neon-green/10 text-neon-green hover:bg-neon-green/20" title="Approve">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground" title="View">
                          <CreditCard className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">{p.date}</span>}
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
