import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  anomaly: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

const STYLES = {
  anomaly: {
    border: 'border-red-500/30',
    bg: 'rgba(239,68,68,0.08)',
    icon: 'text-red-400',
    title: 'text-red-300',
    bar: '#ef4444',
  },
  success: {
    border: 'border-accent-primary/30',
    bg: 'rgba(1,195,142,0.08)',
    icon: 'text-accent-primary',
    title: 'text-accent-primary',
    bar: '#01c38e',
  },
  info: {
    border: 'border-blue-400/30',
    bg: 'rgba(99,179,237,0.08)',
    icon: 'text-blue-400',
    title: 'text-blue-300',
    bar: '#63b3ed',
  },
};

function ToastItem({ toast, onRemove }) {
  const s = STYLES[toast.type] || STYLES.info;
  const Icon = ICONS[toast.type] || Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={`relative w-80 rounded-xl border ${s.border} overflow-hidden shadow-2xl`}
      style={{ background: 'linear-gradient(135deg, #132d46 0%, #0f2438 100%)' }}
    >
      {/* Colored left bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: s.bar }} />

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 rounded-b-xl"
        style={{ background: s.bar, opacity: 0.5 }}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: toast.duration / 1000, ease: 'linear' }}
      />

      <div className="flex items-start gap-3 px-4 py-3 pl-5">
        <div className={`mt-0.5 shrink-0 ${s.icon}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm leading-tight ${s.title}`}>{toast.title}</p>
          {toast.message && (
            <p className="text-white/50 text-xs mt-1 leading-relaxed">{toast.message}</p>
          )}
          {toast.time && (
            <p className="text-white/25 text-xs mt-1 font-mono">{toast.time}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="shrink-0 text-white/20 hover:text-white/60 transition-colors mt-0.5"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 5000, time }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message, duration, time }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container — fixed top-right */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="sync">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onRemove={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
