import { motion } from "framer-motion";
import { Mail, AtSign, Clock, Megaphone, CheckCheck } from "lucide-react";
import { useMail } from "../context/MailContext";
import EmptyState from "../components/EmptyState";

const ICONS = { mail: Mail, mention: AtSign, reminder: Clock, update: Megaphone };

export default function Notifications() {
  const { notifications, setNotifications } = useMail();

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Notifications</h1>
        <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-violet-500 hover:underline">
          <CheckCheck size={15} /> Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const Icon = ICONS[n.type] || Mail;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
                className={`glass flex items-center gap-3 rounded-2xl p-3.5 ${!n.read ? "border-l-4 border-violet-500" : ""}`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                  <Icon size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${!n.read ? "font-semibold text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-300"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(n.time).toLocaleString()}</p>
                </div>
                {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-violet-500" />}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
