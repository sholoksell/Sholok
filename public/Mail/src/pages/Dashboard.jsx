import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Mail, HardDrive, Star, Plus, Pin, Activity, CalendarDays, TrendingUp,
} from "lucide-react";
import { useMail } from "../context/MailContext";
import Avatar from "../components/Avatar";

function StatCard({ icon: Icon, label, value, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="glass rounded-3xl p-5 shadow-lg"
    >
      <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl text-white ${gradient}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { emails, unreadCount, starredEmails, pinnedEmails, storageStats, activities } = useMail();
  const recent = emails.slice(0, 6);
  const percentUsed = Math.round((storageStats.used / storageStats.total) * 100);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-sky-500 p-6 text-white shadow-xl"
      >
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">Welcome back, Maksudul ✨</h1>
          <p className="mt-1 text-white/80">You have {unreadCount} unread emails waiting for you.</p>
          <Link
            to="/inbox"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/30"
          >
            <Mail size={16} /> Go to Inbox
          </Link>
        </div>
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 animate-float" />
      </motion.div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Mail} label="Unread Emails" value={unreadCount} gradient="bg-gradient-to-br from-violet-600 to-violet-400" delay={0.05} />
        <StatCard icon={Star} label="Starred" value={starredEmails.length} gradient="bg-gradient-to-br from-amber-500 to-amber-300" delay={0.1} />
        <StatCard icon={Pin} label="Pinned" value={pinnedEmails.length} gradient="bg-gradient-to-br from-sky-500 to-sky-300" delay={0.15} />
        <StatCard icon={HardDrive} label="Storage Used" value={`${percentUsed}%`} gradient="bg-gradient-to-br from-rose-500 to-rose-300" delay={0.2} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-3xl p-5 lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">Recent Emails</h2>
            <Link to="/inbox" className="text-sm text-violet-500 hover:underline">View all</Link>
          </div>
          <div className="space-y-1">
            {recent.map((mail) => (
              <Link
                key={mail.id}
                to={`/mail/${mail.id}`}
                className="flex items-center gap-3 rounded-2xl p-2.5 hover:bg-violet-500/5 transition-colors"
              >
                <Avatar name={mail.sender.name} color={mail.sender.avatarColor} initials={mail.sender.initials} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{mail.sender.name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{mail.subject}</p>
                </div>
                {!mail.read && <span className="h-2 w-2 shrink-0 rounded-full bg-violet-500" />}
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl p-5"
        >
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-white">
            <CalendarDays size={18} className="text-violet-500" /> Calendar
          </h2>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <span key={d}>{d}</span>
            ))}
            {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
              <span
                key={d}
                className={`rounded-lg py-1.5 text-xs ${
                  d === 14 ? "bg-violet-600 text-white font-bold" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {d}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass rounded-3xl p-5"
      >
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-white">
          <Activity size={18} className="text-violet-500" /> Activity Timeline
        </h2>
        <div className="space-y-3">
          {activities.slice(0, 8).map((a, i) => (
            <div key={a.id} className="flex items-center gap-3 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                <TrendingUp size={13} />
              </span>
              <span className="text-slate-600 dark:text-slate-300">{a.text}</span>
              <span className="ml-auto text-xs text-slate-400">{new Date(a.time).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
