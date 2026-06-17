import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const icons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: 'bg-success-50 dark:bg-success-950/50',
    icon: 'text-success-600',
    border: 'border-success-200 dark:border-success-800',
  },
  error: {
    bg: 'bg-error-50 dark:bg-error-950/50',
    icon: 'text-error-600',
    border: 'border-error-200 dark:border-error-800',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-950/50',
    icon: 'text-warning-600',
    border: 'border-warning-200 dark:border-warning-800',
  },
  info: {
    bg: 'bg-brand-50 dark:bg-brand-950/50',
    icon: 'text-brand-600',
    border: 'border-brand-200 dark:border-brand-800',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = Math.random().toString(36).substring(2);
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  const success = useCallback(
    (title: string, message?: string) => toast('success', title, message),
    [toast]
  );

  const error = useCallback(
    (title: string, message?: string) => toast('error', title, message),
    [toast]
  );

  const warning = useCallback(
    (title: string, message?: string) => toast('warning', title, message),
    [toast]
  );

  const info = useCallback(
    (title: string, message?: string) => toast('info', title, message),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          const style = styles[t.type];
          return (
            <div
              key={t.id}
              className={`animate-slide-up flex items-start gap-3 p-4 rounded-xl border ${style.bg} ${style.border} shadow-soft-lg`}
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${style.icon}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 dark:text-surface-100">{t.title}</p>
                {t.message && (
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-0.5">{t.message}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 p-1 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                <X className="w-4 h-4 text-surface-500" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
