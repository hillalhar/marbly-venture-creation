// Demo auth for the freemium prototype.
//
// IMPORTANT: this is CLIENT-SIDE ONLY. Accounts, passwords and premium checks
// live in the browser's localStorage, so this is NOT real security — anyone can
// bypass it via DevTools. For a real product, move auth, profile data and the
// premium check to a backend (and move the Gemini API key server-side too).

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { load, save, removeKey, uid } from "./storage.js";

const SESSION_KEY = "marbly.session";
const USERS_KEY = "marbly.users";

const DEMO_USERS = [
  { email: "free@marbly.id", password: "free123", name: "Pengguna Free", plan: "free" },
  { email: "premium@marbly.id", password: "premium123", name: "Pengguna Premium", plan: "premium" },
];

export const DEMO_CREDENTIALS = DEMO_USERS.map(({ email, password, plan }) => ({
  email,
  password,
  plan,
}));

const blankProfile = (u) => ({
  email: u.email,
  password: u.password,
  name: u.name,
  phone: u.phone || "",
  plan: u.plan || "free",
  createdAt: u.createdAt || new Date().toISOString(),
  addresses: u.addresses || [],
});

function loadUsers() {
  const stored = load(USERS_KEY, null);
  if (Array.isArray(stored) && stored.length) {
    // make sure demo accounts always exist
    const missing = DEMO_USERS.filter((d) => !stored.some((s) => s.email === d.email));
    return [...stored, ...missing.map(blankProfile)];
  }
  return DEMO_USERS.map(blankProfile);
}

const norm = (e) => String(e || "").trim().toLowerCase();
export const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e).trim());
export const isValidPhone = (p) => /^(\+62|62|0)8\d{7,11}$/.test(String(p).replace(/[\s-]/g, ""));

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [email, setEmail] = useState(() => load(SESSION_KEY, null)?.email || null);

  useEffect(() => save(USERS_KEY, users), [users]);
  useEffect(() => {
    if (email) save(SESSION_KEY, { email });
    else removeKey(SESSION_KEY);
  }, [email]);

  const record = users.find((u) => u.email === email) || null;
  // never expose the password to the UI
  const user = useMemo(() => {
    if (!record) return null;
    const { password: _pw, ...rest } = record;
    return rest;
  }, [record]);

  function patchUser(fn) {
    setUsers((prev) => prev.map((u) => (u.email === email ? fn(u) : u)));
  }

  function login(rawEmail, password) {
    const found = users.find((u) => u.email === norm(rawEmail));
    if (!found || found.password !== password) {
      return { ok: false, error: "Email atau password salah." };
    }
    setEmail(found.email);
    return { ok: true };
  }

  function register({ name, email: rawEmail, password }) {
    const e = norm(rawEmail);
    if (!String(name).trim()) return { ok: false, error: "Nama wajib diisi." };
    if (!isValidEmail(e)) return { ok: false, error: "Format email tidak valid." };
    if (String(password).length < 6) return { ok: false, error: "Password minimal 6 karakter." };
    if (users.some((u) => u.email === e)) return { ok: false, error: "Email sudah terdaftar. Silakan masuk." };
    const u = blankProfile({ email: e, password, name: String(name).trim(), plan: "free" });
    setUsers((prev) => [...prev, u]);
    setEmail(e);
    return { ok: true };
  }

  function logout() {
    setEmail(null);
  }

  function updateProfile({ name, phone }) {
    patchUser((u) => ({ ...u, name: name ?? u.name, phone: phone ?? u.phone }));
  }

  function changePassword(current, next) {
    if (record?.password !== current) return { ok: false, error: "Password saat ini salah." };
    if (String(next).length < 6) return { ok: false, error: "Password baru minimal 6 karakter." };
    patchUser((u) => ({ ...u, password: next }));
    return { ok: true };
  }

  function setPlan(plan) {
    patchUser((u) => ({ ...u, plan }));
  }

  // ---- address book ----
  function saveAddress(addr) {
    const id = addr.id || uid("A");
    patchUser((u) => {
      const list = u.addresses.filter((a) => a.id !== id);
      const isDefault = addr.isDefault || list.length === 0;
      const next = { ...addr, id, isDefault };
      const others = isDefault ? list.map((a) => ({ ...a, isDefault: false })) : list;
      const existingIdx = u.addresses.findIndex((a) => a.id === id);
      const merged = [...others];
      merged.splice(existingIdx >= 0 ? existingIdx : merged.length, 0, next);
      return { ...u, addresses: merged };
    });
    return id;
  }

  function removeAddress(id) {
    patchUser((u) => {
      const list = u.addresses.filter((a) => a.id !== id);
      if (list.length && !list.some((a) => a.isDefault)) list[0] = { ...list[0], isDefault: true };
      return { ...u, addresses: list };
    });
  }

  function setDefaultAddress(id) {
    patchUser((u) => ({
      ...u,
      addresses: u.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
    }));
  }

  const value = {
    user,
    ready: true,
    isAuthed: Boolean(user),
    isPremium: user?.plan === "premium",
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    upgradeToPremium: () => setPlan("premium"),
    downgradeToFree: () => setPlan("free"),
    saveAddress,
    removeAddress,
    setDefaultAddress,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
