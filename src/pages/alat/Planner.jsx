import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getRecipe, meatPerServing, RECIPES, recipesForCut, scaleQty } from "../../data/recipes.js";
import { formatIDR } from "../../data/products.js";
import { DAY } from "../../data/tools.js";
import { useAuth } from "../../lib/auth.jsx";
import { useCart } from "../../lib/cart.jsx";
import { useFridge } from "../../lib/fridge.jsx";
import { uid } from "../../lib/storage.js";
import { useToast } from "../../lib/toast.jsx";
import { useUserStore } from "../../lib/userStore.js";
import Icon from "../../components/icons.jsx";
import { Photo, ProductThumb } from "../../components/ProductCard.jsx";
import { QtyStepper } from "../../components/ui.jsx";
import { Card, kgLabel, Note, productFor, toShoppingLines } from "./shared.jsx";

const pad = (n) => String(n).padStart(2, "0");
const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function nextDays(n = 7) {
  const base = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    return {
      iso: isoOf(d),
      start: d.getTime(),
      day: i === 0 ? "Hari ini" : i === 1 ? "Besok" : d.toLocaleDateString("id-ID", { weekday: "long" }),
      date: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    };
  });
}

// Allocate fridge stock to planned meals (earliest meal first, earliest-expiring
// stock first, skipping stock that expires before the meal's day), then turn
// what's left into a shopping list.
function planMath(meals, fridgeItems, days) {
  const stock = fridgeItems
    .filter((i) => i.expiresAt > Date.now())
    .map((i) => ({ ...i, left: i.grams }))
    .sort((a, b) => a.expiresAt - b.expiresAt);
  const dayStart = Object.fromEntries(days.map((d) => [d.iso, d.start]));

  const rows = [...meals]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => {
      const r = getRecipe(m.recipeId);
      if (!r) return null;
      const need = Math.round(meatPerServing(r) * m.serves);
      let remaining = need;
      const cookAt = (dayStart[m.date] ?? Date.now()) + 12 * 3600e3;
      for (const s of stock) {
        if (remaining <= 0) break;
        if (s.cutId !== r.cutId || s.left <= 0 || s.expiresAt < cookAt) continue;
        const take = Math.min(s.left, remaining);
        s.left -= take;
        remaining -= take;
      }
      const product = productFor(r);
      return { meal: m, recipe: r, need, fromFridge: need - remaining, buy: remaining, product };
    })
    .filter(Boolean);

  const grams = {};
  const prep = {};
  rows.forEach((x) => {
    if (x.buy > 0 && x.product) {
      grams[x.product.sku] = (grams[x.product.sku] || 0) + x.buy;
      if (x.recipe.prep && x.product.prep.includes(x.recipe.prep)) prep[x.product.sku] = x.recipe.prep;
    }
  });

  // other ingredients, merged per recipe
  const extras = {};
  rows.forEach((x) => {
    const e = (extras[x.recipe.id] = extras[x.recipe.id] || { recipe: x.recipe, serves: 0 });
    e.serves += x.meal.serves;
  });

  const soon = stock.filter((s) => s.left > 0 && s.expiresAt - Date.now() <= 3 * DAY);
  return { rows, shopping: toShoppingLines(grams, prep), extras: Object.values(extras), soon };
}

