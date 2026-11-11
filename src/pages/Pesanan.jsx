import { useState } from "react";
import { Link } from "react-router-dom";
import { formatIDR } from "../data/products.js";
import { ORDER_FILTERS, orderState } from "../data/shop.js";
import { useCart } from "../lib/cart.jsx";
import { useAuth } from "../lib/auth.jsx";
import { useNow, usePageTitle } from "../lib/hooks.js";
import { EmptyState, Tabs } from "../components/ui.jsx";
import { ProductThumb } from "../components/ProductCard.jsx";

export default function Pesanan() {
  usePageTitle("Pesanan saya");
  const { orders } = useCart();
  const { isPremium } = useAuth();
  const now = useNow(3000);
  const [filter, setFilter] = useState("semua");

  const withState = orders.map((o) => ({ o, s: orderState(o, now) }));
  const tabs = ORDER_FILTERS.map((f) => ({ id: f.id, label: f.label, count: withState.filter(({ s }) => f.match(s)).length }));
  const active = ORDER_FILTERS.find((f) => f.id === filter);
  const shown = withState.filter(({ s }) => active.match(s));

  return (
    <div className="page">
      <h1 className="h1">Pesanan saya</h1>
      <p className="mt-1 text-sm text-ink/60">
        Status diperbarui otomatis. Waktu pengiriman disimulasikan lebih cepat (± 3 menit setelah bayar).
      </p>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon="📦"
            title="Belum ada pesanan"
            desc="Pesanan yang kamu buat akan muncul di sini lengkap dengan status pengirimannya."
            action={<Link to="/toko" className="btn-coral">Belanja daging</Link>}
          />
        </div>
      ) : (
        <>
          <Tabs className="mt-5" items={tabs} value={filter} onChange={setFilter} />
          <ul className="mt-4 space-y-3">
            {shown.map(({ o, s }) => (
              <li key={o.id}>
                <Link to={`/pesanan/${o.id}`} className="card block p-4 transition-colors hover:bg-cream/50 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-bold">{o.id}</span>
                    <span className="text-xs text-ink/50">{new Date(o.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>
                    <span className={`badge ml-auto border border-ink/10 ${s.tone}`}>{s.label}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {o.lines.slice(0, 3).map((l) => (
                        <span key={l.key} className="rounded-xl ring-2 ring-white"><ProductThumb sku={l.sku} className="h-11 w-11" /></span>
                      ))}
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="truncate font-bold">{o.lines[0].name}{o.lines.length > 1 ? ` +${o.lines.length - 1} lainnya` : ""}</p>
                      <p className="text-xs text-ink/50">{o.delivery.label} · {o.payment.short}</p>
                    </div>
                    <span className="font-display font-bold text-coral">{formatIDR(o.total)}</span>
                  </div>
                  {s.key === "unpaid" && (
                    <p className="mt-3 rounded-full bg-sun/50 px-3 py-1 text-xs font-bold">
                      ⏳ Selesaikan pembayaran sebelum {new Date(s.deadline).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  )}
                  {s.arrived && (isPremium ? !o.stocked : !Object.keys(o.reviewed || {}).length) && (
                    <p className="mt-3 rounded-full bg-mintsoft px-3 py-1 text-xs font-bold">
                      {isPremium && !o.stocked ? "Pesanan tiba. Masukkan ke Kulkas Saya & beri ulasan" : "Pesanan tiba. Beri ulasan untuk produknya"}
                    </p>
                  )}
                </Link>
              </li>
            ))}
            {shown.length === 0 && <li className="py-10 text-center text-sm text-ink/50">Tidak ada pesanan di kategori ini.</li>}
          </ul>
        </>
      )}
    </div>
  );
}
