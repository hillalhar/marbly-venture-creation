import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { CATEGORIES, PRODUCTS } from "../data/products.js";
import { useCart } from "../lib/cart.jsx";
import { usePageTitle } from "../lib/hooks.js";
import ProductCard from "../components/ProductCard.jsx";
import Icon from "../components/icons.jsx";
import { EmptyState, Tabs } from "../components/ui.jsx";

const SORTS = [
  ["populer", "Paling populer"],
  ["rating", "Rating tertinggi"],
  ["murah", "Harga termurah"],
  ["mahal", "Harga termahal"],
  ["promo", "Diskon terbesar"],
];
const GRADES = ["Semua", "Premium", "Pilihan", "Reguler"];
const PERKS = [
  ["snow", "Rantai dingin 0–4°C"],
  ["knife", "Potong sesuai pesanan, gratis"],
  ["truck", "Gratis ongkir mulai Rp150.000"],
  ["shield", "Tidak segar? Ganti baru"],
];

export default function Toko() {
  usePageTitle("Toko daging");
  const [params, setParams] = useSearchParams();
  const { available } = useCart();

  const cat = params.get("kategori") || "semua";
  const q = params.get("q") || "";
  const sort = params.get("urut") || "populer";
  const grade = params.get("grade") || "Semua";
  const inStock = params.get("stok") === "1";

  const setParam = (k, v, def) => {
    const next = new URLSearchParams(params);
    if (!v || v === def) next.delete(k);
    else next.set(k, v);
    setParams(next, { replace: true });
  };

  const term = q.trim().toLowerCase();
  const list = PRODUCTS.filter(
    (p) =>
      (cat === "semua" || p.category === cat) &&
      (grade === "Semua" || p.grade === grade) &&
      (!inStock || available(p.sku) > 0) &&
      (!term || `${p.name} ${p.desc} ${p.origin}`.toLowerCase().includes(term))
  ).sort(
    {
      populer: (a, b) => b.reviewCount - a.reviewCount,
      rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
      murah: (a, b) => a.price - b.price,
      mahal: (a, b) => b.price - a.price,
      promo: (a, b) => (b.compareAt ? 1 - b.price / b.compareAt : 0) - (a.compareAt ? 1 - a.price / a.compareAt : 0),
    }[sort]
  );

  const counts = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c) => [c.id, PRODUCTS.filter((p) => c.id === "semua" || p.category === c.id).length])),
    []
  );
  const filtered = cat !== "semua" || q || grade !== "Semua" || inStock;

  return (
    <div>
      <section className="border-b border-ink/5 bg-white">
        <div className="mx-auto max-w-6xl px-5 pb-6 pt-8 sm:pt-10">
          <p className="eyebrow">Toko</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Daging segar, dipotong sesuai pesanan</h1>
          <div className="relative mt-6 max-w-xl">
            <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/35" />
            <input
              type="search"
              placeholder="Cari ribeye, iga, daging giling…"
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              className="input rounded-full py-3 pl-11"
              aria-label="Cari produk"
            />
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/55">
            {PERKS.map(([i, t]) => (
              <li key={t} className="flex items-center gap-2">
                <Icon name={i} className="h-4 w-4 text-coral" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <div className="sticky top-16 z-20 -mx-5 border-b border-ink/5 bg-creamsoft/95 px-5 py-3 backdrop-blur">
          <Tabs items={CATEGORIES.map((c) => ({ id: c.id, label: c.label, count: counts[c.id] }))} value={cat} onChange={(v) => setParam("kategori", v, "semua")} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <select value={grade} onChange={(e) => setParam("grade", e.target.value, "Semua")} className="input w-auto rounded-full py-1.5" aria-label="Grade">
            {GRADES.map((g) => <option key={g} value={g}>{g === "Semua" ? "Semua grade" : `Grade ${g}`}</option>)}
          </select>
          <label className="flex items-center gap-2 font-medium text-ink/65">
            <input type="checkbox" checked={inStock} onChange={(e) => setParam("stok", e.target.checked ? "1" : "")} className="h-4 w-4 accent-coral" />
            Hanya yang tersedia
          </label>
          {filtered && (
            <button onClick={() => setParams({}, { replace: true })} className="font-semibold text-coral hover:underline">Reset</button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-ink/45 sm:inline">{list.length} produk ·</span>
            <select value={sort} onChange={(e) => setParam("urut", e.target.value, "populer")} className="input w-auto rounded-full py-1.5" aria-label="Urutkan">
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Produk tidak ditemukan"
              desc="Coba kata kunci lain atau hapus filter."
              action={<button onClick={() => setParams({}, { replace: true })} className="btn-outline btn-sm">Reset filter</button>}
            />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
            {list.map((p) => <ProductCard key={p.sku} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
