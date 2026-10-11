import { useState } from "react";
import { useAuth, DEMO_CREDENTIALS } from "./lib/auth.jsx";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) setError(res.error);
  };

  const fill = (creds) => {
    setEmail(creds.email);
    setPassword(creds.password);
    setError("");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-creamsoft px-5 py-10 font-body text-ink">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cream">
            <svg viewBox="0 0 48 48" className="h-8 w-8">
              <path
                d="M6 20 C4 9 16 4 27 5 C40 6 44 15 40 23 C37 29 28 31 20 31 C11 31 8 26 6 20 Z"
                fill="#f26d6d"
                stroke="#1a1413"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <circle cx="18" cy="16" r="2" fill="#1a1413" />
              <circle cx="28" cy="12" r="2" fill="#1a1413" />
              <circle cx="32" cy="20" r="2" fill="#1a1413" />
              <circle cx="23" cy="22" r="2" fill="#1a1413" />
            </svg>
          </span>
          <span className="font-display text-3xl font-extrabold lowercase">marbly</span>
        </div>

        <div className="rounded-xl3 border-2 border-ink bg-white p-7 shadow-card sm:p-8">
          <h1 className="font-display text-2xl font-extrabold">Masuk dulu yuk</h1>
          <p className="mt-1 text-sm text-ink/60">
            Cek daging gratis setelah masuk. Fitur premium untuk yang berlangganan.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-ink/70">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                className="mt-1 w-full rounded-xl2 border-2 border-ink bg-cream px-4 py-2.5 outline-none focus:ring-2 focus:ring-coral"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink/70">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl2 border-2 border-ink bg-cream px-4 py-2.5 outline-none focus:ring-2 focus:ring-coral"
                required
              />
            </div>

            {error && (
              <p className="rounded-xl2 bg-coral/15 px-3 py-2 text-sm font-semibold text-coral">
                {error}
              </p>
            )}

            <button type="submit" className="btn-coral w-full">
              Masuk
            </button>
          </form>
        </div>

        {/* demo accounts */}
        <div className="mt-5 rounded-xl2 border-2 border-dashed border-ink/30 bg-cream p-4">
          <p className="text-center text-xs font-bold uppercase tracking-wide text-ink/50">
            Akun demo — klik untuk isi otomatis
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {DEMO_CREDENTIALS.map((c) => (
              <button
                key={c.email}
                onClick={() => fill(c)}
                className={`rounded-xl2 border-2 border-ink px-3 py-2 text-left text-sm shadow-hard transition-transform active:translate-y-0.5 ${
                  c.plan === "premium" ? "bg-sun" : "bg-white"
                }`}
              >
                <span className="block font-display font-extrabold">
                  {c.plan === "premium" ? "⭐ Premium" : "Free"}
                </span>
                <span className="block text-ink/70">{c.email}</span>
                <span className="block text-ink/50">pass: {c.password}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
