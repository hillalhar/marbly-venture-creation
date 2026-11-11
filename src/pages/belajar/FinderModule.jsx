import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CUTS } from "../../data/meat.js";
import { formatIDR, pricePerKg } from "../../data/products.js";
import { recipesForCut } from "../../data/recipes.js";
import { SIMMER } from "../../data/tools.js";
import { FINDER_STEPS, SUIT } from "../../data/learn.js";
import Icon from "../../components/icons.jsx";
import { Photo, useAddToCart } from "../../components/ProductCard.jsx";
import { QtyStepper } from "../../components/ui.jsx";
import { Lesson, mainProduct, Panel } from "./shared.jsx";

const BUDGET_CAP = { hemat: 110000, sedang: 200000, bebas: Infinity };
const TIME_CAP = { cepat: 30, sedang: 120, lama: Infinity };
const BONY = ["ribs", "oxtail"];
const METHOD_LABEL = { panggang: "dipanggang cepat", berkuah: "dimasak berkuah", tumis: "ditumis atau diiris tipis", giling: "digiling" };

function rank({ method, budget, time }) {
  return CUTS.map((c) => {
    const product = mainProduct(c.id);
    const perKg = product ? pricePerKg(product) : Infinity;
    const suit = SUIT[c.id]?.[method] ?? 0;
    const reasons = [];
    const warnings = [];
    let score = suit * 10;

    if (suit === 3) reasons.push(`juara untuk ${METHOD_LABEL[method]}`);
    else if (suit === 2) reasons.push(`cocok untuk ${METHOD_LABEL[method]}`);
    else if (suit === 1) warnings.push(`kurang ideal untuk ${METHOD_LABEL[method]}`);

    if (perKg <= BUDGET_CAP[budget]) {
      score += 4;
      if (budget !== "bebas") reasons.push(`masuk budget (${formatIDR(perKg)}/kg)`);
    } else {
      score -= Math.min(8, Math.ceil((perKg - BUDGET_CAP[budget]) / 25000) * 2);
      warnings.push(`di atas budget (${formatIDR(perKg)}/kg)`);
    }

    const [pot, presto] = SIMMER[c.id] || [90, 35];
    const needs = method === "berkuah" ? pot : method === "panggang" && BONY.includes(c.id) ? pot : 20;
    if (needs > TIME_CAP[time]) {
      const fitsWithPresto = presto <= TIME_CAP[time];
      score -= fitsWithPresto ? 2 : 6;
      warnings.push(fitsWithPresto ? `butuh ±${pot} menit di panci, pakai presto ±${presto} menit` : `butuh ±${pot} menit, waktumu kurang`);
    } else if (method === "berkuah") {
      reasons.push(`empuk dalam ±${pot} menit`);
    }
    if (c.tenderness >= 4 && method === "panggang") score += 2;

    return { cut: c, product, perKg, suit, score, reasons, warnings };
  })
    .filter((r) => r.suit > 0 && r.product)
    .sort((a, b) => b.score - a.score || a.perKg - b.perKg)
    .slice(0, 3);
}

