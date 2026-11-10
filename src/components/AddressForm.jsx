import { useState } from "react";
import { isValidPhone } from "../lib/auth.jsx";
import { Field } from "./ui.jsx";

const EMPTY = {
  label: "Rumah",
  recipient: "",
  phone: "",
  street: "",
  district: "",
  city: "",
  postal: "",
  notes: "",
  isDefault: false,
};

export function validateAddress(a) {
  const e = {};
  if (!a.recipient.trim()) e.recipient = "Nama penerima wajib diisi.";
  if (!isValidPhone(a.phone)) e.phone = "Nomor HP tidak valid (contoh: 0812xxxxxxx).";
  if (a.street.trim().length < 8) e.street = "Tulis alamat lengkap (jalan, nomor, RT/RW).";
  if (!a.district.trim()) e.district = "Kecamatan wajib diisi.";
  if (!a.city.trim()) e.city = "Kota wajib diisi.";
  if (!/^\d{5}$/.test(a.postal)) e.postal = "Kode pos 5 angka.";
  return e;
}

export function formatAddress(a) {
  if (!a) return "";
  return `${a.street}, ${a.district}, ${a.city} ${a.postal}`;
}

export default function AddressForm({ initial, defaults, onSubmit, onCancel, submitLabel = "Simpan alamat" }) {
  const [a, setA] = useState({ ...EMPTY, ...defaults, ...initial });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setA((x) => ({ ...x, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  function submit(e) {
    e.preventDefault();
    const errs = validateAddress(a);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ ...a, phone: a.phone.replace(/[\s-]/g, "") });
  }

  const cls = (k) => `input ${errors[k] ? "input-error" : ""}`;

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {["Rumah", "Kantor", "Kos", "Lainnya"].map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setA((x) => ({ ...x, label: l }))}
            className={`chip ${a.label === l ? "chip-active" : ""}`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nama penerima" error={errors.recipient} htmlFor="ad-name">
          <input id="ad-name" autoComplete="name" value={a.recipient} onChange={set("recipient")} className={cls("recipient")} />
        </Field>
        <Field label="No. HP" error={errors.phone} htmlFor="ad-phone">
          <input id="ad-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="08xxxxxxxxxx" value={a.phone} onChange={set("phone")} className={cls("phone")} />
        </Field>
      </div>
      <Field label="Alamat lengkap" error={errors.street} htmlFor="ad-street">
        <textarea id="ad-street" rows={2} autoComplete="street-address" placeholder="Jl. Melati No. 5, RT 02/RW 03" value={a.street} onChange={set("street")} className={cls("street")} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Kecamatan" error={errors.district} htmlFor="ad-district">
          <input id="ad-district" value={a.district} onChange={set("district")} className={cls("district")} />
        </Field>
        <Field label="Kota" error={errors.city} htmlFor="ad-city">
          <input id="ad-city" autoComplete="address-level2" value={a.city} onChange={set("city")} className={cls("city")} />
        </Field>
        <Field label="Kode pos" error={errors.postal} htmlFor="ad-postal">
          <input id="ad-postal" inputMode="numeric" maxLength={5} autoComplete="postal-code" value={a.postal} onChange={set("postal")} className={cls("postal")} />
        </Field>
      </div>
      <Field label="Patokan untuk kurir (opsional)" htmlFor="ad-notes">
        <input id="ad-notes" placeholder="Pagar hitam, sebelah warung" value={a.notes} onChange={set("notes")} className="input" />
      </Field>
      <label className="flex items-center gap-2 text-sm font-bold text-ink/70">
        <input type="checkbox" checked={a.isDefault} onChange={set("isDefault")} className="h-4 w-4 accent-coral" />
        Jadikan alamat utama
      </label>
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-outline btn-sm">Batal</button>
        )}
        <button type="submit" className="btn-coral btn-sm">{submitLabel}</button>
      </div>
    </form>
  );
}
