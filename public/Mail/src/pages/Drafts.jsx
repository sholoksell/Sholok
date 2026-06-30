import { motion } from "framer-motion";
import { Trash2, Eye, FileEdit } from "lucide-react";
import { useMail } from "../context/MailContext";
import EmptyState from "../components/EmptyState";

export default function Drafts() {
  const { drafts, setDrafts } = useMail();

  const removeDraft = (id) => setDrafts((prev) => prev.filter((d) => d.id !== id));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">Drafts</h1>
      {drafts.length === 0 ? (
        <EmptyState icon={FileEdit} title="No drafts saved" />
      ) : (
        <div className="space-y-2">
          {drafts.slice(0, 60).map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.015, 0.3) }}
              className="glass flex items-center gap-3 rounded-2xl p-3.5"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">To: {d.to || "(no recipient)"}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{d.subject} — {d.preview}</p>
              </div>
              <span className="text-xs text-slate-400">{new Date(d.lastEdited).toLocaleDateString()}</span>
              <button className="text-slate-400 hover:text-violet-500"><Eye size={16} /></button>
              <button onClick={() => removeDraft(d.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
