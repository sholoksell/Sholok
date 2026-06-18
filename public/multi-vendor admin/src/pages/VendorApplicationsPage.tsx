import { useState, type ElementType } from "react";
import { motion } from "framer-motion";
import {
  UserCheck, Clock, CheckCircle, XCircle, Eye, Store,
  MapPin, Phone, Mail, FileText, Star, AlertTriangle, Filter, Search
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const applications: { id: string; name: string; owner: string; email: string; phone: string; category: string; location: string; applied: string; status: string; docs: boolean; score: number }[] = [];

const statusConfig: Record<string, { color: string; icon: ElementType }> = {
  Pending: { color: "badge-pending", icon: Clock },
  "Under Review": { color: "badge-premium", icon: Eye },
  Approved: { color: "badge-active", icon: CheckCircle },
  Rejected: { color: "badge-suspended", icon: XCircle },
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function VendorApplicationsPage() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const tabs = ["All", "Pending", "Under Review", "Approved", "Rejected"];
  const filtered = applications.filter(a =>
    (filter === "All" || a.status === filter) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) || a.owner.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedApp = applications.find(a => a.id === selected);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">{t("vendorApplicationsTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("reviewVendorOnboarding")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="glass-card px-3 py-1.5 text-xs font-mono text-neon-orange flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />3 Pending Review
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t("total"), value: "128", color: "text-foreground" },
          { label: t("pending"), value: "34", color: "text-neon-orange" },
          { label: t("approved"), value: "82", color: "text-neon-green" },
          { label: t("rejected"), value: "12", color: "text-destructive" },
        ].map(s => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <motion.div variants={itemVariants} className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("searchVendors")} className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {tabs.map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>
      </motion.div>

      {/* Table + Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="xl:col-span-2 glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground">Vendor</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Score</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const Cfg = statusConfig[a.status];
                  return (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelected(a.id === selected ? null : a.id)}
                      className={`border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer ${selected === a.id ? "bg-muted/40" : ""}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "var(--gradient-neon)" }}>
                            {a.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{a.owner}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="text-xs bg-muted px-2 py-1 rounded-md">{a.category}</span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-1.5 w-16">
                            <div className="h-1.5 rounded-full bg-neon-green transition-all" style={{ width: `${a.score}%` }} />
                          </div>
                          <span className="text-xs font-mono">{a.score}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`badge-status ${Cfg.color} flex items-center gap-1 w-fit`}>
                          <Cfg.icon className="w-3 h-3" />{a.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 justify-end">
                          {a.status === "Pending" || a.status === "Under Review" ? (
                            <>
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-1.5 rounded-md bg-neon-green/10 text-neon-green hover:bg-neon-green/20 transition-colors">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                                <XCircle className="w-3.5 h-3.5" />
                              </motion.button>
                            </>
                          ) : null}
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Detail Panel */}
        <motion.div variants={itemVariants} className="glass-card p-5">
          {selectedApp ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0" style={{ background: "var(--gradient-neon)" }}>
                  {selectedApp.name[0]}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedApp.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedApp.id}</p>
                  <span className={`badge-status ${statusConfig[selectedApp.status].color} mt-1`}>{selectedApp.status}</span>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { icon: Store, label: "Owner", value: selectedApp.owner },
                  { icon: Mail, label: "Email", value: selectedApp.email },
                  { icon: Phone, label: "Phone", value: selectedApp.phone },
                  { icon: MapPin, label: "Location", value: selectedApp.location },
                  { icon: FileText, label: "Category", value: selectedApp.category },
                  { icon: Clock, label: "Applied", value: selectedApp.applied },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5 text-xs">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground w-16">{label}</span>
                    <span className="text-foreground truncate">{value}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Application Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${selectedApp.score}%` }} transition={{ duration: 0.8 }} className="h-2 rounded-full bg-neon-green" />
                  </div>
                  <span className="text-sm font-bold text-neon-green font-mono">{selectedApp.score}/100</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Documents:</span>
                <span className={`text-xs font-medium ${selectedApp.docs ? "text-neon-green" : "text-neon-orange"}`}>{selectedApp.docs ? "Submitted" : "Missing"}</span>
              </div>
              {(selectedApp.status === "Pending" || selectedApp.status === "Under Review") && (
                <div className="flex gap-2 pt-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5" style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}>
                    <CheckCircle className="w-3.5 h-3.5" />{t("approve")}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors flex items-center justify-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />{t("reject")}
                  </motion.button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <UserCheck className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">{t("selectVendorApplication")}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">to view details and take action</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
