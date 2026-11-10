// Local product catalog for the in-app meat shop (simulated store). All
// original content. Prices in IDR. No external links; checkout is simulated.

export const CATEGORIES = [
  { id: "semua", label: "Semua", icon: "🛒" },
  { id: "steak", label: "Steak", icon: "🥩" },
  { id: "harian", label: "Masak harian", icon: "🍲" },
  { id: "tulang", label: "Bertulang", icon: "🦴" },
  { id: "giling", label: "Giling & olahan", icon: "🍔" },
  { id: "paket", label: "Paket hemat", icon: "🎁" },
];

// Free cutting service offered per product (like a real butcher counter).
export const PREP_OPTIONS = {
  utuh: { label: "Utuh", hint: "Tidak dipotong" },
  steak: { label: "Steak 2 cm", hint: "Siap dipanggang" },
  dadu: { label: "Dadu 3 cm", hint: "Untuk rendang, semur, sop" },
  iris: { label: "Iris tipis", hint: "Yakiniku, shabu, tumis" },
  giling: { label: "Giling", hint: "Bakso, patty, bolognese" },
  potong: { label: "Potong ruas", hint: "Per ruas tulang" },
};

export const PRODUCTS = [
  {
    sku: "tenderloin-300",
    name: "Has Dalam (Tenderloin)",
    cutId: "tenderloin",
    category: "steak",
    emoji: "✨",
    weight: 300,
    price: 85000,
    compareAt: null,
    grade: "Premium",
    origin: "Sapi lokal Bali, grass-fed",
    stock: 12,
    rating: 4.9,
    reviewCount: 128,
    prep: ["steak", "utuh", "iris"],
    desc: "Potongan paling empuk dengan serat halus dan lemak minim. Pilihan utama untuk filet mignon dan steak lembut.",
  },
  {
    sku: "ribeye-300",
    name: "Lamusir (Ribeye)",
    cutId: "ribeye",
    category: "steak",
    emoji: "🥩",
    weight: 300,
    price: 72000,
    compareAt: 79000,
    grade: "Premium",
    origin: "Australia, grain-fed 150 hari",
    stock: 15,
    rating: 4.8,
    reviewCount: 214,
    prep: ["steak", "utuh", "iris"],
    desc: "Marbling tinggi, juicy, dan beraroma kuat. Favorit untuk steak panggang medium-rare.",
  },
  {
    sku: "sirloin-300",
    name: "Has Luar (Sirloin)",
    cutId: "sirloin",
    category: "steak",
    emoji: "🥩",
    weight: 300,
    price: 58000,
    compareAt: null,
    grade: "Pilihan",
    origin: "Sapi lokal NTT",
    stock: 18,
    rating: 4.7,
    reviewCount: 176,
    prep: ["steak", "utuh", "iris", "dadu"],
    desc: "Empuk dengan rasa kuat dan lapisan lemak di tepi. Serbaguna untuk steak, sate, dan beef bowl.",
  },
  {
    sku: "saikoro-250",
    name: "Wagyu Saikoro MB5",
    cutId: "ribeye",
    category: "steak",
    emoji: "🎲",
    weight: 250,
    price: 125000,
    compareAt: 139000,
    grade: "Premium",
    origin: "Australia, wagyu cross MB5",
    stock: 8,
    rating: 4.9,
    reviewCount: 67,
    prep: ["utuh"],
    desc: "Kubus wagyu marbling tinggi yang lumer di mulut. Cukup sear 1 menit tiap sisi.",
  },
  {
    sku: "brisket-500",
    name: "Sandung Lamur (Brisket)",
    cutId: "brisket",
    category: "harian",
    emoji: "🫕",
    weight: 500,
    price: 65000,
    compareAt: null,
    grade: "Pilihan",
    origin: "Sapi lokal NTT",
    stock: 20,
    rating: 4.7,
    reviewCount: 143,
    prep: ["dadu", "utuh", "iris"],
    desc: "Berlemak dan berurat, kolagennya lumer saat dimasak lama. Juara untuk rendang dan soto.",
  },
  {
    sku: "rendang-1000",
    name: "Daging Rendang Potong Dadu",
    cutId: "brisket",
    category: "harian",
    emoji: "🍛",
    weight: 1000,
    price: 128000,
    compareAt: 138000,
    grade: "Pilihan",
    origin: "Campuran sandung lamur & sampil",
    stock: 14,
    rating: 4.8,
    reviewCount: 98,
    prep: ["dadu"],
    desc: "Sudah dipotong dadu 4 cm, siap dimasak jadi rendang atau semur untuk 6–8 porsi.",
  },
  {
    sku: "chuck-500",
    name: "Sampil (Chuck)",
    cutId: "chuck",
    category: "harian",
    emoji: "🧈",
    weight: 500,
    price: 52000,
    compareAt: null,
    grade: "Reguler",
    origin: "Sapi lokal Jawa Timur",
    stock: 25,
    rating: 4.6,
    reviewCount: 189,
    prep: ["dadu", "utuh", "giling", "iris"],
    desc: "Serbaguna dan ekonomis dengan rasio lemak pas. Cocok untuk bakso, semur, dan tumis.",
  },
  {
    sku: "round-500",
    name: "Gandik (Round)",
    cutId: "round",
    category: "harian",
    emoji: "🪵",
    weight: 500,
    price: 54000,
    compareAt: null,
    grade: "Reguler",
    origin: "Sapi lokal Jawa Timur",
    stock: 20,
    rating: 4.5,
    reviewCount: 87,
    prep: ["utuh", "iris", "dadu"],
    desc: "Padat dan rendah lemak. Terbaik untuk dendeng, empal gepuk, dan abon.",
  },
  {
    sku: "shank-500",
    name: "Sengkel (Shank)",
    cutId: "shank",
    category: "harian",
    emoji: "🦴",
    weight: 500,
    price: 48000,
    compareAt: null,
    grade: "Reguler",
    origin: "Sapi lokal Jawa Timur",
    stock: 22,
    rating: 4.6,
    reviewCount: 112,
    prep: ["dadu", "utuh"],
    desc: "Banyak urat dan kolagen yang jadi kenyal lembut setelah direbus lama. Terbaik untuk rawon dan sop.",
  },
  {
    sku: "ribs-800",
    name: "Iga Sapi (Ribs)",
    cutId: "ribs",
    category: "tulang",
    emoji: "🍖",
    weight: 800,
    price: 88000,
    compareAt: null,
    grade: "Pilihan",
    origin: "Sapi lokal NTT",
    stock: 14,
    rating: 4.7,
    reviewCount: 131,
    prep: ["potong", "utuh"],
    desc: "Daging tebal di sela tulang, gurih untuk iga bakar, sop iga, dan konro.",
  },
  {
    sku: "oxtail-700",
    name: "Buntut (Oxtail)",
    cutId: "oxtail",
    category: "tulang",
    emoji: "🍲",
    weight: 700,
    price: 95000,
    compareAt: null,
    grade: "Pilihan",
    origin: "Sapi lokal NTT",
    stock: 10,
    rating: 4.8,
    reviewCount: 94,
    prep: ["potong"],
    desc: "Bertulang dan kaya kolagen, menghasilkan kaldu gurih yang dalam untuk sop buntut.",
  },
  {
    sku: "ground-500",
    name: "Daging Giling 80/20",
    cutId: "chuck",
    category: "giling",
    emoji: "🍔",
    ground: true,
    weight: 500,
    price: 56000,
    compareAt: null,
    grade: "Reguler",
    origin: "Sampil segar, digiling saat dipesan",
    stock: 30,
    rating: 4.7,
    reviewCount: 202,
    prep: ["giling"],
    desc: "80% daging, 20% lemak. Digiling segar untuk bakso, patty burger, dan bolognese.",
  },
  {
    sku: "patty-400",
    name: "Patty Burger 100% Sapi (4 pcs)",
    cutId: "chuck",
    category: "giling",
    emoji: "🍔",
    ground: true,
    weight: 400,
    price: 62000,
    compareAt: 68000,
    grade: "Pilihan",
    origin: "Sampil & sandung lamur, tanpa pengawet",
    stock: 16,
    rating: 4.6,
    reviewCount: 73,
    prep: ["utuh"],
    desc: "Empat patty 100 g siap panggang. Cukup garam dan lada, masak 3–4 menit tiap sisi.",
  },
  {
    sku: "paket-steak",
    name: "Paket Steak Night",
    cutId: "ribeye",
    category: "paket",
    emoji: "🎁",
    weight: 900,
    price: 199000,
    compareAt: 215000,
    grade: "Premium",
    origin: "Ribeye, sirloin, dan tenderloin @300 g",
    stock: 9,
    rating: 4.9,
    reviewCount: 51,
    prep: ["steak"],
    bundle: [
      { sku: "ribeye-300", qty: 1 },
      { sku: "sirloin-300", qty: 1 },
      { sku: "tenderloin-300", qty: 1 },
    ],
    desc: "Tiga cut steak terbaik untuk dicicipi berdampingan. Cocok untuk makan malam 3–4 orang.",
  },
  {
    sku: "paket-sop",
    name: "Paket Sop & Rawon",
    cutId: "oxtail",
    category: "paket",
    emoji: "🎁",
    weight: 1200,
    price: 132000,
    compareAt: 143000,
    grade: "Pilihan",
    origin: "Buntut 700 g + sengkel 500 g",
    stock: 11,
    rating: 4.8,
    reviewCount: 39,
    prep: ["potong"],
    bundle: [
      { sku: "oxtail-700", qty: 1 },
      { sku: "shank-500", qty: 1 },
    ],
    desc: "Bahan dua masakan berkuah sekaligus: sop buntut dan rawon, hemat Rp11.000.",
  },
];

