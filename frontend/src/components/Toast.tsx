'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, X, MessageSquare } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-[#2F6B4F]" />,
    error: <AlertCircle className="w-4 h-4 text-[#C4473A]" />,
    info: <MessageSquare className="w-4 h-4 text-[#E8833A]" />,
  };

  const bgColors = {
    success: 'bg-[#E3F0E8] border-[#2F6B4F]/20',
    error: 'bg-red-50 border-[#C4473A]/20',
    info: 'bg-[#FCEBDD] border-[#E8833A]/20',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
                       ${bgColors[toast.type]}
                       animate-slide-in max-w-sm`}
          >
            {icons[toast.type]}
            <p className="text-sm font-medium text-primary-text flex-1">
              {toast.message}
            </p>
            <button
              onClick={() => dismiss(toast.id)}
              className="p-0.5 rounded-lg hover:bg-black/5 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5 text-muted" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
