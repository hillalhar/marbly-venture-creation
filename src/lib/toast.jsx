// Lightweight toast notifications used for feedback across the app.
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";

const ToastContext = createContext(null);

const TONES = {
  success: "bg-ink text-white",
  error: "bg-coral text-white",
  info: "bg-white text-ink",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  // toast("Teks", { tone, action: { label, to } , duration })
  const toast = useCallback(
    (message, opts = {}) => {
      const id = ++seq.current;
      const item = { id, message, tone: opts.tone || "success", action: opts.action };
      setToasts((t) => [...t.slice(-2), item]);
      setTimeout(() => dismiss(id), opts.duration || 3200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-md animate-slideUp items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 text-sm font-bold shadow-soft ${TONES[t.tone]}`}
          >
            <span className="flex-1">{t.message}</span>
            {t.action?.onClick && (
              <button
                onClick={() => {
                  t.action.onClick();
                  dismiss(t.id);
                }}
                className="shrink-0 rounded-full bg-white/15 px-3 py-1 hover:underline"
              >
                {t.action.label}
              </button>
            )}
            {t.action?.to && (
              <Link
                to={t.action.to}
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded-full bg-white/15 px-3 py-1 underline-offset-2 hover:underline"
              >
                {t.action.label}
              </Link>
            )}
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100"
              aria-label="Tutup notifikasi"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam <ToastProvider>");
  return ctx;
}
