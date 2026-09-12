import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangleIcon, ShieldIcon, SparklesIcon } from "../components/Icons.jsx";
import { playWarningAlert } from "../lib/sound.js";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, ...toast };

    if (toast.type === "warning" || toast.isFlag) {
      playWarningAlert();
    }

    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration || (toast.isFlag ? 10000 : 5000);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showFlagToast = useCallback(
    ({ durationSeconds, flags, maxFlags = 3, aiAgent }) => {
      return addToast({
        type: "warning",
        isFlag: true,
        title: `Anti-Cheat Strike ${flags} of ${maxFlags}`,
        durationSeconds,
        flags,
        maxFlags,
        aiAgent,
        message: `Quest completed in ${durationSeconds}s (<60s limit). Flagged by Sentinel AI.`,
      });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showFlagToast,
        showSuccess: (title, message) => addToast({ type: "success", title, message }),
        showError: (title, message) => addToast({ type: "error", title, message }),
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <aside aria-label="Notifications" className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto rounded-xl p-4 shadow-xl border backdrop-blur-md transition-all ${
                toast.isFlag
                  ? "bg-amber-950/90 dark:bg-amber-950/95 border-amber-500/60 text-amber-100 ring-2 ring-amber-500/30"
                  : toast.type === "error"
                  ? "bg-rose-950/90 border-rose-500/60 text-rose-100"
                  : "bg-surface/95 border-hairline text-ink"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    toast.isFlag
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : toast.type === "error"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  }`}
                >
                  {toast.isFlag ? (
                    <AlertTriangleIcon className="w-5 h-5 text-amber-400 animate-pulse" />
                  ) : toast.type === "error" ? (
                    <ShieldIcon className="w-5 h-5 text-rose-400" />
                  ) : (
                    <SparklesIcon className="w-5 h-5 text-emerald-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      {toast.title}
                    </h4>
                    <button
                      onClick={() => removeToast(toast.id)}
                      className="text-mute hover:text-ink text-xs px-1"
                      aria-label="Dismiss notification"
                    >
                      ×
                    </button>
                  </div>

                  <p className="text-xs mt-1 text-ink/90 leading-relaxed">
                    {toast.message}
                  </p>

                  {toast.isFlag && (
                    <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex flex-col gap-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-amber-200/90">
                        <span>Speed Limit:</span>
                        <span className="font-mono font-semibold text-rose-300">
                          {toast.durationSeconds}s / 60s min
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-amber-200/90">
                        <span>Strikes:</span>
                        <span className="font-mono font-bold text-amber-400">
                          {toast.flags} / {toast.maxFlags}
                          {toast.flags >= 3 && " (CRITICAL)"}
                        </span>
                      </div>
                      {toast.aiAgent && (
                        <div className="bg-black/30 rounded p-1.5 mt-1 border border-amber-500/20 text-[10px] text-amber-300/80 font-mono leading-tight">
                          🤖 {toast.aiAgent.inspector}: {toast.aiAgent.status} ({Math.round(toast.aiAgent.confidence * 100)}% conf)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
