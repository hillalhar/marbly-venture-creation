import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CUTS } from "../data/meat.js";
import { PRODUCTS, formatIDR } from "../data/products.js";
import { ProductThumb, useAddToCart } from "../components/ProductCard.jsx";
import { usePageTitle } from "../lib/hooks.js";
import { PageHero, Tabs } from "../components/ui.jsx";
import {
  NUTRITION,
  SIMMER,
  STEAK_DONENESS,
  THAW_METHODS,
  YIELD,
} from "../data/tools.js";

const TABS = [
  { id: "masak", label: "Waktu masak" },
  { id: "thaw", label: "Thawing" },
  { id: "nutrisi", label: "Nutrisi" },
  { id: "harga", label: "Harga per porsi" },
];

const input =
  "input";

export default function Alat() {
  usePageTitle("Alat dapur");
  const [tab, setTab] = useState("masak");
  return (
    <div>
      <PageHero badge="Alat dapur" title="Hitung, atur, masak pas" desc="Kalkulator waktu masak dengan timer, thawing aman, nutrisi per potong, dan biaya per porsi." />

      <section className="mx-auto max-w-6xl px-5 py-8">
        <Tabs items={TABS} value={tab} onChange={setTab} />
        <div className="mt-6">
          {tab === "masak" && <CookTime />}
          {tab === "thaw" && <Thaw />}
          {tab === "nutrisi" && <Nutrition />}
          {tab === "harga" && <PricePerPortion />}
        </div>
      </section>
    </div>
  );
}

/* ---------------- Cook time + timer ---------------- */

const round05 = (n) => Math.max(0.5, Math.round(n * 2) / 2);

function CookTime() {
  const [cutId, setCutId] = useState("ribeye");
  const [method, setMethod] = useState("steak"); // steak | rebus | presto
  const [thick, setThick] = useState(2.5);
  const [doneId, setDoneId] = useState("mr");
  const [timerMin, setTimerMin] = useState(4);

  const cut = CUTS.find((c) => c.id === cutId);
  const tender = cut.tenderness >= 4;
  const done = STEAK_DONENESS.find((d) => d.id === doneId);

  const steak = useMemo(() => {
    const side = round05(Number(thick) * done.perCm);
    const rest = Number(thick) > 3 ? 8 : 5;
    return { side, rest, total: side * 2 + rest };
  }, [thick, done]);

  const [simmer, presto] = SIMMER[cutId] || [90, 35];

  const warning =
    method === "steak" && !tender
      ? `${cut.name} berurat. Dimasak cepat sebagai steak hasilnya alot. Pilih rebus atau presto.`
      : method !== "steak" && tender
      ? `${cut.name} sudah empuk. Dimasak lama bisa kering. Waktu di bawah hanya untuk kuah/semur.`
      : "";

  const chips =
    method === "steak"
      ? [
          { label: `Sisi (${steak.side} mnt)`, min: steak.side },
          { label: `Istirahat (${steak.rest} mnt)`, min: steak.rest },
        ]
      : [{ label: `Masak (${method === "rebus" ? simmer : presto} mnt)`, min: method === "rebus" ? simmer : presto }];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 card rounded-xl3 p-6">
        <Field label="Potongan daging">
          <select value={cutId} onChange={(e) => setCutId(e.target.value)} className={input}>
            {CUTS.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.en})</option>
            ))}
          </select>
        </Field>
        <Field label="Metode">
          <div className="flex flex-wrap gap-2">
            {[
              ["steak", "Steak (pan/grill)"],
              ["rebus", "Rebus / ungkep"],
              ["presto", "Presto"],
            ].map(([v, l]) => (
              <Pill key={v} active={method === v} onClick={() => setMethod(v)}>{l}</Pill>
            ))}
          </div>
        </Field>
        {method === "steak" && (
          <>
            <Field label={`Ketebalan: ${thick} cm`}>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={thick}
                onChange={(e) => setThick(e.target.value)}
                className="w-full accent-coral"
              />
            </Field>
            <Field label="Tingkat kematangan">
              <div className="flex flex-wrap gap-2">
                {STEAK_DONENESS.map((d) => (
                  <Pill key={d.id} active={doneId === d.id} onClick={() => setDoneId(d.id)}>
                    {d.label}
                  </Pill>
                ))}
              </div>
            </Field>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl3 bg-coralsoft p-6">
          {method === "steak" ? (
            <>
              <p className="text-sm font-bold text-ink/60">Per sisi, api besar</p>
              <p className="font-display text-5xl font-bold text-coral">{steak.side} menit</p>
              <ul className="mt-3 space-y-1 text-sm">
                <li>Balik sekali, total masak ± {steak.side * 2} menit</li>
                <li>Angkat di {done.pull}°C (suhu akhir setelah istirahat {done.final})</li>
                <li>Istirahatkan {steak.rest} menit sebelum dipotong</li>
              </ul>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-ink/60">
                {method === "rebus" ? "Panci biasa, api kecil" : "Presto, hitung setelah berdesis"}
              </p>
              <p className="font-display text-5xl font-bold text-coral">
                {method === "rebus" ? simmer : presto} menit
              </p>
              <p className="mt-3 text-sm">
                Potong 3–4 cm. Tes dengan garpu: daging siap bila mudah terurai. Tambah 15–30 menit
                jika potongan besar.
              </p>
            </>
          )}
          {warning && (
            <p className="mt-4 rounded-xl2 border border-ink/10 bg-white p-3 text-sm font-bold text-coral">
              {warning}
            </p>
          )}
        </div>

        <Timer minutes={timerMin} setMinutes={setTimerMin} chips={chips} />

        <p className="text-xs text-ink/50">
          Waktu adalah perkiraan; kompor, wajan, dan suhu awal daging berpengaruh. Gunakan termometer
          daging. Daging giling harus matang sampai 71°C. Rare/medium rare lebih berisiko; ibu hamil,
          anak, dan lansia sebaiknya medium well ke atas.
        </p>
      </div>
    </div>
  );
}

