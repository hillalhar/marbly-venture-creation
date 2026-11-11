// Local recipe database. All original content. Each recipe lives on its own
// in-app page (/resep/:id) — no external links.
//
// fields:
//  id, name, cutId (links to a beef cut), emoji, time (min), serves,
//  difficulty (1-3), spicy, summary,
//  ingredients: [{ item, qty }], steps: [string],
//  servingTips: [string]   (replaces the old "cara makan" — practical pairing)
//  pairings: [string]      (side dishes / sauces that go well)
//  productSku: matches a product in products.js (so "beli bahan" can prefill)

export const RECIPES = [
  {
    id: "rendang",
    name: "Rendang Daging",
    cutId: "brisket",
    productSku: "brisket-500",
    emoji: "🍛",
    time: 180,
    serves: 6,
    difficulty: 3,
    spicy: true,
    summary:
      "Daging dimasak perlahan dalam santan dan rempah hingga kuah menyusut dan berminyak, menghasilkan rasa yang dalam dan daging yang empuk.",
    ingredients: [
      { item: "Daging sandung lamur / sampil", qty: "1 kg" },
      { item: "Santan kental", qty: "1 liter" },
      { item: "Serai, digeprek", qty: "3 batang" },
      { item: "Daun jeruk", qty: "5 lembar" },
      { item: "Asam kandis", qty: "2 buah" },
      { item: "Bumbu halus (cabai, bawang, lengkuas, jahe, kunyit)", qty: "secukupnya" },
    ],
    steps: [
      "Tumis bumbu halus bersama serai dan daun jeruk hingga harum dan matang.",
      "Masukkan daging, aduk hingga berubah warna dan terbalut bumbu.",
      "Tuang santan, masukkan asam kandis. Masak dengan api kecil sambil sesekali diaduk.",
      "Terus masak 2-3 jam hingga kuah menyusut, mengering, dan berminyak.",
      "Aduk lebih sering di tahap akhir agar tidak gosong. Rendang siap saat berwarna cokelat gelap.",
    ],
    servingTips: [
      "Sajikan panas dengan nasi hangat agar bumbunya meresap.",
      "Rendang justru makin enak dihangatkan keesokan harinya.",
      "Simpan sisa di kulkas; tahan lama karena kadar airnya rendah.",
    ],
    pairings: ["Nasi putih", "Daun singkong rebus", "Sambal ijo", "Kerupuk"],
  },
  {
    id: "ribeye-steak",
    name: "Ribeye Steak",
    cutId: "ribeye",
    productSku: "ribeye-300",
    emoji: "🥩",
    time: 25,
    serves: 2,
    difficulty: 2,
    spicy: false,
    summary:
      "Steak marbling tinggi yang dimasak cepat di panas tinggi hingga kerak kecokelatan, disajikan medium-rare agar juicy.",
    ingredients: [
      { item: "Ribeye tebal 2-3 cm", qty: "2 potong" },
      { item: "Garam kasar & lada hitam", qty: "secukupnya" },
      { item: "Mentega", qty: "2 sdm" },
      { item: "Bawang putih & rosemary", qty: "secukupnya" },
    ],
    steps: [
      "Keluarkan steak dari kulkas 30 menit sebelum dimasak agar suhunya merata.",
      "Keringkan permukaan, taburi garam dan lada secukupnya.",
      "Panaskan wajan hingga sangat panas. Sear tiap sisi 2-3 menit sampai berkerak.",
      "Masukkan mentega, bawang putih, dan rosemary; siram-siram (basting) steak.",
      "Angkat saat suhu inti ~55°C (medium-rare). Istirahatkan 5 menit sebelum dipotong.",
    ],
    servingTips: [
      "Istirahatkan steak sebelum dipotong agar sari daging tidak tumpah.",
      "Potong melawan arah serat supaya terasa lebih empuk.",
      "Gunakan termometer daging untuk kematangan yang presisi.",
    ],
    pairings: ["Kentang panggang", "Asparagus tumis", "Saus lada hitam", "Garlic butter"],
  },
  {
    id: "sop-buntut",
    name: "Sop Buntut",
    cutId: "oxtail",
    productSku: "oxtail-700",
    emoji: "🍲",
    time: 150,
    serves: 4,
    difficulty: 2,
    spicy: false,
    summary:
      "Kaldu bening gurih dengan potongan buntut yang direbus lama hingga empuk lepas dari tulang.",
    ingredients: [
      { item: "Buntut sapi, potong", qty: "1 kg" },
      { item: "Wortel & kentang", qty: "secukupnya" },
      { item: "Tomat & daun bawang", qty: "secukupnya" },
      { item: "Pala, cengkih, kayu manis", qty: "secukupnya" },
      { item: "Bawang putih & bawang merah", qty: "secukupnya" },
    ],
    steps: [
      "Rebus buntut, buang buih pertama agar kaldu bening, lalu rebus lagi hingga empuk.",
      "Tumis bawang dan rempah, masukkan ke dalam kaldu.",
      "Tambahkan wortel dan kentang, masak hingga matang.",
      "Bumbui garam, merica, dan pala. Koreksi rasa.",
      "Sajikan panas dengan taburan bawang goreng dan daun bawang.",
    ],
    servingTips: [
      "Sajikan dengan sambal rawit dan perasan jeruk nipis.",
      "Pisahkan nasi agar kuah tetap bening dan hangat lebih lama.",
      "Buang lemak permukaan kalau ingin kuah lebih ringan.",
    ],
    pairings: ["Nasi putih", "Sambal rawit", "Emping", "Jeruk nipis"],
  },
  {
    id: "rawon",
    name: "Rawon",
    cutId: "shank",
    productSku: "shank-500",
    emoji: "🥣",
    time: 120,
    serves: 5,
    difficulty: 2,
    spicy: false,
    summary:
      "Sup daging berkuah hitam khas Jawa Timur dengan kluwek yang memberi warna dan rasa khas.",
    ingredients: [
      { item: "Sengkel sapi, potong dadu", qty: "750 g" },
      { item: "Kluwek", qty: "4 buah" },
      { item: "Bumbu halus (bawang, kemiri, kunyit, jahe)", qty: "secukupnya" },
      { item: "Serai & daun jeruk", qty: "secukupnya" },
      { item: "Tauge pendek", qty: "untuk pelengkap" },
    ],
    steps: [
      "Rebus sengkel hingga empuk, sisihkan kaldunya.",
      "Haluskan kluwek bersama bumbu, lalu tumis hingga harum dan matang.",
      "Masukkan tumisan bumbu ke kaldu, tambahkan serai dan daun jeruk.",
      "Masukkan daging, masak hingga bumbu meresap dan kuah menghitam.",
      "Sajikan dengan tauge, telur asin, dan sambal.",
    ],
    servingTips: [
      "Lengkapi dengan tauge pendek segar, telur asin, dan kerupuk udang.",
      "Sambal terasi sangat cocok menemani rawon.",
      "Rasa makin mantap jika didiamkan beberapa jam sebelum disajikan.",
    ],
    pairings: ["Nasi putih", "Tauge", "Telur asin", "Sambal terasi"],
  },
  {
    id: "iga-bakar",
    name: "Iga Bakar",
    cutId: "ribs",
    productSku: "ribs-800",
    emoji: "🍖",
    time: 90,
    serves: 4,
    difficulty: 2,
    spicy: false,
    summary:
      "Iga diungkep dengan bumbu manis gurih lalu dibakar hingga permukaannya karamel.",
    ingredients: [
      { item: "Iga sapi", qty: "1 kg" },
      { item: "Kecap manis", qty: "5 sdm" },
      { item: "Bawang putih & bombai", qty: "secukupnya" },
      { item: "Gula merah & asam jawa", qty: "secukupnya" },
      { item: "Margarin untuk olesan", qty: "secukupnya" },
    ],
    steps: [
      "Rebus/ungkep iga dengan bumbu hingga empuk dan bumbu meresap.",
      "Angkat iga, tiriskan, sisakan sebagian bumbu untuk olesan.",
      "Bakar iga di atas bara atau teflon grill sambil diolesi bumbu.",
      "Bolak-balik hingga permukaan karamel dan sedikit gosong harum.",
      "Sajikan dengan sisa bumbu dan sambal kecap.",
    ],
    servingTips: [
      "Olesi bumbu berulang saat membakar agar lapisan karamel tebal.",
      "Sajikan dengan sambal kecap dan irisan tomat segar.",
      "Lalapan timun menyegarkan di antara gigitan yang gurih.",
    ],
    pairings: ["Nasi putih", "Sambal kecap", "Lalapan", "Acar timun"],
  },
  {
    id: "bakso",
    name: "Bakso Sapi",
    cutId: "chuck",
    productSku: "chuck-500",
    emoji: "🍜",
    time: 60,
    serves: 6,
    difficulty: 2,
    spicy: false,
    summary:
      "Bola daging kenyal dari daging giling segar, disajikan dalam kuah kaldu hangat.",
    ingredients: [
      { item: "Daging sampil giling", qty: "500 g" },
      { item: "Tepung tapioka", qty: "100 g" },
      { item: "Es batu", qty: "secukupnya" },
      { item: "Bawang putih & merica", qty: "secukupnya" },
      { item: "Kaldu sapi untuk kuah", qty: "1,5 liter" },
    ],
    steps: [
      "Haluskan daging dingin bersama es, bawang putih, dan merica.",
      "Campur tapioka, uleni cepat hingga adonan kalis dan kenyal.",
      "Bentuk bola, masukkan ke air panas (jangan mendidih keras) hingga mengapung.",
      "Didihkan kaldu terpisah, bumbui secukupnya.",
      "Sajikan bakso dalam kuah dengan mi, bihun, dan sawi.",
    ],
    servingTips: [
      "Gunakan daging dan es yang dingin agar bakso kenyal sempurna.",
      "Sajikan dengan sambal, saus, dan kecap sesuai selera.",
      "Taburi bawang goreng dan seledri untuk aroma.",
    ],
    pairings: ["Mi kuning", "Bihun", "Sawi", "Sambal & kecap"],
  },
];

