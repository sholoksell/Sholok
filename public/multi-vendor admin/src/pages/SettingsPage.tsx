import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Globe, CreditCard, Mail, Key, Shield, Database, Palette, Save, Eye, EyeOff, ToggleLeft, ToggleRight } from "lucide-react";

const tabs = [
  { id: "general", label: "General", icon: Globe },
  { id: "payments", label: "Payment Gateways", icon: CreditCard },
  { id: "email", label: "Email Config", icon: Mail },
  { id: "api", label: "API Keys", icon: Key },
  { id: "security", label: "Security / 2FA", icon: Shield },
  { id: "database", label: "Backup & DB", icon: Database },
  { id: "branding", label: "Branding", icon: Palette },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [maintenance, setMaintenance] = useState(false);
  const [twoFARequired, setTwoFARequired] = useState(true);
  const [savedBadge, setSavedBadge] = useState(false);

  const save = () => {
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  const toggleKey = (k: string) => setShowKeys(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your multi-vendor platform</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={save}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold">
          <Save className="w-4 h-4" />
          {savedBadge ? "Saved!" : "Save Changes"}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="glass-card p-3 space-y-1 h-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === t.id ? "bg-primary/20 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/20"}`}>
              <t.icon className="w-4 h-4 shrink-0" />{t.label}
            </button>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-4">
          {activeTab === "general" && (
            <div className="glass-card p-5 space-y-5">
              <h3 className="font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-primary" />General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Platform Name", value: "Sholok Marketplace" },
                  { label: "Default Currency", value: "BDT" },
                  { label: "Default Language", value: "English" },
                  { label: "Timezone", value: "UTC+9 (Seoul)" },
                  { label: "Support Email", value: "support@sholok.com" },
                  { label: "Platform URL", value: "https://sholok.com" },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
                    <input defaultValue={f.value}
                      className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/40">
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Settings className="w-4 h-4 text-neon-orange" />Maintenance Mode
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Take platform offline for updates</p>
                </div>
                <button onClick={() => setMaintenance(!maintenance)} className={`text-2xl transition-colors ${maintenance ? "text-neon-orange" : "text-muted-foreground"}`}>
                  {maintenance ? <ToggleRight /> : <ToggleLeft />}
                </button>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" />Payment Gateways</h3>
              {[
                { name: "Stripe", status: true, key: "sk_live_***_stripe" },
                { name: "PayPal", status: true, key: "AX5...paypal" },
                { name: "Toss Payments", status: false, key: "Not configured" },
                { name: "KG Inicis (Korea)", status: false, key: "Not configured" },
              ].map(g => (
                <div key={g.name} className="p-4 border border-border/40 rounded-xl flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{g.name}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{g.key}</p>
                  </div>
                  <span className={`badge-status ${g.status ? "badge-active" : "badge-pending"}`}>{g.status ? "Active" : "Inactive"}</span>
                  <button className="text-xs text-primary hover:underline">Configure</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "email" && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-primary" />Email Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "SMTP Host", value: "smtp.sendgrid.net" },
                  { label: "SMTP Port", value: "587" },
                  { label: "SMTP User", value: "apikey" },
                  { label: "From Address", value: "no-reply@sholok.com" },
                  { label: "From Name", value: "Sholok Platform" },
                  { label: "Reply-To", value: "support@sholok.com" },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
                    <input defaultValue={f.value}
                      className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  </div>
                ))}
              </div>
              <button className="text-xs text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">Send Test Email</button>
            </div>
          )}

          {activeTab === "api" && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Key className="w-4 h-4 text-primary" />API Keys</h3>
              {[
                { label: "Platform API Key", key: "sk-plat-1a2b3c4d5e6f7a8b9c0d1e2f" },
                { label: "Webhook Secret", key: "whsec_9z8y7x6w5v4u3t2s1r0q" },
                { label: "OpenAI API Key", key: "sk-openai-proj-AbCdEfGhIjKlMnOpQrSt" },
                { label: "Maps API Key", key: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxx" },
              ].map(k => (
                <div key={k.label}>
                  <label className="text-xs text-muted-foreground block mb-1">{k.label}</label>
                  <div className="flex gap-2">
                    <input type={showKeys[k.label] ? "text" : "password"} defaultValue={k.key}
                      className="flex-1 bg-background border border-border/60 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary" />
                    <button onClick={() => toggleKey(k.label)} className="p-2 border border-border/40 rounded-lg hover:bg-muted/20 transition-colors">
                      {showKeys[k.label] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "security" && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Security & 2FA Settings</h3>
              <div className="space-y-3">
                {[
                  { label: "Require 2FA for Admins", desc: "Force all admin accounts to use 2FA", state: twoFARequired, toggle: () => setTwoFARequired(!twoFARequired) },
                  { label: "Require 2FA for Vendors", desc: "Force all vendor accounts to use 2FA", state: false, toggle: () => {} },
                  { label: "IP Allowlist for Admin", desc: "Only allow admin access from whitelisted IPs", state: false, toggle: () => {} },
                  { label: "Session Timeout (30 min)", desc: "Auto logout idle admin sessions", state: true, toggle: () => {} },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between p-4 bg-muted/10 border border-border/30 rounded-xl">
                    <div>
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                    <button onClick={s.toggle} className={`text-2xl transition-colors ${s.state ? "text-primary" : "text-muted-foreground"}`}>
                      {s.state ? <ToggleRight /> : <ToggleLeft />}
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Max Login Attempts Before Lockout</label>
                <input type="number" defaultValue={5}
                  className="w-32 bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
            </div>
          )}

          {activeTab === "database" && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Database className="w-4 h-4 text-primary" />Backup & Database</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: "Last Backup", value: "Mar 4, 2026 03:00 UTC" },
                  { label: "DB Size", value: "42.8 GB" },
                  { label: "Backup Status", value: "Healthy" },
                ].map(s => (
                  <div key={s.label} className="p-4 bg-muted/10 border border-border/30 rounded-xl">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-semibold mt-1">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { label: "Automated Backups", freq: "Daily at 03:00 UTC" },
                  { label: "Backup Retention", freq: "30 days" },
                  { label: "Backup Storage", freq: "AWS S3 (us-east-1)" },
                ].map(b => (
                  <div key={b.label} className="flex items-center justify-between py-2 border-b border-border/20">
                    <span className="text-sm">{b.label}</span>
                    <span className="text-xs text-muted-foreground">{b.freq}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="text-sm bg-primary/10 text-primary border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors">Manual Backup Now</button>
                <button className="text-sm border border-border/40 px-4 py-2 rounded-lg hover:bg-muted/20 transition-colors text-destructive">Restore from Backup</button>
              </div>
            </div>
          )}

          {activeTab === "branding" && (
            <div className="glass-card p-5 space-y-5">
              <h3 className="font-semibold flex items-center gap-2"><Palette className="w-4 h-4 text-primary" />Branding & Theme</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Primary Color", value: "#00ff88" },
                  { label: "Accent Color", value: "#a855f7" },
                  { label: "Background Color", value: "#0f1523" },
                  { label: "Card Color", value: "#161d2e" },
                ].map(c => (
                  <div key={c.label}>
                    <label className="text-xs text-muted-foreground block mb-1">{c.label}</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" defaultValue={c.value} className="w-10 h-9 rounded-lg cursor-pointer border border-border/40 bg-transparent p-0.5" />
                      <input defaultValue={c.value}
                        className="flex-1 bg-background border border-border/60 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Platform Logo</label>
                <div className="border-2 border-dashed border-border/50 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-primary/40 transition-colors cursor-pointer">
                  <Palette className="w-6 h-6 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Drag & drop or click to upload logo</p>
                  <p className="text-[10px] text-muted-foreground/60">PNG, SVG, max 512×512px</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
