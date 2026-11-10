import { useState } from "react";
import { Link } from "react-router-dom";
import { discountPct, formatIDR, getProduct, pricePerKg } from "../data/products.js";
import { useCart } from "../lib/cart.jsx";
import { useFavorites } from "../lib/favorites.jsx";
import { useToast } from "../lib/toast.jsx";
import { LogoMark } from "./Logo.jsx";
import Icon from "./icons.jsx";
import { Price } from "./ui.jsx";

// Product / recipe photo with a branded fallback if the file is missing.
export function Photo({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-coralsoft to-cream ${className}`} role="img" aria-label={alt}>
        <LogoMark className="h-1/3 w-1/3 opacity-60" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}

export function ProductThumb({ sku, className = "h-16 w-16" }) {
  const p = getProduct(sku);
  return <Photo src={p?.image} alt={p?.name || ""} className={`shrink-0 rounded-xl ${className}`} />;
}

export function useAddToCart() {
  const { add } = useCart();
  const toast = useToast();
  return (product, qty = 1, prep) => {
    const res = add(product.sku, qty, prep);
    if (res.added > 0) {
      toast(res.capped ? `${res.added} × ${product.name} ditambahkan (stok terbatas)` : `${res.added} × ${product.name} masuk keranjang`, {
        action: { label: "Lihat", to: "/keranjang" },
      });
    } else {
      toast("Stok tidak cukup untuk menambah lagi.", { tone: "error" });
    }
    return res;
  };
}

export function FavButton({ type, id, name, className = "" }) {
  const { has, toggle } = useFavorites();
  const toast = useToast();
  const saved = has(type, id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const now = toggle(type, id);
        toast(now ? `${name} disimpan ke favorit` : `${name} dihapus dari favorit`, { tone: "info" });
      }}
      aria-pressed={saved}
      aria-label={saved ? "Hapus dari favorit" : "Simpan ke favorit"}
      className={`grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-card backdrop-blur transition-transform hover:scale-105 ${className}`}
    >
      <Icon name="heart" filled={saved} className={`h-[18px] w-[18px] ${saved ? "text-coral" : "text-ink/60"}`} />
    </button>
  );
}

export default function ProductCard({ product: p }) {
  const { available } = useCart();
  const addToCart = useAddToCart();
  const stock = available(p.sku);
  const off = discountPct(p);

  return (
    <div className="group relative flex flex-col">
      <Link to={`/toko/${p.sku}`} className="flex flex-1 flex-col" aria-label={p.name}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl2 bg-cream">
          <Photo src={p.image} alt={p.name} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute left-2.5 top-2.5 flex gap-1.5">
            {off > 0 && <span className="badge bg-coral text-white">-{off}%</span>}
            {p.bundle && <span className="badge bg-white/95 text-ink">Paket</span>}
          </div>
          {stock === 0 ? (
            <span className="absolute inset-0 grid place-items-center bg-white/60 text-sm font-semibold">Stok habis</span>
          ) : (
            stock <= 5 && <span className="badge absolute bottom-2.5 left-2.5 bg-ink/80 text-white">Sisa {stock}</span>
          )}
        </div>
        <div className="flex flex-1 flex-col pt-3">
          <p className="text-xs font-medium text-ink/45">
            {p.weight >= 1000 ? `${p.weight / 1000} kg` : `${p.weight} g`} · {p.grade}
          </p>
          <h3 className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug group-hover:text-coral">{p.name}</h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-ink/50">
            <Icon name="star" filled strokeWidth={1} className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold text-ink/70">{p.rating}</span>
            <span>({p.reviewCount})</span>
          </div>
          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <div>
              <Price price={p.price} compareAt={p.compareAt} size="text-base" />
              <p className="text-[11px] text-ink/40">{formatIDR(pricePerKg(p))}/kg</p>
            </div>
          </div>
        </div>
      </Link>
      <FavButton type="products" id={p.sku} name={p.name} className="absolute right-2.5 top-2.5" />
      <button
        onClick={() => addToCart(p, 1)}
        disabled={stock === 0}
        aria-label={`Tambah ${p.name} ke keranjang`}
        className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-ink text-white transition-colors hover:bg-coral disabled:bg-ink/20"
      >
        <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} />
      </button>
    </div>
  );
}