export default function Planner() {
  const { user } = useAuth();
  const { items: fridge } = useFridge();
  const { add } = useCart();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [plan, setPlan] = useUserStore(user?.email, "mealplan", { meals: [] });
  const [adding, setAdding] = useState(null); // iso date being edited
  const [pick, setPick] = useState(RECIPES[0].id);
  const [got, setGot] = useState({});

  const days = useMemo(() => nextDays(7), []);
  const meals = useMemo(() => plan.meals.filter((m) => m.date >= days[0].iso && m.date <= days[6].iso), [plan.meals, days]);
  const math = useMemo(() => planMath(meals, fridge, days), [meals, fridge, days]);
  const total = math.shopping.reduce((n, l) => n + l.cost, 0);
  const incoming = getRecipe(params.get("resep"));

  function addMeal(date, recipeId) {
    const r = getRecipe(recipeId);
    setPlan((p) => ({ meals: [...p.meals.filter((m) => m.date >= days[0].iso), { id: uid("M"), date, recipeId, serves: r.serves }] }));
    setAdding(null);
    toast(`${r.name} direncanakan untuk ${days.find((d) => d.iso === date)?.day.toLowerCase()}`, { tone: "info" });
  }
  const setServes = (id, serves) => setPlan((p) => ({ meals: p.meals.map((m) => (m.id === id ? { ...m, serves } : m)) }));
  const removeMeal = (id) => setPlan((p) => ({ meals: p.meals.filter((m) => m.id !== id) }));

  function addAll() {
    let packs = 0;
    math.shopping.forEach((l) => (packs += add(l.product.sku, l.packs, l.prep).added));
    if (packs > 0) toast(`${packs} pak daging masuk keranjang`, { action: { label: "Lihat", to: "/keranjang" } });
    else toast("Stok toko tidak cukup untuk daftar ini.", { tone: "error" });
  }

  function copyList() {
    const lines = [
      "Daftar belanja marbly",
      ...math.shopping.map((l) => `- ${l.packs} × ${l.product.name} (${kgLabel(l.grams)})`),
      ...math.extras.flatMap((e) => [`\n${e.recipe.name} (${e.serves} porsi):`, ...e.recipe.ingredients.slice(1).map((i) => `- ${i.item}: ${scaleQty(i.qty, e.serves / e.recipe.serves)}`)]),
    ].join("\n");
    navigator.clipboard?.writeText(lines).then(() => toast("Daftar belanja disalin", { tone: "info" }), () => toast("Gagal menyalin", { tone: "error" }));
  }

  return (
    <div className="space-y-6">
      {incoming && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl2 bg-coralsoft p-4">
          <Photo src={incoming.image} alt={incoming.name} className="h-12 w-12 rounded-xl" />
          <p className="flex-1 text-sm">
            Masak <span className="font-semibold">{incoming.name}</span> hari apa?
          </p>
          <div className="flex flex-wrap gap-1.5">
            {days.map((d) => (
              <button
                key={d.iso}
                onClick={() => {
                  addMeal(d.iso, incoming.id);
                  setParams({ tab: "rencana" }, { replace: true });
                }}
                className="chip bg-white text-xs"
              >
                {d.day}
              </button>
            ))}
          </div>
          <button onClick={() => setParams({ tab: "rencana" }, { replace: true })} className="btn-ghost px-2" aria-label="Batal">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-5">
        {/* week */}
        <div className="space-y-3 xl:col-span-3">
          {days.map((d) => {
            const list = math.rows.filter((x) => x.meal.date === d.iso);
            return (
              <Card key={d.iso} className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p>
                    <span className="font-display text-lg font-bold">{d.day}</span>
                    <span className="ml-2 text-sm text-ink/45">{d.date}</span>
                  </p>
                  {adding !== d.iso && (
                    <button onClick={() => { setAdding(d.iso); setPick(RECIPES[0].id); }} className="btn-ghost btn-sm">
                      <Icon name="plus" className="h-4 w-4" /> Menu
                    </button>
                  )}
                </div>

                {list.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {list.map((x) => (
                      <li key={x.meal.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-creamsoft p-2.5">
                        <Photo src={x.recipe.image} alt={x.recipe.name} className="h-12 w-12 rounded-lg" />
                        <div className="min-w-0 flex-1">
                          <Link to={`/resep/${x.recipe.id}`} className="block truncate font-semibold hover:text-coral">{x.recipe.name}</Link>
                          <p className="text-xs text-ink/55">
                            Butuh {kgLabel(x.need)}
                            {x.fromFridge > 0 && <span className="text-mint"> · {kgLabel(x.fromFridge)} dari kulkas</span>}
                            {x.buy > 0 && <span> · beli {kgLabel(x.buy)}</span>}
                          </p>
                        </div>
                        <QtyStepper size="sm" value={x.meal.serves} onChange={(v) => setServes(x.meal.id, v)} min={1} max={50} />
                        <button onClick={() => removeMeal(x.meal.id)} className="btn-ghost px-2 text-ink/40" aria-label={`Hapus ${x.recipe.name}`}>
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {adding === d.iso && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <select value={pick} onChange={(e) => setPick(e.target.value)} className="input min-w-48 flex-1" aria-label="Pilih resep">
                      {RECIPES.map((r) => <option key={r.id} value={r.id}>{r.name} · {r.serves} porsi</option>)}
                    </select>
                    <button onClick={() => addMeal(d.iso, pick)} className="btn-coral btn-sm">Tambah</button>
                    <button onClick={() => setAdding(null)} className="btn-ghost btn-sm">Batal</button>
                  </div>
                )}
                {list.length === 0 && adding !== d.iso && <p className="mt-1 text-sm text-ink/35">Belum ada menu.</p>}
              </Card>
            );
          })}
        </div>

        {/* shopping */}
        <div className="space-y-4 xl:col-span-2 xl:sticky xl:top-24 xl:self-start">
          <Card>
            <p className="font-display text-lg font-bold">Daftar belanja daging</p>
            {math.rows.length === 0 ? (
              <p className="mt-2 text-sm text-ink/50">Tambahkan menu di kiri. Daftar belanja dihitung otomatis setelah dikurangi stok Kulkas Saya.</p>
            ) : math.shopping.length === 0 ? (
              <p className="mt-2 rounded-xl bg-mintsoft p-3 text-sm">Semua daging untuk rencana ini sudah ada di kulkas. Tidak perlu belanja.</p>
            ) : (
              <>
                <ul className="mt-3 divide-y divide-ink/5">
                  {math.shopping.map((l) => (
                    <li key={l.product.sku} className="flex items-center gap-3 py-2.5">
                      <ProductThumb sku={l.product.sku} className="h-11 w-11" />
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="truncate font-semibold">{l.packs} × {l.product.name}</p>
                        <p className="text-xs text-ink/50">Butuh {kgLabel(l.grams)} · {l.product.weight} g/pak</p>
                      </div>
                      <span className="text-sm font-semibold">{formatIDR(l.cost)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex justify-between border-t border-ink/10 pt-3 font-display text-lg font-bold">
                  <span>Total</span>
                  <span>{formatIDR(total)}</span>
                </div>
                <button onClick={addAll} className="btn-coral mt-4 w-full">
                  <Icon name="cart" className="h-4 w-4" /> Masukkan semua ke keranjang
                </button>
              </>
            )}
          </Card>

          {math.extras.length > 0 && (
            <Card>
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-lg font-bold">Bahan pelengkap</p>
                <button onClick={copyList} className="btn-ghost btn-sm">Salin daftar</button>
              </div>
              <div className="mt-3 space-y-4">
                {math.extras.map((e) => (
                  <div key={e.recipe.id}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">{e.recipe.name} · {e.serves} porsi</p>
                    <ul className="mt-1.5 space-y-1">
                      {e.recipe.ingredients.slice(1).map((ing) => {
                        const k = `${e.recipe.id}:${ing.item}`;
                        return (
                          <li key={k}>
                            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                              <input type="checkbox" checked={!!got[k]} onChange={(ev) => setGot({ ...got, [k]: ev.target.checked })} className="h-4 w-4 accent-coral" />
                              <span className={`flex-1 ${got[k] ? "text-ink/35 line-through" : "text-ink/75"}`}>{ing.item}</span>
                              <span className="text-ink/50">{scaleQty(ing.qty, e.serves / e.recipe.serves)}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {math.soon.length > 0 && (
            <Card className="bg-sun/40 ring-amber-200">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Icon name="alert" className="h-4 w-4 text-amber-600" /> Stok kulkas yang perlu segera dimasak
              </p>
              <ul className="mt-2 space-y-2 text-sm">
                {math.soon.map((s) => {
                  const r = recipesForCut(s.cutId)[0];
                  return (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-ink/75">{s.name} · {kgLabel(s.left)}</span>
                      {r && <button onClick={() => addMeal(days[0].iso, r.id)} className="text-xs font-semibold text-coral hover:underline">+ {r.name} hari ini</button>}
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
          <Note>Kebutuhan daging dihitung dari takaran resep per porsi. Stok kulkas yang kedaluwarsa sebelum hari masak tidak dihitung.</Note>
        </div>
      </div>
    </div>
  );
}
