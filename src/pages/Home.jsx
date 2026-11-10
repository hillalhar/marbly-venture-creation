import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { analyzeMeat, hasGeminiKey } from "../lib/analyzeMeat.js";
import { useAuth } from "../lib/auth.jsx";
import { usePageTitle } from "../lib/hooks.js";
import { recipePath } from "../lib/links.js";
import { CUTS } from "../data/meat.js";
import { PRODUCTS, productsForCut } from "../data/products.js";
import { RECIPES } from "../data/recipes.js";
import ProductCard from "../components/ProductCard.jsx";
import { RecipeCard } from "./Resep.jsx";
import Icon from "../components/icons.jsx";
import { PremiumLock, SectionHeader } from "../components/ui.jsx";

const METRICS = [
  { key: "edible", title: "Kelayakan makan", color: "bg-mint" },
  { key: "marbling", title: "Kelas marbling", color: "bg-amber-400" },
  { key: "freshness", title: "Kesegaran", color: "bg-coral" },
];

function matchCut(name = "") {
  const n = name.toLowerCase();
  return CUTS.find((c) => n.includes(c.name.toLowerCase()) || c.en.toLowerCase().split("/").some((e) => e.trim() && n.includes(e.trim()))) || null;
}

export default function Home() {
  usePageTitle("");
  const { isPremium, upgradeToPremium } = useAuth();
  const [days, setDays] = useState(0);
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [over, setOver] = useState(false);
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);

  const pickFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("File harus berupa gambar (JPG/PNG).");
      setStatus("error");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      setImage(reader.result);
      setStatus("loading");
      setResult(null);
      setErrorMsg("");
      try {
        const r = await analyzeMeat(reader.result, Number(days) || 0);
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
      <section className="border-b border-ink/5 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:py-14 lg:grid-cols-2 lg:items-center">
          {/* left: pitch + upload */}
          <div>
            <p className="eyebrow">AI cek daging · gratis</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.1] sm:text-5xl">
              Daging ini masih <span className="text-coral">segar</span>?
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/60">
              Foto dagingnya. marbly menilai kelayakan makan, kelas marbling, dan tingkat kesegaran dalam hitungan detik.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <label htmlFor="days" className="text-sm font-medium text-ink/60">Disimpan di kulkas</label>
              <div className="flex items-center rounded-full border border-ink/15 bg-white">
                <input
                  id="days"
                  type="number"
                  min="0"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-14 bg-transparent py-2 pl-4 text-center text-sm font-semibold outline-none"
                />
                <span className="pr-4 text-sm text-ink/50">hari</span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => cameraRef.current?.click()} className="btn-coral px-6 py-3">
                <Icon name="camera" className="h-[18px] w-[18px]" /> Foto daging
              </button>
              <button onClick={() => galleryRef.current?.click()} className="btn-outline px-6 py-3">
                <Icon name="image" className="h-[18px] w-[18px]" /> Unggah dari galeri
              </button>
            </div>
            <p className="mt-4 text-xs text-ink/40">Skrining visual dari foto, bukan jaminan keamanan pangan. Tetap cek bau dan tekstur.</p>
            {!hasGeminiKey() && (
              <p className="mt-2 text-xs text-coral">API key Gemini belum terbaca. Isi VITE_GEMINI_API_KEY di file .env lalu restart server.</p>
            )}
          </div>

          {/* right: photo + result */}
          <div
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); pickFile(e.dataTransfer.files?.[0]); }}
            className={`card overflow-hidden transition-shadow ${over ? "ring-4 ring-coral/30" : ""}`}
          >
            <div className="grid sm:grid-cols-2">
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="relative aspect-square bg-cream sm:aspect-auto sm:min-h-full"
                aria-label="Pilih foto daging"
              >
                {image ? (
                  <img src={image} alt="Foto daging yang dianalisis" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink/40">
                    <Icon name="image" className="h-10 w-10" strokeWidth={1.4} />
                    <span className="text-sm font-medium">Pilih atau seret foto</span>
                  </span>
                )}
                {status === "loading" && (
                  <span className="absolute inset-0 grid place-items-center bg-ink/30">
                    <span className="animate-pulse rounded-full bg-white px-4 py-2 text-sm font-semibold">Menganalisis…</span>
                  </span>
                )}
              </button>
              <div className="space-y-5 p-5 sm:p-6">
                {METRICS.map((m) => (
                  <Metric
                    key={m.key}
                    title={m.title}
                    color={m.color}
                    value={result?.[m.key]}
                    label={result?.[`${m.key}Label`] ?? "Belum dianalisis"}
                    loading={status === "loading"}
                  />
                ))}
                <div>
                  <p className="text-sm font-semibold">Perkiraan sisa tahan</p>
                  <p className="text-sm text-ink/55">{status === "loading" ? "Menganalisis…" : result?.shelfLife ?? "Belum dianalisis"}</p>
                </div>
              </div>
            </div>
            {(result?.verdict || status === "error") && (
              <div className={`border-t border-ink/5 px-5 py-4 text-sm ${status === "error" ? "text-coral" : "text-ink/75"}`} role={status === "error" ? "alert" : undefined}>
                {status === "error" ? errorMsg || "Gagal menganalisis foto. Coba foto lain." : result.verdict}
                {result?.source === "gemini" && <span className="ml-2 text-xs text-ink/35">· Gemini{result.model ? ` ${result.model}` : ""}</span>}
              </div>
            )}
          </div>
        </div>
      </section>

      {status === "done" && result && (
        <section className="mx-auto max-w-6xl px-5 pt-10">
          <CutDishes result={result} isPremium={isPremium} onUpgrade={upgradeToPremium} />
        </section>
      )}

      <Featured />

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ""; }} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}

