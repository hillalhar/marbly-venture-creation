// Blog-style articles for the Belajar page. All original content.
// Block types: p, h2, list, tip, warn, steps, table.
// Facts match the rest of the app (shelf life, doneness temps, carryover).

export const ARTICLE_CATEGORIES = [
  { id: "semua", label: "Semua" },
  { id: "dasar", label: "Dasar" },
  { id: "belanja", label: "Belanja" },
  { id: "simpan", label: "Simpan & aman" },
  { id: "masak", label: "Teknik masak" },
];

export const ARTICLES = [
  {
    slug: "mengenal-bagian-sapi",
    category: "dasar",
    title: "Mengenal 9 bagian sapi dan cara memasak masing-masing",
    excerpt: "Kenapa has dalam cocok jadi steak, sementara sengkel justru juara untuk rawon? Semuanya berawal dari otot mana yang paling sering bekerja.",
    image: "/images/products/paket-steak.jpg",
    date: "2026-10-28",
    featured: true,
    related: { products: ["tenderloin-300", "brisket-500", "shank-500"], recipes: ["ribeye-steak", "rawon"] },
    body: [
      { type: "p", text: "Setiap bagian sapi punya karakter sendiri. Ada yang empuk dan cukup dimasak beberapa menit, ada juga yang keras kalau terburu-buru tapi berubah lembut setelah direbus berjam-jam. Kuncinya bukan mahal atau murah, melainkan seberapa keras otot itu bekerja selama sapi hidup." },
      { type: "h2", text: "Aturan dasarnya: otot santai vs otot pekerja" },
      { type: "p", text: "Otot di sepanjang punggung jarang dipakai untuk bergerak. Seratnya halus dan jaringan ikatnya sedikit, jadi empuk walau dimasak cepat. Sebaliknya, otot kaki, dada, dan ekor bekerja keras menopang badan. Otot ini kaya kolagen, jaringan ikat yang alot saat dimasak sebentar tapi lumer jadi gelatin saat dimasak lama." },
      { type: "table", head: ["Bagian", "Karakter", "Cara masak terbaik"], rows: [
        ["Has Dalam (tenderloin)", "Paling empuk, lemak sedikit", "Steak, bistik, panggang cepat"],
        ["Lamusir (ribeye)", "Marbling tinggi, juicy", "Steak, yakiniku"],
        ["Has Luar (sirloin)", "Empuk, rasa kuat", "Steak, sate, beef bowl"],
        ["Sampil (chuck)", "Serbaguna, ekonomis", "Bakso, semur, giling"],
        ["Sandung Lamur (brisket)", "Berlemak, berurat", "Rendang, soto, smoked"],
        ["Gandik (round)", "Padat, rendah lemak", "Dendeng, empal, abon"],
        ["Sengkel (shank)", "Banyak urat & kolagen", "Rawon, sop, bakso urat"],
        ["Iga (ribs)", "Daging di sela tulang", "Iga bakar, sop iga, konro"],
        ["Buntut (oxtail)", "Bertulang, kaya kolagen", "Sop buntut, buntut bakar"],
      ] },
      { type: "h2", text: "Salah cut, salah hasil" },
      { type: "p", text: "Kesalahan paling umum adalah memakai cut berurat untuk steak, atau sebaliknya memakai cut steak untuk rendang. Sengkel yang dipanggang lima menit akan sulit dikunyah. Has dalam yang direbus tiga jam akan kering dan berserat karena lemaknya terlalu sedikit untuk dimasak lama." },
      { type: "tip", title: "Cara cepat memilih", text: "Masak cepat dengan api besar? Pilih bagian punggung. Masak lama berkuah? Pilih bagian kaki, dada, atau ekor. Jelajahi semuanya di tab Peta sapi." },
      { type: "h2", text: "Bagaimana dengan harga?" },
      { type: "p", text: "Bagian punggung lebih mahal karena jumlahnya sedikit dan banyak dicari untuk steak. Kabar baiknya, cut berurat yang lebih murah justru menghasilkan kuah paling gurih. Untuk masakan rumahan Indonesia yang banyak berkuah, sampil, sandung lamur, dan sengkel sering jadi pilihan paling masuk akal." },
    ],
  },
  {
    slug: "ciri-daging-segar",
    category: "belanja",
    title: "Cara mengenali daging sapi segar di pasar dan supermarket",
    excerpt: "Warna, bau, tekstur, dan lemak. Empat hal yang bisa kamu cek dalam satu menit sebelum membayar.",
    image: "/images/products/round-500.jpg",
    date: "2026-10-24",
    related: { products: ["round-500", "sirloin-300"], recipes: [] },
    body: [
      { type: "p", text: "Daging segar tidak selalu berarti daging yang baru dipotong. Yang penting adalah bagaimana daging itu ditangani: disimpan dingin, tidak terlalu lama di suhu ruang, dan dikemas bersih. Untungnya, sebagian besar tanda kesegaran bisa dilihat dan dicium langsung." },
      { type: "h2", text: "Empat hal yang perlu dicek" },
      { type: "list", items: [
        "Warna: merah cerah sampai merah keunguan di bagian dalam. Waspadai warna cokelat tua, abu-abu, atau kehijauan yang merata.",
        "Bau: aroma khas daging yang netral. Bau asam, amis tajam, atau seperti amonia adalah tanda daging sudah menurun.",
        "Tekstur: kenyal dan kembali ke bentuk semula saat ditekan. Daging yang lembek dan berlendir sebaiknya dilewati.",
        "Lemak: putih sampai krem. Lemak kekuningan pudar bisa berarti daging sudah lama atau dari sapi tua.",
      ] },
      { type: "h2", text: "Daging vakum berwarna ungu, apakah basi?" },
      { type: "p", text: "Tidak. Daging dalam kemasan vakum tidak terkena oksigen, sehingga warnanya merah keunguan. Setelah kemasan dibuka sekitar 15 menit, daging akan kembali merah cerah. Ini proses alami, bukan tanda kerusakan." },
      { type: "warn", title: "Lewati saja kalau…", text: "Kemasan menggembung, permukaan licin berlendir, atau tercium bau asam begitu dibuka. Mencuci daging tidak menghilangkan bakteri yang sudah berkembang." },
      { type: "h2", text: "Perhatikan rantai dingin" },
      { type: "p", text: "Pilih daging yang dipajang di lemari pendingin, bukan yang dibiarkan di meja tanpa es. Belanja daging di akhir, setelah barang lain, dan langsung masukkan ke kulkas begitu sampai di rumah. Kalau perjalanan lebih dari 30 menit, bawa cooler bag atau ice gel." },
      { type: "tip", title: "Coba juga", text: "Ragu dengan daging yang ada di kulkas? Foto dagingnya di halaman Cek Daging untuk skrining visual cepat. Tetap cek bau dan teksturnya sendiri." },
    ],
  },
  {
    slug: "simpan-dan-cairkan",
    category: "simpan",
    title: "Panduan menyimpan dan mencairkan daging dengan aman",
    excerpt: "Berapa lama daging tahan di kulkas dan freezer, dan kenapa mencairkan di meja dapur adalah kebiasaan yang perlu ditinggalkan.",
    image: "/images/products/ground-500.jpg",
    date: "2026-10-20",
    related: { products: ["ground-500", "oxtail-700"], recipes: [] },
    body: [
      { type: "p", text: "Bakteri berkembang paling cepat di rentang suhu 5–60°C, yang sering disebut zona bahaya. Tujuan menyimpan daging adalah menjaganya tetap di luar zona itu sampai siap dimasak." },
      { type: "h2", text: "Batas simpan yang perlu diingat" },
      { type: "table", head: ["Jenis", "Kulkas 0–4°C", "Freezer −18°C"], rows: [
        ["Potongan utuh (steak, dadu, iga)", "± 3 hari", "± 6 bulan"],
        ["Daging giling", "1–2 hari", "± 3 bulan"],
        ["Sudah dicairkan di kulkas", "1–2 hari", "Jangan dibekukan ulang mentah"],
      ] },
      { type: "p", text: "Angka di atas adalah panduan umum. Simpan daging di rak paling bawah kulkas, di wadah tertutup, supaya cairannya tidak menetes ke makanan lain." },
      { type: "h2", text: "Membekukan dengan benar" },
      { type: "list", items: [
        "Bagi daging per porsi masak sebelum dibekukan, supaya tidak perlu mencairkan semuanya.",
        "Bungkus rapat dan keluarkan udara sebanyak mungkin agar tidak terkena freezer burn.",
        "Tulis tanggal di kemasan. Di halaman Kulkas Saya, batas simpan ini dihitung otomatis.",
      ] },
      { type: "h2", text: "Tiga cara mencairkan yang aman" },
      { type: "steps", items: [
        { title: "Di kulkas (paling aman)", text: "Pindahkan dari freezer ke kulkas semalaman, sekitar 10 jam per kg. Setelah cair, daging masih bisa disimpan 1–2 hari." },
        { title: "Rendam air dingin", text: "Bungkus kedap, rendam di air dingin, dan ganti airnya setiap 30 menit. Sekitar 1 jam per kg. Langsung masak setelah cair." },
        { title: "Microwave mode defrost", text: "Paling cepat, tapi sebagian daging bisa mulai matang. Masak segera setelahnya." },
      ] },
      { type: "warn", title: "Hindari mencairkan di suhu ruang", text: "Saat bagian tengah masih beku, permukaan daging sudah lama berada di zona bahaya. Bakteri berkembang sebelum dagingnya sempat dimasak." },
      { type: "tip", title: "Freezer burn itu aman", text: "Bercak kering keabu-abuan pada daging beku hanya membuat tekstur kering. Potong bagian itu sebelum dimasak." },
    ],
  },
  {
    slug: "steak-juicy-di-rumah",
    category: "masak",
    title: "Rahasia steak juicy di rumah: suhu, istirahat, dan arah serat",
    excerpt: "Tidak perlu grill mahal. Steak yang enak ditentukan oleh tiga hal kecil yang sering terlewat.",
    image: "/images/recipes/ribeye-steak.jpg",
    date: "2026-10-15",
    related: { products: ["ribeye-300", "sirloin-300", "tenderloin-300"], recipes: ["ribeye-steak"] },
    body: [
      { type: "p", text: "Banyak orang mengira steak restoran enak karena alatnya. Padahal, wajan besi biasa di kompor rumah sudah cukup. Perbedaan terbesar ada pada suhu, waktu istirahat, dan cara memotong." },
      { type: "h2", text: "1. Mulai dari daging yang tidak dingin" },
      { type: "p", text: "Keluarkan steak dari kulkas sekitar 30 menit sebelum dimasak dan keringkan permukaannya dengan tisu. Permukaan yang kering membentuk kerak cokelat (reaksi Maillard) dengan cepat, sedangkan permukaan basah justru mengukus daging." },
      { type: "h2", text: "2. Angkat sebelum target" },
      { type: "p", text: "Setelah diangkat dari api, panas di permukaan terus merambat ke tengah, jadi suhu inti naik sekitar 2–4°C. Ini disebut carryover cooking. Untuk medium rare (55–57°C), angkat steak saat suhu intinya sekitar 52°C." },
      { type: "table", head: ["Kematangan", "Suhu inti akhir", "Angkat di sekitar"], rows: [
        ["Rare", "50–54°C", "47–51°C"],
        ["Medium Rare", "55–59°C", "52–56°C"],
        ["Medium", "60–64°C", "57–61°C"],
        ["Medium Well", "65–70°C", "62–67°C"],
        ["Well Done", "≥ 71°C", "≥ 68°C"],
      ] },
      { type: "tip", title: "Lihat langsung", text: "Geser suhu di tab Kematangan untuk melihat perubahan warna bagian dalam steak dan efek panas sisa." },
      { type: "h2", text: "3. Istirahatkan, lalu potong melawan serat" },
      { type: "p", text: "Diamkan steak 5 menit sebelum dipotong agar cairannya merata kembali dan tidak tumpah di talenan. Lalu lihat arah serat otot di permukaan daging dan potong tegak lurus terhadapnya. Serat yang lebih pendek terasa jauh lebih empuk saat dikunyah." },
      { type: "warn", title: "Untuk anak, ibu hamil, dan lansia", text: "Pilih kematangan medium well ke atas. Daging giling selalu dimasak sampai suhu inti minimal 71°C." },
    ],
  },
  {
    slug: "rahasia-rendang-empuk",
    category: "masak",
    title: "Kenapa rendang butuh sandung lamur: memahami kolagen",
    excerpt: "Daging berurat yang alot bisa berubah lembut dan meresap. Ini yang terjadi di dalam panci selama tiga jam.",
    image: "/images/recipes/rendang.jpg",
    date: "2026-10-10",
    related: { products: ["brisket-500", "rendang-1000", "chuck-500"], recipes: ["rendang", "sop-buntut"] },
    body: [
      { type: "p", text: "Rendang yang baik punya daging yang empuk tapi tidak hancur, dengan bumbu yang meresap sampai ke tengah. Rahasianya bukan hanya bumbu, tetapi pilihan cut dan kesabaran." },
      { type: "h2", text: "Kolagen: dari alot jadi lembut" },
      { type: "p", text: "Sandung lamur dan sampil mengandung banyak kolagen, jaringan ikat yang menyatukan serat otot. Dimasak sebentar, kolagen mengerut dan membuat daging alot. Dimasak lama dengan api kecil di atas sekitar 70°C, kolagen perlahan berubah menjadi gelatin. Gelatin inilah yang membuat daging terasa lembut, juicy, dan kuahnya kental." },
      { type: "h2", text: "Kenapa cut steak tidak cocok" },
      { type: "p", text: "Has dalam atau has luar hampir tidak punya kolagen. Saat dimasak berjam-jam, seratnya terus mengencang dan cairannya keluar, sehingga daging menjadi kering dan berserabut. Cut steak bagus untuk dimasak cepat, bukan untuk rendang." },
      { type: "steps", items: [
        { title: "Potong dadu 4 cm", text: "Potongan yang terlalu kecil mudah hancur selama dimasak lama." },
        { title: "Api kecil, aduk sesekali", text: "Didihkan pelan. Api besar membuat santan pecah sebelum daging empuk." },
        { title: "Sabar 2–3 jam", text: "Daging siap saat bisa dibelah dengan sendok dan kuah mulai berminyak." },
      ] },
      { type: "tip", title: "Hemat waktu", text: "Pakai presto sekitar 50 menit untuk melunakkan daging, lalu lanjutkan memasak di wajan sampai bumbu mengering." },
      { type: "p", text: "Prinsip yang sama berlaku untuk sop buntut, rawon, dan semur. Semua masakan berkuah Indonesia yang lezat mengandalkan cut kaya kolagen dan waktu yang cukup." },
    ],
  },
  {
    slug: "marbling-wagyu-grassfed",
    category: "dasar",
    title: "Marbling, wagyu, grass-fed vs grain-fed: apa bedanya?",
    excerpt: "Istilah di label daging premium yang sering membingungkan, dijelaskan dengan sederhana.",
    image: "/images/products/saikoro-250.jpg",
    date: "2026-10-05",
    related: { products: ["saikoro-250", "ribeye-300", "tenderloin-300"], recipes: ["ribeye-steak"] },
    body: [
      { type: "p", text: "Label daging premium sering penuh istilah asing. Memahaminya membantu kamu menilai apakah harga yang dibayar sesuai dengan yang akan didapat di piring." },
      { type: "h2", text: "Marbling" },
      { type: "p", text: "Marbling adalah serat lemak putih tipis yang menyebar di dalam otot, bukan lemak di tepi daging. Saat dimasak, lemak ini meleleh dari dalam sehingga daging terasa lebih juicy dan beraroma. Makin rata sebarannya, makin tinggi nilainya." },
      { type: "h2", text: "Wagyu dan marble score (MB)" },
      { type: "p", text: "Wagyu adalah ras sapi asal Jepang yang secara genetik menghasilkan marbling sangat tinggi. Di Australia, tingkat marbling diukur dengan marble score (MB) dari 0 sampai 9 ke atas. Wagyu MB5 seperti saikoro di toko marbly sudah sangat berlemak, jadi cukup di-sear sekitar 1 menit tiap sisi." },
      { type: "h2", text: "Grass-fed vs grain-fed" },
      { type: "table", head: ["", "Grass-fed", "Grain-fed"], rows: [
        ["Pakan", "Rumput", "Biji-bijian di akhir masa pemeliharaan"],
        ["Lemak", "Lebih ramping", "Marbling lebih banyak"],
        ["Rasa", "Lebih kuat, sedikit 'herbal'", "Lebih lembut dan gurih"],
        ["Cocok untuk", "Yang suka daging ramping", "Steak juicy"],
      ] },
      { type: "tip", title: "Mana yang lebih baik?", text: "Tidak ada yang mutlak. Grass-fed lebih rendah lemak, grain-fed lebih juicy. Pilih sesuai selera dan menu." },
      { type: "h2", text: "Dry aging dan wet aging" },
      { type: "p", text: "Aging adalah pematangan daging untuk menambah keempukan dan rasa. Dry aging dilakukan di ruang bersuhu dan berkelembapan terkontrol selama berminggu-minggu, rasanya menjadi lebih pekat. Wet aging dilakukan di dalam kemasan vakum dan lebih umum di pasaran." },
    ],
  },
  {
    slug: "belanja-daging-hemat",
    category: "belanja",
    title: "Belanja daging hemat: cut murah yang justru juara",
    excerpt: "Budget terbatas bukan berarti masakan biasa saja. Ini cara memaksimalkan setiap rupiah.",
    image: "/images/products/chuck-500.jpg",
    date: "2026-09-30",
    related: { products: ["chuck-500", "shank-500", "round-500", "paket-sop"], recipes: ["bakso", "rawon"] },
    body: [
      { type: "p", text: "Harga per kilogram bisa berbeda tiga kali lipat antara has dalam dan sengkel. Padahal untuk banyak masakan rumahan, cut yang lebih murah justru memberi hasil lebih baik." },
      { type: "h2", text: "Cut hemat dan masakan terbaiknya" },
      { type: "list", items: [
        "Sampil (chuck): rasio lemaknya pas untuk bakso dan patty. Juga enak untuk semur dan tumis.",
        "Sengkel (shank): pilihan utama rawon dan sop. Uratnya berubah kenyal lembut setelah direbus.",
        "Gandik (round): padat dan rendah lemak, cocok untuk empal, dendeng, dan abon.",
      ] },
      { type: "h2", text: "Hitung per porsi, bukan per kilo" },
      { type: "p", text: "Potongan bertulang seperti iga dan buntut terlihat murah per kilo, tapi sebagian beratnya adalah tulang. Rata-rata hanya sekitar 45–55% yang bisa dimakan. Bandingkan harga per porsi matang, bukan hanya harga di label." },
      { type: "tip", title: "Pakai alat bantu", text: "Halaman Alat punya kalkulator harga per porsi yang sudah memperhitungkan susut masak dan tulang." },
      { type: "h2", text: "Kebiasaan kecil yang menghemat" },
      { type: "list", items: [
        "Beli dalam jumlah lebih besar saat promo, lalu bekukan per porsi.",
        "Pilih paket bundling untuk dua masakan sekaligus, misalnya paket sop dan rawon.",
        "Catat stok di Kulkas Saya supaya tidak ada daging yang terbuang karena lupa.",
      ] },
    ],
  },
];

export const getArticle = (slug) => ARTICLES.find((a) => a.slug === slug) || null;

export function readingMinutes(article) {
  const words = article.body
    .map((b) => [b.text, b.title, ...(b.items || []).map((i) => (typeof i === "string" ? i : `${i.title} ${i.text}`)), ...(b.rows || []).flat()].join(" "))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(2, Math.round(words / 180));
}
