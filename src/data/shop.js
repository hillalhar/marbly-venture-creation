// Shop configuration for the simulated in-app store: delivery, payment,
// vouchers, totals, and order lifecycle. No real payment or external service.

import { getProduct } from "./products.js";

export const STORE_ADDRESS = "Marbly Butcher Kemang, Jl. Kemang Raya No. 12, Jakarta Selatan";

export const DELIVERY = [
  {
    id: "reguler",
    icon: "🚚",
    label: "Reguler terjadwal",
    eta: "Pilih tanggal & jam",
    fee: 15000,
    freeAbove: 150000,
    scheduled: true,
  },
  {
    id: "instan",
    icon: "⚡",
    label: "Instan cold-box",
    eta: "± 2 jam setelah dibayar",
    fee: 30000,
    freeAbove: null,
    scheduled: false,
  },
  {
    id: "pickup",
    icon: "🏪",
    label: "Ambil di toko",
    eta: "Siap ± 1 jam",
    fee: 0,
    freeAbove: null,
    scheduled: true,
  },
];

export const SLOTS = ["08.00–11.00", "11.00–14.00", "14.00–17.00", "17.00–20.00"];

// Next `n` delivery dates starting tomorrow (same-day is covered by Instan).
export function deliveryDates(n = 5, now = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i + 1);
    // local calendar date (toISOString would shift it to UTC)
    const pad = (n) => String(n).padStart(2, "0");
    return {
      iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      day: d.toLocaleDateString("id-ID", { weekday: "short" }),
      label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    };
  });
}

export const PAYMENT_GROUPS = [
  {
    id: "va",
    label: "Virtual account",
    methods: [
      { id: "bca", label: "BCA Virtual Account", short: "BCA", prefix: "39012" },
      { id: "mandiri", label: "Mandiri Virtual Account", short: "Mandiri", prefix: "88608" },
      { id: "bri", label: "BRI Virtual Account", short: "BRI", prefix: "26215" },
    ],
  },
  {
    id: "ewallet",
    label: "E-wallet",
    methods: [
      { id: "gopay", label: "GoPay", short: "GoPay" },
      { id: "ovo", label: "OVO", short: "OVO" },
      { id: "dana", label: "DANA", short: "DANA" },
    ],
  },
  {
    id: "qris",
    label: "QRIS",
    methods: [{ id: "qris", label: "QRIS (semua aplikasi bank & e-wallet)", short: "QRIS" }],
  },
  {
    id: "cod",
    label: "Bayar di tempat",
    methods: [{ id: "cod", label: "Bayar tunai / transfer saat diterima", short: "COD" }],
  },
];

export const PAYMENT_METHODS = PAYMENT_GROUPS.flatMap((g) =>
  g.methods.map((m) => ({ ...m, type: g.id }))
);
export const getPayment = (id) => PAYMENT_METHODS.find((m) => m.id === id) || null;

export const PAYMENT_WINDOW_MS = 24 * 60 * 60 * 1000;

export const VOUCHERS = {
  MARBLY10: {
    desc: "Diskon 10% hingga Rp25.000",
    terms: "Min. belanja Rp100.000",
    min: 100000,
    type: "percent",
    value: 10,
    max: 25000,
  },
  HEMAT20K: {
    desc: "Potongan Rp20.000",
    terms: "Min. belanja Rp200.000",
    min: 200000,
    type: "flat",
    value: 20000,
  },
  ONGKIRGRATIS: {
    desc: "Gratis ongkir",
    terms: "Min. belanja Rp75.000, semua metode kirim",
    min: 75000,
    type: "shipping",
  },
};

const idr = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");

// Returns { code, ok, discount, desc, error }.
export function evalVoucher(rawCode, subtotal, shippingFee) {
  const code = String(rawCode || "").trim().toUpperCase();
  if (!code) return { code: "", ok: false, discount: 0, desc: "", error: "" };
  const v = VOUCHERS[code];
  if (!v) return { code, ok: false, discount: 0, desc: "", error: "Kode voucher tidak dikenal." };
  if (subtotal < v.min) {
    return {
      code,
      ok: false,
      discount: 0,
      desc: v.desc,
      error: `Belanja minimal ${idr(v.min)} untuk voucher ini.`,
    };
  }
  let discount = 0;
  if (v.type === "percent") discount = Math.min(v.max, Math.floor((subtotal * v.value) / 100));
  else if (v.type === "flat") discount = Math.min(v.value, subtotal);
  else if (v.type === "shipping") discount = shippingFee;
  return { code, ok: true, discount, desc: v.desc, error: "" };
}

