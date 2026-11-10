// Reference data for the Kulkas (fridge tracker) and Alat (tools) pages.
// Values are general food-safety / cooking guidelines and rough estimates.

// ---------- Storage shelf life (days) ----------
const SHELF = {
  chiller: { normal: 3, ground: 2 },
  freezer: { normal: 180, ground: 90 },
};
// After thawing in the fridge, use quickly.
const THAWED = { normal: 2, ground: 1 };

export const DAY = 24 * 60 * 60 * 1000;

export function shelfDays(storage, ground) {
  return SHELF[storage][ground ? "ground" : "normal"];
}
export function thawedDays(ground) {
  return THAWED[ground ? "ground" : "normal"];
}

export function timeLeftLabel(expiresAt, now = Date.now()) {
  const ms = expiresAt - now;
  if (ms <= 0) return "Kedaluwarsa";
  const hours = ms / (60 * 60 * 1000);
  if (hours < 24) return `${Math.max(1, Math.ceil(hours))} jam lagi`;
  return `${Math.ceil(ms / DAY)} hari lagi`;
}

// ---------- Steak timing ----------
// minutes of searing per side = thickness(cm) * perCm. pull = remove-from-heat temp.
export const STEAK_DONENESS = [
  { id: "rare", label: "Rare", perCm: 1.2, pull: 48, final: "50–52°C" },
  { id: "mr", label: "Medium Rare", perCm: 1.5, pull: 52, final: "55–57°C" },
  { id: "medium", label: "Medium", perCm: 1.8, pull: 57, final: "60–63°C" },
  { id: "mw", label: "Medium Well", perCm: 2.1, pull: 62, final: "65–68°C" },
  { id: "well", label: "Well Done", perCm: 2.5, pull: 67, final: "≥ 71°C" },
];

// [panci biasa, presto] in minutes, for 3–4 cm cubes / bone-in pieces.
export const SIMMER = {
  chuck: [120, 40],
  brisket: [150, 50],
  shank: [150, 50],
  oxtail: [180, 55],
  ribs: [120, 40],
  round: [120, 40],
  ribeye: [60, 25],
  sirloin: [60, 25],
  tenderloin: [45, 20],
};

// ---------- Thawing (per kg) ----------
export const THAW_METHODS = [
  {
    id: "kulkas",
    icon: "🧊",
    label: "Di kulkas (paling aman)",
    note: "Taruh di rak bawah dalam wadah. Setelah cair bisa disimpan 1–2 hari sebelum dimasak.",
    minutesPerKg: 10 * 60,
  },
  {
    id: "air",
    icon: "💧",
    label: "Rendam air dingin",
    note: "Bungkus kedap, rendam air dingin, ganti air tiap 30 menit. Langsung masak setelah cair.",
    minutesPerKg: 66,
  },
  {
    id: "microwave",
    icon: "♨️",
    label: "Microwave (mode defrost)",
    note: "Balik tiap beberapa menit. Langsung masak karena sebagian daging bisa mulai matang.",
    minutesPerKg: 12,
  },
];

// ---------- Nutrition per 100 g raw (approximate) ----------
export const NUTRITION = {
  tenderloin: { kcal: 150, protein: 21, fat: 7 },
  ribeye: { kcal: 235, protein: 18.5, fat: 18 },
  sirloin: { kcal: 190, protein: 21, fat: 11 },
  brisket: { kcal: 240, protein: 18, fat: 18 },
  chuck: { kcal: 200, protein: 19, fat: 13 },
  ribs: { kcal: 280, protein: 16, fat: 24 },
  round: { kcal: 140, protein: 22, fat: 5 },
  shank: { kcal: 150, protein: 21, fat: 7 },
  oxtail: { kcal: 260, protein: 17, fat: 21 },
  ground: { kcal: 254, protein: 17, fat: 20 },
};

// Edible yield after cooking & removing bone/fat (rough).
export const YIELD = {
  default: 0.75,
  ribs: 0.55,
  oxtail: 0.45,
  shank: 0.7,
};
