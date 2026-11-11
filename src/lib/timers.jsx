// Kitchen multi-timer, shared across the whole app so timers keep running
// while the user moves between pages (and survive a refresh, because each
// running timer stores an absolute end time). Premium feature.

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import { useNow } from "./hooks.js";
import { uid } from "./storage.js";
import { useToast } from "./toast.jsx";
import { useUserStore } from "./userStore.js";
import Icon from "../components/icons.jsx";

const TimerContext = createContext(null);
const MAX_TIMERS = 8;

// Three short beeps via Web Audio (no external sound file).
export function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [0, 0.35, 0.7].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.25, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.3);
    });
    setTimeout(() => ctx.close(), 1500);
    navigator.vibrate?.([300, 150, 300]);
  } catch {
    /* audio blocked — ignore */
  }
}

export function fmtClock(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

// Remaining ms for a timer at time `now`.
export function remainingOf(t, now) {
  if (t.status === "running") return Math.max(0, t.endAt - now);
  if (t.status === "done") return 0;
  return t.left;
}

export function TimerProvider({ children }) {
  const { user, isPremium } = useAuth();
  const toast = useToast();
  const [timers, setTimers] = useUserStore(user?.email, "timers", []);
  const timersRef = useRef(timers);
  timersRef.current = timers;

  // Watch for finished timers once per second; only update state when one ends.
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const finished = timersRef.current.filter((t) => t.status === "running" && t.endAt <= now);
      if (!finished.length) return;
      setTimers((prev) => prev.map((t) => (finished.some((f) => f.id === t.id) ? { ...t, status: "done", left: 0 } : t)));
      beep();
      finished.forEach((t) => toast(`Timer "${t.label}" selesai!`, { duration: 6000, action: { label: "Lihat", to: "/alat?tab=timer" } }));
    }, 1000);
    return () => clearInterval(id);
  }, [setTimers, toast]);

  const add = useCallback(
    (label, minutes, { start = true } = {}) => {
      const ms = Math.max(1, Math.round(Number(minutes) * 60)) * 1000;
      const t = {
        id: uid("T"),
        label: String(label || "Timer").slice(0, 40),
        duration: ms,
        left: ms,
        endAt: start ? Date.now() + ms : null,
        status: start ? "running" : "paused",
      };
      setTimers((prev) => [t, ...prev].slice(0, MAX_TIMERS));
      if (start) toast(`Timer "${t.label}" dimulai (${fmtClock(ms)})`, { tone: "info", action: { label: "Lihat", to: "/alat?tab=timer" } });
      return t.id;
    },
    [setTimers, toast]
  );

  const patch = useCallback((id, fn) => setTimers((prev) => prev.map((t) => (t.id === id ? fn(t) : t))), [setTimers]);

  const value = {
    timers: isPremium ? timers : [],
    add,
    pause: (id) => patch(id, (t) => (t.status === "running" ? { ...t, status: "paused", left: Math.max(0, t.endAt - Date.now()), endAt: null } : t)),
    resume: (id) => patch(id, (t) => (t.status === "paused" && t.left > 0 ? { ...t, status: "running", endAt: Date.now() + t.left } : t)),
    reset: (id) => patch(id, (t) => ({ ...t, status: "paused", left: t.duration, endAt: null })),
    extend: (id, minutes) =>
      patch(id, (t) => {
        const ms = minutes * 60000;
        if (t.status === "running") return { ...t, endAt: t.endAt + ms, duration: t.duration + ms };
        return { ...t, status: "running", left: ms, endAt: Date.now() + (t.status === "done" ? ms : t.left + ms), duration: t.duration + ms };
      }),
    remove: (id) => setTimers((prev) => prev.filter((t) => t.id !== id)),
    clearDone: () => setTimers((prev) => prev.filter((t) => t.status !== "done")),
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimers() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimers harus dipakai di dalam <TimerProvider>");
  return ctx;
}

// Small floating pill that shows the next timer while browsing other pages.
export function FloatingTimers() {
  const { timers } = useTimers();
  const { pathname, search } = useLocation();
  const active = timers.filter((t) => t.status === "running" || t.status === "done");
  const now = useNow(active.length ? 500 : 60000);
  if (!active.length || (pathname === "/alat" && search.includes("tab=timer"))) return null;

  const done = active.filter((t) => t.status === "done");
  const next = [...active].filter((t) => t.status === "running").sort((a, b) => a.endAt - b.endAt)[0];

  return (
    <Link
      to="/alat?tab=timer"
      className={`fixed bottom-[76px] right-4 z-40 flex items-center gap-2.5 rounded-full py-2 pl-3 pr-4 text-sm font-semibold shadow-soft transition-colors md:bottom-6 ${
        done.length ? "animate-pulse bg-coral text-white" : "bg-ink text-white hover:bg-black"
      }`}
      aria-label="Buka multi-timer"
    >
      <Icon name="clock" className="h-4 w-4" />
      {done.length ? (
        <span>{done.length === 1 ? `"${done[0].label}" selesai` : `${done.length} timer selesai`}</span>
      ) : (
        <span className="flex items-center gap-2">
          <span className="max-w-32 truncate font-medium text-white/70">{next.label}</span>
          <span className="tabular-nums">{fmtClock(remainingOf(next, now))}</span>
        </span>
      )}
      {active.length > 1 && !done.length && <span className="rounded-full bg-white/15 px-1.5 text-xs">+{active.length - 1}</span>}
    </Link>
  );
}
