import { motion } from "framer-motion";
import { ShieldCheck, Monitor, Smartphone, AlertTriangle, Lock } from "lucide-react";

const DEVICES = [
  { name: "MacBook Pro", location: "Dhaka, BD", icon: Monitor, current: true },
  { name: "iPhone 15", location: "Dhaka, BD", icon: Smartphone, current: false },
  { name: "Windows PC", location: "Chittagong, BD", icon: Monitor, current: false },
];

const LOGIN_HISTORY = [
  { device: "MacBook Pro", time: "2 hours ago", status: "Success" },
  { device: "Unknown device", time: "1 day ago", status: "Blocked" },
  { device: "iPhone 15", time: "3 days ago", status: "Success" },
];

const TIPS = [
  "Use a unique password for your mail account.",
  "Enable two-factor authentication for extra protection.",
  "Review connected devices regularly.",
  "Never share verification codes with anyone.",
];

export default function SecurityCenter() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">Security Center</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-5">
          <ShieldCheck size={28} className="mb-2 text-emerald-500" />
          <p className="text-lg font-bold text-slate-800 dark:text-white">Account Secure</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">No threats detected in the last 30 days.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-3xl p-5">
          <Lock size={28} className="mb-2 text-violet-500" />
          <p className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">Password strength</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-700/60">
            <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
          </div>
          <p className="mt-1 text-xs text-emerald-500">Strong</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-5">
          <AlertTriangle size={28} className="mb-2 text-amber-500" />
          <p className="text-lg font-bold text-slate-800 dark:text-white">1 Suspicious Login</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Blocked automatically.</p>
        </motion.div>
      </div>

      <div className="glass rounded-3xl p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-white">Connected Devices</h2>
        <div className="space-y-2">
          {DEVICES.map((d) => (
            <div key={d.name} className="flex items-center gap-3 rounded-2xl p-2.5 hover:bg-violet-500/5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                <d.icon size={17} />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{d.name} {d.current && <span className="text-xs text-emerald-500">(this device)</span>}</p>
                <p className="text-xs text-slate-400">{d.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="glass rounded-3xl p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-white">Login History</h2>
          <div className="space-y-2">
            {LOGIN_HISTORY.map((l, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">{l.device}</span>
                <span className="text-xs text-slate-400">{l.time}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${l.status === "Success" ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-500"}`}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-3xl p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-white">Security Tips</h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {TIPS.map((t, i) => (
              <li key={i} className="flex gap-2"><span className="text-violet-500">•</span>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
