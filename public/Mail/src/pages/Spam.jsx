import { motion } from "framer-motion";
import { ShieldAlert, Flag, Trash2 } from "lucide-react";
import { useMail } from "../context/MailContext";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";

export default function Spam() {
  const { spam } = useMail();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">Spam</h1>
      {spam.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No spam detected" />
      ) : (
        <div className="space-y-2">
          {spam.slice(0, 60).map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.015, 0.3) }}
              className="glass flex items-center gap-3 rounded-2xl p-3.5"
            >
              <Avatar name={s.sender.name} color={s.sender.avatarColor} initials={s.sender.initials} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{s.subject}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{s.preview}</p>
              </div>
              <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs text-rose-500">{s.spamScore}% spam</span>
              <button className="text-slate-400 hover:text-amber-500"><Flag size={16} /></button>
              <button className="text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
