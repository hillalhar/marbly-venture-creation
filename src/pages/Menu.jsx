import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { PremiumLock } from "../components/Layout.jsx";
import { MENU, CUTS } from "../data/meat.js";
import { recipeUrl, videoUrl, howToEatUrl } from "../lib/links.js";

const TYPES = ["Semua", "Berkuah", "Panggang", "Masakan lama", "Goreng"];

export default function Menu() {
  const { isPremium, upgradeToPremium } = useAuth();
  const [type, setType] = useState("Semua");
  const [cutId, setCutId] = useState("all");

  const filtered = useMemo(
    () =>
      MENU.filter(
        (m) =>
          (type === "Semua" || m.type === type) &&
          (cutId === "all" || m.cutId === cutId)
      ),
    [type, cutId]
  );

  if (!isPremium) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <PremiumLock
          onUpgrade={upgradeToPremium}
          title="Daftar Menu khusus Premium"
          desc="Jelajahi kumpulan menu masakan daging sapi, difilter per bagian dan metode masak, lengkap dengan link resep, video, dan tata cara makan."
          features={[
            "🍽️ Kurasi menu masakan daging sapi",
            "🔎 Filter per bagian/cut & metode masak",
            "🔗 Link resep, video, & tata cara makan",
          ]}
        />
      </div>
    );
  }

  return (
    <div>
      <section className="bg-gradient-to-b from-sun/40 to-creamsoft px-5 pb-8 pt-14">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-sun px-4 py-1.5 text-sm font-bold text-ink">
            🍽️ Daftar Menu
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
            Mau masak apa hari ini?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink/70">
            Pilih menu sesuai bagian daging yang kamu punya. Tiap menu terhubung
            ke resep, video, dan tata cara penyajiannya.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-8">
        {/* filters */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold transition-transform active:translate-y-0.5 ${
                  t === type ? "bg-coral text-white" : "bg-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCutId("all")}
              className={`rounded-full border-2 border-ink px-3 py-1 text-xs font-bold ${
                cutId === "all" ? "bg-ink text-white" : "bg-cream"
              }`}
            >
              Semua bagian
            </button>
            {CUTS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCutId(c.id)}
                className={`rounded-full border-2 border-ink px-3 py-1 text-xs font-bold ${
                  cutId === c.id ? "bg-ink text-white" : "bg-cream"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* grid */}
        <p className="mt-6 text-sm font-bold text-ink/50">
          {filtered.length} menu ditemukan
        </p>
        <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => {
            const cut = CUTS.find((c) => c.id === m.cutId);
            return (
              <div
                key={m.name}
                className="flex flex-col rounded-xl2 border-2 border-ink bg-white p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-extrabold">{m.name}</h3>
                  {m.spicy && <span title="Pedas">🌶️</span>}
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5 text-xs font-bold">
                  <span className="rounded-full bg-cream px-2 py-0.5">{m.type}</span>
                  {cut && (
                    <span className="rounded-full bg-sun px-2 py-0.5">
                      {cut.emoji} {cut.name}
                    </span>
                  )}
                </div>
                <p className="mt-3 flex-1 text-sm text-ink/70">{m.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  <a
                    href={recipeUrl(m.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border-2 border-ink bg-coral px-3 py-1 text-white hover:brightness-105"
                  >
                    📖 Resep
                  </a>
                  <a
                    href={videoUrl(m.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border-2 border-ink bg-white px-3 py-1 hover:bg-cream"
                  >
                    ▶️ Video
                  </a>
                  <a
                    href={howToEatUrl(m.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border-2 border-ink bg-white px-3 py-1 hover:bg-cream"
                  >
                    🍽️ Cara makan
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="mt-10 text-center text-ink/50">
            Tidak ada menu untuk filter ini. Coba kombinasi lain.
          </p>
        )}

        <div className="mt-12 text-center">
          <Link to="/belajar" className="btn-outline">
            📚 Pelajari bagian dagingnya
          </Link>
        </div>
      </section>
    </div>
  );
}
