// AI meat-analysis layer — Gemini vision with automatic model fallback.
//
// Setup: create a `.env` file (NOT .env.example) with:
//   VITE_GEMINI_API_KEY=your_key_here
// Then restart `npm run dev` so Vite picks it up.
//
// Model chain: we try MODEL_CHAIN in order. When a model is rate-limited (429),
// overloaded (503), retired (404), errors (5xx) or times out, we move on to the
// next one. Rate limits are per model, so falling back spreads the load across
// separate quotas. A model that hit a limit is "cooled down" (remembered in
// localStorage) so the next photo skips it straight away instead of waiting
// for the same error again:
//   - per-minute limit  -> skip for the retryDelay Google returns (default 60s)
//   - per-day limit     -> skip until the daily reset (midnight Pacific time)
//   - 503 overloaded    -> skip for 30s
//   - 404 not found     -> skip for 24h
//
// Optional overrides in .env:
//   VITE_GEMINI_MODEL=gemini-3.8-flash          put one model first
//   VITE_GEMINI_MODELS=a,b,c                    replace the whole chain
//
// If the key is missing OR every model fails, we throw a clear error instead of
// returning fake numbers. The local pixel heuristic is only used when you
// explicitly opt in (analyzeMeat(..., { allowLocalFallback: true })).

const env = import.meta.env || {};
const GEMINI_KEY = (env.VITE_GEMINI_API_KEY || "").trim();
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

// Free-tier generateContent models (checked against the Gemini docs, Nov 2026),
// fastest first. Gemini 4 Carbon/Argon are paid-only; Gemini 4 Hydrogen is free
// but took ~1 minute per request on the free tier, so it is not in the default
// chain (add it with VITE_GEMINI_MODEL if you have a paid key).
// Order matters for quota: the two flash-lite models have 15 RPM / 500 RPD each
// on the free tier, gemini-3.8-flash only 5 RPM / 20 RPD, so it is kept as the
// last real model to avoid burning its small daily quota on every RPM spike.
export const DEFAULT_MODELS = [
  "gemini-3.5-flash-lite", // stable, fastest · 15 RPM / 500 RPD
  "gemini-3.1-flash-lite", // stable, separate quota · 15 RPM / 500 RPD
  "gemini-3.8-flash", // stronger, slower, small quota · 5 RPM / 20 RPD
  "gemini-flash-lite-latest", // alias, hot-swapped by Google
  "gemini-flash-latest",
];

const list = (s) => String(s || "").split(",").map((x) => x.trim()).filter(Boolean);
export const MODEL_CHAIN = (() => {
  const custom = list(env.VITE_GEMINI_MODELS);
  const base = custom.length ? custom : DEFAULT_MODELS;
  const first = (env.VITE_GEMINI_MODEL || "").trim();
  return first ? [first, ...base.filter((m) => m !== first)] : base;
})();

// --- Speed tuning (tweak via .env) ------------------------------------------
const ATTEMPT_TIMEOUT_MS = Number(env.VITE_AI_TIMEOUT_MS) || 15000; // per model
const TOTAL_BUDGET_MS = Number(env.VITE_AI_TOTAL_MS) || 40000; // whole request
const MAX_IMAGE_DIM = Number(env.VITE_AI_IMAGE_DIM) || 768; // px, longest side
const MAX_OUTPUT_TOKENS = 2048; // JSON answer + light thinking

export function hasGeminiKey() {
  return Boolean(GEMINI_KEY);
}

export class AnalyzeError extends Error {}

/**
 * Analyze a meat photo.
 * @param {string} dataUrl  base64 data URL of the image
 * @param {number} daysInFridge
 * @param {{allowLocalFallback?: boolean}} [opts]
 */
export async function analyzeMeat(dataUrl, daysInFridge = 0, opts = {}) {
  if (!GEMINI_KEY) {
    if (opts.allowLocalFallback) return analyzeLocally(dataUrl, daysInFridge);
    throw new AnalyzeError("API key Gemini belum diisi. Buat file .env berisi VITE_GEMINI_API_KEY lalu restart server.");
  }
  try {
    return await analyzeWithGemini(dataUrl, daysInFridge);
  } catch (err) {
    if (opts.allowLocalFallback) {
      console.warn("Gemini gagal, pakai analisis lokal:", err);
      return analyzeLocally(dataUrl, daysInFridge);
    }
    throw err instanceof AnalyzeError ? err : new AnalyzeError(err?.message || "Gagal menghubungi AI.");
  }
}

// ---------------------------------------------------------------------------
// Cooldowns (shared across tabs/reloads via localStorage)
// ---------------------------------------------------------------------------
const COOLDOWN_KEY = "marbly.ai.cooldown";

