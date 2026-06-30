import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { useUI } from "../context/UIContext";

const ICONS = { success: CheckCircle2, info: Info, warning: AlertTriangle };

export default function ToastContainer() {
  const { toasts, dismissToast } = useUI();
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              className="glass-strong flex items-center gap-2 rounded-2xl px-4 py-3 text-sm shadow-xl"
            >
              <Icon size={16} className="text-violet-500" />
              <span className="text-slate-700 dark:text-slate-200">{t.message}</span>
              <button onClick={() => dismissToast(t.id)} className="ml-2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
