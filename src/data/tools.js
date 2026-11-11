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

// ---------- Marinade & salt ----------
// Salt for a dry brine is ~1% of the meat weight. 1 sdt garam halus ≈ 6 g.
export const SALT_G_PER_TSP = 6;

export const CUT_TYPES = [
  { id: "steak", label: "Steak tebal", hint: "Ribeye, sirloin, tenderloin 2–4 cm", salt: 1, brine: "40 menit – 24 jam", marinate: "1 – 12 jam", note: "Garami minimal 40 menit atau semalaman di kulkas tanpa ditutup. Jangan 2–40 menit: garam baru menarik cairan keluar dan permukaan jadi basah." },
  { id: "iris", label: "Iris tipis", hint: "Yakiniku, bulgogi, tumis", salt: 0.8, brine: "Tidak perlu", marinate: "15 – 60 menit", note: "Irisan tipis cepat menyerap bumbu. Kalau marinasi memakai nanas, pepaya, atau jeruk, maksimal 1–2 jam supaya daging tidak lembek." },
  { id: "dadu", label: "Dadu", hint: "Sate, semur, rendang", salt: 0.8, brine: "1 – 12 jam", marinate: "2 – 12 jam", note: "Tusuk sate atau potongan dadu cukup 2–4 jam; semalaman membuat bumbu lebih meresap." },
  { id: "iga", label: "Iga & bertulang", hint: "Iga bakar, konro", salt: 1, brine: "4 – 24 jam", marinate: "4 – 24 jam", note: "Bumbu sulit menembus tulang dan lemak tebal. Ungkep dulu bersama bumbu, lalu bakar sambil diolesi." },
  { id: "giling", label: "Daging giling", hint: "Bakso, patty", salt: 1.2, brine: "Campur langsung", marinate: "Diamkan 30 menit di kulkas", note: "Garam membantu protein mengikat sehingga bakso dan patty lebih kenyal. Masak sampai suhu inti minimal 71°C." },
];

// Base amounts per 500 g of meat; scaled to the actual weight.
export const MARINADES = [
  {
    id: "garam",
    label: "Garam & lada saja",
    desc: "Dry brine klasik untuk steak dan daging panggang.",
    items: [{ item: "Lada hitam tumbuk", amount: 1, unit: "sdt" }],
    salty: false,
  },
  {
    id: "bakar",
    label: "Bakar manis",
    desc: "Untuk sate, iga bakar, dan daging bakar kecap.",
    items: [
      { item: "Kecap manis", amount: 4, unit: "sdm" },
      { item: "Bawang putih, haluskan", amount: 3, unit: "siung" },
      { item: "Bawang merah, haluskan", amount: 4, unit: "butir" },
      { item: "Ketumbar bubuk", amount: 1, unit: "sdt" },
      { item: "Minyak goreng", amount: 1, unit: "sdm" },
    ],
    salty: true,
  },
  {
    id: "yakiniku",
    label: "Yakiniku / bulgogi",
    desc: "Gurih manis ala Jepang–Korea untuk irisan tipis.",
    items: [
      { item: "Kecap asin", amount: 3, unit: "sdm" },
      { item: "Gula pasir", amount: 1, unit: "sdm" },
      { item: "Bawang putih, parut", amount: 2, unit: "siung" },
      { item: "Jahe, parut", amount: 1, unit: "cm" },
      { item: "Minyak wijen", amount: 1, unit: "sdm" },
    ],
    salty: true,
  },
  {
    id: "steak",
    label: "Steak herba",
    desc: "Aroma bawang putih dan rosemary untuk steak.",
    items: [
      { item: "Lada hitam tumbuk", amount: 1, unit: "sdt" },
      { item: "Bawang putih, geprek", amount: 3, unit: "siung" },
      { item: "Minyak zaitun", amount: 2, unit: "sdm" },
      { item: "Rosemary / thyme segar", amount: 2, unit: "tangkai" },
    ],
    salty: false,
  },
];

// ---------- Kurban (Iduladha) ----------
// Typical yields for local cattle (estimates; vary by breed and condition).
export const KURBAN = {
  carcass: 0.5, // karkas ≈ 50% bobot hidup
  meatOfCarcass: 0.68, // daging tanpa tulang ≈ 68% karkas
  boneOfCarcass: 0.2, // tulang ≈ 20% karkas
  shares: 7, // satu sapi untuk tujuh pekurban
};
// Rumus Schoorl: perkiraan bobot hidup (kg) dari lingkar dada (cm).
export const schoorl = (chestCm) => Math.round(((Number(chestCm) + 22) ** 2) / 100);

// ---------- Unit conversion ----------
export const WEIGHT_UNITS = [
  { id: "g", label: "gram", g: 1 },
  { id: "ons", label: "ons", g: 100 },
  { id: "pon", label: "pon (½ kg)", g: 500 },
  { id: "kg", label: "kilogram", g: 1000 },
  { id: "lb", label: "pound (lb)", g: 453.6 },
  { id: "oz", label: "ounce (oz)", g: 28.35 },
];
export const VOLUME_UNITS = [
  { id: "ml", label: "mililiter", ml: 1 },
  { id: "sdt", label: "sendok teh", ml: 5 },
  { id: "sdm", label: "sendok makan", ml: 15 },
  { id: "cup", label: "cup / gelas ukur", ml: 240 },
  { id: "l", label: "liter", ml: 1000 },
];
