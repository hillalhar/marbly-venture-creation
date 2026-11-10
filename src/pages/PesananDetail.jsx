import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { formatIDR } from "../data/products.js";
import { orderState, STORE_ADDRESS } from "../data/shop.js";
import { useCart } from "../lib/cart.jsx";
import { useFridge } from "../lib/fridge.jsx";
import { useNow, usePageTitle } from "../lib/hooks.js";
import { useToast } from "../lib/toast.jsx";
import { formatAddress } from "../components/AddressForm.jsx";
import { EmptyState, Modal, Row, StarInput } from "../components/ui.jsx";
import { ProductThumb } from "../components/ProductCard.jsx";

const CANCEL_REASONS = ["Ingin ganti metode pembayaran", "Salah pilih produk / jumlah", "Ingin ubah alamat atau jadwal", "Lainnya"];

function fmtCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export default function PesananDetail() {
  const { id } = useParams();
  const { getOrder } = useCart();
  const order = getOrder(id);
  usePageTitle(order ? `Pesanan ${order.id}` : "Pesanan");

  if (!order) {
    return (
      <div className="page">
        <EmptyState icon="🔎" title="Pesanan tidak ditemukan" action={<Link to="/pesanan" className="btn-coral btn-sm">Semua pesanan</Link>} />
      </div>
    );
  }
  return <Detail order={order} />;
}

