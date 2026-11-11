import { useMemo, useState } from "react";
import { RECIPES } from "../../data/recipes.js";
import { formatIDR } from "../../data/products.js";
import { KURBAN, schoorl } from "../../data/tools.js";
import { useCart } from "../../lib/cart.jsx";
import { useToast } from "../../lib/toast.jsx";
import Icon from "../../components/icons.jsx";
import { Photo, ProductThumb } from "../../components/ProductCard.jsx";
import { QtyStepper } from "../../components/ui.jsx";
import { Card, Field, Highlight, kgLabel, Note, Pill, productFor, toShoppingLines } from "./shared.jsx";

const BONY = ["ribs", "oxtail"];
const APPETITE = [
  { id: "ringan", label: "Ringan", g: 100, hint: "Banyak lauk lain" },
  { id: "normal", label: "Normal", g: 150, hint: "Acara keluarga" },
  { id: "lahap", label: "Lahap", g: 200, hint: "Daging jadi menu utama" },
];

export default function EventCalc() {
  const [mode, setMode] = useState("acara");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Pill active={mode === "acara"} onClick={() => setMode("acara")}>Acara & syukuran</Pill>
        <Pill active={mode === "kurban"} onClick={() => setMode("kurban")}>Kurban Iduladha</Pill>
      </div>
      {mode === "acara" ? <Acara /> : <Kurban />}
    </div>
  );
}