export function shippingFor(deliveryId, subtotal) {
  const d = DELIVERY.find((x) => x.id === deliveryId) || DELIVERY[0];
  if (subtotal <= 0) return 0;
  if (d.freeAbove && subtotal >= d.freeAbove) return 0;
  return d.fee;
}

// Single source of truth for money math (cart page, checkout, and order).
export function computeTotals(lines, deliveryId, voucherCode) {
  const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
  const savings = lines.reduce(
    (n, l) => n + (l.compareAt && l.compareAt > l.price ? (l.compareAt - l.price) * l.qty : 0),
    0
  );
  const shipping = deliveryId ? shippingFor(deliveryId, subtotal) : 0;
  const voucher = evalVoucher(voucherCode, subtotal, shipping);
  const discount = voucher.ok ? voucher.discount : 0;
  return { subtotal, shipping, discount, voucher, savings, total: Math.max(0, subtotal + shipping - discount) };
}

// ---------------- order lifecycle ----------------
// Tracking is derived from elapsed time since payment, so it needs no backend.
// Durations are sped up (seconds) so the whole flow can be seen in a demo.
const STAGES = {
  delivery: [
    { id: "diproses", icon: "🧾", label: "Diproses", at: 0 },
    { id: "dikemas", icon: "📦", label: "Dikemas dingin", at: 30 },
    { id: "dikirim", icon: "🚚", label: "Dalam pengiriman", at: 90 },
    { id: "tiba", icon: "✅", label: "Tiba", at: 180 },
  ],
  pickup: [
    { id: "diproses", icon: "🧾", label: "Diproses", at: 0 },
    { id: "dikemas", icon: "🔪", label: "Dipotong & dikemas", at: 30 },
    { id: "siap", icon: "🏪", label: "Siap diambil", at: 90 },
    { id: "tiba", icon: "✅", label: "Sudah diambil", at: 180 },
  ],
};

export function stagesFor(order) {
  return order.delivery?.id === "pickup" ? STAGES.pickup : STAGES.delivery;
}

// Returns a normalized view of where an order is right now.
export function orderState(order, now = Date.now()) {
  const stages = stagesFor(order);
  const created = new Date(order.createdAt).getTime();

  if (order.status === "cancelled") {
    return { key: "cancelled", label: "Dibatalkan", tone: "bg-ink/10", stages, stageIndex: -1 };
  }
  if (order.status === "unpaid") {
    const deadline = created + PAYMENT_WINDOW_MS;
    if (now > deadline) {
      return { key: "expired", label: "Kedaluwarsa", tone: "bg-ink/10", stages, stageIndex: -1 };
    }
    return {
      key: "unpaid",
      label: "Menunggu pembayaran",
      tone: "bg-sun",
      stages,
      stageIndex: -1,
      deadline,
      canPay: true,
      canCancel: true,
    };
  }

  const start = new Date(order.paidAt || order.createdAt).getTime();
  const sec = (now - start) / 1000;
  let idx = 0;
  stages.forEach((s, i) => {
    if (sec >= s.at) idx = i;
  });
  const done = idx === stages.length - 1;
  const next = stages[idx + 1];
  return {
    key: done ? "done" : stages[idx].id,
    label: stages[idx].label,
    tone: done ? "bg-mint" : "bg-lilac",
    stages,
    stageIndex: idx,
    arrived: done,
    canCancel: idx < 2,
    nextInSec: next ? Math.max(0, Math.ceil(next.at - sec)) : 0,
  };
}

export const ORDER_FILTERS = [
  { id: "semua", label: "Semua", match: () => true },
  { id: "unpaid", label: "Belum bayar", match: (s) => s.key === "unpaid" },
  { id: "proses", label: "Diproses", match: (s) => ["diproses", "dikemas", "dikirim", "siap"].includes(s.key) },
  { id: "done", label: "Selesai", match: (s) => s.key === "done" },
  { id: "batal", label: "Dibatalkan", match: (s) => ["cancelled", "expired"].includes(s.key) },
];

// Fake but stable virtual-account number for the simulated payment screen.
export function paymentRef(method, orderId) {
  const digits = orderId.replace(/\D/g, "").padStart(8, "0").slice(-8);
  if (method.type === "va") return `${method.prefix}${digits}`;
  return `MBY-${digits}`;
}

// Expand bundles to their component products (used for fridge + stock).
export function expandLine(line) {
  const p = getProduct(line.sku);
  if (p?.bundle) {
    return p.bundle.map((b) => ({ sku: b.sku, qty: b.qty * line.qty }));
  }
  return [{ sku: line.sku, qty: line.qty }];
}
