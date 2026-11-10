import { Link } from "react-router-dom";
import { LogoMark } from "../components/Logo.jsx";
import { usePageTitle } from "../lib/hooks.js";

export default function NotFound() {
  usePageTitle("Halaman tidak ditemukan");
  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <LogoMark className="mx-auto h-20 w-24 opacity-80" />
      <h1 className="mt-6 font-display text-3xl font-bold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-ink/60">Tautan ini mungkin sudah berubah atau salah ketik.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-coral">Ke beranda</Link>
        <Link to="/toko" className="btn-outline">Belanja daging</Link>
      </div>
    </div>
  );
}
