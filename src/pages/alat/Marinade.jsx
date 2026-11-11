import { useState } from "react";
import { CUT_TYPES, MARINADES, SALT_G_PER_TSP } from "../../data/tools.js";
import { Card, Field, Highlight, kgLabel, Note, Pill } from "./shared.jsx";

// Round spoon amounts to the nearest ¼ and show them as fractions.
function spoons(x) {
  const q = Math.round(x * 4) / 4;
  if (q <= 0) return "sejumput";
  const whole = Math.floor(q);
  const frac = { 0.25: "¼", 0.5: "½", 0.75: "¾" }[q - whole] || "";
  return `${whole || ""}${whole && frac ? " " : ""}${frac}`.trim();
}
const fmtAmount = (amount, unit) => (["sdm", "sdt"].includes(unit) ? `${spoons(amount)} ${unit}` : `${Math.max(1, Math.round(amount))} ${unit}`);

export default function Marinade() {
  const [grams, setGrams] = useState(500);
  const [cutId, setCutId] = useState("steak");
  const [style, setStyle] = useState("garam");

  const cut = CUT_TYPES.find((c) => c.id === cutId);
  const mar = MARINADES.find((m) => m.id === style);
  const g = Math.max(0, Number(grams) || 0);
  const factor = g / 500;
  // salty marinades (kecap) already carry salt, so add only half
  const saltPct = cut.salt * (mar.salty ? 0.5 : 1);
  const saltG = (g * saltPct) / 100;
  const time = style === "garam" ? cut.brine : cut.marinate;

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <Card className="space-y-5 xl:col-span-2">
        <Field label="Berat daging (gram)" htmlFor="mr-g">
          <input id="mr-g" type="number" min="50" step="50" value={grams} onChange={(e) => setGrams(e.target.value)} className="input" />
        </Field>
        <Field label="Jenis potongan">
          <div className="space-y-2">
            {CUT_TYPES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCutId(c.id)}
                aria-pressed={cutId === c.id}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${cutId === c.id ? "border-ink bg-ink text-white" : "border-ink/10 bg-white hover:border-ink/30"}`}
              >
                <span className="font-semibold">{c.label}</span>
                <span className={`text-xs ${cutId === c.id ? "text-white/60" : "text-ink/45"}`}>{c.hint}</span>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Bumbu">
          <div className="flex flex-wrap gap-2">
            {MARINADES.map((m) => <Pill key={m.id} active={style === m.id} onClick={() => setStyle(m.id)}>{m.label}</Pill>)}
          </div>
          <p className="mt-2 text-xs text-ink/50">{mar.desc}</p>
        </Field>
      </Card>

      <div className="space-y-4 xl:col-span-3">
        <Highlight>
          <p className="text-sm font-semibold text-ink/60">Garam untuk {kgLabel(g)} daging</p>
          <p className="font-display text-5xl font-bold text-coral">{String(Math.round(saltG * 10) / 10).replace(".", ",")} g</p>
          <p className="mt-1 text-sm text-ink/70">
            ≈ {spoons(saltG / SALT_G_PER_TSP)} sdt garam halus · {String(saltPct).replace(".", ",")}% dari berat daging
            {mar.salty ? " (dikurangi karena kecap sudah asin)" : ""}
          </p>
        </Highlight>

        <Card>
          <p className="font-display text-lg font-bold">Bumbu {mar.label.toLowerCase()}</p>
          <ul className="mt-3 divide-y divide-ink/5 text-sm">
            <li className="flex justify-between py-2">
              <span>Garam halus</span>
              <span className="font-semibold">{spoons(saltG / SALT_G_PER_TSP)} sdt</span>
            </li>
            {mar.items.map((i) => (
              <li key={i.item} className="flex justify-between py-2">
                <span>{i.item}</span>
                <span className="font-semibold">{fmtAmount(i.amount * factor, i.unit)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display text-lg font-bold">Lama {style === "garam" ? "penggaraman" : "marinasi"}</p>
            <p className="font-display text-xl font-bold text-coral">{time}</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink/65">{cut.note}</p>
        </Card>

        <Note>
          Selalu marinasi di dalam kulkas, bukan di suhu ruang. Sisa bumbu bekas daging mentah jangan dipakai sebagai saus kecuali direbus sampai mendidih. Takaran adalah titik awal; sesuaikan dengan selera.
        </Note>
      </div>
    </div>
  );
}
