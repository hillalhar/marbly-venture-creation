import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { useCart } from "../lib/cart.jsx";
import { useFridge } from "../lib/fridge.jsx";
import { useDismiss } from "../lib/hooks.js";
import { DAY } from "../data/tools.js";
import Logo, { LogoMark, Wordmark } from "./Logo.jsx";
import Icon from "./icons.jsx";

export { PremiumLock } from "./ui.jsx";

const NAV = [
  { label: "Cek Daging", to: "/", end: true },
  { label: "Toko", to: "/toko" },
  { label: "Resep", to: "/resep" },
  { label: "Belajar", to: "/belajar", premium: true },
  { label: "Kulkas", to: "/kulkas" },
  { label: "Alat", to: "/alat" },
];

const TABS = [
  { label: "Cek", to: "/", icon: "camera", end: true },
  { label: "Toko", to: "/toko", icon: "shop" },
  { label: "Resep", to: "/resep", icon: "book" },
  { label: "Kulkas", to: "/kulkas", icon: "fridge" },
  { label: "Akun", to: "/akun", icon: "user" },
];

function useFridgeAlerts() {
  const { items } = useFridge();
  const now = Date.now();
  return items.filter((i) => i.expiresAt - now <= DAY).length;
}

const initialsOf = (name = "?") =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function AccountMenu() {
  const { user, isPremium, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  useDismiss(ref, open, () => setOpen(false));

  const links = [
    { to: "/akun", label: "Profil & alamat", icon: "user" },
    { to: "/pesanan", label: "Pesanan saya", icon: "box" },
    { to: "/akun?tab=favorit", label: "Favorit", icon: "heart" },
    { to: "/kulkas", label: "Kulkas saya", icon: "fridge" },
  ];

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-ink/5"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-coral text-xs font-bold text-white">
          {initialsOf(user?.name)}
        </span>
        <Icon name="down" className="h-4 w-4 text-ink/50" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-64 animate-fadeIn overflow-hidden rounded-2xl border border-ink/10 bg-white p-1.5 shadow-soft">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-ink/50">{user?.email}</p>
            <span className={`badge mt-2 ${isPremium ? "bg-sun text-[#8a5a00]" : "bg-ink/5 text-ink/60"}`}>
              {isPremium ? "Premium" : "Free"}
            </span>
          </div>
          <div className="my-1 h-px bg-ink/5" />
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink/80 hover:bg-ink/5 hover:text-ink"
            >
              <Icon name={l.icon} className="h-4 w-4 text-ink/50" />
              {l.label}
            </Link>
          ))}
          <div className="my-1 h-px bg-ink/5" />
          <button
            role="menuitem"
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-coral hover:bg-coralsoft"
          >
            <Icon name="logout" className="h-4 w-4" /> Keluar
          </button>
        </div>
      )}
    </div>
  );
}

function MobileMenu({ open, onClose }) {
  const { isPremium } = useAuth();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-ink/30 md:hidden" onClick={onClose}>
      <div className="absolute inset-y-0 left-0 w-72 animate-fadeIn bg-white p-5 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <Logo />
          <button onClick={onClose} className="btn-ghost px-2" aria-label="Tutup menu">
            <Icon name="close" />
          </button>
        </div>
        <nav className="mt-6 space-y-1">
          {[...NAV, { label: "Pesanan", to: "/pesanan" }, { label: "Akun", to: "/akun" }].map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-semibold ${
                  isActive ? "bg-coralsoft text-coral" : "text-ink/80 hover:bg-ink/5"
                }`
              }
            >
              {n.label}
              {n.premium && !isPremium && <Icon name="lock" className="h-4 w-4 text-ink/40" />}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

function IconLink({ to, label, icon, badge }) {
  return (
    <Link
      to={to}
      title={label}
      aria-label={badge ? `${label}, ${badge}` : label}
      className="relative grid h-10 w-10 place-items-center rounded-full text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
    >
      <Icon name={icon} className="h-[22px] w-[22px]" />
      {badge > 0 && (
        <span className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white ring-2 ring-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

export function Header() {
  const { isPremium } = useAuth();
  const { count } = useCart();
  const alerts = useFridgeAlerts();
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-5">
        <button onClick={() => setMenu(true)} className="btn-ghost -ml-2 px-2 md:hidden" aria-label="Buka menu">
          <Icon name="menu" />
        </button>
        <Logo />
        <nav className="ml-8 hidden h-full items-center gap-1 md:flex" aria-label="Navigasi utama">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `relative flex h-full items-center gap-1.5 px-3 text-sm font-semibold transition-colors ${
                  isActive ? "text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-coral" : "text-ink/55 hover:text-ink"
                }`
              }
            >
              {n.label}
              {n.label === "Kulkas" && alerts > 0 && <span className="h-1.5 w-1.5 rounded-full bg-coral" />}
              {n.premium && !isPremium && <Icon name="lock" className="h-3.5 w-3.5 text-ink/35" />}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <span className="hidden sm:block">
            <IconLink to="/pesanan" label="Pesanan saya" icon="box" />
          </span>
          <IconLink to="/keranjang" label="Keranjang" icon="cart" badge={count} />
          <AccountMenu />
        </div>
      </div>
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
    </header>
  );
}

function BottomTabs() {
  const alerts = useFridgeAlerts();
  return (
    <nav aria-label="Navigasi bawah" className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/5 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] font-semibold ${isActive ? "text-coral" : "text-ink/45"}`
            }
          >
            <Icon name={t.icon} className="h-[22px] w-[22px]" />
            {t.label}
            {t.label === "Kulkas" && alerts > 0 && <span className="absolute right-[30%] top-2 h-2 w-2 rounded-full bg-coral ring-2 ring-white" />}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function Footer() {
  const cols = [
    { title: "Belanja", links: [["/toko", "Semua produk"], ["/toko?kategori=paket", "Paket hemat"], ["/pesanan", "Lacak pesanan"]] },
    { title: "Masak", links: [["/resep", "Resep"], ["/belajar", "Belajar cut sapi"], ["/alat", "Waktu masak & timer"]] },
    { title: "Akun", links: [["/akun", "Profil & alamat"], ["/kulkas", "Kulkas saya"], ["/akun?tab=favorit", "Favorit"]] },
  ];
  return (
    <footer className="mt-16 border-t border-ink/5 bg-white pb-24 pt-12 md:pb-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <LogoMark className="h-8 w-10" />
            <Wordmark className="text-xl" />
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/55">
            Semua urusan daging sapi di satu tempat: cek kesegaran, belanja, resep, dan stok kulkas.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold">{c.title}</p>
            <ul className="mt-3 space-y-2 text-sm text-ink/55">
              {c.links.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-6xl border-t border-ink/5 px-5 pt-6 text-xs text-ink/40">
        © 2026 marbly · Prototipe: pembayaran dan pengiriman adalah simulasi. Hasil deteksi AI adalah skrining visual, bukan jaminan keamanan pangan. ·{" "}
        <Link to="/kredit-foto" className="underline-offset-2 hover:text-ink hover:underline">Kredit foto</Link>
      </p>
    </footer>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-creamsoft font-body text-ink">
      <ScrollToTop />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Langsung ke konten
      </a>
      <Header />
      <main id="main" className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomTabs />
    </div>
  );
}
