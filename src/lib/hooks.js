import { useEffect, useState } from "react";

// Re-render every `ms` so time-derived UI (order tracking, expiry) stays live.
export function useNow(ms = 5000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · marbly` : "marbly — Semua urusan daging, satu tempat";
  }, [title]);
}

// Close a popover when clicking outside of `ref` or pressing Escape.
export function useDismiss(ref, open, onClose) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, onClose]);
}
