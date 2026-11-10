import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatIDR, PRODUCTS } from "../data/products.js";
import { computeTotals, VOUCHERS } from "../data/shop.js";
import { useCart } from "../lib/cart.jsx";
import { usePageTitle } from "../lib/hooks.js";
import { useToast } from "../lib/toast.jsx";
import ProductCard, { ProductThumb } from "../components/ProductCard.jsx";
import Icon from "../components/icons.jsx";
import { EmptyState, QtyStepper, Row, SectionHeader } from "../components/ui.jsx";

const FREE_SHIP = 150000;

export default function Keranjang() {
  usePageTitle("Keranjang");
  const navigate = useNavigate();
  const toast = useToast();
  const { lines, setQty, remove, add, voucherCode, applyVoucher, removeVoucher, purchased } = useCart();
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const t = computeTotals(lines, null, voucherCode);
  const progress = Math.min(100, (t.subtotal / FREE_SHIP) * 100);

  function onRemove(l) {
    remove(l.key);
    toast(`${l.name} dihapus dari keranjang`, {
      tone: "info",
      duration: 5000,
      action: { label: "Urungkan", onClick: () => add(l.sku, l.qty, l.prep) },
    });
  }

  function submitVoucher(e) {
    e.preventDefault();
    const res = applyVoucher(code);
    if (res.ok) {
      setCode("");
      setCodeError("");
      toast(`Voucher ${res.code} dipakai`);
    } else setCodeError(res.error);
  }

  const inCart = new Set(lines.map((l) => l.sku));
  const suggestions = PRODUCTS.filter((p) => !inCart.has(p.sku))
    .sort((a, b) => (purchased[b.sku] || 0) - (purchased[a.sku] || 0) || b.reviewCount - a.reviewCount)
    .slice(0, 4);
  const suggestTitle = Object.keys(purchased).length ? "Sering kamu beli" : "Mungkin kamu suka";

  if (lines.length === 0) {
    return (
      <div className="page">
        <h1 className="h1">Keranjang</h1>
        <div className="mt-6">
          <EmptyState
            icon="🧺"
            title="Keranjang masih kosong"
            desc="Pilih daging favoritmu di toko. Bisa minta dipotong sesuai kebutuhan, gratis."
            action={<Link to="/toko" className="btn-coral">Mulai belanja</Link>}
          />
        </div>
        <Suggestions list={suggestions} title={suggestTitle} />
      </div>
    );
  }

  return (
    <div className="page pb-36 md:pb-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="h1">Keranjang <span className="text-ink/40">({lines.reduce((n, l) => n + l.qty, 0)})</span></h1>
        <Link to="/toko" className="text-sm font-bold text-coral hover:underline">← Lanjut belanja</Link>
      </div>

      {/* free shipping progress */}
      <div className="card mt-5 p-4">
        <p className="text-sm font-bold">
          {t.subtotal >= FREE_SHIP
            ? "Kamu dapat gratis ongkir pengiriman reguler"
            : `Tambah ${formatIDR(FREE_SHIP - t.subtotal)} lagi untuk gratis ongkir reguler`}
        </p>
        <div className="track mt-2">
          <div className="h-full rounded-full bg-mint transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <ul className="space-y-3 lg:col-span-2">
          {lines.map((l) => (
            <li key={l.key} className="card flex gap-4 p-4">
              <Link to={`/toko/${l.sku}`} className="shrink-0">
                <ProductThumb sku={l.sku} className="h-20 w-20" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={`/toko/${l.sku}`} className="font-display font-bold hover:text-coral">{l.name}</Link>
                    <p className="text-xs text-ink/60">
                      {l.weight} g · Potong: <strong>{l.prepLabel}</strong>
                    </p>
                  </div>
                  <button onClick={() => onRemove(l)} className="btn-ghost -mr-2 -mt-1 px-2 py-1 text-ink/40" aria-label={`Hapus ${l.name}`}>
                    <Icon name="trash" className="h-[18px] w-[18px]" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <QtyStepper size="sm" value={l.qty} onChange={(v) => setQty(l.key, v)} min={1} max={l.maxQty} />
                  <div className="text-right">
                    <p className="font-display font-bold">{formatIDR(l.lineTotal)}</p>
                    {l.compareAt && <p className="text-xs text-ink/40 line-through">{formatIDR(l.compareAt * l.qty)}</p>}
                  </div>
                </div>
                {l.qty >= l.maxQty && <p className="mt-1 text-xs font-bold text-coral">Maksimal sesuai stok tersedia</p>}
              </div>
            </li>
          ))}
        </ul>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold">Voucher</h2>
            {voucherCode ? (
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-dashed border-mint bg-mintsoft/50 px-4 py-3">
                <div className="text-sm">
                  <p className="font-bold">{voucherCode}</p>
                  <p className={t.voucher.ok ? "text-ink/70" : "font-bold text-coral"}>
                    {t.voucher.ok ? VOUCHERS[voucherCode]?.desc : t.voucher.error}
                  </p>
                </div>
                <button onClick={removeVoucher} className="text-sm font-bold text-coral hover:underline">Hapus</button>
              </div>
            ) : (
              <form onSubmit={submitVoucher} className="mt-3">
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setCodeError("");
                    }}
                    placeholder="Masukkan kode"
                    className={`input ${codeError ? "input-error" : ""}`}
                    aria-label="Kode voucher"
                  />
                  <button type="submit" disabled={!code.trim()} className="btn-dark btn-sm shrink-0">Pakai</button>
                </div>
                {codeError && <p className="mt-1 text-xs font-bold text-coral">{codeError}</p>}
                <div className="mt-3 space-y-2">
                  {Object.entries(VOUCHERS).map(([c, v]) => {
                    const eligible = t.subtotal >= v.min;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          const res = applyVoucher(c);
                          if (res.ok) toast(`Voucher ${c} dipakai`);
                          else setCodeError(res.error);
                        }}
                        className={`flex w-full items-center justify-between rounded-2xl border border-dashed px-3 py-2 text-left text-xs ${
                          eligible ? "border-ink/40 hover:border-coral" : "border-ink/15 opacity-60"
                        }`}
                      >
                        <span>
                          <strong className="block text-sm">{c}</strong>
                          {v.desc} · {v.terms}
                        </span>
                        <span className="font-bold text-coral">{eligible ? "Pakai" : "Belum cukup"}</span>
                      </button>
                    );
                  })}
                </div>
              </form>
            )}
          </div>

          <div className="card hidden p-5 md:block">
            <Summary t={t} />
            <button onClick={() => navigate("/checkout")} className="btn-coral mt-4 w-full">
              Checkout
            </button>
            <p className="mt-2 text-center text-xs text-ink/50">Ongkir dihitung di langkah berikutnya.</p>
          </div>
        </aside>
      </div>

      <Suggestions list={suggestions} title={suggestTitle} />

      {/* mobile checkout bar */}
      <div className="fixed inset-x-0 bottom-[58px] z-30 flex items-center gap-3 border-t-2 border-ink bg-white px-4 py-3 md:hidden">
        <div className="flex-1">
          <p className="text-xs text-ink/50">Total belanja</p>
          <p className="font-display text-lg font-bold text-coral">{formatIDR(t.subtotal - t.discount)}</p>
        </div>
        <button onClick={() => navigate("/checkout")} className="btn-coral btn-sm px-6">Checkout</button>
      </div>
    </div>
  );
}

