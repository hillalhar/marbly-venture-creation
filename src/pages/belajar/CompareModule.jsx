import { useState } from "react";
import { CUTS } from "../../data/meat.js";
import { formatIDR, pricePerKg } from "../../data/products.js";
import { NUTRITION, SIMMER } from "../../data/tools.js";
import Icon from "../../components/icons.jsx";
import { Photo, useAddToCart } from "../../components/ProductCard.jsx";
import { FAT_LEVEL, getCut, Lesson, mainProduct, Panel } from "./shared.jsx";

// higher = better unless `lower` is set
const ROWS = [
  { key: "tender", label: "Keempukan", get: (c) => c.tenderness, max: 5, fmt: (v) => `${v}/5` },
  { key: "fat", label: "Kadar lemak (rasa & juicy)", get: (c) => FAT_LEVEL[c.fat] || 2, max: 4, fmt: (v, c) => c.fat },
  { key: "price", label: "Harga per kg", get: (c) => pricePerKg(mainProduct(c.id)), lower: true, fmt: (v) => formatIDR(v) },
  { key: "protein", label: "Protein per 100 g", get: (c) => NUTRITION[c.id].protein, fmt: (v) => `${v} g` },
  { key: "kcal", label: "Kalori per 100 g", get: (c) => NUTRITION[c.id].kcal, lower: true, fmt: (v) => `${v} kkal` },
  { key: "time", label: "Waktu sampai empuk (direbus)", get: (c) => SIMMER[c.id][0], lower: true, fmt: (v) => `±${v} menit` },
];

const PRESETS = [
  ["ribeye", "sirloin", "Steak: ribeye vs sirloin"],
  ["brisket", "shank", "Kuah: sandung lamur vs sengkel"],
  ["tenderloin", "round", "Paling empuk vs paling ramping"],
  ["chuck", "round", "Hemat: sampil vs gandik"],
];

export default function CompareModule() {
  const [a, setA] = useState("ribeye");
  const [b, setB] = useState("sirloin");
  const [interacted, setInteracted] = useState(false);
  const addToCart = useAddToCart();

  function choose(nextA, nextB) {
    setA(nextA);
    setB(nextB);
    if (!interacted) setInteracted(true);
  }

  const ca = getCut(a);
  const cb = getCut(b);
  const rows = ROWS.map((r) => {
    const va = r.get(ca);
    const vb = r.get(cb);
    const better = va === vb ? null : (r.lower ? va < vb : va > vb) ? "a" : "b";
    return { ...r, va, vb, better, max: r.max || Math.max(va, vb) };
  });
  const wins = { a: rows.filter((r) => r.better === "a").length, b: rows.filter((r) => r.better === "b").length };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(([x, y, label]) => (
          <button key={label} onClick={() => choose(x, y)} className={`chip ${a === x && b === y && interacted ? "chip-active" : ""}`}>
            {label}
          </button>
        ))}
      </div>

      <Panel className="overflow-hidden p-0 sm:p-0">
        {/* header */}
        <div className="grid grid-cols-2 border-b border-ink/5">
          {[
            [ca, a, (v) => choose(v, b)],
            [cb, b, (v) => choose(a, v)],
          ].map(([c, id, set], i) => {
            const prod = mainProduct(c.id);
            return (
              <div key={i} className={`p-4 sm:p-5 ${i === 0 ? "border-r border-ink/5" : ""}`}>
                <Photo src={prod?.image} alt={c.name} className="aspect-[16/10] w-full rounded-xl2" />
                <select
                  value={id}
                  onChange={(e) => set(e.target.value)}
                  aria-label={`Cut ${i === 0 ? "pertama" : "kedua"}`}
                  className="input mt-3 font-semibold"
                >
                  {CUTS.map((x) => (
                    <option key={x.id} value={x.id} disabled={x.id === (i === 0 ? b : a)}>
                      {x.name} ({x.en})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-ink/50">{c.region}</p>
              </div>
            );
          })}
        </div>

        {/* rows */}
        {rows.map((r) => {
          const { va, vb, better, max } = r;
          return (
            <div key={r.key} className="border-b border-ink/5 px-4 py-3 sm:px-5">
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-ink/45">{r.label}</p>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {[
                  ["a", va, ca],
                  ["b", vb, cb],
                ].map(([side, v, c]) => (
                  <div key={side} className={side === "a" ? "text-right" : ""}>
                    <p className={`text-sm font-semibold ${better === side ? "text-coral" : "text-ink/70"}`}>
                      {better === side && <Icon name="check" className="mr-1 inline h-3.5 w-3.5" strokeWidth={3} />}
                      {r.fmt(v, c)}
                    </p>
                    <div className={`track mt-1 ${side === "a" ? "rotate-180" : ""}`}>
                      <div className={`h-full rounded-full ${better === side ? "bg-coral" : "bg-ink/20"}`} style={{ width: `${Math.max(6, (v / max) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* method + verdict */}
        <div className="grid grid-cols-2">
          {[ca, cb].map((c, i) => {
            const prod = mainProduct(c.id);
            return (
              <div key={c.id} className={`p-4 sm:p-5 ${i === 0 ? "border-r border-ink/5" : ""}`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">Paling pas untuk</p>
                <p className="mt-1 text-sm text-ink/75">{c.method}</p>
                <p className="mt-2 text-xs text-ink/50">{c.dishes.join(", ")}</p>
                {prod && (
                  <button onClick={() => addToCart(prod, 1)} className="btn-outline btn-sm mt-4 w-full">
                    Beli {c.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      <Lesson title="Kesimpulan">
        {wins.a === wins.b
          ? `${ca.name} dan ${cb.name} seimbang, masing-masing unggul ${wins.a} kriteria. Pilih berdasarkan masakannya.`
          : `${wins.a > wins.b ? ca.name : cb.name} unggul di ${Math.max(wins.a, wins.b)} dari ${ROWS.length} kriteria. Tapi tidak ada cut yang terbaik untuk semua hal: yang empuk biasanya lebih mahal, dan yang berurat lebih gurih untuk masakan berkuah.`}
      </Lesson>
    </div>
  );
}