function readCooldowns() {
  try {
    return JSON.parse(localStorage.getItem(COOLDOWN_KEY) || "{}");
  } catch {
    return {};
  }
}
function setCooldown(model, ms, reason) {
  try {
    const all = readCooldowns();
    all[model] = { until: Date.now() + ms, reason };
    localStorage.setItem(COOLDOWN_KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable — fallback still works within this request */
  }
}
function clearCooldown(model) {
  try {
    const all = readCooldowns();
    if (all[model]) {
      delete all[model];
      localStorage.setItem(COOLDOWN_KEY, JSON.stringify(all));
    }
  } catch {
    /* ignore */
  }
}

// Ready models first (chain order), then cooling-down ones as a last resort,
// soonest-available first — a cooldown is a hint, not a hard block.
export function orderedModels(now = Date.now()) {
  const cd = readCooldowns();
  const ready = MODEL_CHAIN.filter((m) => !(cd[m]?.until > now));
  const waiting = MODEL_CHAIN.filter((m) => cd[m]?.until > now).sort((a, b) => cd[a].until - cd[b].until);
  return { ready, waiting, cooldowns: cd };
}

export function resetModelCooldowns() {
  try {
    localStorage.removeItem(COOLDOWN_KEY);
  } catch {
    /* ignore */
  }
}

// Daily quotas reset at midnight Pacific time.
function msUntilPacificMidnight(now = Date.now()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date(now));
  const get = (t) => Number(parts.find((p) => p.type === t)?.value || 0);
  const elapsed = ((get("hour") % 24) * 3600 + get("minute") * 60 + get("second")) * 1000;
  return Math.max(60_000, 86_400_000 - elapsed);
}

// Read Google's error details: retry delay and whether it is a per-day quota.
function limitInfo(json) {
  const details = json?.error?.details || [];
  const retry = details.find((d) => String(d["@type"]).includes("RetryInfo"))?.retryDelay;
  const retryMs = retry ? Math.ceil(parseFloat(retry) * 1000) : null;
  const quotaIds = details
    .filter((d) => String(d["@type"]).includes("QuotaFailure"))
    .flatMap((d) => d.violations || [])
    .map((v) => `${v.quotaId || ""} ${v.quotaMetric || ""}`)
    .join(" ");
  const daily = /PerDay|per[_ ]?day|daily/i.test(`${quotaIds} ${json?.error?.message || ""}`);
  return { retryMs, daily };
}

