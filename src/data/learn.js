// Data for the interactive tools on the Belajar page: cut finder rules,
// doneness levels and extra glossary terms. All original content;
// temperatures follow general food-safety guidance.

import { GLOSSARY } from "./meat.js";

// ---------------------------------------------------------------- cut finder
export const FINDER_STEPS = [
  {
    id: "method",
    q: "Mau dimasak jadi apa?",
    options: [
      { id: "panggang", label: "Panggang cepat", hint: "Steak, grill, sate, yakiniku" },
      { id: "berkuah", label: "Berkuah / masak lama", hint: "Rendang, sop, rawon, semur" },
      { id: "tumis", label: "Tumis / iris tipis", hint: "Tumis lada hitam, beef bowl, dendeng" },
      { id: "giling", label: "Giling", hint: "Bakso, patty burger, bolognese" },
    ],
  },
  {
    id: "budget",
    q: "Budget-nya?",
    options: [
      { id: "hemat", label: "Hemat", hint: "Di bawah Rp110.000/kg" },
      { id: "sedang", label: "Sedang", hint: "Rp110.000–200.000/kg" },
      { id: "bebas", label: "Bebas", hint: "Yang penting enak" },
    ],
  },
  {
    id: "time",
    q: "Punya waktu masak berapa lama?",
    options: [
      { id: "cepat", label: "Sebentar", hint: "Maksimal 30 menit" },
      { id: "sedang", label: "1–2 jam", hint: "Masak santai" },
      { id: "lama", label: "Lebih dari 2 jam", hint: "Sabar demi empuk" },
    ],
  },
];

// How suitable each cut is for each method (0 = jangan, 3 = juara).
export const SUIT = {
  tenderloin: { panggang: 3, tumis: 3, berkuah: 0, giling: 0 },
  ribeye: { panggang: 3, tumis: 2, berkuah: 0, giling: 0 },
  sirloin: { panggang: 3, tumis: 3, berkuah: 1, giling: 0 },
  chuck: { panggang: 0, tumis: 2, berkuah: 2, giling: 3 },
  brisket: { panggang: 1, tumis: 0, berkuah: 3, giling: 1 },
  round: { panggang: 0, tumis: 2, berkuah: 2, giling: 1 },
  shank: { panggang: 0, tumis: 0, berkuah: 3, giling: 1 },
  ribs: { panggang: 2, tumis: 0, berkuah: 3, giling: 0 },
  oxtail: { panggang: 1, tumis: 0, berkuah: 3, giling: 0 },
};

// ------------------------------------------------------------ doneness view
export const DONENESS_LEVELS = [
  { id: "mentah", name: "Belum matang", min: 0, max: 49, juicy: "Dingin di tengah", note: "Bagian tengah masih dingin dan belum matang. Lanjutkan memasak." },
  { id: "rare", name: "Rare", min: 50, max: 54, juicy: "Sangat juicy", note: "Tengah merah dan hangat. Hanya untuk cut empuk berkualitas seperti tenderloin." },
  { id: "mr", name: "Medium Rare", min: 55, max: 59, juicy: "Juicy maksimal", note: "Favorit untuk ribeye dan tenderloin: lemak marbling mulai meleleh dan daging tetap lembut." },
  { id: "medium", name: "Medium", min: 60, max: 64, juicy: "Seimbang", note: "Merah muda di tengah, sedikit lebih kesat dari medium rare." },
  { id: "mw", name: "Medium Well", min: 65, max: 70, juicy: "Mulai kering", note: "Hanya sedikit merah muda. Cocok bagi yang kurang suka bagian tengah merah." },
  { id: "well", name: "Well Done", min: 71, max: 100, juicy: "Kering", note: "Matang penuh. Wajib untuk daging giling dan patty (≥71°C)." },
];
export const levelOfTemp = (t) => DONENESS_LEVELS.find((l) => t >= l.min && t <= l.max) || DONENESS_LEVELS[0];
export const CARRYOVER = 3; // °C the core still rises while resting

// ----------------------------------------------------------------- glossary
export const EXTRA_GLOSSARY = [
  { term: "Carryover cooking", def: "Kenaikan suhu inti 2–4°C setelah daging diangkat dari api. Karena itu steak diangkat sedikit sebelum target." },
  { term: "Kolagen", def: "Jaringan ikat di urat dan tulang. Keras bila dimasak cepat, berubah jadi gelatin lembut bila dimasak lama." },
  { term: "Grass-fed vs grain-fed", def: "Sapi pakan rumput dagingnya lebih ramping dan beraroma kuat; pakan biji-bijian menghasilkan marbling lebih banyak." },
  { term: "Wagyu & MB", def: "Wagyu adalah ras sapi Jepang dengan marbling tinggi. MB (marble score) mengukur banyaknya marbling, makin tinggi makin berlemak." },
  { term: "Freezer burn", def: "Bercak kering keabu-abuan pada daging beku akibat udara. Aman dimakan, tapi teksturnya kering." },
  { term: "Basting", def: "Menyiramkan mentega atau minyak panas ke atas steak saat dimasak agar matang merata dan beraroma." },
  { term: "Ungkep", def: "Memasak daging bersama bumbu dengan sedikit air sampai empuk dan bumbu meresap, sebelum digoreng atau dibakar." },
  { term: "Zona bahaya", def: "Rentang suhu 5–60°C tempat bakteri berkembang paling cepat. Jangan biarkan daging mentah lama di suhu ini." },
];

export const ALL_GLOSSARY = [...GLOSSARY, ...EXTRA_GLOSSARY].sort((a, b) => a.term.localeCompare(b.term, "id"));
