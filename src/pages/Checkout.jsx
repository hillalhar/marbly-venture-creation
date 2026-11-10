import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatIDR } from "../data/products.js";
import {
  computeTotals,
  DELIVERY,
  deliveryDates,
  PAYMENT_GROUPS,
  SLOTS,
  STORE_ADDRESS,
} from "../data/shop.js";
import { useAuth } from "../lib/auth.jsx";
import { useCart } from "../lib/cart.jsx";
import { usePageTitle } from "../lib/hooks.js";
import { useToast } from "../lib/toast.jsx";
import AddressForm, { formatAddress } from "../components/AddressForm.jsx";
import { EmptyState, Modal } from "../components/ui.jsx";
import { Summary } from "./Keranjang.jsx";
import { ProductThumb } from "../components/ProductCard.jsx";

export default function Checkout() {
  usePageTitle("Checkout");
  const navigate = useNavigate();
  const toast = useToast();
  const { user, saveAddress } = useAuth();
  const { lines, voucherCode, placeOrder } = useCart();

  const addresses = user?.addresses || [];
  const dates = useMemo(() => deliveryDates(5), []);

  const [addressId, setAddressId] = useState(() => (addresses.find((a) => a.isDefault) || addresses[0])?.id || null);
  const [addrModal, setAddrModal] = useState(false);
  const [deliveryId, setDeliveryId] = useState("reguler");
  const [date, setDate] = useState(dates[0].iso);
  const [slot, setSlot] = useState("");
  const [payment, setPayment] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const delivery = DELIVERY.find((d) => d.id === deliveryId);
  const address = addresses.find((a) => a.id === addressId) || null;
  const t = computeTotals(lines, deliveryId, voucherCode);

  if (lines.length === 0 && !submitting) {
    return (
      <div className="page">
        <EmptyState
          icon="🧺"
          title="Tidak ada yang di-checkout"
          desc="Keranjangmu kosong. Tambahkan produk dulu."
          action={<Link to="/toko" className="btn-coral">Ke toko</Link>}
        />
      </div>
    );
  }

  function submit() {
    const e = {};
    if (deliveryId !== "pickup" && !address) e.address = "Pilih atau tambah alamat pengiriman.";
    if (delivery.scheduled && !slot) e.slot = "Pilih jam pengiriman.";
    if (!payment) e.payment = "Pilih metode pembayaran.";
    setErrors(e);
    if (Object.keys(e).length) {
      const first = ["address", "slot", "payment"].find((k) => e[k]);
      document.getElementById(`sec-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast("Lengkapi data checkout dulu.", { tone: "error" });
      return;
    }
    setSubmitting(true);
    const order = placeOrder({
      address,
      delivery: { id: deliveryId, date: delivery.scheduled ? date : null, slot: delivery.scheduled ? slot : null },
      payment,
      note,
    });
    if (order) navigate(`/pesanan/${order.id}`, { replace: true, state: { justPlaced: true } });
    else setSubmitting(false);
  }

  return (
    <div className="page pb-36 md:pb-10">
      <Link to="/keranjang" className="text-sm font-bold text-ink/60 hover:text-coral">← Kembali ke keranjang</Link>
      <h1 className="h1 mt-2">Checkout</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* 1. delivery */}
          <Section n={1} title="Metode pengiriman" id="sec-slot" error={errors.slot}>
            <div className="grid gap-3 sm:grid-cols-3">
              {DELIVERY.map((d) => {
                const fee = computeTotals(lines, d.id, "").shipping;
                return (
                  <Choice key={d.id} active={deliveryId === d.id} onClick={() => { setDeliveryId(d.id); setSlot(""); }}>
                    <span className="text-2xl">{d.icon}</span>
                    <span className="block font-bold">{d.label}</span>
                    <span className="block text-xs text-ink/60">{d.eta}</span>
                    <span className="mt-1 block text-sm font-bold">{fee === 0 ? "Gratis" : formatIDR(fee)}</span>
                  </Choice>
                );
              })}
            </div>

            {delivery.scheduled && (
              <div className="mt-4">
                <p className="label">{deliveryId === "pickup" ? "Waktu ambil" : "Jadwal kirim"}</p>
                <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                  {dates.map((d) => (
                    <button
                      key={d.iso}
                      onClick={() => setDate(d.iso)}
                      className={`min-w-16 rounded-2xl border px-3 py-2 text-center ${date === d.iso ? "border-ink bg-ink text-white" : "border-ink/15 bg-white hover:border-ink/40"}`}
                    >
                      <span className="block text-xs font-bold opacity-70">{d.day}</span>
                      <span className="block font-display font-bold">{d.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {SLOTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSlot(s); setErrors((x) => ({ ...x, slot: undefined })); }}
                      className={`rounded-full border px-3 py-2 text-sm font-bold ${slot === s ? "border-ink bg-ink text-white" : "border-ink/15 bg-white hover:border-ink/40"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {deliveryId === "instan" && (
              <p className="mt-3 rounded-2xl bg-mintsoft/60 p-3 text-sm">
                ⚡ Dikirim dengan cold-box segera setelah pembayaran terkonfirmasi.
              </p>
            )}
          </Section>

          {/* 2. address */}
          <Section n={2} title={deliveryId === "pickup" ? "Lokasi ambil" : "Alamat pengiriman"} id="sec-address" error={errors.address}>
            {deliveryId === "pickup" ? (
              <div className="rounded-2xl border border-ink/10 bg-cream p-4 text-sm">
                <p className="font-bold">🏪 {STORE_ADDRESS}</p>
                <p className="mt-1 text-ink/60">Buka setiap hari 08.00–20.00. Tunjukkan nomor pesanan di kasir.</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink/15 p-5 text-center">
                <p className="text-sm text-ink/60">Belum ada alamat tersimpan.</p>
                <button onClick={() => setAddrModal(true)} className="btn-coral btn-sm mt-3">+ Tambah alamat</button>
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.map((a) => (
                  <Choice key={a.id} active={addressId === a.id} onClick={() => { setAddressId(a.id); setErrors((x) => ({ ...x, address: undefined })); }}>
                    <span className="flex items-center gap-2">
                      <span className="font-bold">{a.label}</span>
                      {a.isDefault && <span className="badge bg-mintsoft">Utama</span>}
                    </span>
                    <span className="block text-sm">{a.recipient} · {a.phone}</span>
                    <span className="block text-sm text-ink/60">{formatAddress(a)}</span>
                  </Choice>
                ))}
                <button onClick={() => setAddrModal(true)} className="btn-ghost text-sm">+ Tambah alamat baru</button>
              </div>
            )}
          </Section>

          {/* 3. payment */}
          <Section n={3} title="Metode pembayaran" id="sec-payment" error={errors.payment}>
            <div className="space-y-4">
              {PAYMENT_GROUPS.map((g) => (
                <div key={g.id}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/50">{g.label}</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {g.methods.map((m) => (
                      <Choice key={m.id} active={payment === m.id} onClick={() => { setPayment(m.id); setErrors((x) => ({ ...x, payment: undefined })); }} compact>
                        <span className="font-bold">{m.short}</span>
                        <span className="block text-xs text-ink/60">{m.label}</span>
                      </Choice>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 4. note */}
          <Section n={4} title="Catatan untuk tukang daging (opsional)">
            <textarea
              rows={2}
              value={note}
              maxLength={200}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: lemak jangan dibuang, steak tebal 3 cm"
              className="input"
            />
            <p className="mt-1 text-right text-xs text-ink/40">{note.length}/200</p>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <ul className="mb-4 max-h-56 space-y-2 overflow-y-auto border-b-2 border-ink/10 pb-4 text-sm">
              {lines.map((l) => (
                <li key={l.key} className="flex items-center gap-3">
                  <ProductThumb sku={l.sku} className="h-11 w-11" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{l.name}</span>
                    <span className="block text-xs text-ink/50">{l.qty} × {l.prepLabel}</span>
                  </span>
                  <span className="font-bold">{formatIDR(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <Summary t={t} showShipping shippingLabel={`Ongkir ${delivery.label}`} />
            <button onClick={submit} disabled={submitting} className="btn-coral mt-4 hidden w-full md:flex">
              {payment === "cod" ? "Buat pesanan" : `Bayar ${formatIDR(t.total)}`}
            </button>
            <p className="mt-2 text-center text-xs text-ink/50">🔒 Simulasi — tidak ada pembayaran nyata.</p>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-[58px] z-30 flex items-center gap-3 border-t-2 border-ink bg-white px-4 py-3 md:hidden">
        <div className="flex-1">
          <p className="text-xs text-ink/50">Total bayar</p>
          <p className="font-display text-lg font-bold text-coral">{formatIDR(t.total)}</p>
        </div>
        <button onClick={submit} disabled={submitting} className="btn-coral btn-sm px-6">
          {payment === "cod" ? "Buat pesanan" : "Bayar"}
        </button>
      </div>

      <Modal open={addrModal} onClose={() => setAddrModal(false)} title="Tambah alamat">
        <AddressForm
          defaults={{ recipient: user?.name || "", phone: user?.phone || "" }}
          onCancel={() => setAddrModal(false)}
          onSubmit={(a) => {
            const id = saveAddress(a);
            setAddressId(id);
            setAddrModal(false);
            setErrors((x) => ({ ...x, address: undefined }));
            toast("Alamat disimpan");
          }}
        />
      </Modal>
    </div>
  );
}

function Section({ n, title, id, error, children }) {
  return (
    <section id={id} className={`card p-5 ${error ? "!border-coral ring-2 ring-coral/30" : ""}`}>
      <h2 className="flex items-center gap-3 font-display text-lg font-bold">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-sm text-white">{n}</span>
        {title}
      </h2>
      {error && <p role="alert" className="mt-2 text-sm font-bold text-coral">{error}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Choice({ active, onClick, children, compact }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative w-full rounded-2xl border text-left transition-colors ${compact ? "px-3 py-2" : "p-4"} ${
        active ? "border-coral bg-coralsoft" : "border-ink/15 bg-white hover:border-ink/40"
      }`}
    >
      {active && <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-white">✓</span>}
      {children}
    </button>
  );
}
