import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRecipe, RECIPES, scaleQty, stepMinutes } from "../data/recipes.js";
import { formatIDR, getProduct } from "../data/products.js";
import { CUTS } from "../data/meat.js";
import { useAuth } from "../lib/auth.jsx";
import { useFridge } from "../lib/fridge.jsx";
import { usePageTitle } from "../lib/hooks.js";
import { useToast } from "../lib/toast.jsx";
import { FavButton, Photo, ProductThumb, useAddToCart } from "../components/ProductCard.jsx";
import { RecipeCard } from "./Resep.jsx";
import { Breadcrumb, EmptyState, PremiumHint, PremiumLock, QtyStepper } from "../components/ui.jsx";
import Icon from "../components/icons.jsx";
import { useTimers } from "../lib/timers.jsx";

const DIFF = ["Mudah", "Sedang", "Mahir"];

export default function ResepDetail() {
  const { id } = useParams();
  const recipe = getRecipe(id);
  usePageTitle(recipe?.name || "Resep");
  if (!recipe) {
    return (
      <div className="page">
        <EmptyState icon="🤔" title="Resep tidak ditemukan" action={<Link to="/resep" className="btn-coral btn-sm">Lihat semua resep</Link>} />
      </div>
    );
  }
  return <Detail key={recipe.id} recipe={recipe} />;
}

