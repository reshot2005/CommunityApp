import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

function ToastViewport({ toasts, dismissToast }) {
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur ${
            toast.type === "success"
              ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-50"
              : toast.type === "error"
                ? "border-rose-400/30 bg-rose-500/15 text-rose-50"
                : "border-sky-400/30 bg-sky-500/15 text-sky-50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-6">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="interactive-button rounded-full px-2 py-1 text-xs text-current/80 hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info") => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => dismissToast(id), 3500);
    },
    [dismissToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
