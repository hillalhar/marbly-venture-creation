import { useState } from "react";
import { useAuth, DEMO_CREDENTIALS } from "./lib/auth.jsx";
import { LogoMark, Wordmark } from "./components/Logo.jsx";
import { usePageTitle } from "./lib/hooks.js";

const PERKS = [
  ["📸", "Cek kesegaran daging dari foto"],
  ["🛒", "Belanja daging potong, dikirim dingin"],
  ["🧊", "Pantau stok & batas simpan di kulkas"],
  ["📖", "Resep dan panduan masak tiap cut"],
];

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // login | register
  usePageTitle(mode === "login" ? "Masuk" : "Daftar");

  return (
    <div className="grid min-h-screen bg-creamsoft font-body text-ink lg:grid-cols-2">
      {/* brand panel */}
      <div className="relative hidden overflow-hidden bg-coral p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-creamsoft">
            <LogoMark className="h-10 w-12" />
          </span>
          <Wordmark className="text-3xl !text-white" />
        </div>
        <div>
          <h2 className="font-display text-5xl font-bold leading-tight">
            Semua urusan daging,
            <br />
            satu tempat.
          </h2>
          <ul className="mt-8 space-y-3 text-lg font-semibold">
            {PERKS.map(([i, t]) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15">{i}</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-white/70">Dibuat untuk dapur Indonesia.</p>
        <LogoMark className="pointer-events-none absolute -bottom-20 -right-24 h-96 w-[30rem] opacity-15" />
      </div>

      {/* form */}
      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <span className="grid h-20 w-20 place-items-center rounded-3xl border border-ink/10 bg-white">
              <LogoMark className="h-14 w-16" />
            </span>
            <Wordmark className="mt-2 text-4xl" />
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-full border border-ink/10 bg-white p-1" role="tablist">
            {[
              ["login", "Masuk"],
              ["register", "Daftar"],
            ].map(([m, l]) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`rounded-full py-2 font-display font-bold transition-colors ${
                  mode === m ? "bg-ink text-white" : "text-ink/60"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <LoginForm onSubmit={login} onSwitch={() => setMode("register")} />
          ) : (
            <RegisterForm onSubmit={register} onSwitch={() => setMode("login")} />
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordInput({ value, onChange, autoComplete, id }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder="••••••••"
        className="input pr-20"
        required
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-bold text-ink/60 hover:bg-cream"
      >
        {show ? "Sembunyi" : "Lihat"}
      </button>
    </div>
  );
}

function LoginForm({ onSubmit, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const res = onSubmit(email, password);
    if (!res.ok) setError(res.error);
  };

  return (
    <>
      <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
        <div>
          <h1 className="font-display text-2xl font-bold">Selamat datang kembali</h1>
          <p className="mt-1 text-sm text-ink/60">Masuk untuk lanjut belanja dan cek daging.</p>
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kamu@email.com"
            className="input"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {error && (
          <p role="alert" className="rounded-2xl bg-coral/15 px-3 py-2 text-sm font-bold text-coral">
            {error}
          </p>
        )}
        <button type="submit" className="btn-coral w-full">Masuk</button>
        <p className="text-center text-sm text-ink/60">
          Belum punya akun?{" "}
          <button type="button" onClick={onSwitch} className="font-bold text-coral hover:underline">
            Daftar gratis
          </button>
        </p>
      </form>

      <div className="mt-5 rounded-2xl border border-dashed border-ink/15 p-4">
        <p className="text-center text-xs font-bold uppercase tracking-wide text-ink/50">
          Akun demo — klik untuk isi otomatis
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {DEMO_CREDENTIALS.map((c) => (
            <button
              key={c.email}
              type="button"
              onClick={() => {
                setEmail(c.email);
                setPassword(c.password);
                setError("");
              }}
              className={`rounded-2xl border border-ink/10 px-3 py-2 text-left text-sm transition-transform active:translate-y-0.5 ${
                c.plan === "premium" ? "bg-sun" : "bg-white"
              }`}
            >
              <span className="block font-display font-bold">
                {c.plan === "premium" ? "⭐ Premium" : "Free"}
              </span>
              <span className="block truncate text-ink/70">{c.email}</span>
              <span className="block text-ink/50">pass: {c.password}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function RegisterForm({ onSubmit, onSwitch }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", agree: false });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError("Konfirmasi password tidak sama.");
    if (!form.agree) return setError("Setujui syarat & ketentuan untuk melanjutkan.");
    const res = onSubmit(form);
    if (!res.ok) setError(res.error);
  };

  const strength =
    form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : /\d/.test(form.password) && form.password.length >= 8 ? 3 : 2;

  return (
    <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Buat akun marbly</h1>
        <p className="mt-1 text-sm text-ink/60">Gratis. Deteksi dasar, toko, kulkas, dan alat langsung bisa dipakai.</p>
      </div>
      <div>
        <label htmlFor="r-name" className="label">Nama lengkap</label>
        <input id="r-name" autoComplete="name" value={form.name} onChange={set("name")} className="input" required />
      </div>
      <div>
        <label htmlFor="r-email" className="label">Email</label>
        <input id="r-email" type="email" autoComplete="email" value={form.email} onChange={set("email")} className="input" required />
      </div>
      <div>
        <label htmlFor="r-pass" className="label">Password</label>
        <PasswordInput id="r-pass" value={form.password} onChange={set("password")} autoComplete="new-password" />
        <div className="mt-2 flex gap-1" aria-hidden="true">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                strength >= i ? (strength === 1 ? "bg-coral" : strength === 2 ? "bg-sun" : "bg-mint") : "bg-cream"
              }`}
            />
          ))}
        </div>
        <p className="mt-1 text-xs text-ink/50">Minimal 6 karakter. Lebih kuat dengan 8+ karakter dan angka.</p>
      </div>
      <div>
        <label htmlFor="r-confirm" className="label">Ulangi password</label>
        <input id="r-confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={set("confirm")} className="input" required />
      </div>
      <label className="flex items-start gap-2 text-sm text-ink/70">
        <input type="checkbox" checked={form.agree} onChange={set("agree")} className="mt-0.5 h-4 w-4 accent-coral" />
        Saya menyetujui syarat & ketentuan serta kebijakan privasi marbly.
      </label>
      {error && (
        <p role="alert" className="rounded-2xl bg-coral/15 px-3 py-2 text-sm font-bold text-coral">
          {error}
        </p>
      )}
      <button type="submit" className="btn-coral w-full">Daftar</button>
      <p className="text-center text-sm text-ink/60">
        Sudah punya akun?{" "}
        <button type="button" onClick={onSwitch} className="font-bold text-coral hover:underline">
          Masuk
        </button>
      </p>
    </form>
  );
}
