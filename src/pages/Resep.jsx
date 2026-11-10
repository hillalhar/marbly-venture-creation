import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RECIPES } from "../data/recipes.js";
import { CUTS } from "../data/meat.js";
import { useFavorites } from "../lib/favorites.jsx";
import { useFridge } from "../lib/fridge.jsx";
import { usePageTitle } from "../lib/hooks.js";
import { FavButton, Photo } from "../components/ProductCard.jsx";
import Icon from "../components/icons.jsx";
import { EmptyState, PageHero, Tabs } from "../components/ui.jsx";

const DIFF = ["Mudah", "Sedang", "Mahir"];
const TIME = [
  { id: "semua", label: "Semua durasi" },
  { id: "cepat", label: "≤ 30 menit", test: (t) => t <= 30 },
  { id: "sedang", label: "≤ 90 menit", test: (t) => t <= 90 },
  { id: "lama", label: "> 90 menit", test: (t) => t > 90 },
];

export function RecipeCard({ r, inFridge = false }) {
  const c = CUTS.find((x) => x.id === r.cutId);
  return (
    <Link to={`/resep/${r.id}`} className="group relative flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl2 bg-cream">
        <Photo src={r.image} alt={r.name} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
        {inFridge && <span className="badge absolute bottom-2.5 left-2.5 bg-white/95 text-mint">Bahan ada di kulkas</span>}
      </div>
      <FavButton type="recipes" id={r.id} name={r.name} className="absolute right-2.5 top-2.5" />
      <div className="pt-3">
        <p className="text-xs font-medium text-ink/45">
          {c?.name} · {DIFF[r.difficulty - 1]}
          {r.spicy ? " · Pedas" : ""}
        </p>
        <h3 className="mt-0.5 text-[15px] font-semibold leading-snug group-hover:text-coral">{r.name}</h3>
        <p className="mt-1 flex items-center gap-3 text-xs text-ink/50">
          <span className="flex items-center gap-1"><Icon name="clock" className="h-3.5 w-3.5" /> {r.time} menit</span>
          <span className="flex items-center gap-1"><Icon name="user" className="h-3.5 w-3.5" /> {r.serves} porsi</span>
        </p>
      </div>
    </Link>
  );
}

export default function Resep() {
  usePageTitle("Resep");
  const { has } = useFavorites();
  const { items: fridge } = useFridge();
  const [q, setQ] = useState("");
  const [cut, setCut] = useState("semua");
  const [time, setTime] = useState("semua");
  const [onlyFav, setOnlyFav] = useState(false);
  const [fromFridge, setFromFridge] = useState(false);

  const fridgeCuts = new Set(fridge.map((i) => i.cutId));
  const usedCuts = CUTS.filter((c) => RECIPES.some((r) => r.cutId === c.id));

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const tf = TIME.find((t) => t.id === time);
    return RECIPES.filter(
      (r) =>
        (cut === "semua" || r.cutId === cut) &&
        (!tf.test || tf.test(r.time)) &&
        (!onlyFav || has("recipes", r.id)) &&
        (!fromFridge || fridgeCuts.has(r.cutId)) &&
        (!term || `${r.name} ${r.summary} ${r.ingredients.map((i) => i.item).join(" ")}`.toLowerCase().includes(term))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cut, time, onlyFav, fromFridge, fridge]);

  return (
    <div>
      <PageHero
        badge="Resep"
        title="Resep daging, langkah demi langkah"
        desc="Atur porsi, ikuti mode masak, dan beli bahan utamanya langsung dari toko."
      >
        <div className="relative mt-6 max-w-xl">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/35" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari rendang, steak, santan…" className="input rounded-full py-3 pl-11" aria-label="Cari resep" />
        </div>
      </PageHero>

      <section className="mx-auto max-w-6xl px-5 pt-6">
        <Tabs items={[{ id: "semua", label: "Semua" }, ...usedCuts.map((c) => ({ id: c.id, label: c.name }))]} value={cut} onChange={setCut} />
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <select value={time} onChange={(e) => setTime(e.target.value)} className="input w-auto rounded-full py-1.5" aria-label="Durasi">
            {TIME.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <label className="flex items-center gap-2 font-medium text-ink/65">
            <input type="checkbox" checked={fromFridge} onChange={(e) => setFromFridge(e.target.checked)} className="h-4 w-4 accent-coral" />
            Pakai stok kulkas
          </label>
          <label className="flex items-center gap-2 font-medium text-ink/65">
            <input type="checkbox" checked={onlyFav} onChange={(e) => setOnlyFav(e.target.checked)} className="h-4 w-4 accent-coral" />
            Favorit saja
          </label>
          <span className="ml-auto text-ink/45">{list.length} resep</span>
        </div>

        {list.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="Resep tidak ditemukan" desc={fromFridge && fridge.length === 0 ? "Kulkasmu masih kosong. Tambahkan stok di halaman Kulkas." : "Coba kata kunci atau filter lain."} />
          </div>
        ) : (
          <div className="mt-6 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((r) => <RecipeCard key={r.id} r={r} inFridge={fridgeCuts.has(r.cutId)} />)}
          </div>
        )}
      </section>
    </div>
  );
}
