// Demo auth for the freemium prototype.
//
// IMPORTANT: this is CLIENT-SIDE ONLY. Accounts and premium checks live in the
// browser, so this is NOT real security — anyone can bypass it via DevTools.
// It exists to demonstrate the freemium flow. For a real product, move auth and
// the premium check to a backend (and move the Gemini API key server-side too).

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "marbly.session";

// Demo accounts (hardcoded on purpose for the prototype).
const DEMO_USERS = [
  {
    email: "free@marbly.id",
    password: "free123",
    name: "Pengguna Free",
    plan: "free",
  },
  {
    email: "premium@marbly.id",
    password: "premium123",
    name: "Pengguna Premium",
    plan: "premium",
  },
];

export const DEMO_CREDENTIALS = DEMO_USERS.map(({ email, password, plan }) => ({
  email,
  password,
  plan,
}));

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // restore session
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  function login(email, password) {
    const found = DEMO_USERS.find(
      (u) =>
        u.email.toLowerCase() === String(email).trim().toLowerCase() &&
        u.password === password
    );
    if (!found) {
      return { ok: false, error: "Email atau password salah." };
    }
    const session = { email: found.email, name: found.name, plan: found.plan };
    setUser(session);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* ignore */
    }
    return { ok: true };
  }

  function logout() {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  // demo-only: let a free user "upgrade" instantly to try premium
  function upgradeToPremium() {
    if (!user) return;
    const next = { ...user, plan: "premium" };
    setUser(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  const value = useMemo(
    () => ({
      user,
      ready,
      isAuthed: Boolean(user),
      isPremium: user?.plan === "premium",
      login,
      logout,
      upgradeToPremium,
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