function Acara() {
  const { add } = useCart();
  const toast = useToast();
  const [guests, setGuests] = useState(30);
  const [appetite, setAppetite] = useState("normal");
  const [menus, setMenus] = useState(["rendang", "sop-buntut"]);
  const [buffer, setBuffer] = useState(true);

  const perGuest = APPETITE.find((a) => a.id === appetite).g * (buffer ? 1.1 : 1);
  const selected = useMemo(() => RECIPES.filter((r) => menus.includes(r.id)), [menus]);

  const plan = useMemo(() => {
    if (!selected.length) return { rows: [], shopping: [] };
    // edible meat per guest is split evenly across the menus; bone-in cuts
    // need ~40% more raw weight for the same amount of meat
    const base = (guests * perGuest) / selected.length;
    const grams = {};
    const prep = {};
    const rows = selected.map((r) => {
      const g = Math.round((base * (BONY.includes(r.cutId) ? 1.4 : 1)) / 50) * 50;
      const p = productFor(r);
      grams[p.sku] = (grams[p.sku] || 0) + g;
      if (r.prep && p.prep.includes(r.prep)) prep[p.sku] = r.prep;
      return { recipe: r, grams: g, product: p, batches: Math.max(1, Math.round(g / r.meatGrams)) };
    });
    return { rows, shopping: toShoppingLines(grams, prep) };
  }, [selected, guests, perGuest]);

  const total = plan.shopping.reduce((n, l) => n + l.cost, 0);
  const totalGrams = plan.rows.reduce((n, r) => n + r.grams, 0);
  const toggle = (id) => setMenus((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  function addAll() {
    let packs = 0;
    plan.shopping.forEach((l) => (packs += add(l.product.sku, l.packs, l.prep).added));
    if (packs > 0) toast(`${packs} pak daging untuk acara masuk keranjang`, { action: { label: "Lihat", to: "/keranjang" } });
    else toast("Stok toko tidak cukup untuk jumlah ini.", { tone: "error" });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <Card className="space-y-5 xl:col-span-2">
        <Field label="Jumlah tamu">
          <div className="flex items-center gap-3">
            <QtyStepper value={guests} onChange={setGuests} min={5} max={500} />
            <div className="flex gap-1.5">
              {[20, 50, 100].map((n) => <button key={n} onClick={() => setGuests(n)} className="chip text-xs">{n}</button>)}
            </div>
          </div>
        </Field>
        <Field label="Porsi daging per tamu" hint={APPETITE.find((a) => a.id === appetite).hint}>
          <div className="grid grid-cols-3 gap-2">
            {APPETITE.map((a) => (
              <button
                key={a.id}
                onClick={() => setAppetite(a.id)}
                aria-pressed={appetite === a.id}
                title={a.hint}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${appetite === a.id ? "border-ink bg-ink text-white" : "border-ink/10 bg-white hover:border-ink/30"}`}
              >
                <span className="block font-semibold">{a.label}</span>
                <span className={`block text-xs ${appetite === a.id ? "text-white/70" : "text-ink/50"}`}>{a.g} g</span>
              </button>
            ))}
          </div>
        </Field>
        <label className="flex items-center gap-2 text-sm font-medium text-ink/70">
          <input type="checkbox" checked={buffer} onChange={(e) => setBuffer(e.target.checked)} className="h-4 w-4 accent-coral" />
          Tambah cadangan 10% untuk tamu tak terduga
        </label>
        <Field label={`Menu daging (${menus.length} dipilih)`}>
          <div className="grid grid-cols-2 gap-2">
            {RECIPES.map((r) => {
              const on = menus.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => toggle(r.id)}
                  aria-pressed={on}
                  className={`flex items-center gap-2 rounded-xl border p-2 text-left text-sm transition-colors ${on ? "border-coral bg-coralsoft" : "border-ink/10 bg-white hover:border-ink/30"}`}
                >
                  <Photo src={r.image} alt="" className="h-9 w-9 rounded-lg" />
                  <span className="flex-1 font-semibold leading-tight">{r.name}</span>
                  {on && <Icon name="check" className="h-4 w-4 text-coral" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </Field>
      </Card>

      <div className="space-y-4 xl:col-span-3">
        {plan.rows.length === 0 ? (
          <Card><p className="text-sm text-ink/55">Pilih minimal satu menu daging.</p></Card>
        ) : (
          <>
            <Highlight>
              <p className="text-sm font-semibold text-ink/60">Total daging mentah untuk {guests} tamu</p>
              <p className="font-display text-5xl font-bold text-coral">{kgLabel(totalGrams)}</p>
              <p className="mt-2 text-sm text-ink/70">
                Perkiraan biaya {formatIDR(total)} · {formatIDR(Math.round(total / guests))} per tamu
              </p>
            </Highlight>
            <Card>
              <p className="font-display text-lg font-bold">Rincian per menu</p>
              <ul className="mt-3 divide-y divide-ink/5">
                {plan.rows.map((r) => (
                  <li key={r.recipe.id} className="flex items-center gap-3 py-3">
                    <Photo src={r.recipe.image} alt="" className="h-12 w-12 rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{r.recipe.name}</p>
                      <p className="text-xs text-ink/50">± {r.batches}× takaran resep · {r.product.name}{BONY.includes(r.recipe.cutId) ? " · termasuk tulang" : ""}</p>
                    </div>
                    <span className="font-display text-lg font-bold">{kgLabel(r.grams)}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <p className="font-display text-lg font-bold">Belanja di marbly</p>
              <ul className="mt-3 divide-y divide-ink/5">
                {plan.shopping.map((l) => (
                  <li key={l.product.sku} className="flex items-center gap-3 py-2.5">
                    <ProductThumb sku={l.product.sku} className="h-11 w-11" />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{l.packs} × {l.product.name}</span>
                    <span className="text-sm font-semibold">{formatIDR(l.cost)}</span>
                  </li>
                ))}
              </ul>
              <button onClick={addAll} className="btn-coral mt-4 w-full">
                <Icon name="cart" className="h-4 w-4" /> Masukkan semua ke keranjang
              </button>
              <p className="mt-2 text-center text-xs text-ink/45">Untuk pesanan besar, pilih pengiriman terjadwal H-1 acara.</p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function Kurban() {
  const [weight, setWeight] = useState(350);
  const [chest, setChest] = useState("");
  const [sharePct, setSharePct] = useState(33);
  const [bag, setBag] = useState(1000);

  const live = chest ? schoorl(chest) : Number(weight) || 0;
  const carcass = live * KURBAN.carcass;
  const meat = carcass * KURBAN.meatOfCarcass;
  const bone = carcass * KURBAN.boneOfCarcass;
  const forShohibul = (meat * sharePct) / 100;
  const perShohibul = forShohibul / KURBAN.shares;
  const forRecipients = meat - forShohibul;
  const bags = Math.floor((forRecipients * 1000) / bag);

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <Card className="space-y-5 xl:col-span-2">
        <Field label="Bobot hidup sapi (kg)" htmlFor="kb-w" hint="Biasanya tertera saat membeli sapi kurban.">
          <input id="kb-w" type="number" min="100" max="1500" value={chest ? live : weight} onChange={(e) => { setWeight(e.target.value); setChest(""); }} className="input" />
        </Field>
        <Field label="Belum tahu bobotnya? Ukur lingkar dada (cm)" htmlFor="kb-c" hint="Dihitung dengan rumus Schoorl: (lingkar dada + 22)² ÷ 100.">
          <input id="kb-c" type="number" min="100" max="250" value={chest} onChange={(e) => setChest(e.target.value)} placeholder="Mis. 165" className="input" />
        </Field>
        <Field label={`Bagian untuk 7 pekurban: ${sharePct}%`} htmlFor="kb-s" hint="Banyak yang mengikuti anjuran sepertiga. Ikuti ketentuan panitia setempat.">
          <input id="kb-s" type="range" min="0" max="50" step="1" value={sharePct} onChange={(e) => setSharePct(Number(e.target.value))} className="w-full accent-coral" />
        </Field>
        <Field label="Berat per kantong penerima">
          <div className="flex flex-wrap gap-2">
            {[500, 750, 1000, 1500].map((g) => <Pill key={g} active={bag === g} onClick={() => setBag(g)}>{kgLabel(g)}</Pill>)}
          </div>
        </Field>
      </Card>

      <div className="space-y-4 xl:col-span-3">
        <Highlight>
          <p className="text-sm font-semibold text-ink/60">Perkiraan daging bersih (tanpa tulang)</p>
          <p className="font-display text-5xl font-bold text-coral">± {Math.round(meat)} kg</p>
          <p className="mt-2 text-sm text-ink/70">dari sapi ± {live} kg · karkas ± {Math.round(carcass)} kg · tulang ± {Math.round(bone)} kg</p>
        </Highlight>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">Untuk pekurban</p>
            <p className="mt-1 font-display text-3xl font-bold">{kgLabel(perShohibul * 1000)}</p>
            <p className="text-sm text-ink/55">per orang × 7 · total {kgLabel(forShohibul * 1000)}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">Untuk penerima</p>
            <p className="mt-1 font-display text-3xl font-bold">{bags} kantong</p>
            <p className="text-sm text-ink/55">@ {kgLabel(bag)} · total {kgLabel(forRecipients * 1000)}</p>
          </Card>
        </div>
        <Card>
          <p className="font-display text-lg font-bold">Kebutuhan panitia</p>
          <ul className="mt-3 space-y-2 text-sm text-ink/70">
            <li className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-mint" strokeWidth={2.5} /> Siapkan ± {Math.ceil(bags * 1.05)} kantong (cadangan 5%) dan timbangan gantung.</li>
            <li className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-mint" strokeWidth={2.5} /> Bagikan di hari yang sama. Daging yang belum dibagi simpan di bawah 4°C.</li>
            <li className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-mint" strokeWidth={2.5} /> Pisahkan tulang dan jeroan dari daging agar tidak cepat rusak.</li>
          </ul>
        </Card>
        <Note>
          Perkiraan umum untuk sapi lokal: karkas ±50% bobot hidup, daging tanpa tulang ±68% karkas. Angka sebenarnya bergantung pada ras, umur, dan kondisi sapi. Belum termasuk jeroan, kepala, kaki, dan kulit.
        </Note>
      </div>
    </div>
  );
}
