import { useState } from "react";
import { ALL_GLOSSARY } from "../../data/learn.js";
import Icon from "../../components/icons.jsx";

export default function GlossaryModule() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const list = ALL_GLOSSARY.filter((g) => !term || `${g.term} ${g.def}`.toLowerCase().includes(term));

  // group by first letter, like a dictionary
  const groups = list.reduce((acc, g) => {
    const k = g.term[0].toUpperCase();
    (acc[k] = acc[k] || []).push(g);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="relative max-w-xl">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/35" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari istilah, mis. marbling, kolagen…" className="input rounded-full pl-11" aria-label="Cari istilah" />
      </div>

      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink/45">Istilah tidak ditemukan.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(groups).map(([letter, items]) => (
            <section key={letter}>
              <p className="font-display text-2xl font-bold text-coral">{letter}</p>
              <dl className="mt-3 grid gap-4 md:grid-cols-2">
                {items.map((g) => (
                  <div key={g.term} className="rounded-xl2 bg-white p-5 ring-1 ring-ink/10">
                    <dt className="font-display text-lg font-bold">{g.term}</dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-ink/65">{g.def}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
