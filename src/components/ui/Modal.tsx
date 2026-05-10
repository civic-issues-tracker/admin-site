import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal = ({ isOpen, onClose, children, title }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-secondary/20 backdrop-blur-xl"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md p-12 overflow-hidden
             bg-primary/40 backdrop-blur-3xl 
             border border-secondary/10 
             shadow-2xl rounded-sm"
          >
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-secondary/30 hover:text-secondary transition-colors"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            {title && (
              <h3 className="text-2xl font-header font-light text-secondary uppercase tracking-tight mb-10">
                {title}
              </h3>
            )}
            <div className="absolute top-0 left-0 w-full h-1px bg-linear-to-r from-transparent via-secondary/20 to-transparent" />
            <div className="relative z-10">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;