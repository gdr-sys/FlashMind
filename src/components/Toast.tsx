/**
 * Toast notification component — shows temporary messages at top of screen.
 */
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

export default function Toast() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-xs w-full">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`${colorMap[toast.type]} text-white px-4 py-3 rounded-xl shadow-lg 
              flex items-center gap-3 animate-slide-in`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