export default function FinderModule() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [people, setPeople] = useState(4);
  const addToCart = useAddToCart();
  const finished = step >= FINDER_STEPS.length;

  const results = useMemo(() => (finished ? rank(answers) : []), [finished, answers]);

  function pick(stepId, optId) {
    setAnswers((a) => ({ ...a, [stepId]: optId }));
    setStep((s) => s + 1);
  }

  if (!finished) {
    const s = FINDER_STEPS[step];
    return (
      <div className="space-y-6">
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">Pertanyaan {step + 1} dari {FINDER_STEPS.length}</p>
            {step > 0 && (
              <button onClick={() => setStep((x) => x - 1)} className="btn-ghost px-2 py-1 text-xs">
                <Icon name="back" className="h-4 w-4" /> Kembali
              </button>
            )}
          </div>
          <div className="track mt-3">
            <div className="h-full rounded-full bg-coral transition-all" style={{ width: `${(step / FINDER_STEPS.length) * 100}%` }} />
          </div>
          <h3 key={s.id} className="mt-6 animate-fadeIn font-display text-2xl font-bold">{s.q}</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {s.options.map((o) => (
              <button
                key={o.id}
                onClick={() => pick(s.id, o.id)}
                className={`group flex items-center justify-between gap-3 rounded-xl2 border p-4 text-left transition-colors ${
                  answers[s.id] === o.id ? "border-coral bg-coralsoft" : "border-ink/10 bg-white hover:border-ink/30"
                }`}
              >
                <span>
                  <span className="block font-semibold">{o.label}</span>
                  <span className="block text-sm text-ink/50">{o.hint}</span>
                </span>
                <Icon name="chevron" className="h-5 w-5 text-ink/30 group-hover:text-coral" />
              </button>
            ))}
          </div>
        </Panel>
        <Lesson title="Kenapa ditanya begini?">
          Cut yang tepat bergantung pada cara masak, budget, dan waktu. Cut murah berurat justru juara untuk masakan berkuah, asal waktunya cukup.
        </Lesson>
      </div>
    );
  }

  const summary = FINDER_STEPS.map((s) => s.options.find((o) => o.id === answers[s.id])?.label).join(" · ");
  const perPerson = 180;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/60">
          Pilihanmu: <span className="font-semibold text-ink">{summary}</span>
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-ink/60">Untuk</span>
          <QtyStepper size="sm" value={people} onChange={setPeople} min={1} max={30} />
          <span className="text-sm font-semibold text-ink/60">orang</span>
          <button onClick={() => { setStep(0); setAnswers({}); }} className="btn-ghost btn-sm">Ulangi</button>
        </div>
      </div>

      {results.length === 0 ? (
        <Panel>
          <p className="font-semibold">Belum ada cut yang cocok dengan kombinasi ini.</p>
          <p className="mt-1 text-sm text-ink/55">Coba longgarkan budget atau waktu masaknya.</p>
        </Panel>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {results.map((r, i) => {
            const grams = Math.round(people * perPerson * (BONY.includes(r.cut.id) ? 1.4 : 1));
            const packs = Math.max(1, Math.ceil(grams / r.product.weight));
            const recipe = recipesForCut(r.cut.id)[0];
            return (
              <Panel key={r.cut.id} className={`flex flex-col ${i === 0 ? "ring-2 ring-coral" : ""}`}>
                <div className="relative">
                  <Photo src={r.product.image} alt={r.cut.name} className="aspect-[16/10] w-full rounded-xl2" />
                  <span className={`badge absolute left-3 top-3 ${i === 0 ? "bg-coral text-white" : "bg-white/95 text-ink"}`}>
                    {i === 0 ? "Paling cocok" : `Pilihan ${i + 1}`}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">
                  {r.cut.name} <span className="text-sm font-medium text-ink/40">· {r.cut.en}</span>
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {r.reasons.map((t) => (
                    <li key={t} className="flex gap-2 text-ink/75"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-mint" strokeWidth={2.5} /> {t}</li>
                  ))}
                  {r.warnings.map((t) => (
                    <li key={t} className="flex gap-2 text-ink/60"><Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> {t}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-5">
                  <div className="rounded-xl bg-creamsoft p-3 text-sm">
                    <p className="text-ink/55">Butuh ± {(grams / 1000).toFixed(grams % 1000 ? 1 : 0)} kg untuk {people} orang</p>
                    <p className="font-semibold">{packs} × {r.product.name} · {formatIDR(packs * r.product.price)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => addToCart(r.product, packs)} className="btn-coral btn-sm flex-1">
                      <Icon name="cart" className="h-4 w-4" /> Beli {packs} pak
                    </button>
                    {recipe && <Link to={`/resep/${recipe.id}`} className="btn-outline btn-sm">Resep</Link>}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <Lesson>
        Perkiraan porsi: ±180 g daging mentah per orang, dan ±40% lebih banyak untuk potongan bertulang seperti iga dan buntut.
      </Lesson>
    </div>
  );
}
