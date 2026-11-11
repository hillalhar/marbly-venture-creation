import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CUTS } from "../../data/meat.js";
import { SIMMER, STEAK_DONENESS } from "../../data/tools.js";
import { useTimers } from "../../lib/timers.jsx";
import Icon from "../../components/icons.jsx";
import { Card, Field, Highlight, Note, Pill } from "./shared.jsx";

const round05 = (n) => Math.max(0.5, Math.round(n * 2) / 2);

export default function CookTime() {
  const { add } = useTimers();
  const [cutId, setCutId] = useState("ribeye");
  const [method, setMethod] = useState("steak"); // steak | rebus | presto
  const [thick, setThick] = useState(2.5);
  const [doneId, setDoneId] = useState("mr");

  const cut = CUTS.find((c) => c.id === cutId);
  const tender = cut.tenderness >= 4;
  const done = STEAK_DONENESS.find((d) => d.id === doneId);

  const steak = useMemo(() => {
    const side = round05(Number(thick) * done.perCm);
    const rest = Number(thick) > 3 ? 8 : 5;
    return { side, rest };
  }, [thick, done]);
  const [simmer, presto] = SIMMER[cutId] || [90, 35];

  const warning =
    method === "steak" && !tender
      ? `${cut.name} berurat. Dimasak cepat sebagai steak hasilnya alot. Pilih rebus atau presto.`
      : method !== "steak" && tender
      ? `${cut.name} sudah empuk. Dimasak lama bisa kering. Waktu di bawah hanya untuk kuah/semur.`
      : "";

  const timers =
    method === "steak"
      ? [
          { label: `${cut.name}: sisi 1`, min: steak.side, text: `Sisi 1 · ${steak.side} mnt` },
          { label: `${cut.name}: sisi 2`, min: steak.side, text: `Sisi 2 · ${steak.side} mnt` },
          { label: `${cut.name}: istirahat`, min: steak.rest, text: `Istirahat · ${steak.rest} mnt` },
        ]
      : [{ label: `${cut.name}: ${method === "rebus" ? "rebus" : "presto"}`, min: method === "rebus" ? simmer : presto, text: `Masak · ${method === "rebus" ? simmer : presto} mnt` }];

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="space-y-5">
        <Field label="Potongan daging" htmlFor="ct-cut">
          <select id="ct-cut" value={cutId} onChange={(e) => setCutId(e.target.value)} className="input">
            {CUTS.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.en})</option>)}
          </select>
        </Field>
        <Field label="Metode">
          <div className="flex flex-wrap gap-2">
            {[["steak", "Steak (pan/grill)"], ["rebus", "Rebus / ungkep"], ["presto", "Presto"]].map(([v, l]) => (
              <Pill key={v} active={method === v} onClick={() => setMethod(v)}>{l}</Pill>
            ))}
          </div>
        </Field>
        {method === "steak" && (
          <>
            <Field label={`Ketebalan: ${String(thick).replace(".", ",")} cm`} htmlFor="ct-thick">
              <input id="ct-thick" type="range" min="1" max="5" step="0.5" value={thick} onChange={(e) => setThick(e.target.value)} className="w-full accent-coral" />
            </Field>
            <Field label="Tingkat kematangan">
              <div className="flex flex-wrap gap-2">
                {STEAK_DONENESS.map((d) => <Pill key={d.id} active={doneId === d.id} onClick={() => setDoneId(d.id)}>{d.label}</Pill>)}
              </div>
            </Field>
          </>
        )}
      </Card>

      <div className="space-y-4">
        <Highlight>
          {method === "steak" ? (
            <>
              <p className="text-sm font-semibold text-ink/60">Per sisi, api besar</p>
              <p className="font-display text-5xl font-bold text-coral">{String(steak.side).replace(".", ",")} menit</p>
              <ul className="mt-3 space-y-1 text-sm text-ink/75">
                <li>Balik sekali, total masak ± {String(steak.side * 2).replace(".", ",")} menit</li>
                <li>Angkat di {done.pull}°C (suhu akhir setelah istirahat {done.final})</li>
                <li>Istirahatkan {steak.rest} menit sebelum dipotong</li>
              </ul>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-ink/60">{method === "rebus" ? "Panci biasa, api kecil" : "Presto, hitung setelah berdesis"}</p>
              <p className="font-display text-5xl font-bold text-coral">{method === "rebus" ? simmer : presto} menit</p>
              <p className="mt-3 text-sm text-ink/75">Potong 3–4 cm. Tes dengan garpu: daging siap bila mudah terurai. Tambah 15–30 menit jika potongan besar.</p>
            </>
          )}
          {warning && <p className="mt-4 rounded-xl bg-white p-3 text-sm font-semibold text-coral">{warning}</p>}
        </Highlight>

        <Card>
          <p className="font-display text-lg font-bold">Mulai timer</p>
          <p className="mt-1 text-sm text-ink/55">Timer berjalan di multi-timer dan tetap aktif saat kamu pindah halaman.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {timers.map((t) => (
              <button key={t.text} onClick={() => add(t.label, t.min)} className="btn-outline btn-sm">
                <Icon name="clock" className="h-4 w-4" /> {t.text.replace(".", ",")}
              </button>
            ))}
          </div>
          <Link to="/alat?tab=timer" className="mt-4 inline-block text-sm font-semibold text-coral hover:underline">Buka multi-timer</Link>
        </Card>

        <Note>
          Waktu adalah perkiraan; kompor, wajan, dan suhu awal daging berpengaruh. Gunakan termometer daging. Daging giling harus matang sampai 71°C. Ibu hamil, anak, dan lansia sebaiknya memilih medium well ke atas.
        </Note>
      </div>
    </div>
  );
}
