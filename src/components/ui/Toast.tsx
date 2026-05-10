import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-green-600" />,
    error: <AlertCircle className="w-4 h-4 text-red-600" />,
    info: <Info className="w-4 h-4 text-secondary/60" />,
    warning: <AlertCircle className="w-4 h-4 text-orange-600" />,
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className="fixed top-8 right-8 z-100 flex items-center gap-4 p-4 min-w-[320px] 
                     bg-tertiary border border-secondary/10 shadow-2xl rounded-sm"
        >
          <div className="shrink-0">
            {icons[type]}
          </div>

          <div className="flex-1">
            <p className="font-body text-[11px] font-medium uppercase tracking-wider text-secondary leading-tight">
              {message}
            </p>
          </div>

          <button 
            onClick={onClose}
            className="text-secondary/20 hover:text-secondary transition-colors"
          >
            <X size={14} />
          </button>

          <motion.div 
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: "linear" }}
            className="absolute bottom-0 left-0 right-0 h-2px bg-secondary/10 origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;