function Detail({ recipe }) {
  const { isPremium, upgradeToPremium } = useAuth();
  const { items: fridgeAll, consume } = useFridge();
  const fridge = isPremium ? fridgeAll.filter((i) => i.expiresAt > Date.now()) : [];
  const { add: addTimer } = useTimers();
  const addToCart = useAddToCart();
  const toast = useToast();
  const [serves, setServes] = useState(recipe.serves);
  const [cooking, setCooking] = useState(false);
  const [checked, setChecked] = useState({});
  const [have, setHave] = useState({});

  const factor = serves / recipe.serves;
  const cut = CUTS.find((c) => c.id === recipe.cutId);
  const product = recipe.productSku ? getProduct(recipe.productSku) : null;
  const prep = product && recipe.prep && product.prep.includes(recipe.prep) ? recipe.prep : product?.prep[0];
  const meatGrams = recipe.meatGrams * factor;
  const packs = product ? Math.max(1, Math.ceil(meatGrams / product.weight)) : 0;
  const inFridge = fridge.filter((i) => i.cutId === recipe.cutId).sort((a, b) => a.expiresAt - b.expiresAt);
  const fridgeGrams = inFridge.reduce((n, i) => n + i.grams, 0);
  const doneSteps = Object.values(checked).filter(Boolean).length;
  const others = RECIPES.filter((r) => r.id !== recipe.id).slice(0, 3);

  function markCooked() {
    let need = Math.round(meatGrams);
    for (const i of inFridge) {
      if (need <= 0) break;
      const take = Math.min(i.grams, need);
      consume(i.id, take);
      need -= take;
    }
    toast(`Stok kulkas dikurangi ${Math.round(meatGrams - Math.max(0, need))} g. Selamat makan! 🍽️`, { action: { label: "Kulkas", to: "/kulkas" } });
    setCooking(false);
    setChecked({});
  }

  return (
    <div className="page">
      <Breadcrumb items={[{ to: "/resep", label: "Resep" }, { label: recipe.name }]} />

      <header className="mt-5 grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
        <div className="relative">
          <Photo src={recipe.image} alt={recipe.name} className="aspect-[4/3] w-full rounded-xl3" />
          <FavButton type="recipes" id={recipe.id} name={recipe.name} className="absolute right-4 top-4 h-10 w-10" />
        </div>
        <div>
          <p className="eyebrow">{cut ? `Resep ${cut.name}` : "Resep"}</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{recipe.name}</h1>
          <p className="mt-3 leading-relaxed text-ink/65">{recipe.summary}</p>
          <dl className="mt-6 grid max-w-md grid-cols-3 divide-x divide-ink/10 rounded-xl2 bg-white py-3 text-center ring-1 ring-ink/10">
            <div><dt className="text-xs text-ink/45">Waktu</dt><dd className="font-semibold">{recipe.time} mnt</dd></div>
            <div><dt className="text-xs text-ink/45">Tingkat</dt><dd className="font-semibold">{DIFF[recipe.difficulty - 1]}</dd></div>
            <div><dt className="text-xs text-ink/45">Rasa</dt><dd className="font-semibold">{recipe.spicy ? "Pedas" : "Gurih"}</dd></div>
          </dl>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold">Bahan</h2>
              <div className="flex items-center gap-2 text-sm font-bold">
                <span className="text-ink/60">Porsi</span>
                <QtyStepper size="sm" value={serves} onChange={setServes} min={1} max={30} />
              </div>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-cream">
                    <input type="checkbox" checked={!!have[i]} onChange={(e) => setHave({ ...have, [i]: e.target.checked })} className="h-4 w-4 accent-coral" />
                    <span className={`flex-1 ${have[i] ? "text-ink/40 line-through" : ""}`}>{ing.item}</span>
                    <span className="font-bold text-ink/70">{scaleQty(ing.qty, factor)}</span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink/50">Centang bahan yang sudah ada di dapur.</p>
          </section>

          {product && (
            <section className="card p-5">
              <h2 className="font-display text-lg font-bold">Bahan utama untuk {serves} porsi</h2>
              {isPremium && fridgeGrams > 0 && (
                <p className="mt-2 rounded-xl bg-mintsoft px-3 py-2 text-sm">
                  Di kulkasmu ada <strong>{fridgeGrams} g</strong> {cut?.name}.{" "}
                  {fridgeGrams >= meatGrams ? "Cukup untuk resep ini." : `Kurang ± ${Math.round(meatGrams - fridgeGrams)} g.`}
                </p>
              )}
              <Link to={`/toko/${product.sku}`} className="mt-3 flex items-center gap-3 rounded-xl bg-creamsoft p-3 hover:bg-cream">
                <ProductThumb sku={product.sku} className="h-12 w-12" />
                <span className="flex-1">
                  <span className="block font-bold">{product.name}</span>
                  <span className="block text-xs text-ink/60">{packs} × {product.weight} g · {formatIDR(product.price)}/pak</span>
                </span>
              </Link>
              <button onClick={() => addToCart(product, packs, prep)} className="btn-coral mt-3 w-full">
                + {packs} pak ke keranjang · {formatIDR(product.price * packs)}
              </button>
              {isPremium ? (
                <Link to={`/alat?tab=rencana&resep=${recipe.id}`} className="btn-outline btn-sm mt-2 w-full">
                  <Icon name="clock" className="h-4 w-4" /> Masukkan ke rencana masak
                </Link>
              ) : (
                <PremiumHint className="mt-3">Cek stok kulkas &amp; rencanakan menu mingguan</PremiumHint>
              )}
            </section>
          )}
        </div>

        <div className="space-y-6 lg:col-span-3">
          {!isPremium ? (
            <PremiumLock
              onUpgrade={upgradeToPremium}
              title="Langkah memasak khusus Premium"
              desc="Buka langkah lengkap, mode masak dengan checklist, tips penyajian, dan saran teman makan."
              features={["👩‍🍳 Langkah demi langkah + mode masak", "💡 Tips penyajian", "🍽️ Saran teman makan"]}
            />
          ) : (
            <>
              <section className={`card p-5 ${cooking ? "ring-4 ring-coral/40" : ""}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-bold">Langkah</h2>
                  <button onClick={() => { setCooking((c) => !c); setChecked({}); }} className={cooking ? "btn-outline btn-sm" : "btn-coral btn-sm"}>
                    {cooking ? "Keluar mode masak" : "Mulai mode masak"}
                  </button>
                </div>
                {cooking && (
                  <div className="mt-3">
                    <div className="track">
                      <div className="h-full rounded-full bg-mint transition-all" style={{ width: `${(doneSteps / recipe.steps.length) * 100}%` }} />
                    </div>
                    <p className="mt-1 text-xs font-bold text-ink/60">{doneSteps}/{recipe.steps.length} langkah selesai · layar tetap di halaman ini</p>
                  </div>
                )}
                <ol className="mt-4 space-y-3">
                  {recipe.steps.map((s, i) => {
                    const done = !!checked[i];
                    const Tag = cooking ? "button" : "div";
                    const mins = stepMinutes(s);
                    return (
                      <li key={i}>
                        <Tag
                          {...(cooking ? { type: "button", onClick: () => setChecked({ ...checked, [i]: !done }) } : {})}
                          className={`flex w-full gap-3 rounded-2xl p-2 text-left ${cooking ? "hover:bg-cream" : ""} ${cooking && done ? "opacity-50" : ""}`}
                        >
                          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/10 font-display text-sm font-bold ${done ? "bg-mint text-white" : "bg-sun"}`}>
                            {done ? "✓" : i + 1}
                          </span>
                          <span className={`pt-1 ${cooking ? "text-lg" : ""} ${done ? "line-through" : "text-ink/80"}`}>{s}</span>
                        </Tag>
                        {mins && (
                          <button
                            type="button"
                            onClick={() => addTimer(`${recipe.name}: langkah ${i + 1}`, mins)}
                            className="ml-[52px] mt-1 inline-flex items-center gap-1.5 rounded-full bg-creamsoft px-3 py-1 text-xs font-semibold text-ink/70 ring-1 ring-ink/10 hover:text-coral"
                          >
                            <Icon name="clock" className="h-3.5 w-3.5" /> Timer {mins >= 60 ? `${mins / 60} jam` : `${mins} menit`}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ol>
                {cooking && doneSteps === recipe.steps.length && (
                  <div className="mt-4 rounded-2xl bg-mintsoft p-4 text-center">
                    <p className="font-display text-lg font-bold">Selesai!</p>
                    {inFridge.length > 0 ? (
                      <button onClick={markCooked} className="btn-coral btn-sm mt-2">Kurangi {Math.round(Math.min(meatGrams, fridgeGrams))} g dari stok kulkas</button>
                    ) : (
                      <button onClick={() => { setCooking(false); setChecked({}); }} className="btn-outline btn-sm mt-2">Tutup</button>
                    )}
                  </div>
                )}
                <Link to="/alat?tab=timer" className="mt-4 inline-block text-sm font-bold text-coral hover:underline">Buka multi-timer →</Link>
              </section>

              <section className="card p-5">
                <h2 className="font-display text-lg font-bold">Tips penyajian</h2>
                <ul className="mt-3 space-y-2">
                  {recipe.servingTips.map((t, i) => (
                    <li key={i} className="flex gap-2 text-ink/80">
                      <span className="text-coral">▸</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="card p-5">
                <h2 className="font-display text-lg font-bold">Teman makan</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {recipe.pairings.map((p) => (
                    <span key={p} className="chip">{p}</span>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="h2">Resep lainnya</h2>
        <div className="mt-5 grid gap-x-5 gap-y-8 sm:grid-cols-3">
          {others.map((r) => <RecipeCard key={r.id} r={r} />)}
        </div>
      </section>
    </div>
  );
}
