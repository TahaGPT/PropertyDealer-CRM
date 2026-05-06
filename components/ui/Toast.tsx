'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, UserPlus, RefreshCw, Trash2, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Toast = {
  id: string;
  type: 'LEAD_CREATED' | 'LEAD_UPDATED' | 'LEAD_ASSIGNED' | 'LEAD_DELETED' | 'LEAD_STATUS_CHANGED' | 'info';
  title: string;
  message: string;
  timestamp: Date;
};

const toastIcons: Record<string, any> = {
  LEAD_CREATED: Bell,
  LEAD_UPDATED: RefreshCw,
  LEAD_ASSIGNED: UserPlus,
  LEAD_DELETED: Trash2,
  LEAD_STATUS_CHANGED: ArrowRightLeft,
  info: Bell,
};

const toastColors: Record<string, string> = {
  LEAD_CREATED: 'border-l-emerald-500 bg-emerald-50',
  LEAD_UPDATED: 'border-l-blue-500 bg-blue-50',
  LEAD_ASSIGNED: 'border-l-purple-500 bg-purple-50',
  LEAD_DELETED: 'border-l-red-500 bg-red-50',
  LEAD_STATUS_CHANGED: 'border-l-orange-500 bg-orange-50',
  info: 'border-l-[#517561] bg-[#f4f7f5]',
};

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = toastIcons[toast.type] || Bell;
  const colorClass = toastColors[toast.type] || toastColors.info;

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'relative flex items-start gap-3 rounded-xl border border-l-4 p-4 shadow-lg backdrop-blur-sm',
        colorClass
      )}
    >
      <div className="mt-0.5">
        <Icon size={18} className="text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900">{toast.title}</p>
        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{toast.message}</p>
      </div>
      <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 transition-colors">
        <X size={14} />
      </button>
    </motion.div>
  );
}

/**
 * Hook to manage toast notifications.
 */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id' | 'timestamp'>) => {
    const newToast: Toast = {
      ...toast,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
    };
    setToasts((prev) => [...prev, newToast].slice(-5)); // Keep max 5 toasts
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, dismissToast };
}
