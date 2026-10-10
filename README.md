# marbly (clone)

Klon fungsional dari situs **marbly** — cek kesegaran, kelayakan, dan marbling daging sapi dari foto. Dibangun ulang dengan React + Vite + Tailwind CSS. Semua kode, warna, dan logo di sini original (bukan salinan source code asli, yang tidak publik).

## Jalankan

```bash
npm install
npm run dev      # buka http://localhost:5173
npm run build    # build produksi ke folder dist/
npm run preview  # pratinjau hasil build
```

## Soal "AI untuk cek daging"

Situs asli dibuat di platform [Lovable](https://lovable.dev) dan source code AI-nya tidak dipublikasikan, jadi tidak ada cara pasti tahu model apa yang dipakai. Klon ini memakai **Google Gemini vision** sebagai mesin analisis utama.

### Setup (wajib supaya AI jalan)

1. Ambil API key gratis di <https://aistudio.google.com/apikey>
2. Buat file bernama **`.env`** (persis, bukan `.env.example`) di folder project
3. Isi: `VITE_GEMINI_API_KEY=key_kamu`
4. Jalankan ulang `npm run dev` (Vite hanya baca `.env` saat start)

App mengirim foto ke Gemini dengan prompt khusus penilaian daging, lalu menampilkan skor kelayakan, marbling, kesegaran, perkiraan sisa tahan, dan satu kalimat kesimpulan. Model dipilih **otomatis** (`gemini-flash-latest` dulu, lalu fallback). Nama model versi-pin seperti `gemini-1.5-flash`/`2.5-flash` sengaja dihindari karena sudah di-pensiun untuk user baru dan bikin error 404.

Kalau mau paksa model tertentu, isi `VITE_GEMINI_MODEL` di `.env`. Kosongkan untuk auto-detect.

Jika key salah/kosong atau API error, app menampilkan **pesan error yang jelas** (bukan diam-diam ngasih angka palsu).

### Mode lokal (opsional, cadangan)

Masih ada heuristik piksel di `src/lib/analyzeMeat.js` (`analyzeLocally`) sebagai cadangan, tapi **tidak dipakai otomatis** karena hasilnya kasar. Aktifkan hanya kalau kamu sengaja memanggil `analyzeMeat(dataUrl, days, { allowLocalFallback: true })`.

> Mau pakai OpenAI GPT-4o atau provider lain? Cukup tambah satu fungsi di `src/lib/analyzeMeat.js` dengan bentuk hasil yang sama (`edible`, `marbling`, `freshness`, dll).

## Struktur

```
index.html
src/
  main.jsx            # entry React
  App.jsx             # seluruh UI (header, hero, kartu analisis, dst.)
  index.css           # Tailwind + style tombol
  lib/
    analyzeMeat.js    # layer AI: Gemini + fallback lokal
public/
  favicon.svg
.env.example          # template API key
```

## Catatan

Hasil adalah skrining visual dari foto, **bukan jaminan keamanan pangan**. Tetap periksa bau dan tekstur daging sebelum membeli atau memasak.
