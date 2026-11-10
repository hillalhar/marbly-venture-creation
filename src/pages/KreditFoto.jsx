import { PHOTO_CREDITS } from "../data/photoCredits.js";
import { usePageTitle } from "../lib/hooks.js";
import { PageHero } from "../components/ui.jsx";

export default function KreditFoto() {
  usePageTitle("Kredit foto");
  return (
    <div>
      <PageHero
        badge="Kredit foto"
        title="Foto yang dipakai di marbly"
        desc="Foto produk dan resep berlisensi Creative Commons. Terima kasih kepada para fotografer berikut."
      />
      <div className="page">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PHOTO_CREDITS.map((c) => (
            <li key={c.file} className="card flex gap-3 p-3">
              <img src={c.file} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" loading="lazy" />
              <div className="min-w-0 text-xs leading-relaxed">
                <p className="truncate font-semibold text-ink">{c.title}</p>
                <p className="truncate text-ink/55">oleh {c.author}</p>
                <p className="text-ink/55">
                  {c.license} ·{" "}
                  <a href={c.source} target="_blank" rel="noopener noreferrer" className="font-semibold text-coral hover:underline">
                    sumber
                  </a>
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-ink/45">Foto ditampilkan dengan pemotongan (crop) dan pengubahan ukuran.</p>
      </div>
    </div>
  );
}
