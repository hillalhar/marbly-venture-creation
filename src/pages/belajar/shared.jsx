// Small building blocks shared by the Belajar modules.
import { CUTS } from "../../data/meat.js";
import { pricePerKg, productsForCut } from "../../data/products.js";
import Icon from "../../components/icons.jsx";

export const FAT_LEVEL = { Rendah: 1, Sedang: 2, "Sedang-tinggi": 3, Tinggi: 4 };
export const getCut = (id) => CUTS.find((c) => c.id === id);

// Cheapest single (non-bundle) product for a cut, used for price & photo.
export function mainProduct(cutId) {
  const list = productsForCut(cutId);
  return list.length ? [...list].sort((a, b) => pricePerKg(a) - pricePerKg(b))[0] : null;
}

export function Meter({ label, value, max = 5, tone = "bg-coral", right }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink/55">{label}</span>
        <span className="font-semibold">{right ?? `${value}/${max}`}</span>
      </div>
      <div className="track mt-1.5">
        <div className={`h-full rounded-full ${tone} transition-all duration-500`} style={{ width: `${Math.max(4, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}

export function Panel({ children, className = "" }) {
  return <div className={`rounded-xl3 bg-white p-5 ring-1 ring-ink/10 sm:p-6 ${className}`}>{children}</div>;
}

export function Lesson({ title = "Intinya", children }) {
  return (
    <div className="flex gap-3 rounded-xl2 bg-sun/60 p-4 text-sm leading-relaxed text-ink/75">
      <Icon name="sparkle" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}
