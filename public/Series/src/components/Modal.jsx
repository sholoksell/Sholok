import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed left-1/2 top-1/2 z-[91] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl dark:bg-brand-950"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-brand-950 dark:text-white">{title}</h3>
              <button type="button" onClick={onClose} aria-label="বন্ধ করুন">
                <X size={20} className="text-gray-400 hover:text-brand-600" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Modal;
