'use client';

import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onRemove: (id: string) => void;
}

const configs: Record<ToastType, { icon: React.ReactNode; color: string; border: string }> = {
  success: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-700', border: 'border-emerald-200' },
  error:   { icon: <XCircle className="h-4 w-4" />,      color: 'text-red-700',     border: 'border-red-200' },
  warning: { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-amber-700',   border: 'border-amber-200' },
  info:    { icon: <Info className="h-4 w-4" />,          color: 'text-blue-700',    border: 'border-blue-200' },
};

export function Toast({ id, type, message, onRemove }: ToastProps) {
  const { icon, color, border } = configs[type];
  return (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg text-sm font-medium',
        color,
        border
      )}
    >
      {icon}
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 rounded p-0.5 opacity-60 hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export interface ToastContainerProps {
  toasts: ToastProps[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} />
      ))}
    </div>
  );
}
