import { useState } from "react";
import { Link } from "react-router-dom";
import { CUTS } from "../../data/meat.js";
import { formatIDR, pricePerKg } from "../../data/products.js";
import { recipesForCut } from "../../data/recipes.js";
import { recipePath } from "../../lib/links.js";
import CowDiagram from "../../components/CowDiagram.jsx";
import Icon from "../../components/icons.jsx";
import { Photo, useAddToCart } from "../../components/ProductCard.jsx";
import { FAT_LEVEL, Lesson, mainProduct, Meter, Panel } from "./shared.jsx";

export default function PetaModule({ goTo }) {
  const [activeId, setActiveId] = useState("ribeye");
  const cut = CUTS.find((c) => c.id === activeId) || CUTS[0];
  const product = mainProduct(cut.id);
  const recipes = recipesForCut(cut.id);
  const addToCart = useAddToCart();

  const ladder = [...CUTS].sort((a, b) => b.tenderness - a.tenderness);

  return (
    <div className="space-y-6">

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <CowDiagram activeId={activeId} onSelect={setActiveId} />
          <div className="mt-5 flex flex-wrap gap-2">
            {CUTS.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                aria-pressed={c.id === activeId}
                className={`chip ${c.id === activeId ? "chip-active" : ""}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <div key={cut.id} className="animate-fadeIn">
            {product && <Photo src={product.image} alt={cut.name} className="aspect-[16/10] w-full rounded-xl2" />}
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-coral">{cut.region}</p>
            <h3 className="font-display text-2xl font-bold">
              {cut.name} <span className="text-base font-medium text-ink/40">· {cut.en}</span>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{cut.char}</p>

            <div className="mt-4 space-y-3">
              <Meter label="Keempukan" value={cut.tenderness} />
              <Meter label="Kadar lemak" value={FAT_LEVEL[cut.fat] || 2} max={4} tone="bg-amber-400" right={cut.fat} />
              <Meter label="Kelas harga" value={cut.price} tone="bg-ink/70" right={product ? `${formatIDR(pricePerKg(product))}/kg` : `${cut.price}/5`} />
            </div>

            <p className="mt-4 text-sm"><span className="font-semibold">Cara masak terbaik:</span> <span className="text-ink/65">{cut.method}</span></p>
            <p className="mt-3 rounded-xl bg-mintsoft p-3 text-sm leading-relaxed"><span className="font-semibold">Tips:</span> {cut.tip}</p>
            <p className="mt-2 rounded-xl bg-coralsoft p-3 text-sm leading-relaxed"><span className="font-semibold text-coral">Hindari:</span> {cut.mistake}</p>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink/45">Masakan populer</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {cut.dishes.map((d) => (
                <Link key={d} to={recipePath(d)} className="chip text-xs">{d}</Link>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {product && (
                <button onClick={() => addToCart(product, 1)} className="btn-coral btn-sm">
                  <Icon name="cart" className="h-4 w-4" /> Beli {cut.name}
                </button>
              )}
              <button onClick={() => goTo("banding")} className="btn-outline btn-sm">Bandingkan</button>
              {recipes[0] && <Link to={`/resep/${recipes[0].id}`} className="btn-ghost btn-sm">Resep {recipes[0].name}</Link>}
            </div>
          </div>
        </Panel>
      </div>

      {/* tenderness ladder */}
      <Panel>
        <h3 className="font-display text-lg font-bold">Tangga keempukan</h3>
        <p className="mt-1 text-sm text-ink/55">Kiri paling empuk, kanan paling berurat. Klik untuk membuka bagiannya di atas.</p>
        <div className="no-scrollbar mt-4 flex items-end gap-2 overflow-x-auto pb-1">
          {ladder.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveId(c.id);
                document.getElementById("modul")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="group flex min-w-[76px] flex-1 flex-col items-center gap-2"
              title={c.method}
            >
              <span
                className={`w-full rounded-t-xl transition-colors ${c.id === activeId ? "bg-coral" : "bg-coral/25 group-hover:bg-coral/50"}`}
                style={{ height: `${c.tenderness * 22 + 10}px` }}
              />
              <span className={`text-xs font-semibold ${c.id === activeId ? "text-coral" : "text-ink/65"}`}>{c.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-ink/40">
          <span>Masak cepat: steak, grill</span>
          <span>Masak lama: rebus, ungkep</span>
        </div>
      </Panel>

      <Lesson title="Intinya">
        Otot yang jarang bergerak (punggung: has dalam, has luar, lamusir) empuk dan cocok dimasak cepat. Otot yang bekerja keras (kaki, dada, ekor) kaya kolagen, jadi butuh dimasak lama sampai kolagennya lumer.
      </Lesson>
    </div>
  );
}
