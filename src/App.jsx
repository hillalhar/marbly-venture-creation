import { useRef, useState } from "react";
import { analyzeMeat, hasGeminiKey } from "./lib/analyzeMeat.js";

const NAV = [
  { label: "Cara kerja", href: "#cara-kerja" },
  { label: "Kenapa marbly", href: "#kenapa" },
  { label: "Belajar", href: "#belajar" },
];

const FRESH_SIGNS = [
  { good: true, title: "Warna merah cerah", text: "Daging sapi segar berwarna merah cerah sampai merah keunguan di bagian dalam." },
  { good: true, title: "Permukaan sedikit lembap", text: "Lembap wajar, tapi tidak berair atau berlendir." },
  { good: true, title: "Lemak putih / krem", text: "Lemak segar berwarna putih sampai krem, tidak kekuningan pudar." },
  { good: true, title: "Bau netral", text: "Aroma khas daging, tidak asam, amis tajam, atau busuk." },
  { good: false, title: "Warna cokelat / abu / kehijauan", text: "Perubahan warna menyeluruh jadi cokelat tua, abu, atau hijau adalah tanda mulai basi." },
  { good: false, title: "Berlendir & lengket", text: "Lapisan lendir licin di permukaan menandakan pertumbuhan bakteri." },
  { good: false, title: "Bau asam atau busuk", text: "Bau menyengat, asam, atau amonia berarti sebaiknya tidak dikonsumsi." },
  { good: false, title: "Tekstur lembek", text: "Daging segar kenyal dan kembali saat ditekan; yang lembek dan tidak balik sudah menurun." },
];

const CUTS = [
  { name: "Has Dalam (Tenderloin)", char: "Paling empuk, lemak sedikit, serat halus.", cook: "Steak, grill cepat, tumis.", color: "bg-coral text-white" },
  { name: "Has Luar (Sirloin)", char: "Empuk, rasa kuat, marbling sedang.", cook: "Steak, panggang, sate.", color: "bg-sun" },
  { name: "Lamusir (Ribeye/Cube Roll)", char: "Marbling tinggi, juicy, beraroma.", cook: "Steak, panggang.", color: "bg-lilac" },
  { name: "Sandung Lamur (Brisket)", char: "Berlemak dan berurat, butuh waktu.", cook: "Rendang, soto, smoked brisket.", color: "bg-cream" },
  { name: "Sengkel (Shank)", char: "Banyak urat & kolagen, keras bila cepat.", cook: "Semur, bakso urat, sup, rawon.", color: "bg-cream" },
  { name: "Sampil (Chuck)", char: "Serbaguna, sedikit urat, ekonomis.", cook: "Giling, semur, tumis, bakso.", color: "bg-cream" },
  { name: "Gandik (Round)", char: "Rendah lemak, padat, agak kering.", cook: "Dendeng, empal, abon, rendang.", color: "bg-cream" },
  { name: "Iga (Ribs)", char: "Daging di sela tulang, gurih.", cook: "Iga bakar, sop iga, konro.", color: "bg-cream" },
  { name: "Buntut (Oxtail)", char: "Bertulang, kaya kolagen, gurih.", cook: "Sop buntut, buntut bakar.", color: "bg-cream" },
];

export default function App() {
  const [days, setDays] = useState(0);
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
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
    <div className="min-h-screen bg-creamsoft font-body text-ink">
      <Header />
      <main>
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
          onPick={() => galleryRef.current?.click()}
        />
        <HowItWorks />
        <WhyMarbly />
        <Learn onStart={() => galleryRef.current?.click()} />
      </main>
      <Footer />

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

/* ------------------------------------------------------------------ */
function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cream">
        <svg viewBox="0 0 48 48" className="h-7 w-7">
          <path
            d="M6 20 C4 9 16 4 27 5 C40 6 44 15 40 23 C37 29 28 31 20 31 C11 31 8 26 6 20 Z"
            fill="#f26d6d"
            stroke="#1a1413"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="16" r="2" fill="#1a1413" />
          <circle cx="28" cy="12" r="2" fill="#1a1413" />
          <circle cx="32" cy="20" r="2" fill="#1a1413" />
          <circle cx="23" cy="22" r="2" fill="#1a1413" />
        </svg>
      </span>
      <span className="font-display text-2xl font-extrabold lowercase">marbly</span>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 bg-creamsoft/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="font-semibold hover:text-coral">
              {n.label}
            </a>
          ))}
        </nav>
        <a href="#analisis" className="btn-dark px-5 py-2.5 text-sm">
          Cek daging
        </a>
      </div>
    </header>
  );
}

