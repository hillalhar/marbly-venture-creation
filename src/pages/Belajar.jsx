import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { usePageTitle } from "../lib/hooks.js";
import { ARTICLE_CATEGORIES, ARTICLES, readingMinutes } from "../data/articles.js";
import Icon from "../components/icons.jsx";
import { Photo } from "../components/ProductCard.jsx";
import { PremiumGate, Tabs } from "../components/ui.jsx";
import PetaModule from "./belajar/PetaModule.jsx";
import FinderModule from "./belajar/FinderModule.jsx";
import CompareModule from "./belajar/CompareModule.jsx";
import DonenessModule from "./belajar/DonenessModule.jsx";
import GlossaryModule from "./belajar/GlossaryModule.jsx";

const TABS = [
  { id: "artikel", label: "Artikel" },
  { id: "peta", label: "Peta sapi", desc: "Klik tiap bagian sapi untuk melihat karakter, cara masak, dan harganya.", View: PetaModule },
  { id: "cari", label: "Pencari cut", desc: "Jawab tiga pertanyaan singkat, marbly menyarankan cut yang paling pas beserta jumlah yang perlu dibeli.", View: FinderModule },
  { id: "banding", label: "Bandingkan cut", desc: "Letakkan dua cut berdampingan: keempukan, lemak, harga, gizi, dan waktu masak.", View: CompareModule },
  { id: "matang", label: "Kematangan steak", desc: "Lihat bagaimana bagian dalam steak berubah di tiap suhu, termasuk efek panas sisa.", View: DonenessModule },
  { id: "kamus", label: "Kamus", desc: "Istilah daging yang sering muncul di resep dan di meja tukang daging.", View: GlossaryModule },
];

const formatDate = (d) => new Date(`${d}T00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const catLabel = (id) => ARTICLE_CATEGORIES.find((c) => c.id === id)?.label;

export function ArticleCard({ a, horizontal = false }) {
  return (
    <Link to={`/belajar/artikel/${a.slug}`} className={`group flex ${horizontal ? "flex-col gap-6 md:flex-row md:items-center" : "flex-col"}`}>
      <div className={`overflow-hidden rounded-xl2 bg-cream ${horizontal ? "md:w-1/2" : ""}`}>
        <Photo src={a.image} alt={a.title} className={`w-full transition-transform duration-500 group-hover:scale-105 ${horizontal ? "aspect-[16/10]" : "aspect-[16/10]"}`} />
      </div>
      <div className={horizontal ? "md:w-1/2" : "pt-4"}>
        <p className="text-xs font-semibold uppercase tracking-wider text-coral">{catLabel(a.category)}</p>
        <h3 className={`mt-1.5 font-display font-bold leading-snug group-hover:text-coral ${horizontal ? "text-2xl sm:text-3xl" : "text-lg"}`}>{a.title}</h3>
        <p className={`mt-2 leading-relaxed text-ink/60 ${horizontal ? "text-[15px]" : "line-clamp-2 text-sm"}`}>{a.excerpt}</p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink/45">
          <Icon name="clock" className="h-3.5 w-3.5" /> {readingMinutes(a)} menit baca · {formatDate(a.date)}
        </p>
      </div>
    </Link>
  );
}

function Articles() {
  const [cat, setCat] = useState("semua");
  const featured = ARTICLES.find((a) => a.featured) || ARTICLES[0];
  const list = ARTICLES.filter((a) => (cat === "semua" || a.category === cat) && (cat !== "semua" || a.slug !== featured.slug));

  return (
    <div className="space-y-12">
      {cat === "semua" && <ArticleCard a={featured} horizontal />}
      <div>
        <Tabs items={ARTICLE_CATEGORIES} value={cat} onChange={setCat} />
        <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => <ArticleCard key={a.slug} a={a} />)}
        </div>
      </div>
    </div>
  );
}

export default function Belajar() {
  usePageTitle("Belajar");
  const { isPremium, upgradeToPremium } = useAuth();
  if (!isPremium) {
    return (
      <PremiumGate
        eyebrow="Belajar"
        title="Panduan daging sapi, dari pasar sampai piring"
        desc="Artikel praktis untuk belanja, menyimpan, dan memasak daging, ditambah alat interaktif untuk mengenal tiap cut dan kematangan steak."
        lockTitle="Belajar khusus Premium"
        lockDesc={`Upgrade untuk membaca ${ARTICLES.length} artikel lengkap dan membuka semua alat interaktif.`}
        features={["Artikel lengkap: memilih cut, ciri daging segar, menyimpan, steak, rendang", ...TABS.filter((t) => t.View).map((t) => `${t.label}: ${t.desc}`)]}
        onUpgrade={upgradeToPremium}
      >
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.slice(0, 3).map((a) => <ArticleCard key={a.slug} a={a} />)}
        </div>
      </PremiumGate>
    );
  }
  return <BelajarContent />;
}

function BelajarContent() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((t) => t.id === params.get("tab")) || TABS[0];

  const go = (id) => {
    setParams(id === "artikel" ? {} : { tab: id }, { replace: true });
    document.getElementById("belajar-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <section className="border-b border-ink/5 bg-white">
        <div className="mx-auto max-w-6xl px-5 pb-8 pt-8 sm:pb-10 sm:pt-12">
          <p className="eyebrow">Belajar</p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl">
            Panduan daging sapi, <span className="text-coral">dari pasar sampai piring</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/60">
            Artikel praktis untuk belanja, menyimpan, dan memasak daging, ditambah alat interaktif untuk mengenal tiap cut dan kematangan steak.
          </p>
        </div>
      </section>

      <div id="belajar-tabs" className="sticky top-16 z-20 scroll-mt-16 border-b border-ink/5 bg-creamsoft/95 backdrop-blur">
        <div className="no-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5">
          {TABS.map((t) => {
            const on = t.id === tab.id;
            return (
              <button
                key={t.id}
                onClick={() => go(t.id)}
                aria-current={on ? "page" : undefined}
                className={`relative flex shrink-0 items-center gap-1.5 px-3 py-3.5 text-sm font-semibold transition-colors ${
                  on ? "text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-coral" : "text-ink/50 hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        {tab.id === "artikel" ? (
          <Articles />
        ) : (
          <>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold">{tab.label}</h2>
              <p className="mt-1 max-w-2xl text-sm text-ink/55">{tab.desc}</p>
            </div>
            <tab.View goTo={go} />
          </>
        )}
      </section>
    </div>
  );
}
