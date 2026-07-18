import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning }}>
      {children}
      
      {/* Toast Portal/Container */}
      <div className="fixed bottom-6 right-6 z-[999999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => {
            let bgColor = 'bg-slate-900 border-slate-800 text-white';
            let iconColor = 'text-emerald-400';
            let iconBg = 'bg-emerald-500/10 border-emerald-500/20';
            let IconComponent = CheckCircle2;
            let title = 'Succès !';

            if (toast.type === 'error') {
              bgColor = 'bg-rose-950/95 border-rose-900/50 text-rose-50';
              iconColor = 'text-rose-400';
              iconBg = 'bg-rose-500/15 border-rose-500/25';
              IconComponent = AlertCircle;
              title = 'Erreur';
            } else if (toast.type === 'warning') {
              bgColor = 'bg-amber-950/95 border-amber-900/50 text-amber-50';
              iconColor = 'text-amber-400';
              iconBg = 'bg-amber-500/15 border-amber-500/25';
              IconComponent = AlertTriangle;
              title = 'Avertissement';
            }

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.15 } }}
                className={`p-4 rounded-xl border shadow-2xl flex items-start space-x-3 pointer-events-auto backdrop-blur-md ${bgColor}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${iconBg}`}>
                  <IconComponent size={16} className={iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black leading-none">{title}</p>
                  <p className="text-[11px] font-semibold text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