function Suggestions({ list, title }) {
  if (!list.length) return null;
  return (
    <section className="mt-12">
      <SectionHeader title={title} to="/toko" />
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
        {list.map((p) => (
          <ProductCard key={p.sku} product={p} />
        ))}
      </div>
    </section>
  );
}

export function Summary({ t, showShipping = false, shippingLabel }) {
  return (
    <>
      <h2 className="font-display text-lg font-bold">Ringkasan belanja</h2>
      <div className="mt-3 space-y-2 text-sm">
        <Row label="Subtotal" value={formatIDR(t.subtotal)} />
        {t.savings > 0 && <Row label="Hemat dari harga coret" value={`−${formatIDR(t.savings)}`} />}
        {showShipping && <Row label={shippingLabel || "Ongkir"} value={t.shipping === 0 ? "Gratis" : formatIDR(t.shipping)} />}
        {t.discount > 0 && <Row label={`Voucher ${t.voucher.code}`} value={`−${formatIDR(t.discount)}`} />}
      </div>
      <div className="mt-3 flex justify-between border-t-2 border-ink/10 pt-3 font-display text-lg font-bold">
        <span>Total</span>
        <span className="text-coral">{formatIDR(showShipping ? t.total : t.subtotal - t.discount)}</span>
      </div>
    </>
  );
}
