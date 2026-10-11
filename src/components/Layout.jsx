import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

const NAV = [
  { label: "Deteksi", to: "/" },
  { label: "Belajar", to: "/belajar", premium: true },
  { label: "Menu", to: "/menu", premium: true },
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cream">
        <svg viewBox="0 0 48 48" className="h-7 w-7">
          <path
            d="M6 20 C4 9 16 4 27 5 C40 6 44 15 40 23 C37 29 28 31 20 31 C11 31 8 26 6 20 Z"
            fill="#f26d6d"
            stroke="#1a1413"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="16" r="2" fill="#1a1413" />
          <circle cx="28" cy="12" r="2" fill="#1a1413" />
          <circle cx="32" cy="20" r="2" fill="#1a1413" />
          <circle cx="23" cy="22" r="2" fill="#1a1413" />
        </svg>
      </span>
      <span className="font-display text-2xl font-extrabold lowercase">marbly</span>
    </Link>
  );
}

export function Header() {
  const { isPremium, logout } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink/5 bg-creamsoft/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex items-center gap-1 font-semibold transition-colors ${
                  isActive ? "text-coral" : "hover:text-coral"
                }`
              }
            >
              {n.label}
              {n.premium && !isPremium && <span title="Fitur premium">🔒</span>}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span
            className={`hidden rounded-full border-2 border-ink px-3 py-1 text-xs font-bold sm:inline ${
              isPremium ? "bg-sun" : "bg-white"
            }`}
          >
            {isPremium ? "⭐ Premium" : "Free"}
          </span>
          <button
            onClick={logout}
            className="hidden rounded-full px-3 py-1 text-sm font-semibold text-ink/60 hover:text-coral sm:inline"
          >
            Keluar
          </button>
          <Link to="/" className="btn-dark px-5 py-2.5 text-sm">
            Cek daging
          </Link>
        </div>
      </div>
      {/* mobile nav */}
      <nav className="flex items-center justify-center gap-6 border-t-2 border-ink/5 px-5 py-2 md:hidden">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `flex items-center gap-1 text-sm font-semibold ${
                isActive ? "text-coral" : "text-ink/70"
              }`
            }
          >
            {n.label}
            {n.premium && !isPremium && <span>🔒</span>}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink py-6 text-center text-sm text-white/80">
      marbly — cek daging lebih percaya diri. Dibuat untuk dapur Indonesia.
    </footer>
  );
}

export function PremiumLock({ title, desc, features, onUpgrade }) {
  return (
    <div className="relative overflow-hidden rounded-xl2 border-2 border-ink bg-ink p-7 text-cream">
      <div className="absolute right-4 top-4 text-4xl opacity-30">🔒</div>
      <span className="inline-flex items-center gap-2 rounded-full bg-sun px-3 py-1 text-xs font-extrabold text-ink">
        ⭐ Fitur Premium
      </span>
      <h3 className="mt-3 font-display text-2xl font-extrabold text-white">{title}</h3>
      <p className="mt-2 max-w-xl text-cream/75">{desc}</p>
      {features?.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm text-cream/90">
          {features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
      {onUpgrade && (
        <>
          <button onClick={onUpgrade} className="btn-coral mt-6">
            ⭐ Upgrade ke Premium
          </button>
          <p className="mt-2 text-xs text-cream/50">
            Demo: upgrade instan tanpa pembayaran untuk mencoba fitur premium.
          </p>
        </>
      )}
    </div>
  );
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-creamsoft font-body text-ink">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
