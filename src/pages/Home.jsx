import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { analyzeMeat, hasGeminiKey } from "../lib/analyzeMeat.js";
import { useAuth } from "../lib/auth.jsx";
import { PremiumLock } from "../components/Layout.jsx";
import { recipeUrl, howToEatUrl, videoUrl } from "../lib/links.js";

const METRICS = [
  { key: "edible", icon: "🥩", title: "Kelayakan makan", color: "bg-mint" },
  { key: "marbling", icon: "🧵", title: "Kelas marbling", color: "bg-sun" },
  { key: "freshness", icon: "💧", title: "Kesegaran", color: "bg-coral" },
];

export default function Home() {
  const { isPremium, upgradeToPremium } = useAuth();
  const [days, setDays] = useState(0);
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);

  const pickFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setImage(dataUrl);
      setStatus("loading");
      setResult(null);
      setErrorMsg("");
      try {
        const r = await analyzeMeat(dataUrl, Number(days) || 0);
        if (!r) throw new Error("Tidak ada hasil dari AI.");
        setResult(r);
        setStatus("done");
      } catch (err) {
        setErrorMsg(err?.message || "Gagal menganalisis foto.");
        setStatus("error");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <Hero
        days={days}
        setDays={setDays}
        onCamera={() => cameraRef.current?.click()}
        onGallery={() => galleryRef.current?.click()}
      />
      <AnalyzerCard
        image={image}
        status={status}
        result={result}
        errorMsg={errorMsg}
        isPremium={isPremium}
        onUpgrade={upgradeToPremium}
        onPick={() => galleryRef.current?.click()}
      />
      <HowItWorks />

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => pickFile(e.target.files?.[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pickFile(e.target.files?.[0])}
      />
    </div>
  );
}

function Hero({ days, setDays, onCamera, onGallery }) {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-6 pt-10 text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-mintsoft px-4 py-1.5 text-sm font-bold text-ink">
        <span className="h-2 w-2 rounded-full bg-mint" />
        AI daging · deteksi gratis
      </span>

      <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] sm:text-6xl">
        Cek daging
        <br />
        <span className="text-coral">segar atau nggak?</span>
      </h1>

      <p className="mx-auto mt-5 max-w-xl text-lg text-ink/70">
        Foto daging, marbly membantu menilai <strong>indikasi kelayakan</strong>,{" "}
        <strong>kelas marbling</strong>, dan <strong>tingkat kesegaran</strong>.
        Simpel, cepat, akurat.
      </p>

      <div className="mt-7">
        <label className="block text-sm font-bold text-ink/70">
          Sudah berapa hari disimpan di kulkas?
        </label>
        <div className="mt-2 inline-flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-24 rounded-full border-2 border-ink bg-white px-5 py-2 text-center font-display font-bold outline-none focus:ring-2 focus:ring-coral"
          />
          <span className="text-ink/60">hari</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button onClick={onCamera} className="btn-coral w-full sm:w-auto">
          📸 Foto daging sekarang
        </button>
        <button onClick={onGallery} className="btn-outline w-full sm:w-auto">
          🖼️ Unggah dari galeri
        </button>
      </div>

      <p className="mt-4 text-sm text-ink/50">
        Deteksi dasar gratis. Deteksi bagian daging, rekomendasi masak, dan
        halaman belajar tersedia untuk pengguna premium.
      </p>
    </section>
  );
}