function Metric({ title, color, value, label, loading }) {
  const pct = typeof value === "number" ? value : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold">{title}</p>
        {typeof value === "number" && <span className="text-sm font-bold tabular-nums">{value}%</span>}
      </div>
      <div className="track mt-1.5">
        <div className={`h-full rounded-full ${color} transition-all duration-700 ${loading ? "animate-pulse" : ""}`} style={{ width: `${loading ? 15 : pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-ink/50">{loading ? "Menganalisis…" : label}</p>
    </div>
  );
}

function CutDishes({ result, isPremium, onUpgrade }) {
  const hasCut = result.cut && result.cut !== "Tidak yakin";
  const cut = hasCut ? matchCut(result.cut) : null;
  const products = cut ? productsForCut(cut.id).slice(0, 4) : [];

  if (!isPremium) {
    return (
      <PremiumLock
        onUpgrade={onUpgrade}
        title="Tahu bagian dagingnya & mau dimasak apa"
        desc="Premium menebak bagian/cut daging dari foto, lalu menyarankan masakan yang cocok lengkap dengan resep dan produk serupa di toko."
        features={["Deteksi bagian/cut daging", "Rekomendasi masakan sesuai cut", "Resep lengkap & beli bahan di toko"]}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <p className="eyebrow">Tebakan bagian daging</p>
          <p className="mt-2 font-display text-2xl font-bold">{hasCut ? result.cut : "Belum bisa ditebak"}</p>
          {typeof result.cutConfidence === "number" && result.cutConfidence > 0 && <p className="mt-0.5 text-sm text-ink/50">Keyakinan AI {result.cutConfidence}%</p>}
          {result.cutReason && <p className="mt-3 text-sm leading-relaxed text-ink/65">{result.cutReason}</p>}
          {cut && (
            <p className="mt-3 rounded-xl bg-creamsoft p-3 text-sm text-ink/70">
              <span className="font-semibold text-ink">Paling pas:</span> {cut.method} {cut.tip}
            </p>
          )}
          {hasCut && <Link to="/belajar" className="mt-3 inline-block text-sm font-semibold text-coral hover:underline">Pelajari bagian ini</Link>}
        </div>
        <div className="card p-5">
          <p className="eyebrow">Masakan yang cocok</p>
          {result.dishes?.length ? (
            <ul className="mt-2 divide-y divide-ink/5">
              {result.dishes.map((d, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{d.name}</p>
                    {d.why && <p className="text-sm text-ink/55">{d.why}</p>}
                  </div>
                  <Link to={recipePath(d.name)} className="btn-outline btn-sm shrink-0 px-3 py-1.5">Resep</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-ink/55">Rekomendasi muncul saat AI bisa menebak bagian dagingnya.</p>
          )}
        </div>
      </div>
      {products.length > 0 && (
        <div>
          <SectionHeader title={`Beli ${cut.name} segar`} to={`/toko?q=${encodeURIComponent(cut.name)}`} />
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.sku} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function Featured() {
  const deals = PRODUCTS.filter((p) => p.compareAt).slice(0, 4);
  const recipes = RECIPES.slice(0, 3);
  return (
    <div className="mx-auto max-w-6xl space-y-14 px-5 pt-14">
      <section>
        <SectionHeader title="Promo minggu ini" desc="Dipotong sesuai pesanan, dikirim dingin" to="/toko?urut=promo" />
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {deals.map((p) => <ProductCard key={p.sku} product={p} />)}
        </div>
      </section>
      <section>
        <SectionHeader title="Mau masak apa hari ini?" to="/resep" />
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {recipes.map((r) => <RecipeCard key={r.id} r={r} />)}
        </div>
      </section>
    </div>
  );
}
