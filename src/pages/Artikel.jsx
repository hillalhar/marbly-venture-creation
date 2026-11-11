import { Link, useParams } from "react-router-dom";
import { ARTICLE_CATEGORIES, ARTICLES, getArticle, readingMinutes } from "../data/articles.js";
import { getProduct } from "../data/products.js";
import { getRecipe } from "../data/recipes.js";
import { useAuth } from "../lib/auth.jsx";
import { usePageTitle } from "../lib/hooks.js";
import Icon from "../components/icons.jsx";
import ProductCard, { Photo } from "../components/ProductCard.jsx";
import { Breadcrumb, EmptyState, PremiumLock, SectionHeader } from "../components/ui.jsx";
import { RecipeCard } from "./Resep.jsx";
import { ArticleCard } from "./Belajar.jsx";

const FREE_BLOCKS = 1; // free accounts see the opening paragraph only

function Block({ b }) {
  switch (b.type) {
    case "h2":
      return <h2 className="pt-6 font-display text-2xl font-bold leading-snug">{b.text}</h2>;
    case "p":
      return <p className="text-[17px] leading-8 text-ink/75">{b.text}</p>;
    case "list":
      return (
        <ul className="space-y-3">
          {b.items.map((t) => (
            <li key={t} className="flex gap-3 text-[17px] leading-8 text-ink/75">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="space-y-4">
          {b.items.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
              <div>
                <p className="font-semibold">{s.title}</p>
                <p className="mt-0.5 leading-7 text-ink/70">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "tip":
    case "warn": {
      const tip = b.type === "tip";
      return (
        <aside className={`flex gap-3 rounded-xl2 p-5 ${tip ? "bg-mintsoft" : "bg-coralsoft"}`}>
          <Icon name={tip ? "sparkle" : "alert"} className={`mt-0.5 h-5 w-5 shrink-0 ${tip ? "text-mint" : "text-coral"}`} />
          <div>
            <p className="font-semibold">{b.title}</p>
            <p className="mt-1 leading-7 text-ink/75">{b.text}</p>
          </div>
        </aside>
      );
    }
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl2 ring-1 ring-ink/10">
          <table className="w-full min-w-[520px] bg-white text-left text-sm">
            <thead className="bg-creamsoft">
              <tr>
                {b.head.map((h, i) => <th key={i} className="px-4 py-3 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-t border-ink/5">
                  {r.map((c, j) => <td key={j} className={`px-4 py-3 ${j === 0 ? "font-semibold" : "text-ink/70"}`}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

export default function Artikel() {
  const { slug } = useParams();
  const a = getArticle(slug);
  const { isPremium, upgradeToPremium } = useAuth();
  usePageTitle(a?.title || "Artikel");

  if (!a) {
    return (
      <div className="page">
        <EmptyState title="Artikel tidak ditemukan" action={<Link to="/belajar" className="btn-coral btn-sm">Semua artikel</Link>} />
      </div>
    );
  }

  const blocks = isPremium ? a.body : a.body.slice(0, FREE_BLOCKS);
  const products = (a.related?.products || []).map(getProduct).filter(Boolean);
  const recipes = (a.related?.recipes || []).map(getRecipe).filter(Boolean);
  const more = ARTICLES.filter((x) => x.slug !== a.slug).sort((x, y) => (x.category === a.category ? -1 : 0) - (y.category === a.category ? -1 : 0)).slice(0, 3);
  const cat = ARTICLE_CATEGORIES.find((c) => c.id === a.category)?.label;

  return (
    <article>
      <header className="border-b border-ink/5 bg-white">
        <div className="mx-auto max-w-3xl px-5 pb-8 pt-8 sm:pt-10">
          <Breadcrumb items={[{ to: "/belajar", label: "Belajar" }, { label: cat }]} />
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-[2.6rem] sm:leading-[1.15]">{a.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink/60">{a.excerpt}</p>
          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/45">
            <span>Tim marbly</span>
            <span>·</span>
            <span>{new Date(`${a.date}T00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Icon name="clock" className="h-3.5 w-3.5" /> {readingMinutes(a)} menit baca</span>
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 pt-8">
        <Photo src={a.image} alt={a.title} className="aspect-[16/8] w-full rounded-xl3" />
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-5 py-10">
        {blocks.map((b, i) => <Block key={i} b={b} />)}

        {!isPremium && a.body.length > FREE_BLOCKS && (
          <div className="relative">
            <div className="pointer-events-none absolute -top-28 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-creamsoft" />
            <PremiumLock
              onUpgrade={upgradeToPremium}
              title="Lanjutkan membaca dengan Premium"
              desc="Belajar adalah fitur Premium: artikel lengkap dengan tabel panduan, plus alat interaktif untuk mengenal tiap cut."
              features={["Semua artikel Belajar dibaca sampai habis", "Peta sapi, pencari cut, dan perbandingan cut", "Penampil kematangan steak dan kamus istilah"]}
            />
          </div>
        )}
      </div>

      <div className="mx-auto max-w-6xl space-y-14 px-5">
        {products.length > 0 && (
          <section>
            <SectionHeader title="Produk di artikel ini" to="/toko" />
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p.sku} product={p} />)}
            </div>
          </section>
        )}
        {recipes.length > 0 && (
          <section>
            <SectionHeader title="Coba resepnya" to="/resep" />
            <div className="mt-5 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((r) => <RecipeCard key={r.id} r={r} />)}
            </div>
          </section>
        )}
        <section>
          <SectionHeader title="Baca juga" to="/belajar" linkLabel="Semua artikel" />
          <div className="mt-5 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((x) => <ArticleCard key={x.slug} a={x} />)}
          </div>
        </section>
      </div>
    </article>
  );
}
