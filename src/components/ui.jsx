// Shared UI building blocks.
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { formatIDR } from "../data/products.js";
import Icon from "./icons.jsx";

const stripEmoji = (s = "") => String(s).replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u, "");

export function PageHero({ badge, title, accent, desc, children }) {
  return (
    <section className="border-b border-ink/5 bg-white">
      <div className="mx-auto max-w-6xl px-5 pb-8 pt-8 sm:pb-10 sm:pt-12">
        {badge && <p className="eyebrow">{stripEmoji(badge)}</p>}
        <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl">
          {title} {accent && <span className="text-coral">{accent}</span>}
        </h1>
        {desc && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/60">{desc}</p>}
        {children}
      </div>
    </section>
  );
}

export function SectionHeader({ title, desc, to, linkLabel = "Lihat semua" }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="h2">{title}</h2>
        {desc && <p className="mt-1 text-sm text-ink/55">{desc}</p>}
      </div>
      {to && (
        <Link to={to} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-coral hover:underline">
          {linkLabel} <Icon name="chevron" className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function PremiumLock({ title, desc, features, onUpgrade }) {
  return (
    <div className="rounded-xl3 border border-coral/20 bg-gradient-to-br from-coralsoft to-white p-6 sm:p-8">
      <span className="badge bg-white text-coral ring-1 ring-coral/20">
        <Icon name="lock" className="h-3.5 w-3.5" /> Premium
      </span>
      <h3 className="mt-3 font-display text-xl font-bold sm:text-2xl">{title}</h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/60">{desc}</p>
      {features?.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm text-ink/75">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
              {stripEmoji(f)}
            </li>
          ))}
        </ul>
      )}
      {onUpgrade && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={onUpgrade} className="btn-coral">Upgrade ke Premium</button>
          <span className="text-xs text-ink/45">Demo: upgrade instan tanpa pembayaran.</span>
        </div>
      )}
    </div>
  );
}

// Quiet, inline upsell: one line with a lock and a link. Never blocks the flow.
export function PremiumHint({ children, cta = "Lihat Premium", className = "" }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-creamsoft px-3 py-2.5 text-sm text-ink/60 ring-1 ring-ink/5 ${className}`}>
      <Icon name="lock" className="h-4 w-4 shrink-0 text-coral" />
      <span className="flex-1">{children}</span>
      <Link to="/akun?tab=langganan" className="shrink-0 font-semibold text-coral hover:underline">
        {cta}
      </Link>
    </p>
  );
}

// Full-page gate for premium-only pages: page header + lock + optional preview.
export function PremiumGate({ eyebrow, title, desc, lockTitle, lockDesc, features, onUpgrade, children }) {
  return (
    <div>
      <PageHero badge={eyebrow} title={title} desc={desc} />
      <div className="mx-auto max-w-6xl space-y-10 px-5 py-8 sm:py-10">
        <PremiumLock title={lockTitle} desc={lockDesc} features={features} onUpgrade={onUpgrade} />
        {children && (
          <div aria-hidden="true" className="pointer-events-none select-none opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export function PremiumPage(props) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <PremiumLock {...props} />
    </div>
  );
}

export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="rounded-xl3 border border-dashed border-ink/15 bg-white px-6 py-14 text-center">
      {icon && <p className="text-4xl opacity-80">{icon}</p>}
      <p className="mt-3 font-display text-lg font-bold">{title}</p>
      {desc && <p className="mx-auto mt-1 max-w-md text-sm text-ink/55">{desc}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function QtyStepper({ value, onChange, min = 1, max = 99, size = "md" }) {
  const s = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className="inline-flex items-center rounded-full border border-ink/15 bg-white">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className={`${s} grid place-items-center rounded-full text-ink/70 hover:bg-ink/5 disabled:opacity-30`}
        aria-label="Kurangi jumlah"
      >
        <Icon name="minus" className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className={`${s} grid place-items-center rounded-full text-ink/70 hover:bg-ink/5 disabled:opacity-30`}
        aria-label="Tambah jumlah"
      >
        <Icon name="plus" className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Stars({ value, size = "h-3.5 w-3.5" }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex gap-0.5" aria-label={`Rating ${value} dari 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" filled className={`${size} ${i <= full ? "text-amber-400" : "text-ink/15"}`} strokeWidth={1} />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Pilih rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" role="radio" aria-checked={value === i} onClick={() => onChange(i)} className="transition-transform hover:scale-110">
          <Icon name="star" filled strokeWidth={1} className={`h-8 w-8 ${i <= value ? "text-amber-400" : "text-ink/15"}`} />
        </button>
      ))}
    </div>
  );
}

export function Price({ price, compareAt, size = "text-xl" }) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span className={`font-display font-bold text-ink ${size}`}>{formatIDR(price)}</span>
      {compareAt && compareAt > price && <span className="text-sm text-ink/35 line-through">{formatIDR(compareAt)}</span>}
    </span>
  );
}

export function Modal({ open, onClose, title, children, footer }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector("input, textarea, select")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-lg animate-slideUp overflow-y-auto rounded-t-3xl bg-white p-6 shadow-soft sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="btn-ghost -mr-2 -mt-1 px-2" aria-label="Tutup">
            <Icon name="close" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function Tabs({ items, value, onChange, className = "" }) {
  return (
    <div className={`no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 ${className}`} role="tablist">
      {items.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)} className={`chip ${value === t.id ? "chip-active" : ""}`}>
          {t.label}
          {typeof t.count === "number" && (
            <span className={`rounded-full px-1.5 text-xs ${value === t.id ? "bg-white/20" : "bg-ink/5 text-ink/50"}`}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, error, hint, children, htmlFor }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
        </label>
      )}
      {children}
      {error ? <p className="mt-1 text-xs font-semibold text-coral">{error}</p> : hint && <p className="mt-1 text-xs text-ink/45">{hint}</p>}
    </div>
  );
}

export function Row({ label, value, strong }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-ink/55">{label}</span>
      <span className={strong ? "font-bold" : "font-semibold"}>{value}</span>
    </div>
  );
}

export function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-ink/45">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <Icon name="chevron" className="h-3.5 w-3.5" />}
          {it.to ? (
            <Link to={it.to} className="hover:text-ink">
              {it.label}
            </Link>
          ) : (
            <span className="font-medium text-ink/80">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
