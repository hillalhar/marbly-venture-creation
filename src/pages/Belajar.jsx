import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { PageHero, PremiumLock } from "../components/ui.jsx";
import CowDiagram from "../components/CowDiagram.jsx";
import { useAddToCart } from "../components/ProductCard.jsx";
import { usePageTitle } from "../lib/hooks.js";
import { PRODUCTS, formatIDR } from "../data/products.js";
import {
  CUTS,
  FRESH_SIGNS,
  STORAGE_TIPS,
  DONENESS,
  TECHNIQUES,
  GLOSSARY,
  BUYING_TIPS,
} from "../data/meat.js";
import { recipePath } from "../lib/links.js";

export default function Belajar() {
  usePageTitle("Belajar");
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
      <PageHero
        badge="Belajar"
        title="Pahami daging sapi, dari bagian sampai piring"
        desc="Kenali setiap bagian sapi, nilai kesegaran, dan pilih cara masak terbaik. Klik bagian pada diagram untuk mulai."
      />

      {/* interactive diagram + detail */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <h2 className="font-display text-2xl font-bold">Peta bagian sapi</h2>
        <p className="mt-1 text-ink/60">
          Setiap bagian punya karakter berbeda. Pilih untuk lihat detailnya.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          {/* diagram */}
          <div className="lg:col-span-3">
            <div className="rounded-xl3 border border-ink/10 bg-white p-5 shadow-card">
              <CowDiagram activeId={activeId} onSelect={setActiveId} />
              <div className="mt-4 flex flex-wrap gap-2">
                {CUTS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`rounded-full border border-ink/10 px-3 py-1 text-sm font-bold transition-transform active:translate-y-0.5 ${
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
            <div className="h-full rounded-xl3 bg-white p-6 ring-1 ring-ink/10">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{activeCut.emoji}</span>
                <div>
                  <h3 className="font-display text-2xl font-bold">{activeCut.name}</h3>
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
                {activeCut.price && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-ink/60">Kelas harga</span>
                    <PriceDots n={activeCut.price} />
                  </div>
                )}
              </div>

              <p className="mt-4 text-sm font-bold">
                🍳 Cara masak: <span className="font-normal">{activeCut.method}</span>
              </p>

              {activeCut.tip && (
                <div className="mt-3 rounded-xl2 border border-ink/10 bg-mintsoft p-3 text-sm">
                  <span className="font-bold">💡 Tips: </span>
                  {activeCut.tip}
                </div>
              )}
              {activeCut.mistake && (
                <div className="mt-2 rounded-xl2 border border-ink/10 bg-white p-3 text-sm">
                  <span className="font-bold text-coral">⚠️ Hindari: </span>
                  {activeCut.mistake}
                </div>
              )}

              <div className="mt-4">
                <p className="text-sm font-bold text-ink/60">Masakan populer:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeCut.dishes.map((d) => (
                    <Link
                      key={d}
                      to={recipePath(d)}
                      className="rounded-full border border-ink/10 bg-white px-3 py-1 text-sm font-bold hover:bg-cream"
                    >
                      {d} →
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* portion calculator */}
      <PortionCalculator />

      {/* tenderness ladder */}
      <section className="bg-cream px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-bold">
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
                  className="flex items-center gap-3 rounded-xl2 border border-ink/10 bg-white p-4 shadow-card"
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <div className="flex-1">
                    <p className="font-display font-bold">{c.name}</p>
                    <p className="text-xs text-ink/50">{c.method}</p>
                  </div>
                  <TendernessDots n={c.tenderness} />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* steak doneness guide */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="font-display text-2xl font-bold">
          Tingkat kematangan steak
        </h2>
        <p className="mt-1 max-w-2xl text-ink/60">
          Panduan suhu inti daging dan ciri visualnya. Gunakan termometer daging
          untuk hasil paling akurat.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {DONENESS.map((d) => (
            <div
              key={d.level}
              className="overflow-hidden rounded-xl2 border border-ink/10 bg-white shadow-card"
            >
              <div className="flex h-16 items-center justify-center" style={{ background: d.color }}>
                <div
                  className="h-9 w-9 rounded-full border border-white/70"
                  style={{ background: d.color, filter: "brightness(0.7)" }}
                />
              </div>
              <div className="p-4">
                <p className="font-display font-bold">{d.level}</p>
                <p className="mt-0.5 text-sm font-bold text-coral">{d.tempC}</p>
                <p className="mt-1 text-xs text-ink/60">{d.center}</p>
                <p className="mt-2 text-xs text-ink/70">{d.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* cooking techniques */}
      <section className="bg-lilac/25 px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-bold">
            Teknik memasak & kapan dipakai
          </h2>
          <p className="mt-1 max-w-2xl text-ink/60">
            Teknik yang tepat mengubah cut murah jadi hidangan juara. Cocokkan
            teknik dengan karakter dagingnya.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TECHNIQUES.map((t) => (
              <div
                key={t.name}
                className="rounded-xl2 border border-ink/10 bg-white p-5 shadow-card"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{t.icon}</span>
                  <p className="font-display text-lg font-bold">{t.name}</p>
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-coral">
                  {t.heat}
                </p>
                <p className="mt-2 text-sm text-ink/80">{t.why}</p>
                <p className="mt-2 text-sm">
                  <span className="font-bold">Terbaik untuk: </span>
                  <span className="text-ink/70">{t.best}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* fresh signs */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="font-display text-2xl font-bold">
          Segar atau mulai basi?
        </h2>
        <p className="mt-1 max-w-2xl text-ink/60">
          Mata dan hidung kamu tetap juara. Ini tanda-tanda yang perlu diperhatikan.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FRESH_SIGNS.map((s) => (
            <div
              key={s.title}
              className={`rounded-xl2 border border-ink/10 p-5 shadow-card ${
                s.good ? "bg-mintsoft" : "bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{s.good ? "✅" : "⛔"}</span>
                <div>
                  <p className="font-display font-bold">{s.title}</p>
                  <p className="mt-1 text-sm text-ink/70">{s.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* storage */}
      <section className="bg-ink px-5 py-12 text-cream">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-bold text-white">
            Simpan & tangani dengan aman
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STORAGE_TIPS.map((t) => (
              <div key={t.title} className="rounded-xl2 border border-cream/20 bg-white/5 p-5">
                <div className="text-3xl">{t.icon}</div>
                <p className="mt-2 font-display font-bold text-white">{t.title}</p>
                <p className="mt-1 text-sm text-cream/70">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* smart buying */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="font-display text-2xl font-bold">
          Belanja daging lebih cerdas
        </h2>
        <p className="mt-1 max-w-2xl text-ink/60">
          Tips memilih di lapak atau supermarket supaya dapat kualitas terbaik
          sesuai budget.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {BUYING_TIPS.map((t) => (
            <div
              key={t.title}
              className="flex gap-4 rounded-xl2 border border-ink/10 bg-sun/40 p-5 shadow-card"
            >
              <span className="text-3xl">{t.icon}</span>
              <div>
                <p className="font-display font-bold">{t.title}</p>
                <p className="mt-1 text-sm text-ink/70">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* glossary */}
      <section className="bg-cream px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-bold">
            Kamus istilah daging
          </h2>
          <p className="mt-1 max-w-2xl text-ink/60">
            Biar nggak bingung saat baca resep atau ngobrol sama tukang daging.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {GLOSSARY.map((g) => (
              <div
                key={g.term}
                className="rounded-xl2 border border-ink/10 bg-white p-5 shadow-card"
              >
                <p className="font-display font-bold text-coral">{g.term}</p>
                <p className="mt-1 text-sm text-ink/70">{g.def}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="mx-auto max-w-6xl px-5 py-12 text-center">
        <h2 className="font-display text-2xl font-bold">Siap praktik?</h2>
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

function PortionCalculator() {
  const addToCart = useAddToCart();
  const [people, setPeople] = useState(4);
  const [appetite, setAppetite] = useState("normal"); // ringan | normal | lahap
  const [bone, setBone] = useState(false); // ada tulang?

  const perPerson = { ringan: 120, normal: 180, lahap: 250 }[appetite];
  const grams = useMemo(() => {
    let g = perPerson * (Number(people) || 0);
    if (bone) g *= 1.4; // tulang menambah berat
    return Math.round(g);
  }, [perPerson, people, bone]);

  const kg = (grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 1);

  // suggest the closest product multiple to cover the need
  const suggestion = useMemo(() => {
    const base = PRODUCTS.find((p) => p.sku === "chuck-500") || PRODUCTS[0];
    const packs = Math.max(1, Math.ceil(grams / base.weight));
    return { product: base, packs, total: packs * base.price };
  }, [grams]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <h2 className="font-display text-2xl font-bold">Kalkulator porsi daging</h2>
      <p className="mt-1 max-w-2xl text-ink/60">
        Perkirakan berapa daging yang perlu dibeli untuk sekian orang, lalu
        langsung tambahkan ke keranjang.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* inputs */}
        <div className="rounded-xl3 border border-ink/10 bg-white p-6 shadow-card">
          <label className="block text-sm font-bold text-ink/70">Jumlah orang</label>
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => setPeople((n) => Math.max(1, Number(n) - 1))}
              className="h-9 w-9 rounded-full border border-ink/10 bg-cream font-bold"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              className="w-20 rounded-xl2 border border-ink/10 bg-cream px-3 py-2 text-center font-display font-bold outline-none"
            />
            <button
              onClick={() => setPeople((n) => Number(n) + 1)}
              className="h-9 w-9 rounded-full border border-ink/10 bg-cream font-bold"
            >
              +
            </button>
          </div>

          <label className="mt-5 block text-sm font-bold text-ink/70">Porsi makan</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["ringan", "Ringan"],
              ["normal", "Normal"],
              ["lahap", "Lahap"],
            ].map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setAppetite(val)}
                className={`rounded-full border border-ink/10 px-4 py-1.5 text-sm font-bold ${
                  appetite === val ? "bg-coral text-white" : "bg-cream"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          <label className="mt-5 flex items-center gap-2 text-sm font-bold text-ink/70">
            <input
              type="checkbox"
              checked={bone}
              onChange={(e) => setBone(e.target.checked)}
              className="h-4 w-4 accent-coral"
            />
            Potongan bertulang (iga/buntut)
          </label>
        </div>

        {/* result */}
        <div className="rounded-xl3 bg-white p-6 ring-1 ring-ink/10">
          <p className="text-sm font-bold text-ink/60">Perkiraan kebutuhan</p>
          <p className="mt-1 font-display text-5xl font-bold text-coral">
            {kg} kg
          </p>
          <p className="mt-1 text-sm text-ink/70">
            ≈ {grams} gram untuk {people || 0} orang ({perPerson} g/orang
            {bone ? ", +tulang" : ""})
          </p>

          <div className="mt-5 rounded-xl2 border border-ink/10 bg-white p-4">
            <p className="text-sm font-bold">Saran belanja</p>
            <p className="mt-1 text-sm text-ink/70">
              {suggestion.packs} × {suggestion.product.name} ({suggestion.product.weight} g)
            </p>
            <p className="mt-1 font-display font-bold">
              ≈ {formatIDR(suggestion.total)}
            </p>
            <button
              onClick={() => addToCart(suggestion.product, suggestion.packs)}
              className="btn-coral mt-3 w-full"
            >
              + Tambah {suggestion.packs} ke keranjang
            </button>
          </div>
          <p className="mt-2 text-xs text-ink/50">
            Perkiraan kasar; sesuaikan dengan menu dan selera.
          </p>
        </div>
      </div>
    </section>
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

function PriceDots({ n }) {
  return (
    <span className="font-bold tracking-tight">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= n ? "text-ink" : "text-ink/25"}>
          Rp
        </span>
      ))}
    </span>
  );
}
