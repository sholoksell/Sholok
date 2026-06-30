import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title = "Nothing here yet", subtitle = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/15 to-sky-500/15 text-violet-500"
      >
        <Icon size={34} />
      </motion.div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      {subtitle && <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </motion.div>
  );
}
