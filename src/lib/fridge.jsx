// Fridge/freezer inventory tracker, per account (localStorage).
// Each item has an expiry computed from the storage type; purchases from the
// in-app shop can be moved in once delivered.

import { createContext, useContext } from "react";
import { getProduct } from "../data/products.js";
import { expandLine } from "../data/shop.js";
import { DAY, shelfDays, thawedDays } from "../data/tools.js";
import { useAuth } from "./auth.jsx";
import { uid } from "./storage.js";
import { useUserStore } from "./userStore.js";

const FridgeContext = createContext(null);

export function FridgeProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useUserStore(user?.email, "fridge", []);

  // daysAgo: how many days ago it was bought/stored (manual entry)
  function addItem({ name, cutId, sku, grams, storage = "chiller", daysAgo = 0, source = "manual", label = "" }) {
    const now = Date.now();
    const storedAt = now - daysAgo * DAY;
    const ground = Boolean(getProduct(sku)?.ground);
    const expiresAt = storedAt + shelfDays(storage, ground) * DAY;
    setItems((prev) => [
      ...prev,
      { id: uid("F"), name, label, cutId, sku: sku || null, ground, grams, storage, storedAt, expiresAt, source },
    ]);
  }

  function addFromOrder(order) {
    order.lines.forEach((l) => {
      expandLine(l).forEach(({ sku, qty }) => {
        const p = getProduct(sku);
        if (!p) return;
        addItem({
          name: p.name,
          cutId: p.cutId,
          sku: p.sku,
          grams: p.weight * qty,
          storage: "chiller",
          source: order.id,
          label: l.prepLabel || "",
        });
      });
    });
  }

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  // use part of an item; removes it when nothing is left
  function consume(id, grams) {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, grams: Math.max(0, i.grams - grams) } : i))
        .filter((i) => i.grams > 0)
    );
  }

  // chiller <-> freezer. Freezing restarts the clock; thawing leaves a short window.
  function moveTo(id, storage) {
    const now = Date.now();
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id || i.storage === storage) return i;
        const days = storage === "freezer" ? shelfDays("freezer", i.ground) : thawedDays(i.ground);
        return { ...i, storage, storedAt: now, expiresAt: now + days * DAY };
      })
    );
  }

  return (
    <FridgeContext.Provider value={{ items, addItem, addFromOrder, remove, consume, moveTo }}>
      {children}
    </FridgeContext.Provider>
  );
}

export function useFridge() {
  const ctx = useContext(FridgeContext);
  if (!ctx) throw new Error("useFridge harus dipakai di dalam <FridgeProvider>");
  return ctx;
}
