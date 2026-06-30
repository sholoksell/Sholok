import { motion } from "framer-motion";
import { useMail } from "../context/MailContext";

export default function Storage() {
  const { storageStats } = useMail();
  const percent = Math.round((storageStats.used / storageStats.total) * 100);
  const circumference = 2 * Math.PI * 70;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">Storage</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass flex flex-col items-center justify-center rounded-3xl p-8">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="70" fill="none" stroke="currentColor" strokeWidth="14" className="text-slate-200 dark:text-slate-700" />
            <motion.circle
              cx="90" cy="90" r="70" fill="none" stroke="url(#grad)" strokeWidth="14" strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - (circumference * percent) / 100 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              transform="rotate(-90 90 90)"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
          </svg>
          <div className="-mt-28 text-center">
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{percent}%</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{storageStats.used} GB of {storageStats.total} GB</p>
          </div>
        </div>

        <div className="glass space-y-4 rounded-3xl p-6">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Category Breakdown</h2>
          {storageStats.breakdown.map((b) => (
            <div key={b.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">{b.label}</span>
                <span className="text-slate-500 dark:text-slate-400">{b.value} GB</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-700/60">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(b.value / storageStats.total) * 100}%` }}
                  transition={{ duration: 1 }}
                  className="h-full rounded-full"
                  style={{ background: b.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl p-5">
        <h2 className="mb-2 text-base font-semibold text-slate-800 dark:text-white">Cleanup Suggestions</h2>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li className="flex gap-2"><span className="text-violet-500">•</span> Delete 100 spam emails to free up 0.4 GB</li>
          <li className="flex gap-2"><span className="text-violet-500">•</span> Empty trash to recover 0.3 GB</li>
          <li className="flex gap-2"><span className="text-violet-500">•</span> Archive large attachments older than 1 year</li>
        </ul>
      </div>
    </div>
  );
}
