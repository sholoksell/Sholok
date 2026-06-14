import { useState } from "react";
import { type ElementType } from "react";
import { motion } from "framer-motion";
import { Shield, Plus, Edit2, Trash2, CheckCircle, AlertTriangle, FileText, Lock, Users, Package, CreditCard, Globe } from "lucide-react";

const rules = [
  { id: "RULE-001", category: "Vendor", title: "Product Listing Guidelines", description: "All products must have accurate descriptions, high-quality images, and correct categorization.", scope: "All Vendors", severity: "Mandatory", enforced: true, violations: 12 },
  { id: "RULE-002", category: "Vendor", title: "Commission Payment Policy", description: "Commission rates are deducted automatically from each sale. Payout requests must be submitted before the 25th.", scope: "All Vendors", severity: "Mandatory", enforced: true, violations: 0 },
  { id: "RULE-003", category: "User", title: "Anti-Fraud Policy", description: "Users found engaging in fraudulent activities will be permanently banned without notice.", scope: "All Users", severity: "Critical", enforced: true, violations: 47 },
  { id: "RULE-004", category: "Content", title: "Counterfeit Products Ban", description: "Listing of counterfeit, replica, or fake branded products is strictly prohibited.", scope: "All Vendors", severity: "Critical", enforced: true, violations: 8 },
  { id: "RULE-005", category: "Payment", title: "Refund Processing SLA", description: "All approved refunds must be processed within 5 business days.", scope: "Platform", severity: "Mandatory", enforced: true, violations: 2 },
  { id: "RULE-006", category: "Content", title: "Review & Rating Integrity Policy", description: "Vendors may not incentivize, purchase, or manipulate product reviews.", scope: "All Vendors", severity: "Mandatory", enforced: false, violations: 4 },
];

const categoryConfig: Record<string, { color: string; icon: ElementType }> = {
  Vendor: { color: "text-neon-blue", icon: Users },
  User: { color: "text-neon-green", icon: Users },
  Content: { color: "text-neon-purple", icon: FileText },
  Payment: { color: "text-neon-orange", icon: CreditCard },
  Platform: { color: "text-neon-blue", icon: Globe },
};
const severityColor: Record<string, string> = { Mandatory: "badge-pending", Critical: "badge-suspended" };

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function PlatformRulesPage() {
  const [catFilter, setCatFilter] = useState("All");

  const filtered = rules.filter(r => catFilter === "All" || r.category === catFilter);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Platform Rules & Policies</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage marketplace rules, vendor policies, and enforcement settings</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}>
          <Plus className="w-4 h-4" />Add Rule
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Rules", value: "84", icon: Shield, color: "text-neon-green" },
          { label: "Total Violations", value: "73", icon: AlertTriangle, color: "text-neon-orange" },
          { label: "Enforced", value: "81", icon: CheckCircle, color: "text-neon-blue" },
          { label: "Pending Review", value: "3", icon: FileText, color: "text-neon-purple" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="flex gap-1.5 flex-wrap">
        {["All", "Vendor", "User", "Content", "Payment"].map(c => (
          <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${catFilter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{c}</button>
        ))}
      </motion.div>

      <div className="space-y-3">
        {filtered.map((r, i) => {
          const Cat = categoryConfig[r.category] || { color: "text-muted-foreground", icon: Shield };
          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-5 hover-card-float">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-muted">
                    <Cat.icon className={`w-4.5 h-4.5 ${Cat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{r.category}</span>
                      <span className={`badge-status ${severityColor[r.severity]}`}>{r.severity}</span>
                      {r.violations > 0 && (
                        <span className="text-xs text-neon-orange bg-neon-orange/10 px-1.5 py-0.5 rounded">
                          <AlertTriangle className="w-2.5 h-2.5 inline mr-0.5" />{r.violations} violations
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold mb-1">{r.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">Scope: <span className="text-foreground">{r.scope}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-col sm:flex-row">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={r.enforced} className="sr-only peer" readOnly />
                    <div className="w-9 h-5 bg-muted peer-checked:bg-neon-green rounded-full transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                  </label>
                  <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20"><Edit2 className="w-3.5 h-3.5" /></motion.button>
                  <motion.button whileHover={{ scale: 1.15 }} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5" /></motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
