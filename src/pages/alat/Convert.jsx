import { useState } from "react";
import { VOLUME_UNITS, WEIGHT_UNITS } from "../../data/tools.js";
import { Card, Field, Note } from "./shared.jsx";

const fmt = (n) => {
  if (!Number.isFinite(n)) return "-";
  const r = n >= 100 ? Math.round(n) : n >= 10 ? Math.round(n * 10) / 10 : Math.round(n * 100) / 100;
  return r.toLocaleString("id-ID", { maximumFractionDigits: 2 });
};

function Converter({ title, units, base, defUnit, defValue }) {
  const [value, setValue] = useState(defValue);
  const [unit, setUnit] = useState(defUnit);
  const from = units.find((u) => u.id === unit);
  const inBase = (Number(String(value).replace(",", ".")) || 0) * from[base];
  return (
    <Card>
      <p className="font-display text-lg font-bold">{title}</p>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^\d.,]/g, ""))}
          className="input flex-1 text-lg font-semibold"
          aria-label={`Nilai ${title.toLowerCase()}`}
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input w-auto" aria-label="Satuan asal">
          {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {units.filter((u) => u.id !== unit).map((u) => (
          <li key={u.id} className="flex items-baseline justify-between rounded-xl bg-creamsoft px-3 py-2.5">
            <span className="text-sm text-ink/55">{u.label}</span>
            <span className="font-display text-lg font-bold tabular-nums">{fmt(inBase / u[base])}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Temperature() {
  const [c, setC] = useState(180);
  const f = Math.round((Number(c) * 9) / 5 + 32);
  return (
    <Card>
      <p className="font-display text-lg font-bold">Suhu oven</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Field label="Celcius (°C)" htmlFor="cv-c">
          <input id="cv-c" type="number" value={c} onChange={(e) => setC(e.target.value)} className="input text-lg font-semibold" />
        </Field>
        <Field label="Fahrenheit (°F)" htmlFor="cv-f">
          <input id="cv-f" type="number" value={f} onChange={(e) => setC(Math.round(((Number(e.target.value) - 32) * 5) / 9))} className="input text-lg font-semibold" />
        </Field>
      </div>
      <p className="mt-3 text-sm text-ink/55">Resep luar negeri sering memakai °F. 350°F ≈ 175°C, 400°F ≈ 205°C, 450°F ≈ 230°C.</p>
    </Card>
  );
}

const QUICK = [
  ["1 ons", "100 g"],
  ["3 ons", "300 g"],
  ["5 ons (setengah kilo)", "500 g"],
  ["1 pon", "500 g"],
  ["1 kg", "10 ons"],
  ["1 sdm", "15 ml = 3 sdt"],
  ["1 cup", "240 ml ≈ 16 sdm"],
  ["1 lb (resep luar)", "± 454 g"],
];

export default function Convert() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="space-y-6">
        <Converter title="Berat" units={WEIGHT_UNITS} base="g" defUnit="ons" defValue="3" />
        <Converter title="Volume" units={VOLUME_UNITS} base="ml" defUnit="sdm" defValue="2" />
      </div>
      <div className="space-y-6">
        <Temperature />
        <Card>
          <p className="font-display text-lg font-bold">Contekan pasar</p>
          <dl className="mt-3 divide-y divide-ink/5 text-sm">
            {QUICK.map(([a, b]) => (
              <div key={a} className="flex justify-between py-2">
                <dt className="text-ink/60">{a}</dt>
                <dd className="font-semibold">{b}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Note>Di Indonesia, 1 ons = 100 g dan 1 pon = 500 g. Ini berbeda dari ounce (28 g) dan pound (454 g) di resep berbahasa Inggris.</Note>
      </div>
    </div>
  );
}