function Hero({ days, setDays, onCamera, onGallery }) {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-6 pt-10 text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-mintsoft px-4 py-1.5 text-sm font-bold text-ink">
        <span className="h-2 w-2 rounded-full bg-mint" />
        AI daging · gratis · tanpa daftar
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
        Gratis, tanpa daftar. Foto kamu dinilai AI penglihatan marbly dalam
        hitungan detik.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
const METRICS = [
  { key: "edible", icon: "🥩", title: "Kelayakan makan", color: "bg-mint" },
  { key: "marbling", icon: "🧵", title: "Kelas marbling", color: "bg-sun" },
  { key: "freshness", icon: "💧", title: "Kesegaran", color: "bg-coral" },
];

function AnalyzerCard({ image, status, result, errorMsg, onPick }) {
  return (
    <section id="analisis" className="mx-auto max-w-5xl px-5 py-8">
      <div className="rounded-xl3 border-2 border-ink bg-white p-6 shadow-card sm:p-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* metrics */}
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

          {/* preview */}
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
              <p className="mt-4 text-center font-semibold text-ink/80">
                {result.verdict}
              </p>
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

        {status === "done" && result && <CutDishes result={result} />}
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

function CutDishes({ result }) {
  const hasCut = result.cut && result.cut !== "Tidak yakin";
  return (
    <div className="mt-8 border-t-2 border-dashed border-ink/10 pt-7">
      <div className="grid gap-6 md:grid-cols-2">
        {/* cut detection */}
        <div className="rounded-xl2 border-2 border-ink bg-cream p-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔪</span>
            <h3 className="font-display text-lg font-extrabold">Tebakan bagian daging</h3>
          </div>
          <p className="mt-3 font-display text-2xl font-extrabold text-coral">
            {hasCut ? result.cut : "Belum bisa ditebak"}
          </p>
          {typeof result.cutConfidence === "number" && result.cutConfidence > 0 && (
            <p className="mt-1 text-sm font-bold text-ink/60">
              Keyakinan AI: {result.cutConfidence}%
            </p>
          )}
          {result.cutReason && (
            <p className="mt-2 text-sm text-ink/70">{result.cutReason}</p>
          )}
        </div>

        {/* dish recommendations */}
        <div className="rounded-xl2 border-2 border-ink bg-white p-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <h3 className="font-display text-lg font-extrabold">Masakan yang cocok</h3>
          </div>
          {result.dishes?.length ? (
            <ul className="mt-3 space-y-2.5">
              {result.dishes.map((d, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-coral">▸</span>
                  <span>
                    <span className="font-bold">{d.name}</span>
                    {d.why && <span className="text-ink/60"> — {d.why}</span>}
                  </span>
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

/* ------------------------------------------------------------------ */
const STEPS = [
  { icon: "📸", title: "Foto", color: "bg-sun", text: "Potret daging pakai kamera HP, atau unggah dari galeri." },
  { icon: "🧠", title: "AI menganalisis", color: "bg-lilac", text: "AI membaca warna, permukaan, dan lemak daging dari fotomu." },
  { icon: "✅", title: "Laporan instan", color: "bg-coral text-white", text: "Tahu langsung layak makan, marbling, dan kesegarannya." },
];

function HowItWorks() {
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

/* ------------------------------------------------------------------ */
const REASONS = [
  { title: "Bahasa manusia", text: "Tanpa istilah teknis, cukup layak atau tidak." },
  { title: "Langsung di browser", text: "Ringan, tidak perlu unduh aplikasi apa pun." },
  { title: "Gratis selamanya", text: "Dibuat sebagai alat edukasi buat semua orang." },
];

function WhyMarbly() {
  return (
    <section id="kenapa" className="mx-auto max-w-5xl px-5 pb-14">
      <div className="rounded-xl3 border-2 border-ink bg-white p-7 shadow-card sm:p-10">
        <h2 className="font-display text-3xl font-extrabold">Kenapa marbly?</h2>
        <p className="mt-3 max-w-2xl text-ink/70">
          Alat pengecek daging biasanya cuma dipakai pabrik dan laboratorium yang
          mahal. marbly bawa kemampuan itu ke tangan kamu, pas lagi berdiri di
          depan lapak daging.
        </p>

        <div className="mt-7 grid gap-6 sm:grid-cols-3">
          {REASONS.map((r) => (
            <div key={r.title}>
              <h3 className="font-display text-lg font-extrabold">{r.title}</h3>
              <p className="mt-1 text-ink/60">{r.text}</p>
            </div>
          ))}
        </div>

        <a href="#belajar" className="btn-dark mt-8">
          Belajar kenali daging segar
        </a>
      </div>
    </section>
  );
}

function Learn({ onStart }) {
  return (
    <section id="belajar" className="scroll-mt-20 bg-cream py-14">
      <div className="mx-auto max-w-5xl px-5">
        <span className="inline-flex items-center gap-2 rounded-full bg-lilac px-4 py-1.5 text-sm font-bold text-ink">
          📚 Belajar
        </span>
        <h2 className="mt-4 font-display text-4xl font-extrabold">
          Kenali daging segar sendiri
        </h2>
        <p className="mt-3 max-w-2xl text-ink/70">
          AI membantu, tapi mata dan hidung kamu tetap juara. Ini panduan singkat
          membaca kesegaran daging sapi dan mengenali bagian potongannya.
        </p>

        {/* fresh vs not */}
        <h3 className="mt-10 font-display text-2xl font-extrabold">
          Tanda daging segar vs mulai basi
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
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

        {/* cuts guide */}
        <h3 className="mt-12 font-display text-2xl font-extrabold">
          Mengenal bagian daging sapi
        </h3>
        <p className="mt-2 max-w-2xl text-ink/70">
          Tiap bagian punya karakter dan cara masak terbaiknya. Cut empuk cocok
          dimasak cepat; cut berurat butuh dimasak lama agar empuk.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CUTS.map((c) => (
            <div
              key={c.name}
              className={`rounded-xl2 border-2 border-ink p-5 shadow-card ${c.color}`}
            >
              <p className="font-display text-lg font-extrabold">{c.name}</p>
              <p className="mt-2 text-sm opacity-90">{c.char}</p>
              <p className="mt-2 text-sm font-bold">
                🍳 Cocok untuk: <span className="font-normal">{c.cook}</span>
              </p>
            </div>
          ))}
        </div>

        {/* safe handling */}
        <div className="mt-10 rounded-xl3 border-2 border-ink bg-ink p-7 text-cream shadow-card sm:p-9">
          <h3 className="font-display text-2xl font-extrabold text-white">
            Tips menyimpan & aman
          </h3>
          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            <div>
              <p className="font-display font-bold text-white">Kulkas (chiller)</p>
              <p className="mt-1 text-sm text-cream/70">
                Daging segar bertahan 1-3 hari di suhu 0-4°C. Simpan tertutup.
              </p>
            </div>
            <div>
              <p className="font-display font-bold text-white">Freezer</p>
              <p className="mt-1 text-sm text-cream/70">
                Beku di -18°C bisa tahan berbulan-bulan. Cairkan di kulkas, bukan
                di suhu ruang.
              </p>
            </div>
            <div>
              <p className="font-display font-bold text-white">Sebelum masak</p>
              <p className="mt-1 text-sm text-cream/70">
                Cek bau dan tekstur. Kalau ragu dari bau asam atau lendir, jangan
                dipaksakan.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button onClick={onStart} className="btn-coral">
            🥩 Coba cek daging kamu sekarang
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink py-6 text-center text-sm text-white/80">
      marbly — cek daging lebih percaya diri. Dibuat untuk dapur Indonesia.
    </footer>
  );
}
