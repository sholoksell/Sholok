import { motion } from "framer-motion";
import { RotateCcw, X, Trash2 } from "lucide-react";
import { useMail } from "../context/MailContext";
import { useUI } from "../context/UIContext";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";

export default function Trash() {
  const { trash, setTrash } = useMail();
  const { pushToast } = useUI();

  const restore = (id) => {
    setTrash((prev) => prev.filter((t) => t.id !== id));
    pushToast("Email restored", "success");
  };
  const permanentDelete = (id) => {
    setTrash((prev) => prev.filter((t) => t.id !== id));
    pushToast("Email permanently deleted", "warning");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Trash</h1>
        {trash.length > 0 && (
          <button onClick={() => setTrash([])} className="flex items-center gap-1.5 text-sm text-rose-500 hover:underline">
            <Trash2 size={14} /> Empty trash
          </button>
        )}
      </div>
      {trash.length === 0 ? (
        <EmptyState icon={Trash2} title="Trash is empty" />
      ) : (
        <div className="space-y-2">
          {trash.slice(0, 60).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.015, 0.3) }}
              className="glass flex items-center gap-3 rounded-2xl p-3.5"
            >
              <Avatar name={t.sender.name} color={t.sender.avatarColor} initials={t.sender.initials} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{t.subject}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{t.preview}</p>
              </div>
              <button onClick={() => restore(t.id)} className="text-slate-400 hover:text-emerald-500"><RotateCcw size={16} /></button>
              <button onClick={() => permanentDelete(t.id)} className="text-slate-400 hover:text-rose-500"><X size={16} /></button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