function AnalyzerCard({ image, status, result, errorMsg, isPremium, onUpgrade, onPick }) {
  return (
    <section id="analisis" className="mx-auto max-w-5xl px-5 py-8">
      <div className="rounded-xl3 border-2 border-ink bg-white p-6 shadow-card sm:p-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-5">
            {METRICS.map((m) => (
              <Metric
                key={m.key}
                icon={m.icon}
                title={m.title}
                color={m.color}
                value={result?.[m.key]}
                label={
                  result?.[`${m.key}Label`] ??
                  (m.key === "edible" ? "Menunggu foto daging kamu" : "Belum dianalisis")
                }
                loading={status === "loading"}
              />
            ))}

            <div className="flex items-start gap-3 pt-1">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="font-display text-lg font-bold">Perkiraan sisa tahan</p>
                <p className="text-ink/60">
                  {status === "loading"
                    ? "Menganalisis…"
                    : result?.shelfLife ?? "Belum dianalisis"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-full overflow-hidden rounded-xl2 border-2 border-ink bg-cream">
              {image ? (
                <img src={image} alt="Daging" className="aspect-square w-full object-cover" />
              ) : (
                <div className="grid aspect-square w-full place-items-center text-6xl">🥩</div>
              )}
            </div>
            <button
              onClick={onPick}
              className="mt-4 rounded-full border-2 border-ink bg-mint px-6 py-2.5 font-display font-bold text-ink shadow-hard hover:brightness-105"
            >
              {image ? "Ganti foto" : "Pilih foto untuk mulai"}
            </button>

            {result?.verdict && (
              <p className="mt-4 text-center font-semibold text-ink/80">{result.verdict}</p>
            )}
            {status === "error" && (
              <p className="mt-4 text-center font-semibold text-coral">
                {errorMsg || "Gagal menganalisis foto. Coba foto lain."}
              </p>
            )}
            {result?.source === "gemini" && (
              <p className="mt-2 text-center text-xs text-ink/40">
                Dianalisis oleh Gemini{result.model ? ` (${result.model})` : ""}
              </p>
            )}
          </div>
        </div>

        {status === "done" && result && (
          <CutDishes result={result} isPremium={isPremium} onUpgrade={onUpgrade} />
        )}
      </div>

      <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-ink/50">
        Hasil adalah skrining visual dari foto, bukan jaminan keamanan pangan.
        Tetap periksa bau dan tekstur daging sebelum membeli atau memasak.
      </p>
      {!hasGeminiKey() && (
        <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-coral">
          ⚠️ API key Gemini belum terbaca. Buat file <strong>.env</strong> (bukan
          .env.example) berisi VITE_GEMINI_API_KEY, lalu restart server.
        </p>
      )}
    </section>
  );
}

function Metric({ icon, title, color, value, label, loading }) {
  const pct = typeof value === "number" ? value : 0;
  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-display text-lg font-bold">{title}</p>
            {typeof value === "number" && (
              <span className="font-display font-bold text-ink/70">{value}%</span>
            )}
          </div>
          <p className="text-ink/60">{loading ? "Menganalisis…" : label}</p>
        </div>
      </div>
      <div className="track mt-2 border border-ink/10">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${loading ? 15 : pct}%` }}
        />
      </div>
    </div>
  );
}

function CutDishes({ result, isPremium, onUpgrade }) {
  const hasCut = result.cut && result.cut !== "Tidak yakin";

  if (!isPremium) {
    return (
      <div className="mt-8 border-t-2 border-dashed border-ink/10 pt-7">
        <PremiumLock
          onUpgrade={onUpgrade}
          title="Deteksi bagian daging & rekomendasi masak"
          desc="Buka tebakan bagian/cut daging plus rekomendasi masakan yang langsung terhubung ke resep dan tata cara makan."
          features={[
            "🔪 Deteksi bagian/cut daging",
            "🍳 Rekomendasi masakan sesuai cut",
            "🔗 Link resep, video, & tata cara makan",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="mt-8 border-t-2 border-dashed border-ink/10 pt-7">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl2 border-2 border-ink bg-cream p-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔪</span>
            <h3 className="font-display text-lg font-extrabold">Tebakan bagian daging</h3>
            <span className="ml-auto rounded-full bg-sun px-2 py-0.5 text-xs font-bold">
              ⭐ Premium
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-extrabold text-coral">
            {hasCut ? result.cut : "Belum bisa ditebak"}
          </p>
          {typeof result.cutConfidence === "number" && result.cutConfidence > 0 && (
            <p className="mt-1 text-sm font-bold text-ink/60">
              Keyakinan AI: {result.cutConfidence}%
            </p>
          )}
          {result.cutReason && <p className="mt-2 text-sm text-ink/70">{result.cutReason}</p>}
          {hasCut && (
            <Link
              to="/belajar"
              className="mt-3 inline-block text-sm font-bold text-coral hover:underline"
            >
              Pelajari bagian ini di halaman Belajar →
            </Link>
          )}
        </div>

        <div className="rounded-xl2 border-2 border-ink bg-white p-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <h3 className="font-display text-lg font-extrabold">Masakan yang cocok</h3>
            <span className="ml-auto rounded-full bg-sun px-2 py-0.5 text-xs font-bold">
              ⭐ Premium
            </span>
          </div>
          {result.dishes?.length ? (
            <ul className="mt-3 space-y-4">
              {result.dishes.map((d, i) => (
                <li key={i}>
                  <p className="font-bold">{d.name}</p>
                  {d.why && <p className="text-sm text-ink/60">{d.why}</p>}
                  <div className="mt-1.5 flex flex-wrap gap-2 text-xs font-bold">
                    <a
                      href={recipeUrl(d.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border-2 border-ink bg-coral px-3 py-1 text-white hover:brightness-105"
                    >
                      📖 Resep
                    </a>
                    <a
                      href={videoUrl(d.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border-2 border-ink bg-white px-3 py-1 hover:bg-cream"
                    >
                      ▶️ Video
                    </a>
                    <a
                      href={howToEatUrl(d.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border-2 border-ink bg-white px-3 py-1 hover:bg-cream"
                    >
                      🍽️ Tata cara makan
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink/60">
              Rekomendasi masakan muncul saat AI bisa menebak bagian dagingnya.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const STEPS = [
    { icon: "📸", title: "Foto", color: "bg-sun", text: "Potret daging pakai kamera HP, atau unggah dari galeri." },
    { icon: "🧠", title: "AI menganalisis", color: "bg-lilac", text: "AI membaca warna, permukaan, dan lemak daging dari fotomu." },
    { icon: "✅", title: "Laporan instan", color: "bg-coral text-white", text: "Tahu langsung layak makan, marbling, dan kesegarannya." },
  ];
  return (
    <section id="cara-kerja" className="mx-auto max-w-5xl px-5 py-10">
      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.title}
            className={`rounded-xl2 border-2 border-ink p-6 shadow-card ${s.color}`}
          >
            <div className="text-3xl">{s.icon}</div>
            <h3 className="mt-3 font-display text-xl font-extrabold">{s.title}</h3>
            <p className="mt-1 opacity-90">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
