// AI meat-analysis layer — Gemini vision as the primary engine.
//
// Setup: create a `.env` file (NOT .env.example) with:
//   VITE_GEMINI_API_KEY=your_key_here
// Then restart `npm run dev` so Vite picks it up.
//
// Model is auto-detected from the API (model names change over time, and old
// ones like gemini-1.5-flash / 2.0-flash are retired). You can force one with:
//   VITE_GEMINI_MODEL=gemini-2.5-flash
//
// If the key is missing OR Gemini fails, we throw a clear error instead of
// silently returning fake numbers. The local pixel heuristic is only used when
// you explicitly opt in (analyzeMeat(..., { allowLocalFallback: true })).

const GEMINI_KEY = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
const FORCED_MODEL = (import.meta.env.VITE_GEMINI_MODEL || "").trim();
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

// Preferred models, best first. We use the "-latest" aliases because pinned
// version names (e.g. gemini-2.5-flash) get retired for new users and return
// 404 even when the /models listing still reports them.
const PREFERRED_MODELS = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-pro-latest",
];

export function hasGeminiKey() {
  return Boolean(GEMINI_KEY);
}

/**
 * Analyze a meat photo.
 * @param {string} dataUrl  base64 data URL of the image
 * @param {number} daysInFridge
 * @param {{allowLocalFallback?: boolean}} [opts]
 * @returns {Promise<MeatResult>}
 */
export async function analyzeMeat(dataUrl, daysInFridge = 0, opts = {}) {
  if (!GEMINI_KEY) {
    if (opts.allowLocalFallback) return analyzeLocally(dataUrl, daysInFridge);
    throw new AnalyzeError(
      "API key Gemini belum diisi. Buat file .env berisi VITE_GEMINI_API_KEY lalu restart server."
    );
  }

  try {
    return await analyzeWithGemini(dataUrl, daysInFridge);
  } catch (err) {
    if (opts.allowLocalFallback) {
      console.warn("Gemini gagal, pakai analisis lokal:", err);
      return analyzeLocally(dataUrl, daysInFridge);
    }
    throw err instanceof AnalyzeError
      ? err
      : new AnalyzeError(err?.message || "Gagal menghubungi AI.");
  }
}

export class AnalyzeError extends Error {}

// ---------------------------------------------------------------------------
// Model resolution (cached for the session)
// ---------------------------------------------------------------------------
let resolvedModel = null;

