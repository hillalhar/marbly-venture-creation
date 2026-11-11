// Thawing, nutrition and price-per-portion tools.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CUTS } from "../../data/meat.js";
import { formatIDR, PRODUCTS } from "../../data/products.js";
import { NUTRITION, THAW_METHODS, YIELD } from "../../data/tools.js";
import { ProductThumb, useAddToCart } from "../../components/ProductCard.jsx";
import { useTimers } from "../../lib/timers.jsx";
import Icon from "../../components/icons.jsx";
import { Card, Field, Highlight, Note } from "./shared.jsx";

function fmtDuration(min) {
  if (min < 60) return `${Math.max(1, Math.round(min))} menit`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h} jam ${m} menit` : `${h} jam`;
}

export function Thaw() {
  const { add } = useTimers();
  const [kg, setKg] = useState(1);
  const w = Math.max(0.1, Number(kg) || 0.1);
  return (
    <div className="space-y-5">
      <Card className="max-w-sm">
        <Field label="Berat daging beku (kg)" htmlFor="th-kg">
          <input id="th-kg" type="number" min="0.1" step="0.1" value={kg} onChange={(e) => setKg(e.target.value)} className="input" />
        </Field>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {THAW_METHODS.map((m) => {
          const min = m.minutesPerKg * w;
          return (
            <Card key={m.id} className="flex flex-col">
              <p className="font-display font-bold">{m.label}</p>
              <p className="font-display text-2xl font-bold text-coral">≈ {fmtDuration(min)}</p>
              <p className="mt-2 flex-1 text-sm text-ink/65">{m.note}</p>
              {min <= 180 && (
                <button onClick={() => add(`Thawing: ${m.label.split(" (")[0].toLowerCase()}`, Math.round(min))} className="btn-outline btn-sm mt-4 self-start">
                  <Icon name="clock" className="h-4 w-4" /> Pasang timer
                </button>
              )}
            </Card>
          );
        })}
      </div>
      <div className="rounded-xl2 bg-mintsoft p-4 text-sm leading-relaxed">
        <strong>Jangan</strong> cairkan di suhu ruang: permukaan daging cepat hangat dan bakteri berkembang sebelum bagian dalam cair. Daging yang dicairkan dengan air atau microwave sebaiknya langsung dimasak.
      </div>
      <Link to="/kulkas" className="inline-block text-sm font-semibold text-coral hover:underline">Lihat stok di Kulkas Saya</Link>
    </div>
  );
}

export function Nutrition() {
  const [id, setId] = useState("sirloin");
  const [grams, setGrams] = useState(150);
  const options = [...CUTS.map((c) => ({ id: c.id, name: `${c.name} (${c.en})` })), { id: "ground", name: "Daging giling (80/20)" }];
  const n = NUTRITION[id];
  const g = Math.max(0, Number(grams) || 0);
  const scale = (v) => Math.round(((v * g) / 100) * 10) / 10;

  return (
    <div className="space-y-5">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <Field label="Potongan" htmlFor="nu-cut">
            <select id="nu-cut" value={id} onChange={(e) => setId(e.target.value)} className="input">
              {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </Field>
          <Field label="Berat mentah (gram)" htmlFor="nu-g">
            <input id="nu-g" type="number" min="0" value={grams} onChange={(e) => setGrams(e.target.value)} className="input" />
          </Field>
        </Card>
        <Highlight>
          <p className="text-sm font-semibold text-ink/60">Untuk {g} g daging mentah</p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            {[["Kalori", Math.round(scale(n.kcal)), "kkal"], ["Protein", scale(n.protein), "g"], ["Lemak", scale(n.fat), "g"]].map(([l, v, u]) => (
              <div key={l} className="rounded-xl2 bg-white p-3">
                <p className="text-xs text-ink/55">{l}</p>
                <p className="font-display text-2xl font-bold text-coral">{String(v).replace(".", ",")}</p>
                <p className="text-xs text-ink/45">{u}</p>
              </div>
            ))}
          </div>
        </Highlight>
      </div>
      <div className="overflow-x-auto rounded-xl2 ring-1 ring-ink/10">
        <table className="w-full min-w-[480px] bg-white text-left text-sm">
          <thead className="bg-creamsoft">
            <tr>{["Per 100 g mentah", "Kalori", "Protein", "Lemak"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {options.map((o) => (
              <tr key={o.id} className={`border-t border-ink/5 ${o.id === id ? "bg-coralsoft/50" : ""}`}>
                <td className="px-4 py-3 font-semibold">{o.name}</td>
                <td className="px-4 py-3 text-ink/70">{NUTRITION[o.id].kcal} kkal</td>
                <td className="px-4 py-3 text-ink/70">{String(NUTRITION[o.id].protein).replace(".", ",")} g</td>
                <td className="px-4 py-3 text-ink/70">{NUTRITION[o.id].fat} g</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note>Angka perkiraan dari data gizi umum dan bervariasi menurut marbling, pemangkasan lemak, dan cara masak. Bukan saran medis.</Note>
    </div>
  );
}

export function PricePerPortion() {
  const addToCart = useAddToCart();
  const [portion, setPortion] = useState(150);

  const rows = useMemo(
    () =>
      PRODUCTS.filter((p) => !p.bundle)
        .map((p) => {
          const y = YIELD[p.cutId] ?? YIELD.default;
          return { ...p, perKg: Math.round((p.price / p.weight) * 1000), perPortion: Math.round((p.price / p.weight) * (Number(portion) / y)) };
        })
        .sort((a, b) => a.perPortion - b.perPortion),
    [portion]
  );
  const max = Math.max(...rows.map((r) => r.perPortion));

  return (
    <div className="space-y-5">
      <Card className="max-w-sm">
        <Field label="Porsi matang per orang (gram)" htmlFor="pp-g">
          <input id="pp-g" type="number" min="50" step="10" value={portion} onChange={(e) => setPortion(e.target.value)} className="input" />
        </Field>
      </Card>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.sku} className="flex flex-wrap items-center gap-4 rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
            <ProductThumb sku={r.sku} className="h-14 w-14" />
            <div className="min-w-40 flex-1">
              <p className="font-semibold">{r.name}</p>
              <p className="text-xs text-ink/50">{formatIDR(r.perKg)} / kg</p>
              <div className="track mt-2">
                <div className="h-full rounded-full bg-coral" style={{ width: `${(r.perPortion / max) * 100}%` }} />
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-bold">{formatIDR(r.perPortion)}</p>
              <p className="text-xs text-ink/50">per porsi</p>
            </div>
            <button onClick={() => addToCart(r, 1)} className="btn-outline btn-sm" aria-label={`Tambah ${r.name} ke keranjang`}>
              <Icon name="cart" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Note>Memperhitungkan penyusutan masak dan tulang (perkiraan): tanpa tulang ±75%, sengkel ±70%, iga ±55%, buntut ±45%. Diurutkan dari yang paling hemat per porsi.</Note>
    </div>
  );
}