// Three short beeps via Web Audio (no external sound file).
function beep() {
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
}

function Timer({ minutes, setMinutes, chips }) {
  const [left, setLeft] = useState(Math.round(minutes * 60));
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  // keep display in sync when the duration changes while idle
  useEffect(() => {
    if (!running) setLeft(Math.round(Number(minutes) * 60));
  }, [minutes]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(ref.current);
          setRunning(false);
          try {
            navigator.vibrate?.([300, 150, 300]);
            beep();
          } catch {
            /* ignore */
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const finished = left === 0 && !running;

  return (
    <div className="card rounded-xl3 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">Timer</h3>
        <label className="flex items-center gap-2 text-sm font-bold text-ink/60">
          menit
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={minutes}
            onChange={(e) => {
              setRunning(false);
              setMinutes(e.target.value);
            }}
            className="w-20 rounded-full border border-ink/10 bg-cream px-3 py-1 text-center font-bold outline-none"
          />
        </label>
      </div>
      <p
        className={`mt-3 text-center font-display text-6xl font-bold tabular-nums ${
          finished ? "text-coral" : ""
        }`}
      >
        {mm}:{ss}
      </p>
      {finished && <p className="text-center font-bold text-coral">Waktu habis!</p>}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {chips.map((c) => (
          <Pill
            key={c.label}
            active={false}
            onClick={() => {
              setRunning(false);
              setMinutes(c.min);
              setLeft(Math.round(c.min * 60));
            }}
          >
            {c.label}
          </Pill>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-3">
        <button
          onClick={() => {
            if (left === 0) setLeft(Math.round(Number(minutes) * 60));
            setRunning((r) => !r);
          }}
          className="btn-coral px-6 py-2"
        >
          {running ? "Jeda" : "Mulai"}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            setLeft(Math.round(Number(minutes) * 60));
          }}
          className="btn-outline px-6 py-2"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

/* ---------------- Thawing ---------------- */

function fmtDuration(min) {
  if (min < 60) return `${Math.max(1, Math.round(min))} menit`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h} jam ${m} menit` : `${h} jam`;
}

function Thaw() {
  const [kg, setKg] = useState(1);
  const w = Math.max(0.1, Number(kg) || 0.1);
  return (
    <div className="space-y-5">
      <div className="max-w-sm card rounded-xl3 p-6">
        <Field label="Berat daging beku (kg)">
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            className={input}
          />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {THAW_METHODS.map((m) => (
          <div key={m.id} className="card p-5">
            
            <p className="mt-2 font-display font-bold">{m.label}</p>
            <p className="font-display text-2xl font-bold text-coral">
              ≈ {fmtDuration(m.minutesPerKg * w)}
            </p>
            <p className="mt-2 text-sm text-ink/70">{m.note}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl2 border border-ink/10 bg-mintsoft p-4 text-sm">
        <strong>Jangan</strong> cairkan di suhu ruang: permukaan daging cepat hangat dan bakteri
        berkembang sebelum bagian dalam cair. Daging yang dicairkan dengan air atau microwave sebaiknya
        langsung dimasak, jangan dibekukan ulang sebelum dimasak.
      </div>
      <Link to="/kulkas" className="inline-block text-sm font-bold text-coral hover:underline">
        Lihat stok di kulkas →
      </Link>
    </div>
  );
}

/* ---------------- Nutrition ---------------- */

function Nutrition() {
  const [id, setId] = useState("sirloin");
  const [grams, setGrams] = useState(150);
  const options = [...CUTS.map((c) => ({ id: c.id, name: `${c.name} (${c.en})` })), { id: "ground", name: "Daging giling (80/20)" }];
  const n = NUTRITION[id];
  const g = Math.max(0, Number(grams) || 0);
  const scale = (v) => Math.round(((v * g) / 100) * 10) / 10;

  return (
    <div className="space-y-5">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 card rounded-xl3 p-6">
          <Field label="Potongan">
            <select value={id} onChange={(e) => setId(e.target.value)} className={input}>
              {options.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Berat mentah (gram)">
            <input type="number" min="0" value={grams} onChange={(e) => setGrams(e.target.value)} className={input} />
          </Field>
        </div>
        <div className="rounded-xl3 bg-coralsoft p-6">
          <p className="text-sm font-bold text-ink/60">Untuk {g} g daging mentah</p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <Macro label="Kalori" value={`${Math.round(scale(n.kcal))}`} unit="kkal" />
            <Macro label="Protein" value={scale(n.protein)} unit="g" />
            <Macro label="Lemak" value={scale(n.fat)} unit="g" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto card">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream font-display">
            <tr>
              <th className="p-3">Per 100 g mentah</th>
              <th className="p-3">Kalori</th>
              <th className="p-3">Protein</th>
              <th className="p-3">Lemak</th>
            </tr>
          </thead>
          <tbody>
            {options.map((o) => (
              <tr key={o.id} className="border-t border-ink/10">
                <td className="p-3 font-bold">{o.name}</td>
                <td className="p-3">{NUTRITION[o.id].kcal} kkal</td>
                <td className="p-3">{NUTRITION[o.id].protein} g</td>
                <td className="p-3">{NUTRITION[o.id].fat} g</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink/50">
        Angka perkiraan dari data gizi umum dan bervariasi menurut marbling, pemangkasan lemak, dan
        cara masak. Bukan saran medis.
      </p>
    </div>
  );
}

/* ---------------- Price per portion ---------------- */

function PricePerPortion() {
  const addToCart = useAddToCart();
  const [portion, setPortion] = useState(150); // cooked grams per person
  const [added, setAdded] = useState("");

  const rows = useMemo(
    () =>
      PRODUCTS.filter((p) => !p.bundle).map((p) => {
        const y = YIELD[p.cutId] ?? YIELD.default;
        const rawNeeded = Number(portion) / y;
        return {
          ...p,
          perKg: Math.round((p.price / p.weight) * 1000),
          perPortion: Math.round((p.price / p.weight) * rawNeeded),
        };
      }).sort((a, b) => a.perPortion - b.perPortion),
    [portion]
  );
  const max = Math.max(...rows.map((r) => r.perPortion));

  return (
    <div className="space-y-5">
      <div className="max-w-sm card rounded-xl3 p-6">
        <Field label="Porsi matang per orang (gram)">
          <input type="number" min="50" step="10" value={portion} onChange={(e) => setPortion(e.target.value)} className={input} />
        </Field>
      </div>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.sku} className="flex flex-wrap items-center gap-4 card p-4">
            <ProductThumb sku={r.sku} className="h-14 w-14" />
            <div className="min-w-40 flex-1">
              <p className="font-bold">{r.name}</p>
              <p className="text-xs text-ink/50">{formatIDR(r.perKg)} / kg</p>
              <div className="track mt-2 border border-ink/10">
                <div className="h-full rounded-full bg-coral" style={{ width: `${(r.perPortion / max) * 100}%` }} />
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-bold text-coral">{formatIDR(r.perPortion)}</p>
              <p className="text-xs text-ink/50">per porsi</p>
            </div>
            <button
              onClick={() => {
                addToCart(r, 1);
                setAdded(r.sku);
                setTimeout(() => setAdded(""), 1200);
              }}
              className="btn-outline px-4 py-2 text-sm"
            >
              {added === r.sku ? "✓" : "+ Keranjang"}
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-ink/50">
        Memperhitungkan penyusutan masak dan tulang (perkiraan): tanpa tulang ±75%, sengkel ±70%, iga
        ±55%, buntut ±45%. Diurutkan dari yang paling hemat per porsi.
      </p>
    </div>
  );
}

/* ---------------- shared bits ---------------- */

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-ink/70">{label}</label>
      {children}
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border border-ink/10 px-4 py-1.5 text-sm font-semibold ${
        active ? "bg-ink text-white border-ink" : "bg-white text-ink/75 hover:border-ink/30"
      }`}
    >
      {children}
    </button>
  );
}

function Macro({ label, value, unit }) {
  return (
    <div className="rounded-xl2 border border-ink/10 bg-white p-3">
      <p className="text-xs font-bold text-ink/60">{label}</p>
      <p className="font-display text-2xl font-bold text-coral">{value}</p>
      <p className="text-xs text-ink/50">{unit}</p>
    </div>
  );
}
