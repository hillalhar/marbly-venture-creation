// Small building blocks shared by the Alat tools.
import { getProduct, pricePerKg, productsForCut } from "../../data/products.js";

export function Field({ label, children, hint, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink/45">{hint}</p>}
    </div>
  );
}

export function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
        active ? "border-ink bg-ink text-white" : "border-ink/10 bg-white text-ink/75 hover:border-ink/30"
      }`}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`rounded-xl3 bg-white p-5 ring-1 ring-ink/10 sm:p-6 ${className}`}>{children}</div>;
}

export function Highlight({ children, className = "" }) {
  return <div className={`rounded-xl3 bg-coralsoft p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function Note({ children }) {
  return <p className="text-xs leading-relaxed text-ink/50">{children}</p>;
}

export const kgLabel = (g) =>
  g >= 1000 ? `${(Math.round(g / 100) / 10).toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg` : `${Math.round(g)} g`;

// Product to buy for a recipe/cut: the recipe's own product, else the cheapest for the cut.
export function productFor(recipe) {
  return getProduct(recipe.productSku) || [...productsForCut(recipe.cutId)].sort((a, b) => pricePerKg(a) - pricePerKg(b))[0] || null;
}

// Turn a { sku: grams } map into cart lines (packs, cost).
export function toShoppingLines(gramsBySku, prepBySku = {}) {
  return Object.entries(gramsBySku)
    .filter(([, g]) => g > 0)
    .map(([sku, g]) => {
      const p = getProduct(sku);
      const packs = Math.max(1, Math.ceil(g / p.weight));
      return { product: p, grams: g, packs, cost: packs * p.price, prep: prepBySku[sku] };
    })
    .sort((a, b) => b.cost - a.cost);
}
