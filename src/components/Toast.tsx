import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-center justify-between gap-3 text-sm transition-all transform animate-slide-up ${
            toast.type === 'success'
              ? 'bg-[#151C2C] border-emerald-500/80 text-white shadow-emerald-500/10'
              : toast.type === 'error'
              ? 'bg-[#151C2C] border-rose-500/80 text-white shadow-rose-500/10'
              : 'bg-[#151C2C] border-amber-500/80 text-white shadow-amber-500/10'
          }`}
        >
          <div className="flex items-center space-x-3 min-w-0">
            {toast.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            {toast.type === 'info' && (
              <Info className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-medium leading-snug break-words">
              {toast.text}
            </span>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-gray-400 hover:text-white p-1 rounded-lg shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
