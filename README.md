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

## Freemium (login + premium)

App ini pakai model freemium dengan login sederhana.

### Akun demo

| Plan | Email | Password |
|------|-------|----------|
| Free | `free@marbly.id` | `free123` |
| Premium | `premium@marbly.id` | `premium123` |

Di halaman login ada tombol untuk mengisi kredensial otomatis. Free user juga bisa klik **"Upgrade ke Premium"** untuk mencoba fitur premium secara instan (demo, tanpa pembayaran).

### Apa yang gratis vs premium

**Free (hanya deteksi dasar):**
- Kelayakan makan, kelas marbling, kesegaran, perkiraan sisa tahan.

**Premium (3 fitur tambahan):**
1. **Deteksi bagian/cut daging** — tebakan AI bagian daging (Has Luar, Sengkel, dll) + keyakinan.
2. **Rekomendasi masakan** — saran masakan sesuai cut, lengkap dengan link ke **resep** (Cookpad), **video** (YouTube), dan **tata cara makan** (Google).
3. **Halaman Belajar** — panduan kenali daging segar, peta cut sapi, dan tips penyimpanan.

### ⚠️ Peringatan keamanan (penting)

Auth dan cek premium di sini **100% client-side** (akun di-hardcode + localStorage). Ini **bukan keamanan sungguhan** — siapa pun bisa melewatinya lewat DevTools. Cukup untuk demo/prototipe freemium. Untuk produk nyata:
- Pindahkan auth & cek langganan ke **backend** (mis. dengan database + JWT/session).
- Pindahkan API key Gemini ke **server** supaya tidak ikut terkirim ke browser.
- Gating fitur premium divalidasi di server, bukan hanya di UI.

## Halaman (routing)

App ini punya 3 halaman terpisah (pakai `react-router-dom`):

| Rute | Halaman | Akses |
|------|---------|-------|
| `/` | **Deteksi** — foto daging + hasil AI | Free (deteksi dasar) |
| `/belajar` | **Belajar** — diagram sapi interaktif, panduan kesegaran, tips simpan | Premium |
| `/menu` | **Menu** — daftar menu masakan, filter per cut & metode, link resep | Premium |

Halaman Belajar menampilkan **diagram sapi SVG interaktif** (original): klik bagian pada tubuh sapi atau tombol cut untuk melihat karakter, keempukan, kadar lemak, cara masak, dan masakan populernya.

## Struktur

```
index.html
src/
  main.jsx                # entry: Router + AuthProvider + gate login
  App.jsx                 # definisi rute (Home/Belajar/Menu)
  Login.jsx               # halaman login + akun demo
  index.css               # Tailwind + style tombol
  components/
    Layout.jsx            # Header, Footer, Logo, PremiumLock (dipakai semua halaman)
    CowDiagram.jsx        # diagram sapi SVG interaktif (original)
  pages/
    Home.jsx              # deteksi daging + hasil AI + gating premium
    Belajar.jsx           # halaman edukasi visual (premium)
    Menu.jsx              # daftar menu masakan (premium)
  data/
    meat.js               # data cut, tanda kesegaran, tips, daftar menu
  lib/
    analyzeMeat.js        # layer AI: Gemini + fallback lokal
    auth.jsx              # context auth demo (free/premium, localStorage)
    links.js              # builder link resep/video/tata cara makan
public/
  favicon.svg
.env.example              # template API key
```

> Catatan deploy: karena ini SPA dengan client-side routing, saat deploy ke
> hosting statik arahkan semua rute ke `index.html` (SPA fallback) agar refresh
> di `/belajar` atau `/menu` tidak 404.

## Catatan

Hasil adalah skrining visual dari foto, **bukan jaminan keamanan pangan**. Tetap periksa bau dan tekstur daging sebelum membeli atau memasak.