// Photos live in /public/images/products/<sku>.jpg (credits in photoCredits.js).
PRODUCTS.forEach((p) => {
  p.image = `/images/products/${p.sku}.jpg`;
});

export const CATEGORY_TONE = {
  steak: "bg-coral/20",
  harian: "bg-sun/40",
  tulang: "bg-lilac/40",
  giling: "bg-mintsoft",
  paket: "bg-cream",
};

export function getProduct(sku) {
  return PRODUCTS.find((p) => p.sku === sku) || null;
}

export function productsForCut(cutId) {
  return PRODUCTS.filter((p) => p.cutId === cutId && !p.bundle);
}

export function formatIDR(n) {
  return "Rp" + Math.round(Number(n || 0)).toLocaleString("id-ID");
}

export const pricePerKg = (p) => Math.round((p.price / p.weight) * 1000);

export const discountPct = (p) =>
  p.compareAt && p.compareAt > p.price ? Math.round((1 - p.price / p.compareAt) * 100) : 0;

// ---- seed reviews (deterministic per product, so every product has some) ----
const REVIEW_POOL = [
  { name: "Rina", rating: 5, text: "Datang masih dingin, dikemas rapi pakai ice gel. Dagingnya segar dan wangi." },
  { name: "Bagas", rating: 5, text: "Potongan sesuai pesanan, tebal rata. Bakal langganan." },
  { name: "Sinta", rating: 4, text: "Kualitas bagus, cuma pengiriman agak telat 30 menit dari slot." },
  { name: "Dimas", rating: 5, text: "Lemaknya pas, dimasak sesuai panduan di aplikasi hasilnya empuk banget." },
  { name: "Ayu", rating: 4, text: "Rasanya enak, porsinya pas untuk keluarga kecil. Harga masuk akal." },
  { name: "Hendra", rating: 5, text: "Beratnya pas bahkan sedikit lebih. Kurirnya ramah." },
  { name: "Maya", rating: 5, text: "Tidak bau amis sama sekali, warnanya merah cerah. Recommended." },
  { name: "Yoga", rating: 4, text: "Bagus, semoga ke depan ada pilihan ukuran 1 kg." },
];

function hash(s) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function seedReviews(sku) {
  const h = hash(sku);
  return [0, 1, 2].map((i) => {
    const r = REVIEW_POOL[(h + i * 3) % REVIEW_POOL.length];
    return {
      id: `seed-${sku}-${i}`,
      user: r.name,
      rating: r.rating,
      text: r.text,
      date: new Date(Date.UTC(2026, 9, 28 - ((h >> i) % 20))).toISOString(),
      seed: true,
    };
  });
}
