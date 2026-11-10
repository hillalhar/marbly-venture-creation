import { useState } from "react";
import { Link } from "react-router-dom";
import { useFridge } from "../lib/fridge.jsx";
import { useNow, usePageTitle } from "../lib/hooks.js";
import { useToast } from "../lib/toast.jsx";
import { getProduct, PRODUCTS } from "../data/products.js";
import { RECIPES } from "../data/recipes.js";
import { DAY, timeLeftLabel } from "../data/tools.js";
import { useAddToCart } from "../components/ProductCard.jsx";
import { EmptyState, Field, Modal, PageHero, Tabs } from "../components/ui.jsx";

const SINGLE = PRODUCTS.filter((p) => !p.bundle);

function statusOf(item, now) {
  const left = item.expiresAt - now;
  if (left <= 0) return { key: "expired", label: "Kedaluwarsa", cls: "bg-coral text-white", bar: "bg-coral" };
  if (left <= DAY) return { key: "soon", label: "Masak hari ini", cls: "bg-sun", bar: "bg-sun" };
  return { key: "ok", label: "Aman", cls: "bg-mintsoft", bar: "bg-mint" };
}

export default function Kulkas() {
  usePageTitle("Kulkas saya");
  const { items, addItem, remove, moveTo, consume } = useFridge();
  const toast = useToast();
  useNow(30000); // re-render periodically so countdowns stay live
  const now = Date.now();
  const [tab, setTab] = useState("semua");
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [useItem, setUseItem] = useState(null);
  const [discard, setDiscard] = useState(null);

  const sorted = [...items].sort((a, b) => a.expiresAt - b.expiresAt);
  const urgent = sorted.filter((i) => statusOf(i, now).key !== "ok");
  const totalKg = items.reduce((n, i) => n + i.grams, 0) / 1000;

  const filters = {
    semua: () => true,
    chiller: (i) => i.storage === "chiller",
    freezer: (i) => i.storage === "freezer",
    segera: (i) => statusOf(i, now).key !== "ok",
  };
  const shown = sorted.filter(filters[tab]).filter((i) => !q.trim() || i.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div>
      <PageHero
        badge="🧊 Kulkas Saya"
        badgeTone="bg-lilac"
        tone="from-lilac/40"
        title="Stok daging,"
        accent="tanpa ada yang terbuang"
        desc="Catat daging di kulkas dan freezer. marbly menghitung batas simpan dan mengingatkan mana yang harus dimasak lebih dulu."
      >
        <div className="mt-5 grid max-w-2xl grid-cols-3 gap-3">
          <Stat label="Total stok" value={`${totalKg.toFixed(totalKg % 1 ? 1 : 0)} kg`} />
          <Stat label="Item" value={items.length} />
          <Stat label="Perlu perhatian" value={urgent.length} warn={urgent.length > 0} />
        </div>
      </PageHero>

      <section className="mx-auto max-w-6xl px-5">
        {urgent.length > 0 && (
          <div className="mb-5 rounded-2xl border border-ink/10 bg-sun/60 p-4 text-sm">
            <p className="font-bold">⚠️ {urgent.map((i) => i.name).join(", ")} sudah dekat atau melewati batas simpan.</p>
            <p className="mt-1 text-ink/70">Masak hari ini, pindahkan ke freezer, atau buang jika sudah kedaluwarsa.</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            className="flex-1"
            items={[
              { id: "semua", label: "Semua", count: items.length },
              { id: "chiller", label: "Kulkas", icon: "🧊", count: items.filter(filters.chiller).length },
              { id: "freezer", label: "Freezer", icon: "❄️", count: items.filter(filters.freezer).length },
              { id: "segera", label: "Segera", icon: "⏰", count: urgent.length },
            ]}
            value={tab}
            onChange={setTab}
          />
          <button onClick={() => setAddOpen(true)} className="btn-coral btn-sm">+ Tambah daging</button>
        </div>
        {items.length > 3 && (
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari di kulkas…" className="input mt-3 rounded-full" aria-label="Cari di kulkas" />
        )}

        <div className="mt-5">
          {items.length === 0 ? (
            <EmptyState
              icon="🧊"
              title="Kulkas masih kosong"
              desc="Tambah manual, atau belanja di toko lalu pindahkan dari halaman pesanan setelah tiba."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <button onClick={() => setAddOpen(true)} className="btn-coral btn-sm">+ Tambah daging</button>
                  <Link to="/toko" className="btn-outline btn-sm">Belanja daging</Link>
                </div>
              }
            />
          ) : shown.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink/50">Tidak ada item di filter ini.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {shown.map((i) => (
                <FridgeCard
                  key={i.id}
                  item={i}
                  now={now}
                  onMove={(id, to) => {
                    moveTo(id, to);
                    toast(to === "freezer" ? `${i.name} dibekukan. Tahan berbulan-bulan.` : `${i.name} dicairkan. Masak dalam 1–2 hari.`, { tone: "info" });
                  }}
                  onUse={() => setUseItem(i)}
                  onDiscard={() => setDiscard(i)}
                />
              ))}
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-ink/50">
          Batas simpan adalah panduan umum: kulkas 0–4°C sekitar 3 hari (giling 2 hari), freezer −18°C sekitar 6 bulan (giling 3 bulan).
          Daging yang dicairkan di kulkas sebaiknya dimasak dalam 1–2 hari. Tetap cek bau dan tekstur sebelum memasak.
        </p>
      </section>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah daging ke kulkas">
        <AddForm
          onAdd={(x) => {
            addItem(x);
            setAddOpen(false);
            toast(`${x.name} ditambahkan ke ${x.storage === "freezer" ? "freezer" : "kulkas"}`);
          }}
        />
      </Modal>
      <UseModal
        item={useItem}
        onClose={() => setUseItem(null)}
        onSubmit={(g) => {
          consume(useItem.id, g);
          toast(g >= useItem.grams ? `${useItem.name} habis dipakai` : `${g} g ${useItem.name} dipakai`);
          setUseItem(null);
        }}
      />
      <Modal
        open={Boolean(discard)}
        onClose={() => setDiscard(null)}
        title={discard && statusOf(discard, now).key === "expired" ? "Buang daging kedaluwarsa?" : "Hapus dari kulkas?"}
        footer={
          <>
            <button onClick={() => setDiscard(null)} className="btn-outline btn-sm">Batal</button>
            <button
              onClick={() => {
                remove(discard.id);
                toast(`${discard.name} dihapus`, { tone: "info" });
                setDiscard(null);
              }}
              className="btn-coral btn-sm"
            >
              Hapus
            </button>
          </>
        }
      >
        <p className="text-sm text-ink/70">{discard && `${discard.name} (${discard.grams} g) akan dihapus dari daftar.`}</p>
      </Modal>
    </div>
  );
}

