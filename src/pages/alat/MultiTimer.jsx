import { useState } from "react";
import { fmtClock, remainingOf, useTimers } from "../../lib/timers.jsx";
import { useNow } from "../../lib/hooks.js";
import Icon from "../../components/icons.jsx";
import { Card, Field, Note } from "./shared.jsx";

const PRESETS = [
  ["Steak per sisi", 4],
  ["Istirahat steak", 5],
  ["Rebus telur", 10],
  ["Ungkep iga", 60],
  ["Presto daging", 45],
  ["Rebus kaldu", 120],
];

function Ring({ pct, done }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90" aria-hidden="true">
      <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-ink/5" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        className={done ? "text-coral" : "text-mint"}
        style={{ transition: "stroke-dashoffset .5s linear" }}
      />
    </svg>
  );
}

export default function MultiTimer() {
  const { timers, add, pause, resume, reset, extend, remove, clearDone } = useTimers();
  const now = useNow(250);
  const [label, setLabel] = useState("");
  const [h, setH] = useState(0);
  const [m, setM] = useState(10);

  const minutes = Number(h) * 60 + Number(m);
  const doneCount = timers.filter((t) => t.status === "done").length;

  function submit(e) {
    e.preventDefault();
    if (minutes <= 0) return;
    add(label.trim() || `Timer ${minutes} menit`, minutes);
    setLabel("");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <div className="space-y-5 xl:col-span-2">
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <p className="font-display text-lg font-bold">Timer baru</p>
            <Field label="Nama" htmlFor="mt-label">
              <input id="mt-label" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={40} placeholder="Mis. rebus kaldu buntut" className="input" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Jam" htmlFor="mt-h">
                <input id="mt-h" type="number" min="0" max="12" value={h} onChange={(e) => setH(e.target.value)} className="input" />
              </Field>
              <Field label="Menit" htmlFor="mt-m">
                <input id="mt-m" type="number" min="0" max="59" value={m} onChange={(e) => setM(e.target.value)} className="input" />
              </Field>
            </div>
            <button type="submit" disabled={minutes <= 0} className="btn-coral w-full">
              <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} /> Mulai timer
            </button>
          </form>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-ink/70">Cepat</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map(([l, min]) => (
              <button key={l} onClick={() => add(l, min)} className="chip">
                {l} <span className="text-ink/40">{min >= 60 ? `${min / 60} jam` : `${min} mnt`}</span>
              </button>
            ))}
          </div>
        </Card>
        <Note>Timer tetap berjalan saat kamu pindah halaman atau me-refresh. Bunyi peringatan butuh tab marbly tetap terbuka.</Note>
      </div>

      <div className="xl:col-span-3">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-lg font-bold">
            Timer aktif <span className="text-ink/35">({timers.length}/8)</span>
          </p>
          {doneCount > 0 && <button onClick={clearDone} className="btn-ghost btn-sm">Hapus yang selesai</button>}
        </div>

        {timers.length === 0 ? (
          <div className="rounded-xl3 border border-dashed border-ink/15 bg-white px-6 py-14 text-center">
            <Icon name="clock" className="mx-auto h-10 w-10 text-ink/25" strokeWidth={1.4} />
            <p className="mt-3 font-semibold">Belum ada timer</p>
            <p className="mt-1 text-sm text-ink/50">Buat timer baru, pilih yang cepat, atau mulai dari langkah resep.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {timers.map((t) => {
              const left = remainingOf(t, now);
              const done = t.status === "done";
              const pct = t.duration ? 1 - left / t.duration : 1;
              return (
                <li key={t.id} className={`flex items-center gap-4 rounded-xl2 bg-white p-4 ring-1 ${done ? "ring-coral" : "ring-ink/10"}`}>
                  <div className="relative shrink-0">
                    <Ring pct={done ? 1 : pct} done={done} />
                    <Icon name={done ? "alert" : "clock"} className={`absolute inset-0 m-auto h-5 w-5 ${done ? "text-coral" : "text-ink/40"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{t.label}</p>
                    <p className={`font-display text-3xl font-bold tabular-nums ${done ? "text-coral" : t.status === "paused" ? "text-ink/40" : ""}`}>
                      {done ? "Selesai!" : fmtClock(left)}
                    </p>
                    <p className="text-xs text-ink/45">
                      {done ? `Total ${fmtClock(t.duration)}` : t.status === "paused" ? "Dijeda" : `Selesai pukul ${new Date(t.endAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                    {t.status === "running" && <button onClick={() => pause(t.id)} className="btn-outline btn-sm">Jeda</button>}
                    {t.status === "paused" && <button onClick={() => resume(t.id)} className="btn-coral btn-sm">Lanjut</button>}
                    {!done && <button onClick={() => extend(t.id, 1)} className="btn-ghost btn-sm">+1 mnt</button>}
                    {done && <button onClick={() => extend(t.id, 5)} className="btn-outline btn-sm">+5 mnt</button>}
                    {done && <button onClick={() => reset(t.id)} className="btn-ghost btn-sm">Ulang</button>}
                    <button onClick={() => remove(t.id)} className="btn-ghost btn-sm px-2 text-ink/40" aria-label={`Hapus timer ${t.label}`}>
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