// Build the ordered list of models to try. Listing is unreliable (it reports
// models that 404 on real calls), so we lead with our known-good aliases and
// only append listed "latest" aliases as extra fallbacks.
async function candidateModels() {
  if (FORCED_MODEL) return [FORCED_MODEL];
  if (resolvedModel) return [resolvedModel, ...PREFERRED_MODELS];

  const list = [...PREFERRED_MODELS];
  try {
    const res = await fetch(`${API_BASE}/models?key=${GEMINI_KEY}`);
    const json = await res.json();
    if (!res.ok) throw new AnalyzeError(describeApiError(json, res.status));
    const listed = (json.models || [])
      .filter((m) =>
        (m.supportedGenerationMethods || []).includes("generateContent")
      )
      .map((m) => m.name.replace(/^models\//, ""))
      .filter((m) => m.endsWith("-latest")); // aliases are the stable ones
    for (const m of listed) if (!list.includes(m)) list.push(m);
  } catch (err) {
    if (err instanceof AnalyzeError && /tidak valid|ditolak/i.test(err.message)) {
      throw err; // bad key / forbidden — no point trying models
    }
    // otherwise keep going with the hardcoded preferred list
  }
  return list;
}

// Try each candidate model in order. Retry once on 503 (temporary high demand),
// skip to the next model on 404 (model retired for this key).
async function callWithFallback(body) {
  const models = await candidateModels();
  let lastErr = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      let res, json;
      try {
        res = await fetch(
          `${API_BASE}/models/${model}:generateContent?key=${GEMINI_KEY}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body }
        );
        json = await res.json();
      } catch {
        lastErr = new AnalyzeError("Tidak bisa menghubungi Gemini. Cek koneksi.");
        break; // network error — try next model
      }

      if (res.ok) {
        resolvedModel = model; // cache the one that worked
        return { json, model };
      }

      const status = res.status;
      lastErr = new AnalyzeError(describeApiError(json, status));

      if (status === 503 && attempt === 0) {
        await sleep(1200);
        continue; // retry same model once
      }
      if (status === 404 || status === 503) break; // try next model
      throw lastErr; // 400/401/403/429 — real problem, stop
    }
  }
  throw lastErr || new AnalyzeError("Semua model Gemini gagal dihubungi.");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Gemini vision call
// ---------------------------------------------------------------------------
async function analyzeWithGemini(dataUrl, daysInFridge) {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) throw new AnalyzeError("Format gambar tidak dikenali.");
  const mimeType = (match[1] || "image/jpeg").split(";")[0];
  const base64 = match[2];

  const prompt = `Kamu adalah ahli penilai dan tukang potong daging sapi (butcher) berpengalaman di Indonesia. Perhatikan foto daging ini dengan teliti.
Konteks: daging sudah disimpan di kulkas selama ${daysInFridge} hari.
Nilai HANYA dari yang terlihat di foto. Ini skrining visual, bukan jaminan keamanan pangan.
Perhatikan: warna daging (merah segar vs coklat/abu/kehijauan), kilap permukaan, lendir, sebaran lemak (marbling), bentuk serat otot, dan ketebalan potongan untuk menebak bagian/cut.

Untuk tebakan cut, pilih dari istilah yang umum dipakai di Indonesia bila cocok, mis.: Has Dalam (tenderloin), Has Luar (sirloin), Lamusir (cube roll/ribeye), Sandung Lamur (brisket), Sengkel (shank), Sampil (chuck), Gandik/Pendasar (round), Tanjung (rump), Iga (ribs), Buntut (oxtail), Daging giling, atau "Tidak yakin" kalau sulit ditebak.

Balas HANYA dengan JSON valid, tanpa teks lain, bentuknya persis:
{
  "edible": <angka 0-100, seberapa layak dimakan>,
  "marbling": <angka 0-100, tingkat marbling/sebaran lemak>,
  "freshness": <angka 0-100, tingkat kesegaran>,
  "edibleLabel": "<ringkas, bahasa Indonesia>",
  "marblingLabel": "<ringkas, bahasa Indonesia>",
  "freshnessLabel": "<ringkas, bahasa Indonesia>",
  "shelfLife": "<perkiraan sisa tahan, mis. '1-2 hari lagi'>",
  "verdict": "<satu kalimat kesimpulan ramah dalam bahasa Indonesia>",
  "cut": "<tebakan bagian/cut daging dalam bahasa Indonesia, mis. 'Has Luar (Sirloin)'>",
  "cutConfidence": <angka 0-100, seberapa yakin tebakan cut dari foto>,
  "cutReason": "<alasan singkat tebakan cut dari ciri visual yang terlihat>",
  "dishes": [
    { "name": "<nama masakan Indonesia/umum>", "why": "<alasan singkat kenapa cocok untuk cut ini>" }
  ],
  "isMeat": <true jika foto memang daging, false jika bukan>
}
Isi "dishes" dengan 3-4 rekomendasi masakan yang paling cocok untuk cut tersebut (pertimbangkan metode masak: cepat/panggang untuk cut empuk, slow-cook/rebus untuk cut berurat).`;

  const body = JSON.stringify({
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: base64 } },
        ],
      },
    ],
    generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
  });

  const { json, model } = await callWithFallback(body);

  const text =
    json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  if (!text) {
    const reason = json?.candidates?.[0]?.finishReason;
    throw new AnalyzeError(
      reason === "SAFETY"
        ? "AI menolak gambar ini (filter keamanan). Coba foto lain."
        : "AI tidak memberi jawaban. Coba foto lain."
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new AnalyzeError("Jawaban AI tidak bisa dibaca.");
    parsed = JSON.parse(m[0]);
  }

  if (parsed.isMeat === false) {
    throw new AnalyzeError("Foto ini sepertinya bukan daging. Coba foto daging.");
  }

  return {
    edible: clamp(parsed.edible),
    marbling: clamp(parsed.marbling),
    freshness: clamp(parsed.freshness),
    edibleLabel: parsed.edibleLabel || labelFrom(parsed.edible, EDIBLE),
    marblingLabel: parsed.marblingLabel || labelFrom(parsed.marbling, MARBLING),
    freshnessLabel:
      parsed.freshnessLabel || labelFrom(parsed.freshness, FRESHNESS),
    shelfLife:
      parsed.shelfLife || estimateShelfLife(parsed.freshness, daysInFridge),
    verdict: parsed.verdict || "",
    cut: parsed.cut || "Tidak yakin",
    cutConfidence: clamp(parsed.cutConfidence),
    cutReason: parsed.cutReason || "",
    dishes: normalizeDishes(parsed.dishes),
    source: "gemini",
    model,
  };
}

function normalizeDishes(dishes) {
  if (!Array.isArray(dishes)) return [];
  return dishes
    .map((d) =>
      typeof d === "string"
        ? { name: d, why: "" }
        : { name: d?.name || "", why: d?.why || "" }
    )
    .filter((d) => d.name)
    .slice(0, 4);
}

function describeApiError(json, status) {
  const msg = json?.error?.message || "";
  if (status === 400 && /API key not valid/i.test(msg))
    return "API key Gemini tidak valid. Periksa lagi key di file .env.";
  if (status === 403)
    return "Akses ditolak (403). Pastikan Generative Language API aktif untuk key ini.";
  if (status === 429)
    return "Kuota API habis atau terlalu banyak permintaan (429). Coba lagi nanti.";
  if (status === 404)
    return "Model tidak ditemukan (404). Coba kosongkan VITE_GEMINI_MODEL agar auto-detect.";
  return `Gemini error ${status}: ${msg || "tidak diketahui"}`;
}

// ---------------------------------------------------------------------------
// Local heuristic (opt-in fallback only)
// ---------------------------------------------------------------------------
function analyzeLocally(dataUrl, daysInFridge) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = 96;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);

      let r = 0, g = 0, b = 0, n = 0;
      const lums = [];
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        lums.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        n++;
      }
      r /= n; g /= n; b /= n;

      const redness = clamp(((r - (g + b) / 2) / 128) * 100 + 35);
      const mean = lums.reduce((a, c) => a + c, 0) / lums.length;
      const variance =
        lums.reduce((a, c) => a + (c - mean) ** 2, 0) / lums.length;
      const marbling = clamp((Math.sqrt(variance) / 70) * 100);
      const freshness = clamp(redness - daysInFridge * 7);
      const edible = clamp(freshness * 0.7 + redness * 0.3);

      resolve({
        edible,
        marbling,
        freshness,
        edibleLabel: labelFrom(edible, EDIBLE),
        marblingLabel: labelFrom(marbling, MARBLING),
        freshnessLabel: labelFrom(freshness, FRESHNESS),
        shelfLife: estimateShelfLife(freshness),
        verdict: verdictFrom(edible),
        cut: "Tidak yakin",
        cutConfidence: 0,
        cutReason: "Deteksi cut hanya tersedia di mode AI Gemini.",
        dishes: [],
        source: "local",
      });
    };
    img.onerror = () => reject(new AnalyzeError("Gambar gagal dimuat."));
    img.src = dataUrl;
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function clamp(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

const EDIBLE = [
  [75, "Layak makan"],
  [50, "Masih bisa, segera masak"],
  [0, "Sebaiknya jangan"],
];
const MARBLING = [
  [70, "Marbling tinggi"],
  [40, "Marbling sedang"],
  [0, "Marbling rendah"],
];
const FRESHNESS = [
  [75, "Sangat segar"],
  [50, "Cukup segar"],
  [25, "Mulai menurun"],
  [0, "Tidak segar"],
];

function labelFrom(value, table) {
  const v = clamp(value);
  for (const [min, label] of table) if (v >= min) return label;
  return table[table.length - 1][1];
}

function estimateShelfLife(freshness) {
  const f = clamp(freshness);
  if (f >= 75) return "3-4 hari lagi";
  if (f >= 50) return "1-2 hari lagi";
  if (f >= 25) return "Masak hari ini";
  return "Sudah lewat";
}

function verdictFrom(edible) {
  if (edible >= 75) return "Daging terlihat segar dan layak dimasak.";
  if (edible >= 50) return "Daging masih bisa dipakai, sebaiknya segera dimasak.";
  return "Indikasi visual kurang baik, periksa bau dan tekstur dulu.";
}
