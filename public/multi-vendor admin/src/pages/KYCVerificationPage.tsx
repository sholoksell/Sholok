import { motion } from "framer-motion";
import { Shield, Upload, CheckCircle, Clock, AlertTriangle, Eye, FileText, User, Building } from "lucide-react";

const kycEntries: { id: string; vendor: string; owner: string; type: string; idDoc: boolean; bizDoc: boolean; bankDoc: boolean; taxDoc: boolean; status: string; submitted: string }[] = [];

const DocBadge = ({ ok, label }: { ok: boolean; label: string }) => (
  <div className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${ok ? "bg-neon-green/10 text-neon-green" : "bg-destructive/10 text-destructive"}`}>
    {ok ? <CheckCircle className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
    {label}
  </div>
);

const statusColor: Record<string, string> = {
  Verified: "badge-active", Pending: "badge-pending", Incomplete: "badge-premium", "Not Started": "badge-suspended"
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function KYCVerificationPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text-neon">KYC Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">Know Your Customer document verification system</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Verified", value: "234", icon: CheckCircle, color: "text-neon-green" },
          { label: "Pending", value: "47", icon: Clock, color: "text-neon-orange" },
          { label: "Incomplete", value: "19", icon: AlertTriangle, color: "text-neon-purple" },
          { label: "Not Started", value: "12", icon: User, color: "text-muted-foreground" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Shield className="w-4 h-4 text-neon-green" />KYC Document Status</h3>
          <span className="text-xs text-muted-foreground">Showing {kycEntries.length} vendors</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {["Vendor", "Type", "ID Doc", "Business Doc", "Bank Doc", "Tax Doc", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kycEntries.map((k, i) => (
                <motion.tr key={k.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold bg-neon-purple/20 text-neon-purple">{k.vendor[0]}</div>
                      <div>
                        <p className="text-xs font-medium">{k.vendor}</p>
                        <p className="text-[10px] text-muted-foreground">{k.owner}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {k.type === "Business" ? <Building className="w-3 h-3" /> : <User className="w-3 h-3" />}{k.type}
                    </span>
                  </td>
                  <td className="p-4"><DocBadge ok={k.idDoc} label="ID" /></td>
                  <td className="p-4"><DocBadge ok={k.bizDoc} label="Biz" /></td>
                  <td className="p-4"><DocBadge ok={k.bankDoc} label="Bank" /></td>
                  <td className="p-4"><DocBadge ok={k.taxDoc} label="Tax" /></td>
                  <td className="p-4">
                    <span className={`badge-status ${statusColor[k.status]}`}>{k.status}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-muted hover:bg-secondary transition-colors">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </motion.button>
                      {k.status !== "Verified" && (
                        <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-neon-green/10 hover:bg-neon-green/20 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5 text-neon-green" />
                        </motion.button>
                      )}
                      {k.status === "Incomplete" || k.status === "Not Started" ? (
                        <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-neon-purple/10 hover:bg-neon-purple/20 transition-colors">
                          <Upload className="w-3.5 h-3.5 text-neon-purple" />
                        </motion.button>
                      ) : null}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* KYC Requirements Guide */}
      <motion.div variants={itemVariants} className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-neon-blue" />Required Documents Checklist</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: "Government ID", desc: "National ID, Passport, or Driver's License", req: "All vendors" },
            { title: "Business Registration", desc: "Official business registration certificate", req: "Business type" },
            { title: "Bank Statement", desc: "Recent 3-month bank statement with IBAN", req: "All vendors" },
            { title: "Tax Certificate", desc: "VAT/ভ্যাট নিবন্ধন বা কর শনাক্তকরণ নম্বর", req: "Revenue > ৳11 Lakh" },
          ].map(d => (
            <div key={d.title} className="p-3 rounded-lg bg-muted/50 border border-border/30">
              <p className="text-xs font-semibold mb-1">{d.title}</p>
              <p className="text-[10px] text-muted-foreground mb-2">{d.desc}</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{d.req}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
