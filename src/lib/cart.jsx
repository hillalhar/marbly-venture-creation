// Simulated store: cart, stock, orders, payments and reviews. Client-side only
// (localStorage). Checkout does NOT take real payment.
//
// Cart and orders are per account; stock and reviews are shared on this device
// to mimic a real shop where everyone sees the same inventory.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProduct, PREP_OPTIONS, seedReviews } from "../data/products.js";
import {
  computeTotals,
  DELIVERY,
  expandLine,
  getPayment,
  orderState,
  paymentRef,
} from "../data/shop.js";
import { useAuth } from "./auth.jsx";
import { load, save, uid } from "./storage.js";
import { useUserStore } from "./userStore.js";

const SOLD_KEY = "marbly.sold";
const REVIEWS_KEY = "marbly.reviews";

const CartContext = createContext(null);

const lineKey = (sku, prep) => `${sku}::${prep}`;

export function CartProvider({ children }) {
  const { user } = useAuth();
  const email = user?.email;

  const [items, setItems] = useUserStore(email, "cart", {}); // { key: { sku, prep, qty } }
  const [orders, setOrders] = useUserStore(email, "orders", []);
  const [voucherCode, setVoucherCode] = useUserStore(email, "voucher", "");
  const [sold, setSold] = useState(() => load(SOLD_KEY, {})); // shared stock ledger
  const [reviews, setReviews] = useState(() => load(REVIEWS_KEY, {})); // { sku: [review] }

  useEffect(() => save(SOLD_KEY, sold), [sold]);
  useEffect(() => save(REVIEWS_KEY, reviews), [reviews]);

  // ---------- stock ----------
  const available = (sku) => Math.max(0, (getProduct(sku)?.stock ?? 0) - (sold[sku] || 0));
  const qtyInCart = (sku, exceptKey) =>
    Object.entries(items).reduce(
      (n, [k, it]) => (it.sku === sku && k !== exceptKey ? n + it.qty : n),
      0
    );

  // ---------- cart ----------
  function add(sku, qty = 1, prep) {
    const p = getProduct(sku);
    if (!p) return { ok: false, added: 0 };
    const pr = prep && p.prep.includes(prep) ? prep : p.prep[0];
    const key = lineKey(sku, pr);
    const current = items[key]?.qty || 0;
    const room = available(sku) - qtyInCart(sku, key) - current;
    const added = Math.max(0, Math.min(qty, room));
    if (added > 0) {
      setItems((prev) => ({ ...prev, [key]: { sku, prep: pr, qty: (prev[key]?.qty || 0) + added } }));
    }
    return { ok: added > 0, added, capped: added < qty };
  }

  function setQty(key, qty) {
    setItems((prev) => {
      const it = prev[key];
      if (!it) return prev;
      const next = { ...prev };
      const max = available(it.sku) - qtyInCart(it.sku, key);
      const q = Math.min(max, Math.floor(qty));
      if (q <= 0) delete next[key];
      else next[key] = { ...it, qty: q };
      return next;
    });
  }

  function remove(key) {
    setItems((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function clear() {
    setItems({});
  }

  const lines = useMemo(
    () =>
      Object.entries(items)
        .map(([key, it]) => {
          const p = getProduct(it.sku);
          if (!p || it.qty <= 0) return null;
          return {
            ...p,
            key,
            prep: it.prep,
            prepLabel: PREP_OPTIONS[it.prep]?.label || "",
            qty: it.qty,
            lineTotal: p.price * it.qty,
            maxQty: available(it.sku) - qtyInCart(it.sku, key),
          };
        })
        .filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, sold]
  );

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);

  // ---------- vouchers ----------
  function applyVoucher(code) {
    const res = computeTotals(lines, "reguler", code).voucher;
    if (res.ok) setVoucherCode(res.code);
    return res;
  }
  const removeVoucher = () => setVoucherCode("");

  // ---------- orders ----------
  function placeOrder({ address, delivery, payment, note }) {
    if (!lines.length) return null;
    const method = getPayment(payment);
    const del = DELIVERY.find((d) => d.id === delivery.id);
    if (!method || !del) return null;

    const totals = computeTotals(lines, del.id, voucherCode);
    const id = "MB" + Date.now().toString().slice(-8);
    const now = new Date().toISOString();
    const isCod = method.type === "cod";
    const order = {
      id,
      createdAt: now,
      lines: lines.map((l) => ({
        key: l.key,
        sku: l.sku,
        name: l.name,
        emoji: l.emoji,
        prep: l.prep,
        prepLabel: l.prepLabel,
        weight: l.weight,
        qty: l.qty,
        price: l.price,
      })),
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      discount: totals.discount,
      voucher: totals.voucher.ok ? totals.voucher.code : null,
      total: totals.total,
      delivery: { id: del.id, label: del.label, date: delivery.date || null, slot: delivery.slot || null },
      address: del.id === "pickup" ? null : address,
      payment: { id: method.id, label: method.label, short: method.short, type: method.type, ref: paymentRef(method, id) },
      note: note || "",
      status: isCod ? "paid" : "unpaid",
      paidAt: isCod ? now : null,
      stocked: false,
      reviewed: {},
    };

    setOrders((prev) => [order, ...prev]);
    // reserve stock immediately (like a real checkout)
    setSold((prev) => {
      const next = { ...prev };
      order.lines.forEach((l) => {
        next[l.sku] = (next[l.sku] || 0) + l.qty;
      });
      return next;
    });
    clear();
    setVoucherCode("");
    return order;
  }

  const patchOrder = (id, fn) => setOrders((prev) => prev.map((o) => (o.id === id ? fn(o) : o)));

  function payOrder(id) {
    patchOrder(id, (o) => (o.status === "unpaid" ? { ...o, status: "paid", paidAt: new Date().toISOString() } : o));
  }

  function cancelOrder(id, reason = "") {
    const o = orders.find((x) => x.id === id);
    if (!o || !orderState(o).canCancel) return false;
    patchOrder(id, (x) => ({ ...x, status: "cancelled", cancelledAt: new Date().toISOString(), cancelReason: reason }));
    // release reserved stock
    setSold((prev) => {
      const next = { ...prev };
      o.lines.forEach((l) => {
        next[l.sku] = Math.max(0, (next[l.sku] || 0) - l.qty);
      });
      return next;
    });
    return true;
  }

  const markStocked = (id) => patchOrder(id, (o) => ({ ...o, stocked: true }));
  const getOrder = (id) => orders.find((o) => o.id === id) || null;

  function reorder(order) {
    let added = 0;
    order.lines.forEach((l) => {
      added += add(l.sku, l.qty, l.prep).added;
    });
    return added;
  }

  // ---------- reviews ----------
  function getReviews(sku) {
    return [...(reviews[sku] || []), ...seedReviews(sku)];
  }

  function addReview(sku, { rating, text, orderId }) {
    const r = {
      id: uid("R"),
      user: user?.name || "Pelanggan",
      email,
      rating,
      text: String(text || "").trim(),
      date: new Date().toISOString(),
      orderId,
    };
    setReviews((prev) => ({ ...prev, [sku]: [r, ...(prev[sku] || [])] }));
    if (orderId) patchOrder(orderId, (o) => ({ ...o, reviewed: { ...o.reviewed, [sku]: true } }));
  }

  // units of each product bought (for "Sering dibeli")
  const purchased = useMemo(() => {
    const m = {};
    orders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) => o.lines.forEach((l) => (m[l.sku] = (m[l.sku] || 0) + l.qty)));
    return m;
  }, [orders]);

  const value = {
    lines, count, subtotal, items,
    add, setQty, remove, clear, available,
    voucherCode, applyVoucher, removeVoucher,
    orders, placeOrder, payOrder, cancelOrder, markStocked, getOrder, reorder,
    getReviews, addReview, purchased,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus dipakai di dalam <CartProvider>");
  return ctx;
}

export { expandLine };
