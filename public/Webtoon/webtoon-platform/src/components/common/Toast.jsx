import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Info, AlertCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const icons = {
  success: { Icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
  error: { Icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
  info: { Icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
};

export default function Toast() {
  const { toast } = useApp();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl shadow-2xl ${icons[toast.type]?.bg || icons.info.bg}`}
        >
          {(() => {
            const { Icon, color } = icons[toast.type] || icons.info;
            return <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />;
          })()}
          <span className="text-white text-sm font-medium">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
