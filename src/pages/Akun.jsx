import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getProduct } from "../data/products.js";
import { getRecipe } from "../data/recipes.js";
import { orderState } from "../data/shop.js";
import { isValidPhone, useAuth } from "../lib/auth.jsx";
import { useCart } from "../lib/cart.jsx";
import { useFavorites } from "../lib/favorites.jsx";
import { useFridge } from "../lib/fridge.jsx";
import { usePageTitle } from "../lib/hooks.js";
import { useToast } from "../lib/toast.jsx";
import AddressForm, { formatAddress } from "../components/AddressForm.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Icon from "../components/icons.jsx";
import { RecipeCard } from "./Resep.jsx";
import { EmptyState, Field, Modal, Tabs } from "../components/ui.jsx";

const TABS = [
  { id: "profil", label: "Profil" },
  { id: "alamat", label: "Alamat" },
  { id: "favorit", label: "Favorit" },
  { id: "langganan", label: "Langganan" },
  { id: "keamanan", label: "Keamanan" },
];

export default function Akun() {
  usePageTitle("Akun saya");
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "profil";
  const { user, isPremium, logout } = useAuth();
  const { orders } = useCart();
  const { items } = useFridge();
  const navigate = useNavigate();

  const active = orders.filter((o) => {
    const s = orderState(o);
    return !["done", "cancelled", "expired"].includes(s.key);
  }).length;

  return (
    <div className="page">
      <div className="card flex flex-wrap items-center gap-4 p-5">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-coral font-display text-2xl font-bold text-white">
          {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-bold">{user.name}</h1>
          <p className="truncate text-sm text-ink/60">{user.email}</p>
          <span className={`badge mt-1 ${isPremium ? "bg-sun" : "bg-cream"}`}>{isPremium ? "Premium" : "Free"}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <Link to="/pesanan" className="rounded-2xl bg-creamsoft px-3 py-2 hover:bg-cream">
            <p className="font-display text-xl font-bold">{orders.length}</p>
            <p className="text-xs text-ink/60">Pesanan</p>
          </Link>
          <Link to="/pesanan" className="rounded-2xl bg-creamsoft px-3 py-2 hover:bg-cream">
            <p className="font-display text-xl font-bold">{active}</p>
            <p className="text-xs text-ink/60">Aktif</p>
          </Link>
          <Link to="/kulkas" className="rounded-2xl bg-creamsoft px-3 py-2 hover:bg-cream">
            <p className="font-display text-xl font-bold">{isPremium ? items.length : <Icon name="lock" className="mx-auto my-1 h-4 w-4 text-ink/35" />}</p>
            <p className="text-xs text-ink/60">Di kulkas</p>
          </Link>
        </div>
      </div>

      <Tabs className="mt-6" items={TABS} value={tab} onChange={(t) => setParams(t === "profil" ? {} : { tab: t }, { replace: true })} />

      <div className="mt-5">
        {tab === "profil" && <Profile />}
        {tab === "alamat" && <Addresses />}
        {tab === "favorit" && <Favorites />}
        {tab === "langganan" && <Plan />}
        {tab === "keamanan" && <Security />}
      </div>

      <div className="mt-8 grid gap-2 sm:grid-cols-3">
        <Link to="/belajar" className="card flex items-center justify-between p-4 font-bold hover:bg-cream">Belajar {!isPremium && <Icon name="lock" className="h-4 w-4 text-ink/35" />}</Link>
        <Link to="/alat" className="card flex items-center justify-between p-4 font-bold hover:bg-cream">Alat dapur {!isPremium && <Icon name="lock" className="h-4 w-4 text-ink/35" />}</Link>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="card p-4 text-left font-bold text-coral hover:bg-cream"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}

function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [err, setErr] = useState({});
  const dirty = name !== user.name || phone !== (user.phone || "");

  function submit(e) {
    e.preventDefault();
    const x = {};
    if (!name.trim()) x.name = "Nama wajib diisi.";
    if (phone && !isValidPhone(phone)) x.phone = "Nomor HP tidak valid.";
    setErr(x);
    if (Object.keys(x).length) return;
    updateProfile({ name: name.trim(), phone: phone.replace(/[\s-]/g, "") });
    toast("Profil diperbarui");
  }

  return (
    <form onSubmit={submit} noValidate className="card max-w-xl space-y-4 p-5">
      <Field label="Nama" error={err.name} htmlFor="p-name">
        <input id="p-name" value={name} onChange={(e) => setName(e.target.value)} className={`input ${err.name ? "input-error" : ""}`} />
      </Field>
      <Field label="Email" hint="Email dipakai untuk masuk dan tidak bisa diubah.">
        <input value={user.email} disabled className="input opacity-60" />
      </Field>
      <Field label="No. HP" error={err.phone} hint="Dipakai otomatis saat menambah alamat." htmlFor="p-phone">
        <input id="p-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" className={`input ${err.phone ? "input-error" : ""}`} />
      </Field>
      <p className="text-xs text-ink/50">Member sejak {new Date(user.createdAt).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</p>
      <button type="submit" disabled={!dirty} className="btn-coral btn-sm">Simpan perubahan</button>
    </form>
  );
}

function Addresses() {
  const { user, saveAddress, removeAddress, setDefaultAddress } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // null | "new" | address
  const [confirm, setConfirm] = useState(null);

  return (
    <div className="space-y-3">
      {user.addresses.length === 0 && (
        <EmptyState icon="📍" title="Belum ada alamat" desc="Simpan alamat supaya checkout lebih cepat." />
      )}
      {user.addresses.map((a) => (
        <div key={a.id} className={`card p-5 ${a.isDefault ? "!border-coral" : ""}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-bold">{a.label}</span>
            {a.isDefault && <span className="badge bg-coral text-white">Utama</span>}
          </div>
          <p className="mt-1 text-sm font-bold">{a.recipient} · {a.phone}</p>
          <p className="text-sm text-ink/60">{formatAddress(a)}</p>
          {a.notes && <p className="text-xs text-ink/50">Patokan: {a.notes}</p>}
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <button onClick={() => setEditing(a)} className="btn-outline px-4 py-1.5 text-sm">Ubah</button>
            {!a.isDefault && (
              <button onClick={() => { setDefaultAddress(a.id); toast("Alamat utama diganti"); }} className="btn-ghost px-3 py-1.5 text-sm">
                Jadikan utama
              </button>
            )}
            <button onClick={() => setConfirm(a)} className="btn-ghost px-3 py-1.5 text-sm text-coral">Hapus</button>
          </div>
        </div>
      ))}
      <button onClick={() => setEditing("new")} className="btn-coral btn-sm">+ Tambah alamat</button>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === "new" ? "Tambah alamat" : "Ubah alamat"}>
        {editing && (
          <AddressForm
            initial={editing === "new" ? undefined : editing}
            defaults={{ recipient: user.name, phone: user.phone || "" }}
            onCancel={() => setEditing(null)}
            onSubmit={(a) => {
              saveAddress(a);
              setEditing(null);
              toast("Alamat disimpan");
            }}
          />
        )}
      </Modal>
      <Modal
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title="Hapus alamat?"
        footer={
          <>
            <button onClick={() => setConfirm(null)} className="btn-outline btn-sm">Batal</button>
            <button
              onClick={() => {
                removeAddress(confirm.id);
                setConfirm(null);
                toast("Alamat dihapus", { tone: "info" });
              }}
              className="btn-coral btn-sm"
            >
              Hapus
            </button>
          </>
        }
      >
        <p className="text-sm text-ink/70">{confirm && `${confirm.label}: ${formatAddress(confirm)}`}</p>
      </Modal>
    </div>
  );
}

function Favorites() {
  const { fav } = useFavorites();
  const products = fav.products.map(getProduct).filter(Boolean);
  const recipes = fav.recipes.map(getRecipe).filter(Boolean);
  if (!products.length && !recipes.length) {
    return (
      <EmptyState
        icon="🤍"
        title="Belum ada favorit"
        desc="Ketuk ikon hati di produk atau resep untuk menyimpannya di sini."
        action={<Link to="/toko" className="btn-coral btn-sm">Jelajahi toko</Link>}
      />
    );
  }
  return (
    <div className="space-y-8">
      {products.length > 0 && (
        <section>
          <h2 className="h2">Produk</h2>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.sku} product={p} />)}
          </div>
        </section>
      )}
      {recipes.length > 0 && (
        <section>
          <h2 className="h2">Resep</h2>
          <div className="mt-4 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r) => <RecipeCard key={r.id} r={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "Rp0",
    perks: ["Deteksi kesegaran & marbling", "Belanja daging di toko", "Lacak pesanan & ulasan", "Daftar resep & bahan"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "Rp29.000/bulan",
    perks: ["Semua fitur Free", "Kulkas Saya: stok & batas simpan otomatis", "Alat dapur: rencana mingguan, acara & kurban, multi-timer, marinasi, konversi", "Belajar: artikel lengkap & alat interaktif", "Deteksi bagian/cut daging + saran masakan", "Langkah resep + mode masak"],
  },
];

function Plan() {
  const { isPremium, upgradeToPremium, downgradeToFree } = useAuth();
  const toast = useToast();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {PLANS.map((p) => {
        const current = (p.id === "premium") === isPremium;
        return (
          <div key={p.id} className={`card p-6 ${p.id === "premium" ? "bg-ink text-white" : ""}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold">{p.id === "premium" ? "⭐ " : ""}{p.name}</h3>
              {current && <span className="badge bg-mint text-ink">Paket kamu</span>}
            </div>
            <p className="mt-1 font-display text-xl font-bold text-coral">{p.price}</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {p.perks.map((x) => <li key={x}>✓ {x}</li>)}
            </ul>
            {!current && (
              <button
                onClick={() => {
                  if (p.id === "premium") { upgradeToPremium(); toast("Selamat, kamu sekarang Premium! ⭐"); }
                  else { downgradeToFree(); toast("Paket diubah ke Free", { tone: "info" }); }
                }}
                className={`${p.id === "premium" ? "btn-coral" : "btn-outline"} btn-sm mt-5`}
              >
                {p.id === "premium" ? "Upgrade ke Premium" : "Pindah ke Free"}
              </button>
            )}
          </div>
        );
      })}
      <p className="text-xs text-ink/50 md:col-span-2">Demo: perubahan paket instan tanpa pembayaran.</p>
    </div>
  );
}

function Security() {
  const { changePassword } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (f.next !== f.confirm) return setError("Konfirmasi password baru tidak sama.");
    const r = changePassword(f.current, f.next);
    if (!r.ok) return setError(r.error);
    setF({ current: "", next: "", confirm: "" });
    setError("");
    toast("Password diganti");
  }

  return (
    <form onSubmit={submit} className="card max-w-xl space-y-4 p-5">
      {[
        ["current", "Password saat ini", "current-password"],
        ["next", "Password baru", "new-password"],
        ["confirm", "Ulangi password baru", "new-password"],
      ].map(([k, l, ac]) => (
        <Field key={k} label={l} htmlFor={`s-${k}`}>
          <input id={`s-${k}`} type="password" autoComplete={ac} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="input" required />
        </Field>
      ))}
      {error && <p role="alert" className="text-sm font-bold text-coral">{error}</p>}
      <button type="submit" className="btn-coral btn-sm">Ganti password</button>
      <p className="text-xs text-ink/50">Prototipe: akun disimpan di browser ini saja.</p>
    </form>
  );
}