// ---------------------------------------------------------------------------
// Fallback loop
// ---------------------------------------------------------------------------
async function callOnce(model, body, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/models/${model}:generateContent`, {
      method: "POST",
      // key in a header (not the URL) so it does not end up in logs/history
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    let json = null;
    try {
      json = await res.json();
    } catch {
      /* non-JSON error page */
    }
    return { res, json };
  } finally {
    clearTimeout(timer);
  }
}

export async function callWithFallback(body) {
  const started = Date.now();
  const { ready, waiting } = orderedModels(started);
  const tried = [];
  let lastErr = null;
  let limited = 0;

  for (const model of [...ready, ...waiting]) {
    const left = TOTAL_BUDGET_MS - (Date.now() - started);
    if (left < 2500) break;
    tried.push(model);

    let payload = body;
    for (let attempt = 0; attempt < 2; attempt++) {
      let res, json;
      try {
        ({ res, json } = await callOnce(model, payload, Math.min(ATTEMPT_TIMEOUT_MS, left)));
      } catch (err) {
        const timeout = err?.name === "AbortError";
        lastErr = new AnalyzeError(timeout ? "AI terlalu lama menjawab. Coba lagi sebentar lagi." : "Tidak bisa menghubungi Gemini. Cek koneksi internet.");
        if (timeout) setCooldown(model, 30_000, "lambat");
        break; // next model
      }

      if (res.ok) {
        clearCooldown(model);
        return { json, model, fallback: model !== MODEL_CHAIN[0], tried };
      }

      const status = res.status;
      const msg = json?.error?.message || "";
      lastErr = new AnalyzeError(describeApiError(json, status));

      if (status === 429) {
        limited += 1;
        const { retryMs, daily } = limitInfo(json);
        setCooldown(model, daily ? msUntilPacificMidnight() : Math.max(retryMs || 60_000, 10_000), daily ? "kuota harian" : "limit per menit");
        break;
      }
      if (status === 503 || status === 500 || status === 502 || status === 504) {
        setCooldown(model, 30_000, "sedang penuh");
        break;
      }
      if (status === 404) {
        setCooldown(model, 86_400_000, "tidak tersedia");
        break;
      }
      if (status === 400 && /API key not valid/i.test(msg)) throw lastErr; // no model will work
      if (status === 401 || status === 403) throw lastErr;
      if (status === 400 && attempt === 0 && payload.generationConfig?.thinkingConfig) {
        // some models reject thinking settings — retry the same model without them
        const { thinkingConfig: _drop, ...rest } = payload.generationConfig;
        payload = { ...payload, generationConfig: rest };
        continue;
      }
      break; // other 4xx for this model — try the next one
    }
  }

  if (limited && limited === tried.length) {
    const cd = readCooldowns();
    const soonest = Math.min(...MODEL_CHAIN.map((m) => cd[m]?.until || Infinity));
    const mins = Number.isFinite(soonest) ? Math.max(1, Math.ceil((soonest - Date.now()) / 60_000)) : null;
    throw new AnalyzeError(
      mins && mins < 120
        ? `Semua model AI sedang kena limit. Coba lagi sekitar ${mins} menit lagi.`
        : "Kuota harian semua model AI sudah habis. Coba lagi besok atau pakai API key lain."
    );
  }
  throw lastErr || new AnalyzeError("Semua model Gemini gagal dihubungi. Coba lagi sebentar lagi.");
}

// ---------------------------------------------------------------------------
// Image prep: shrink before upload (faster, and uses fewer tokens per minute)
// ---------------------------------------------------------------------------
function shrinkImage(dataUrl) {
  if (typeof document === "undefined" || typeof Image === "undefined") return Promise.resolve(dataUrl);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(img.width, img.height));
      if (scale >= 1) return resolve(dataUrl);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ---------------------------------------------------------------------------
// Gemini vision call
// ---------------------------------------------------------------------------
async function analyzeWithGemini(rawDataUrl, daysInFridge) {
  const dataUrl = await shrinkImage(rawDataUrl);
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

  const body = {
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      thinkingConfig: { thinkingLevel: "low" }, // visual screening needs little reasoning; keeps it fast
    },
  };

  const { json, model, fallback } = await callWithFallback(body);

  const text = json?.candidates?.[0]?.content?.parts?.filter((p) => !p.thought).map((p) => p.text || "").join("") || "";
  if (!text) {
    const reason = json?.candidates?.[0]?.finishReason;
    throw new AnalyzeError(reason === "SAFETY" ? "AI menolak gambar ini (filter keamanan). Coba foto lain." : "AI tidak memberi jawaban. Coba foto lain.");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new AnalyzeError("Jawaban AI tidak bisa dibaca. Coba lagi.");
    parsed = JSON.parse(m[0]);
  }
  if (Array.isArray(parsed)) parsed = parsed[0] || {};

  if (parsed.isMeat === false) {
    throw new AnalyzeError("Foto ini sepertinya bukan daging. Coba foto daging.");
  }

  return {
    edible: clamp(parsed.edible),
    marbling: clamp(parsed.marbling),
    freshness: clamp(parsed.freshness),
    edibleLabel: parsed.edibleLabel || labelFrom(parsed.edible, EDIBLE),
    marblingLabel: parsed.marblingLabel || labelFrom(parsed.marbling, MARBLING),
    freshnessLabel: parsed.freshnessLabel || labelFrom(parsed.freshness, FRESHNESS),
    shelfLife: parsed.shelfLife || estimateShelfLife(parsed.freshness),
    verdict: parsed.verdict || "",
    cut: parsed.cut || "Tidak yakin",
    cutConfidence: clamp(parsed.cutConfidence),
    cutReason: parsed.cutReason || "",
    dishes: normalizeDishes(parsed.dishes),
    source: "gemini",
    model,
    fallback,
  };
}

function normalizeDishes(dishes) {
  if (!Array.isArray(dishes)) return [];
  return dishes
    .map((d) => (typeof d === "string" ? { name: d, why: "" } : { name: d?.name || "", why: d?.why || "" }))
    .filter((d) => d.name)
    .slice(0, 4);
}

function describeApiError(json, status) {
  const msg = json?.error?.message || "";
  if (status === 400 && /API key not valid/i.test(msg)) return "API key Gemini tidak valid. Periksa lagi key di file .env.";
  if (status === 401 || status === 403) return "Akses ditolak. Pastikan Generative Language API aktif untuk API key ini.";
  if (status === 429) return "Model AI sedang kena limit. Mencoba model lain…";
  if (status === 404) return "Model AI tidak tersedia untuk API key ini.";
  if (status >= 500) return "Server AI sedang sibuk. Coba lagi sebentar lagi.";
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
      const variance = lums.reduce((a, c) => a + (c - mean) ** 2, 0) / lums.length;
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
