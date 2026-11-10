import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CATEGORIES, discountPct, formatIDR, getProduct, PREP_OPTIONS, pricePerKg, PRODUCTS } from "../data/products.js";
import { CUTS } from "../data/meat.js";
import { recipesForCut } from "../data/recipes.js";
import { NUTRITION, shelfDays } from "../data/tools.js";
import { useCart } from "../lib/cart.jsx";
import { usePageTitle } from "../lib/hooks.js";
import ProductCard, { FavButton, Photo, useAddToCart } from "../components/ProductCard.jsx";
import { RecipeCard } from "./Resep.jsx";
import Icon from "../components/icons.jsx";
import { Breadcrumb, EmptyState, Price, QtyStepper, SectionHeader, Stars, Tabs } from "../components/ui.jsx";

export default function ProdukDetail() {
  const { sku } = useParams();
  const p = getProduct(sku);
  usePageTitle(p?.name || "Produk");
  if (!p) {
    return (
      <div className="page">
        <EmptyState title="Produk tidak ditemukan" desc="Produk ini mungkin sudah tidak dijual." action={<Link to="/toko" className="btn-coral btn-sm">Kembali ke toko</Link>} />
      </div>
    );
  }
  return <Detail key={p.sku} p={p} />;
}

function Detail({ p }) {
  const navigate = useNavigate();
  const { available, getReviews } = useCart();
  const addToCart = useAddToCart();
  const [prep, setPrep] = useState(p.prep[0]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("info");

  const stock = available(p.sku);
  const cut = CUTS.find((c) => c.id === p.cutId);
  const category = CATEGORIES.find((c) => c.id === p.category);
  const recipes = recipesForCut(p.cutId);
  const reviews = getReviews(p.sku);
  const nutrition = NUTRITION[p.ground ? "ground" : p.cutId];
  const related = useMemo(() => PRODUCTS.filter((x) => x.sku !== p.sku && (x.category === p.category || x.cutId === p.cutId)).slice(0, 4), [p]);
  const off = discountPct(p);
  const q = Math.min(qty, Math.max(1, stock));

  const addNow = () => addToCart(p, q, prep);
  const buyNow = () => {
    if (addToCart(p, q, prep).added > 0) navigate("/checkout");
  };

  return (
    <div className="page pb-36 md:pb-10">
      <Breadcrumb items={[{ to: "/toko", label: "Toko" }, { to: `/toko?kategori=${p.category}`, label: category?.label }, { label: p.name }]} />

      <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative">
          <Photo src={p.image} alt={p.name} className="aspect-square w-full rounded-xl3 bg-cream" />
          {off > 0 && <span className="badge absolute left-4 top-4 bg-coral px-3 py-1 text-sm text-white">Hemat {off}%</span>}
          <FavButton type="products" id={p.sku} name={p.name} className="absolute right-4 top-4 h-10 w-10" />
        </div>

        <div className="lg:py-2">
          <p className="text-sm font-medium text-ink/45">{p.grade} · {p.origin}</p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight">{p.name}</h1>
          <button onClick={() => setTab("ulasan")} className="mt-2 flex items-center gap-2 text-sm">
            <Stars value={p.rating} />
            <span className="font-semibold">{p.rating}</span>
            <span className="text-ink/45 underline-offset-2 hover:underline">{p.reviewCount + reviews.filter((r) => !r.seed).length} ulasan</span>
          </button>

          <div className="mt-5">
            <Price price={p.price} compareAt={p.compareAt} size="text-3xl" />
            <p className="mt-0.5 text-sm text-ink/45">
              per {p.weight >= 1000 ? `${p.weight / 1000} kg` : `${p.weight} g`} · {formatIDR(pricePerKg(p))}/kg
            </p>
          </div>

          <p className="mt-5 leading-relaxed text-ink/70">{p.desc}</p>

          {p.bundle && (
            <div className="mt-5 rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
              <p className="text-sm font-semibold">Isi paket</p>
              <ul className="mt-3 space-y-3">
                {p.bundle.map((b) => {
                  const bp = getProduct(b.sku);
                  return (
                    <li key={b.sku}>
                      <Link to={`/toko/${b.sku}`} className="flex items-center gap-3 hover:text-coral">
                        <Photo src={bp?.image} alt={bp?.name} className="h-12 w-12 rounded-lg" />
                        <span className="text-sm"><span className="font-semibold">{b.qty} × {bp?.name}</span> <span className="text-ink/45">· {bp?.weight} g</span></span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <p className="label">Potongan <span className="font-normal text-ink/45">· gratis</span></p>
            <div className="flex flex-wrap gap-2">
              {p.prep.map((id) => (
                <button
                  key={id}
                  onClick={() => setPrep(id)}
                  aria-pressed={prep === id}
                  title={PREP_OPTIONS[id].hint}
                  className={`rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${prep === id ? "border-ink bg-ink text-white" : "border-ink/15 bg-white hover:border-ink/40"}`}
                >
                  <span className="block font-semibold">{PREP_OPTIONS[id].label}</span>
                  <span className={`block text-xs ${prep === id ? "text-white/60" : "text-ink/45"}`}>{PREP_OPTIONS[id].hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <QtyStepper value={q} onChange={setQty} min={1} max={Math.max(1, stock)} />
            <span className={`text-sm ${stock <= 5 ? "font-semibold text-coral" : "text-ink/45"}`}>{stock === 0 ? "Stok habis" : `Stok ${stock}`}</span>
          </div>
          <div className="mt-4 hidden gap-3 md:grid md:grid-cols-2">
            <button onClick={addNow} disabled={stock === 0} className="btn-outline py-3">Tambah ke keranjang</button>
            <button onClick={buyNow} disabled={stock === 0} className="btn-coral py-3">Beli sekarang · {formatIDR(p.price * q)}</button>
          </div>

          <ul className="mt-7 grid gap-3 border-t border-ink/10 pt-6 text-sm text-ink/60 sm:grid-cols-2">
            <li className="flex items-center gap-2"><Icon name="truck" className="h-4 w-4 text-coral" /> Gratis ongkir reguler ≥ Rp150.000</li>
            <li className="flex items-center gap-2"><Icon name="clock" className="h-4 w-4 text-coral" /> Instan cold-box ± 2 jam</li>
            <li className="flex items-center gap-2"><Icon name="snow" className="h-4 w-4 text-coral" /> Dikemas vakum + ice gel</li>
            <li className="flex items-center gap-2"><Icon name="shield" className="h-4 w-4 text-coral" /> Tidak segar? Ganti baru</li>
          </ul>
        </div>
      </div>

      <div className="mt-14">
        <Tabs
          items={[
            { id: "info", label: "Tentang cut" },
            { id: "simpan", label: "Penyimpanan" },
            { id: "gizi", label: "Nilai gizi" },
            { id: "ulasan", label: "Ulasan", count: reviews.length },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className="card mt-4 p-6">
          {tab === "info" && cut && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-display text-lg font-bold">{cut.name} <span className="font-medium text-ink/40">· {cut.en}</span></h3>
                <p className="text-sm text-ink/45">{cut.region}</p>
                <p className="mt-3 leading-relaxed text-ink/70">{cut.char}</p>
                <p className="mt-3 text-sm"><span className="font-semibold">Cara masak terbaik:</span> <span className="text-ink/65">{cut.method}</span></p>
              </div>
              <div className="space-y-3 text-sm">
                <p className="rounded-xl bg-mintsoft p-4 leading-relaxed"><span className="font-semibold">Tips:</span> {cut.tip}</p>
                <p className="rounded-xl bg-coralsoft p-4 leading-relaxed"><span className="font-semibold text-coral">Hindari:</span> {cut.mistake}</p>
                <Link to="/belajar" className="inline-block font-semibold text-coral hover:underline">Pelajari semua cut</Link>
              </div>
            </div>
          )}
          {tab === "simpan" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Info title="Kulkas 0–4°C" text={`Tahan ± ${shelfDays("chiller", p.ground)} hari. Simpan di rak paling bawah dalam wadah tertutup.`} />
              <Info title="Freezer −18°C" text={`Tahan ± ${Math.round(shelfDays("freezer", p.ground) / 30)} bulan. Bungkus rapat agar tidak freezer burn.`} />
              <Info title="Mencairkan" text="Pindahkan ke kulkas semalaman. Jangan dicairkan di suhu ruang." />
              <p className="text-xs text-ink/45 sm:col-span-3">
                Setelah pesanan tiba, masukkan ke <Link to="/kulkas" className="font-semibold text-coral">Kulkas Saya</Link> agar batas simpannya dipantau otomatis.
              </p>
            </div>
          )}
          {tab === "gizi" && nutrition && (
            <div>
              <p className="text-sm text-ink/50">Perkiraan per 100 g mentah</p>
              <div className="mt-3 grid max-w-md grid-cols-3 gap-3 text-center">
                {[["Kalori", nutrition.kcal, "kkal"], ["Protein", nutrition.protein, "g"], ["Lemak", nutrition.fat, "g"]].map(([l, v, u]) => (
                  <div key={l} className="rounded-xl bg-creamsoft p-4">
                    <p className="text-xs text-ink/50">{l}</p>
                    <p className="font-display text-2xl font-bold">{v}</p>
                    <p className="text-xs text-ink/45">{u}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "ulasan" && <Reviews p={p} reviews={reviews} />}
        </div>
      </div>

      {recipes.length > 0 && (
        <section className="mt-14">
          <SectionHeader title="Masak jadi apa?" desc={`Resep yang cocok untuk ${cut?.name}`} to="/resep" />
          <div className="mt-5 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r) => <RecipeCard key={r.id} r={r} />)}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-14">
          <SectionHeader title="Produk serupa" to={`/toko?kategori=${p.category}`} />
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {related.map((x) => <ProductCard key={x.sku} product={x} />)}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-[62px] z-30 flex items-center gap-3 border-t border-ink/5 bg-white px-4 py-3 shadow-soft md:hidden">
        <div className="flex-1">
          <p className="text-xs text-ink/45">{q} × {PREP_OPTIONS[prep].label}</p>
          <p className="font-display text-lg font-bold">{formatIDR(p.price * q)}</p>
        </div>
        <button onClick={addNow} disabled={stock === 0} className="btn-outline btn-sm" aria-label="Tambah ke keranjang"><Icon name="cart" className="h-4 w-4" /></button>
        <button onClick={buyNow} disabled={stock === 0} className="btn-coral btn-sm px-6">Beli</button>
      </div>
    </div>
  );
}

function Info({ title, text }) {
  return (
    <div className="rounded-xl bg-creamsoft p-4">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink/60">{text}</p>
    </div>
  );
}

function Reviews({ p, reviews }) {
  const [filter, setFilter] = useState(0);
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => r.rating === s).length }));
  const shown = filter ? reviews.filter((r) => r.rating === filter) : reviews;
  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div>
        <p className="font-display text-5xl font-bold">{p.rating}</p>
        <Stars value={p.rating} size="h-5 w-5" />
        <p className="mt-1 text-sm text-ink/50">{p.reviewCount} ulasan terverifikasi</p>
        <div className="mt-4 space-y-1">
          {dist.map(({ s, n }) => (
            <button key={s} onClick={() => setFilter(filter === s ? 0 : s)} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1 text-sm ${filter === s ? "bg-ink/5" : "hover:bg-ink/5"}`}>
              <span className="w-4 font-semibold">{s}</span>
              <span className="track flex-1">
                <span className="block h-full rounded-full bg-amber-400" style={{ width: `${reviews.length ? (n / reviews.length) * 100 : 0}%` }} />
              </span>
              <span className="w-5 text-right text-ink/45">{n}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink/45">Ulasan ditulis dari halaman pesanan setelah pesanan tiba.</p>
      </div>
      <ul className="divide-y divide-ink/5 md:col-span-2">
        {shown.map((r) => (
          <li key={r.id} className="py-4 first:pt-0">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-cream text-sm font-semibold">{r.user[0]}</span>
              <div>
                <p className="text-sm font-semibold">{r.user} {!r.seed && <span className="badge ml-1 bg-mintsoft text-mint">Ulasan kamu</span>}</p>
                <Stars value={r.rating} size="h-3 w-3" />
              </div>
              <span className="ml-auto text-xs text-ink/40">{new Date(r.date).toLocaleDateString("id-ID")}</span>
            </div>
            {r.text && <p className="mt-2 text-sm leading-relaxed text-ink/70">{r.text}</p>}
          </li>
        ))}
        {shown.length === 0 && <li className="text-sm text-ink/45">Belum ada ulasan dengan rating ini.</li>}
      </ul>
    </div>
  );
}