function FridgeCard({ item, now, onMove, onUse, onDiscard }) {
  const addToCart = useAddToCart();
  const st = statusOf(item, now);
  const recipes = RECIPES.filter((r) => r.cutId === item.cutId).slice(0, 3);
  const isFreezer = item.storage === "freezer";
  const total = item.expiresAt - item.storedAt;
  const pctLeft = Math.max(0, Math.min(100, ((item.expiresAt - now) / total) * 100));
  const product = getProduct(item.sku);

  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold">{item.name}</p>
          <p className="text-sm text-ink/60">
            {item.grams} g · {isFreezer ? "❄️ Freezer" : "🧊 Kulkas"}
            {item.label ? ` · ${item.label}` : ""}
          </p>
          <p className="text-xs text-ink/40">
            Disimpan {new Date(item.storedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            {item.source !== "manual" ? ` · dari pesanan ${item.source}` : ""}
          </p>
        </div>
        <span className={`badge shrink-0 border border-ink/10 ${st.cls}`}>{st.label}</span>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-ink/60">Batas simpan</span>
          <span className={st.key === "ok" ? "" : "text-coral"}>{timeLeftLabel(item.expiresAt, now)}</span>
        </div>
        <div className="track mt-1">
          <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${pctLeft}%` }} />
        </div>
      </div>

      {recipes.length > 0 && st.key !== "expired" && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-bold text-ink/60">Masak jadi:</span>
          {recipes.map((r) => (
            <Link key={r.id} to={`/resep/${r.id}`} className="rounded-full border border-ink/10 bg-cream px-2.5 py-0.5 font-semibold hover:border-ink/30">
              {r.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {st.key !== "expired" && (
          <>
            <button onClick={onUse} className="btn-dark px-4 py-1.5 text-sm">🍳 Pakai</button>
            <button onClick={() => onMove(item.id, isFreezer ? "chiller" : "freezer")} className="btn-outline px-4 py-1.5 text-sm shadow-none">
              {isFreezer ? "🧊 Cairkan" : "❄️ Bekukan"}
            </button>
          </>
        )}
        {product && (
          <button onClick={() => addToCart(product, 1)} className="btn-ghost px-3 py-1.5 text-sm">🔁 Beli lagi</button>
        )}
        <button onClick={onDiscard} className="btn-ghost ml-auto px-3 py-1.5 text-sm text-coral">
          {st.key === "expired" ? "🗑️ Buang" : "Hapus"}
        </button>
      </div>
    </div>
  );
}

function UseModal({ item, onClose, onSubmit }) {
  const [grams, setGrams] = useState("");
  if (!item) return null;
  const g = Math.min(item.grams, Math.max(0, Number(grams) || 0));
  return (
    <Modal
      open
      onClose={onClose}
      title={`Pakai ${item.name}`}
      footer={
        <>
          <button onClick={onClose} className="btn-outline btn-sm">Batal</button>
          <button onClick={() => { onSubmit(g); setGrams(""); }} disabled={g <= 0} className="btn-coral btn-sm">Simpan</button>
        </>
      }
    >
      <p className="text-sm text-ink/60">Tersisa {item.grams} g. Berapa yang dipakai?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[0.25, 0.5, 1].map((f) => {
          const v = Math.round(item.grams * f);
          return (
            <button key={f} onClick={() => setGrams(String(v))} className={`chip ${Number(grams) === v ? "chip-active" : ""}`}>
              {f === 1 ? "Semua" : `${f * 100}%`} · {v} g
            </button>
          );
        })}
      </div>
      <input type="number" min="1" max={item.grams} value={grams} onChange={(e) => setGrams(e.target.value)} placeholder="Gram" className="input mt-3" aria-label="Gram dipakai" />
    </Modal>
  );
}

function AddForm({ onAdd }) {
  const [sku, setSku] = useState(SINGLE[0].sku);
  const [grams, setGrams] = useState(SINGLE[0].weight);
  const [storage, setStorage] = useState("chiller");
  const [daysAgo, setDaysAgo] = useState(0);
  const [error, setError] = useState("");

  function pick(next) {
    setSku(next);
    const p = SINGLE.find((x) => x.sku === next);
    if (p) setGrams(p.weight);
  }

  function submit(e) {
    e.preventDefault();
    const p = SINGLE.find((x) => x.sku === sku);
    const g = Number(grams);
    if (!(g > 0)) return setError("Berat harus lebih dari 0 gram.");
    onAdd({ name: p.name, cutId: p.cutId, sku: p.sku, grams: Math.round(g), storage, daysAgo: Math.max(0, Number(daysAgo) || 0) });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Jenis daging" htmlFor="f-sku">
        <select id="f-sku" value={sku} onChange={(e) => pick(e.target.value)} className="input">
          {SINGLE.map((p) => <option key={p.sku} value={p.sku}>{p.name}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Berat (gram)" error={error} htmlFor="f-g">
          <input id="f-g" type="number" min="1" value={grams} onChange={(e) => { setGrams(e.target.value); setError(""); }} className="input" />
        </Field>
        <Field label="Disimpan sejak (hari lalu)" htmlFor="f-d">
          <input id="f-d" type="number" min="0" value={daysAgo} onChange={(e) => setDaysAgo(e.target.value)} className="input" />
        </Field>
      </div>
      <div>
        <p className="label">Disimpan di</p>
        <div className="grid grid-cols-2 gap-2">
          {[["chiller", "🧊 Kulkas"], ["freezer", "❄️ Freezer"]].map(([v, l]) => (
            <button key={v} type="button" onClick={() => setStorage(v)} className={`rounded-2xl border py-2.5 font-bold ${storage === v ? "border-ink bg-ink text-white" : "border-ink/20 bg-white"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <button type="submit" className="btn-coral w-full">Simpan</button>
    </form>
  );
}

function Stat({ label, value, warn }) {
  return (
    <div className={`rounded-2xl border border-ink/10 p-3 ${warn ? "bg-sun" : "bg-white"}`}>
      <p className="text-xs font-bold text-ink/60">{label}</p>
      <p className="font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
