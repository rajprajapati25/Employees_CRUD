import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
        let borderColor = 'border-emerald-200';
        let bgColor = 'bg-white';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          borderColor = 'border-rose-200';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-violet-500 shrink-0" />;
          borderColor = 'border-violet-200';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border ${borderColor} ${bgColor} shadow-xl flex items-start justify-between gap-3 animate-slideDown transition-all`}
          >
            <div className="flex items-start space-x-3">
              {icon}
              <div>
                <h4 className="text-xs font-bold text-slate-900">{toast.title}</h4>
                {toast.message && (
                  <p className="text-[11px] text-slate-500 mt-0.5">{toast.message}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