// Raw meat (grams) for the recipe's default servings, and the free cutting
// option that suits it. Used by the meal planner, event calculator and the
// "beli bahan" box so they all agree.
const MEAT = {
  rendang: { meatGrams: 1000, prep: "dadu" },
  "ribeye-steak": { meatGrams: 600, prep: "steak" },
  "sop-buntut": { meatGrams: 1000, prep: "potong" },
  rawon: { meatGrams: 750, prep: "dadu" },
  "iga-bakar": { meatGrams: 1000, prep: "potong" },
  bakso: { meatGrams: 500, prep: "giling" },
};

// Photos live in /public/images/recipes/<id>.jpg (credits in photoCredits.js).
RECIPES.forEach((r) => {
  r.image = `/images/recipes/${r.id}.jpg`;
  Object.assign(r, MEAT[r.id] || { meatGrams: 500, prep: null });
});

export const meatPerServing = (r) => r.meatGrams / r.serves;

const COUNT_UNITS = /^(buah|lembar|batang|potong|siung|butir|sdm|sdt)/i;
const fmtNum = (n) => (Math.round(n * 10) / 10).toString().replace(".", ",");

// Scale a free-text quantity like "1 kg", "1,5 liter", "2-3 batang".
export function scaleQty(qty, factor) {
  const m = String(qty).match(/^(\d+(?:[.,]\d+)?)(?:\s*-\s*(\d+(?:[.,]\d+)?))?\s*(.*)$/);
  if (!m || factor === 1) return qty;
  const num = (s) => parseFloat(s.replace(",", "."));
  let unit = m[3];
  const scale = (v) => {
    let x = num(v) * factor;
    if (COUNT_UNITS.test(unit)) x = Math.max(1, Math.round(x * 2) / 2);
    return x;
  };
  let a = scale(m[1]);
  let b = m[2] ? scale(m[2]) : null;
  if (/^kg\b/i.test(unit) && a < 1) {
    a *= 1000;
    if (b) b *= 1000;
    unit = unit.replace(/^kg/i, "g");
    return `${Math.round(a / 10) * 10}${b ? `-${Math.round(b / 10) * 10}` : ""} ${unit}`;
  }
  if (/^g\b/i.test(unit)) {
    return `${Math.round(a / 10) * 10}${b ? `-${Math.round(b / 10) * 10}` : ""} ${unit}`;
  }
  return `${fmtNum(a)}${b ? `-${fmtNum(b)}` : ""} ${unit}`.trim();
}

// Minutes mentioned in a step ("rebus 2-3 jam", "5 menit"); uses the lower bound.
export function stepMinutes(text) {
  const m = String(text).match(/(\d+(?:[.,]\d+)?)(?:\s*-\s*\d+(?:[.,]\d+)?)?\s*(menit|jam)\b/i);
  if (!m) return null;
  const v = parseFloat(m[1].replace(",", "."));
  return /jam/i.test(m[2]) ? v * 60 : v;
}

export function getRecipe(id) {
  return RECIPES.find((r) => r.id === id) || null;
}

export function recipesForCut(cutId) {
  return RECIPES.filter((r) => r.cutId === cutId);
}

// Map an arbitrary dish name (from AI or menu) to a local recipe id if we have
// one, matching loosely by keyword.
export function findRecipeByName(name = "") {
  const n = name.toLowerCase();
  return (
    RECIPES.find((r) => n.includes(r.name.toLowerCase())) ||
    RECIPES.find((r) => r.name.toLowerCase().split(" ").some((w) => n.includes(w))) ||
    null
  );
}
