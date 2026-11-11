import { useState } from "react";
import { Link } from "react-router-dom";
import { CARRYOVER, DONENESS_LEVELS, levelOfTemp } from "../../data/learn.js";
import { Lesson, Panel } from "./shared.jsx";

const LEVELS = DONENESS_LEVELS.filter((l) => l.id !== "mentah");

// Core colour by internal temperature (°C).
const STOPS = [
  [38, [150, 22, 44]],
  [50, [190, 40, 58]],
  [56, [212, 78, 88]],
  [61, [214, 122, 118]],
  [66, [196, 150, 132]],
  [72, [163, 128, 106]],
  [80, [140, 108, 88]],
];
function coreColor(t) {
  if (t <= STOPS[0][0]) return `rgb(${STOPS[0][1]})`;
  for (let i = 1; i < STOPS.length; i++) {
    const [t1, c1] = STOPS[i];
    const [t0, c0] = STOPS[i - 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0);
      return `rgb(${c0.map((v, j) => Math.round(v + (c1[j] - v) * k)).join(",")})`;
    }
  }
  return `rgb(${STOPS[STOPS.length - 1][1]})`;
}

// Steak cross-section: crust, grey band growing inward, coloured core.
export function SteakSection({ temp, className = "" }) {
  const band = Math.min(0.9, Math.max(0.05, (temp - 44) / 30));
  return (
    <svg viewBox="0 0 340 150" className={className} role="img" aria-label={`Potongan steak pada suhu inti ${temp}°C`}>
      <ellipse cx="170" cy="78" rx="164" ry="66" fill="#4a2a1d" />
      <ellipse cx="170" cy="76" rx="158" ry="60" fill="#a88471" />
      <ellipse cx="170" cy="76" rx={Math.max(4, 150 * (1 - band))} ry={Math.max(2, 52 * (1 - band))} fill={coreColor(temp)} style={{ transition: "all .35s ease" }} />
      <g fill="none" stroke="#fbeee6" strokeLinecap="round" opacity="0.55">
        <path d="M40 70 C80 55 110 85 150 66" strokeWidth="3" />
        <path d="M190 56 C220 70 250 48 290 64" strokeWidth="2.5" />
        <path d="M120 100 C150 92 180 108 220 96" strokeWidth="2" />
        <path d="M60 96 C70 90 85 98 95 92" strokeWidth="1.8" />
      </g>
      <path d="M318 60 C330 70 330 90 316 100" fill="none" stroke="#f4e6d6" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}

export default function DonenessModule() {
  const [temp, setTemp] = useState(52);
  const [rest, setRest] = useState(true);

  const final = rest ? temp + CARRYOVER : temp;
  const lvl = levelOfTemp(final);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <div className="rounded-xl2 bg-[#2b2522] p-4">
            <SteakSection temp={final} className="w-full" />
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs text-ink/45">{rest ? "Suhu inti setelah istirahat" : "Suhu inti"}</p>
              <p className="font-display text-4xl font-bold tabular-nums">{final}°C</p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-bold text-coral">{lvl.name}</p>
              <p className="text-sm text-ink/50">{lvl.juicy}</p>
            </div>
          </div>

          <label htmlFor="temp" className="mt-5 block text-sm font-semibold text-ink/70">
            Diangkat dari api di {temp}°C
          </label>
          <input
            id="temp"
            type="range"
            min="40"
            max="78"
            step="1"
            value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            className="mt-2 w-full accent-coral"
          />
          <div className="flex justify-between text-[11px] text-ink/40">
            <span>40°C</span>
            <span>78°C</span>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm font-medium text-ink/70">
            <input type="checkbox" checked={rest} onChange={(e) => setRest(e.target.checked)} className="h-4 w-4 accent-coral" />
            Hitung panas sisa saat diistirahatkan 5 menit (+{CARRYOVER}°C)
          </label>

          <p className="mt-4 rounded-xl bg-creamsoft p-3 text-sm leading-relaxed text-ink/70">{lvl.note}</p>
        </Panel>

        <Panel className="lg:col-span-2">
          <h3 className="font-display text-lg font-bold">Tingkat kematangan</h3>
          <p className="mt-1 text-sm text-ink/50">Klik untuk melihat warnanya.</p>
          <ul className="mt-3 space-y-1.5">
            {LEVELS.map((l) => {
              const on = l.id === lvl.id;
              const pull = l.min - (rest ? CARRYOVER : 0);
              return (
                <li key={l.id}>
                  <button
                    onClick={() => setTemp(Math.round(pull + Math.min(2, (Math.min(l.max, 74) - l.min) / 2)))}
                    className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors ${on ? "bg-creamsoft ring-1 ring-ink/10" : "hover:bg-ink/5"}`}
                  >
                    <span className="h-8 w-8 shrink-0 rounded-full ring-2 ring-white" style={{ background: coreColor((l.min + Math.min(l.max, 75)) / 2) }} />
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-semibold ${on ? "text-coral" : ""}`}>{l.name}</span>
                      <span className="block text-xs text-ink/50">{l.juicy}</span>
                    </span>
                    <span className="text-right text-xs tabular-nums text-ink/60">
                      <span className="block font-semibold text-ink/80">{l.max === 100 ? `≥ ${l.min}` : `${l.min}–${l.max}`}°C</span>
                      {rest && <span className="block">angkat ±{pull}°C</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Lesson title="Panas sisa (carryover cooking)">
        Setelah diangkat, panas di permukaan steak terus merambat ke tengah, jadi suhu inti naik 2–4°C. Karena itu steak diangkat sedikit sebelum target, lalu diistirahatkan 5 menit. Baca selengkapnya di artikel{" "}
        <Link to="/belajar/artikel/steak-juicy-di-rumah" className="font-semibold text-coral hover:underline">Rahasia steak juicy di rumah</Link>.
      </Lesson>
    </div>
  );
}
