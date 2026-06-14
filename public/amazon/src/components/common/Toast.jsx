import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';

const icons = {
  success: <FiCheck className="text-green-600" size={16} />,
  error: <FiX className="text-red-600" size={16} />,
  warning: <FiAlertCircle className="text-yellow-600" size={16} />,
  info: <FiInfo className="text-blue-600" size={16} />,
};

const colors = {
  success: 'border-l-green-500 bg-white',
  error: 'border-l-red-500 bg-white',
  warning: 'border-l-yellow-500 bg-white',
  info: 'border-l-blue-500 bg-white',
};

const ToastItem = ({ toast, onRemove }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: 80, scale: 0.95 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: 80, scale: 0.9 }}
    transition={{ duration: 0.25 }}
    className={`flex items-start gap-2.5 px-3 py-2.5 rounded shadow-amazon-md border-l-4 min-w-[250px] max-w-[340px] cursor-pointer ${
      colors[toast.type] || colors.success
    }`}
    onClick={() => onRemove(toast.id)}
  >
    <span className="mt-0.5 shrink-0">{icons[toast.type] || icons.success}</span>
    <p className="text-amazon-dark text-sm leading-snug flex-1">{toast.message}</p>
    <button
      className="text-amazon-text-gray hover:text-amazon-dark ml-1 shrink-0"
      onClick={(e) => { e.stopPropagation(); onRemove(toast.id); }}
    >
      <FiX size={14} />
    </button>
  </motion.div>
);

const Toast = () => {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
