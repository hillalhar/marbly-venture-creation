import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { PremiumLock } from "../components/Layout.jsx";
import CowDiagram from "../components/CowDiagram.jsx";
import { CUTS, FRESH_SIGNS, STORAGE_TIPS } from "../data/meat.js";
import { recipeUrl } from "../lib/links.js";

export default function Belajar() {
  const { isPremium, upgradeToPremium } = useAuth();
  const [activeId, setActiveId] = useState("ribeye");
  const activeCut = CUTS.find((c) => c.id === activeId) || CUTS[0];

  if (!isPremium) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <PremiumLock
          onUpgrade={upgradeToPremium}
          title="Halaman Belajar khusus Premium"
          desc="Buka panduan visual lengkap: peta bagian sapi interaktif, cara mengenali daging segar, dan tips penyimpanan yang aman."
          features={[
            "🐄 Diagram sapi interaktif — klik tiap bagian",
            "🔎 Penjelasan karakter & cara masak tiap cut",
            "📚 Tanda daging segar vs basi + tips simpan",
          ]}
        />
      </div>
    );
  }

  return (
    <div>
      {/* hero */}
      <section className="bg-gradient-to-b from-lilac/40 to-creamsoft px-5 pb-10 pt-14">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-lilac px-4 py-1.5 text-sm font-bold text-ink">
            📚 Pusat Belajar
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
            Pahami daging sapi,
            <br />
            <span className="text-coral">dari bagian sampai piring</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink/70">
            Panduan visual untuk mengenali setiap bagian sapi, menilai kesegaran,
            dan memilih cara masak terbaik. Klik bagian pada diagram untuk mulai.
          </p>
        </div>
      </section>

      {/* interactive diagram + detail */}
      <section className="mx-auto max-w-5xl px-5 py-10">
        <h2 className="font-display text-2xl font-extrabold">Peta bagian sapi</h2>
        <p className="mt-1 text-ink/60">
          Setiap bagian punya karakter berbeda. Pilih untuk lihat detailnya.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          {/* diagram */}
          <div className="lg:col-span-3">
            <div className="rounded-xl3 border-2 border-ink bg-white p-5 shadow-card">
              <CowDiagram activeId={activeId} onSelect={setActiveId} />
              <div className="mt-4 flex flex-wrap gap-2">
                {CUTS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`rounded-full border-2 border-ink px-3 py-1 text-sm font-bold transition-transform active:translate-y-0.5 ${
                      c.id === activeId ? "bg-coral text-white" : "bg-cream"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* detail panel */}
          <div className="lg:col-span-2">
            <div className="h-full rounded-xl3 border-2 border-ink bg-sun p-6 shadow-card">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{activeCut.emoji}</span>
                <div>
                  <h3 className="font-display text-2xl font-extrabold">{activeCut.name}</h3>
                  <p className="text-sm font-bold text-ink/60">
                    {activeCut.en} · {activeCut.region}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-ink/80">{activeCut.char}</p>

              <div className="mt-4 space-y-3">
                <Stat label="Keempukan" value={activeCut.tenderness} />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-ink/60">Kadar lemak</span>
                  <span className="font-bold">{activeCut.fat}</span>
                </div>
              </div>

              <p className="mt-4 text-sm font-bold">
                🍳 Cara masak: <span className="font-normal">{activeCut.method}</span>
              </p>

              <div className="mt-4">
                <p className="text-sm font-bold text-ink/60">Masakan populer:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeCut.dishes.map((d) => (
                    <a
                      key={d}
                      href={recipeUrl(d)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border-2 border-ink bg-white px-3 py-1 text-sm font-bold hover:bg-cream"
                    >
                      {d} ↗
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* tenderness ladder */}
      <section className="bg-cream px-5 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-extrabold">
            Empuk vs berurat — pilih cara masak
          </h2>
          <p className="mt-1 max-w-2xl text-ink/60">
            Aturan sederhana: makin empuk, makin cocok dimasak cepat (grill, steak).
            Makin berurat, makin butuh dimasak lama (rebus, slow-cook) agar lumer.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...CUTS]
              .sort((a, b) => b.tenderness - a.tenderness)
              .map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl2 border-2 border-ink bg-white p-4 shadow-card"
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <div className="flex-1">
                    <p className="font-display font-extrabold">{c.name}</p>
                    <p className="text-xs text-ink/50">{c.method}</p>
                  </div>
                  <TendernessDots n={c.tenderness} />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* fresh signs */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <h2 className="font-display text-2xl font-extrabold">
          Segar atau mulai basi?
        </h2>
        <p className="mt-1 max-w-2xl text-ink/60">
          Mata dan hidung kamu tetap juara. Ini tanda-tanda yang perlu diperhatikan.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FRESH_SIGNS.map((s) => (
            <div
              key={s.title}
              className={`rounded-xl2 border-2 border-ink p-5 shadow-card ${
                s.good ? "bg-mintsoft" : "bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{s.good ? "✅" : "⛔"}</span>
                <div>
                  <p className="font-display font-extrabold">{s.title}</p>
                  <p className="mt-1 text-sm text-ink/70">{s.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* storage */}
      <section className="bg-ink px-5 py-12 text-cream">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-extrabold text-white">
            Simpan & tangani dengan aman
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STORAGE_TIPS.map((t) => (
              <div key={t.title} className="rounded-xl2 border-2 border-cream/20 bg-white/5 p-5">
                <div className="text-3xl">{t.icon}</div>
                <p className="mt-2 font-display font-bold text-white">{t.title}</p>
                <p className="mt-1 text-sm text-cream/70">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="mx-auto max-w-5xl px-5 py-12 text-center">
        <h2 className="font-display text-2xl font-extrabold">Siap praktik?</h2>
        <p className="mt-1 text-ink/60">
          Foto daging kamu dan biarkan AI menilai kesegaran serta bagiannya.
        </p>
        <Link to="/" className="btn-coral mt-5 inline-flex">
          🥩 Cek daging sekarang
        </Link>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-bold text-ink/60">{label}</span>
      <TendernessDots n={value} />
    </div>
  );
}

function TendernessDots({ n }) {
  return (
    <span className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-2.5 w-2.5 rounded-full border border-ink ${
            i <= n ? "bg-coral" : "bg-white/60"
          }`}
        />
      ))}
    </span>
  );
}
