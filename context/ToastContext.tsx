"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Check, Info, X, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right-5 fade-in bg-white ${
              t.type === "success"
                ? "border-success/30"
                : t.type === "error"
                ? "border-danger/30"
                : t.type === "warning"
                ? "border-amber-400/50 bg-amber-50/20"
                : "border-info/30"
            }`}
          >
            {t.type === "success" && <Check className="text-success" size={20} />}
            {t.type === "error" && <X className="text-danger" size={20} />}
            {t.type === "warning" && <AlertTriangle className="text-amber-500" size={20} />}
            {t.type === "info" && <Info className="text-info" size={20} />}
            <p className="text-sm font-medium text-navy-900">{t.message}</p>
            <button onClick={() => removeToast(t.id)} className="ml-4 text-navy-900/50 hover:text-navy-900">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