function Detail({ order: o }) {
  const now = useNow(1000);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { payOrder, cancelOrder, markStocked, reorder, addReview } = useCart();
  const { addFromOrder } = useFridge();
  const s = orderState(o, now);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [reviewFor, setReviewFor] = useState(null);
  const [paying, setPaying] = useState(false);
  const justPlaced = location.state?.justPlaced;

  function pay() {
    setPaying(true);
    setTimeout(() => {
      payOrder(o.id);
      setPaying(false);
      toast("Pembayaran berhasil. Pesanan sedang diproses.");
    }, 1200);
  }

  function copy(text) {
    navigator.clipboard?.writeText(text).then(
      () => toast("Disalin ke clipboard", { tone: "info" }),
      () => toast("Gagal menyalin", { tone: "error" })
    );
  }

  function stock() {
    addFromOrder(o);
    markStocked(o.id);
    toast("Masuk ke kulkas. Batas simpan dipantau otomatis.", { action: { label: "Lihat", to: "/kulkas" } });
  }

  function again() {
    const n = reorder(o);
    if (n > 0) navigate("/keranjang");
    else toast("Stok produk di pesanan ini sedang habis.", { tone: "error" });
  }

  const deliveryWhen =
    o.delivery.date && o.delivery.slot
      ? `${new Date(`${o.delivery.date}T00:00`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}, ${o.delivery.slot}`
      : o.delivery.id === "instan"
      ? "± 2 jam setelah dibayar"
      : "-";

  return (
    <div className="page">
      <Link to="/pesanan" className="no-print text-sm font-bold text-ink/60 hover:text-coral">← Semua pesanan</Link>

      {justPlaced && s.key === "unpaid" && (
        <div className="mt-4 animate-fadeIn rounded-2xl border border-ink/10 bg-mintsoft p-4 font-bold">✅ Pesanan dibuat! Selesaikan pembayaran di bawah.</div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="h1">Pesanan {o.id}</h1>
        <span className={`badge border border-ink/10 px-3 py-1 text-sm ${s.tone}`}>{s.label}</span>
      </div>
      <p className="text-sm text-ink/50">Dibuat {new Date(o.createdAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* payment panel */}
          {s.key === "unpaid" && (
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between bg-sun px-5 py-3">
                <span className="font-display font-bold">Bayar sebelum</span>
                <span className="font-display text-xl font-bold tabular-nums">{fmtCountdown(s.deadline - now)}</span>
              </div>
              <div className="p-5">
                <p className="text-sm text-ink/60">{o.payment.label}</p>
                {o.payment.type === "va" && (
                  <>
                    <p className="mt-3 text-xs font-bold text-ink/50">Nomor virtual account</p>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-2xl font-bold tracking-wider">{o.payment.ref}</span>
                      <button onClick={() => copy(o.payment.ref)} className="btn-ghost btn-sm">Salin</button>
                    </div>
                    <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-ink/70">
                      <li>Buka m-banking {o.payment.short}, pilih Transfer → Virtual Account.</li>
                      <li>Masukkan nomor di atas, pastikan nama tertera “MARBLY”.</li>
                      <li>Periksa nominal {formatIDR(o.total)} lalu konfirmasi.</li>
                    </ol>
                  </>
                )}
                {o.payment.type === "qris" && (
                  <div className="mt-3 flex flex-col items-center">
                    <FakeQR seed={o.id} />
                    <p className="mt-2 text-sm text-ink/60">Pindai dengan aplikasi bank atau e-wallet apa pun.</p>
                  </div>
                )}
                {o.payment.type === "ewallet" && (
                  <p className="mt-3 text-sm text-ink/70">
                    Kami akan membuka aplikasi {o.payment.short} untuk konfirmasi pembayaran {formatIDR(o.total)}.
                  </p>
                )}
                <div className="mt-4 flex items-baseline justify-between border-t-2 border-ink/10 pt-4">
                  <span className="text-sm font-bold text-ink/60">Total tagihan</span>
                  <span className="flex items-center gap-2">
                    <span className="font-display text-2xl font-bold text-coral">{formatIDR(o.total)}</span>
                    <button onClick={() => copy(String(o.total))} className="btn-ghost px-2 py-1 text-xs">Salin</button>
                  </span>
                </div>
                <button onClick={pay} disabled={paying} className="btn-coral mt-4 w-full">
                  {paying ? "Memverifikasi pembayaran…" : o.payment.type === "ewallet" ? `Bayar dengan ${o.payment.short}` : "Saya sudah bayar"}
                </button>
                <p className="mt-2 text-center text-xs text-ink/50">Simulasi: tombol ini menandai pesanan sebagai lunas.</p>
              </div>
            </section>
          )}

          {/* tracking */}
          {s.stageIndex >= 0 && (
            <section className="card p-5">
              <h2 className="font-display text-lg font-bold">Status pesanan</h2>
              <ol className="mt-4 space-y-0">
                {s.stages.map((st, i) => {
                  const done = i <= s.stageIndex;
                  const current = i === s.stageIndex;
                  return (
                    <li key={st.id} className="relative flex gap-4 pb-5 last:pb-0">
                      {i < s.stages.length - 1 && (
                        <span className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 ${i < s.stageIndex ? "bg-mint" : "bg-ink/15"}`} />
                      )}
                      <span className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/10 text-lg ${done ? "bg-mint" : "bg-cream opacity-50"} ${current && !s.arrived ? "animate-pulse" : ""}`}>
                        {st.icon}
                      </span>
                      <div className="pt-1.5">
                        <p className={`font-bold ${done ? "" : "text-ink/40"}`}>{st.label}</p>
                        {current && !s.arrived && s.nextInSec > 0 && (
                          <p className="text-xs text-ink/50">Tahap berikutnya ± {s.nextInSec} detik (simulasi)</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {(s.key === "cancelled" || s.key === "expired") && (
            <section className="card p-5">
              <p className="font-bold">{s.key === "expired" ? "Batas waktu pembayaran habis." : "Pesanan dibatalkan."}</p>
              {o.cancelReason && <p className="text-sm text-ink/60">Alasan: {o.cancelReason}</p>}
              <p className="mt-1 text-sm text-ink/60">Stok sudah dikembalikan. Tidak ada dana yang ditagih.</p>
            </section>
          )}

          {/* items */}
          <section className="card p-5">
            <h2 className="font-display text-lg font-bold">Produk</h2>
            <ul className="mt-3 divide-y divide-ink/10">
              {o.lines.map((l) => (
                <li key={l.key} className="flex flex-wrap items-center gap-3 py-3">
                  <Link to={`/toko/${l.sku}`}><ProductThumb sku={l.sku} className="h-14 w-14" /></Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/toko/${l.sku}`} className="font-bold hover:text-coral">{l.name}</Link>
                    <p className="text-xs text-ink/50">{l.qty} × {formatIDR(l.price)} · {l.weight} g · {l.prepLabel}</p>
                  </div>
                  <span className="font-bold">{formatIDR(l.price * l.qty)}</span>
                  {s.arrived && (
                    <div className="no-print w-full text-right sm:w-auto">
                      {o.reviewed?.[l.sku] ? (
                        <span className="text-xs font-bold text-mint">✓ Sudah diulas</span>
                      ) : (
                        <button onClick={() => setReviewFor(l)} className="btn-outline px-3 py-1 text-xs">★ Beri ulasan</button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="card space-y-2 p-5 text-sm">
            <h2 className="font-display text-lg font-bold">Rincian pembayaran</h2>
            <Row label="Subtotal" value={formatIDR(o.subtotal)} />
            <Row label="Ongkir" value={o.shipping === 0 ? "Gratis" : formatIDR(o.shipping)} />
            {o.discount > 0 && <Row label={`Voucher ${o.voucher}`} value={`−${formatIDR(o.discount)}`} />}
            <div className="flex justify-between border-t-2 border-ink/10 pt-2 font-display text-lg font-bold">
              <span>Total</span>
              <span className="text-coral">{formatIDR(o.total)}</span>
            </div>
            <Row label="Metode" value={o.payment.short} />
            {o.paidAt && <Row label="Dibayar" value={new Date(o.paidAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })} />}
          </section>

          <section className="card space-y-1 p-5 text-sm">
            <h2 className="font-display text-lg font-bold">{o.delivery.id === "pickup" ? "Ambil di toko" : "Pengiriman"}</h2>
            <p className="font-bold">{o.delivery.label}</p>
            <p className="text-ink/60">{deliveryWhen}</p>
            {o.address ? (
              <div className="pt-2">
                <p className="font-bold">{o.address.recipient} · {o.address.phone}</p>
                <p className="text-ink/60">{formatAddress(o.address)}</p>
                {o.address.notes && <p className="text-xs text-ink/50">Patokan: {o.address.notes}</p>}
              </div>
            ) : (
              <p className="pt-2 text-ink/60">{STORE_ADDRESS}</p>
            )}
            {o.note && <p className="pt-2 text-xs text-ink/60">Catatan: {o.note}</p>}
          </section>

          <div className="no-print grid gap-2">
            {s.arrived && !o.stocked && <button onClick={stock} className="btn-coral">🧊 Masukkan ke kulkas</button>}
            {o.stocked && <Link to="/kulkas" className="btn-outline">✓ Sudah di kulkas · Lihat</Link>}
            <button onClick={again} className="btn-outline">🔁 Beli lagi</button>
            {s.stageIndex >= 0 && <button onClick={() => window.print()} className="btn-ghost">🧾 Cetak invoice</button>}
            {s.canCancel && <button onClick={() => setCancelOpen(true)} className="btn-ghost text-coral">Batalkan pesanan</button>}
          </div>
        </aside>
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Batalkan pesanan?"
        footer={
          <>
            <button onClick={() => setCancelOpen(false)} className="btn-outline btn-sm">Jangan batalkan</button>
            <button
              onClick={() => {
                if (cancelOrder(o.id, reason)) toast("Pesanan dibatalkan", { tone: "info" });
                else toast("Pesanan sudah dikirim dan tidak bisa dibatalkan.", { tone: "error" });
                setCancelOpen(false);
              }}
              className="btn-coral btn-sm"
            >
              Ya, batalkan
            </button>
          </>
        }
      >
        <p className="text-sm text-ink/60">Pilih alasan pembatalan:</p>
        <div className="mt-3 space-y-2">
          {CANCEL_REASONS.map((r) => (
            <label key={r} className="flex items-center gap-3 rounded-2xl border border-ink/15 px-4 py-2.5 text-sm font-bold has-[:checked]:border-ink has-[:checked]:bg-cream">
              <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-coral" />
              {r}
            </label>
          ))}
        </div>
      </Modal>

      <ReviewModal
        line={reviewFor}
        onClose={() => setReviewFor(null)}
        onSubmit={(rating, text) => {
          addReview(reviewFor.sku, { rating, text, orderId: o.id });
          setReviewFor(null);
          toast("Terima kasih atas ulasannya!");
        }}
      />
    </div>
  );
}

function ReviewModal({ line, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  return (
    <Modal
      open={Boolean(line)}
      onClose={onClose}
      title="Beri ulasan"
      footer={
        <>
          <button onClick={onClose} className="btn-outline btn-sm">Nanti</button>
          <button
            onClick={() => {
              onSubmit(rating, text);
              setRating(5);
              setText("");
            }}
            className="btn-coral btn-sm"
          >
            Kirim ulasan
          </button>
        </>
      }
    >
      {line && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <ProductThumb sku={line.sku} className="h-12 w-12" />
            <span className="font-bold">{line.name}</span>
          </div>
          <StarInput value={rating} onChange={setRating} />
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={300}
            placeholder="Bagaimana kesegaran, potongan, dan pengemasannya?"
            className="input"
          />
        </div>
      )}
    </Modal>
  );
}

// Decorative QR-like grid (not a real payable code).
function FakeQR({ seed }) {
  let h = 0;
  for (const c of seed) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  const n = 21;
  const cells = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      let on;
      if (finder) {
        const fx = x > 13 ? x - 14 : x;
        const fy = y > 13 ? y - 14 : y;
        on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
      } else {
        h = (h * 1103515245 + 12345) >>> 0;
        on = (h >> 16) % 2 === 0;
      }
      if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  }
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="h-48 w-48 rounded-2xl border border-ink/10 bg-white" role="img" aria-label="Kode QRIS simulasi">
      <g fill="#2b2727">{cells}</g>
    </svg>
  );
}
