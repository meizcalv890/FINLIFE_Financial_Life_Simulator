/* FINLIFE v2.0 — scenario data
 * Original Indonesian/English scenarios preserved from v1.0.
 * Loaded as a classic script so existing action callbacks keep their shared game-state access.
 */

window.FINLIFE_EVENTS = [
  {
    id: {
      text: "Teman ngajak nongkrong (Rp100.000) atau ditabung?",
      a: "Nongkrong",
      b: "Tabung",
    },
    en: {
      text: "Friend wants to hang out (Rp100,000) or save it?",
      a: "Go out",
      b: "Save",
    },
    a: () => {
      uang -= 100000;
      return "lose";
    },
    b: () => {
      tabungan += 100000;
      return "save";
    },
  },

  {
    id: {
      text: "Beli sepatu diskon (Rp200.000)?",
      a: "Beli",
      b: "Lewati",
    },
    en: {
      text: "Buy discounted shoes (Rp200,000)?",
      a: "Buy",
      b: "Skip",
    },
    a: () => {
      uang -= 200000;
      return "lose";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Investasi Rp150.000 (untung 20%)?",
      a: "Investasi",
      b: "Lewati",
    },
    en: {
      text: "Invest Rp150,000 (20% profit)?",
      a: "Invest",
      b: "Skip",
    },
    a: () => {
      uang -= 150000;
      uang += 150000 * 1.2;
      return "coin";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Makan mahal Rp120.000 atau hemat Rp40.000?",
      a: "Makan mahal",
      b: "Hemat",
    },
    en: {
      text: "Expensive meal Rp120,000 or eat cheap Rp40,000?",
      a: "Splurge",
      b: "Eat cheap",
    },
    a: () => {
      uang -= 120000;
      return "lose";
    },
    b: () => {
      uang -= 40000;
      return "neutral";
    },
  },

  {
    id: {
      text: "Ada promo game online Rp75.000. Beli?",
      a: "Beli",
      b: "Tidak",
    },
    en: {
      text: "Online game promo Rp75,000. Buy it?",
      a: "Buy",
      b: "No",
    },
    a: () => {
      uang -= 75000;
      return "lose";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Dapat uang dari bantu tetangga Rp80.000. Mau disimpan?",
      a: "Simpan uang",
      b: "Tabung",
    },
    en: {
      text: "Earned Rp80,000 helping a neighbor. Keep or save?",
      a: "Keep",
      b: "Save",
    },
    a: () => {
      uang += 80000;
      return "coin";
    },
    b: () => {
      tabungan += 80000;
      return "save";
    },
  },

  {
    id: {
      text: "Motor mogok, servis Rp250.000 atau tambal sendiri Rp100.000?",
      a: "Servis bengkel",
      b: "Tambal sendiri",
    },
    en: {
      text: "Motorcycle broke down. Full service Rp250,000 or DIY Rp100,000?",
      a: "Full service",
      b: "DIY fix",
    },
    a: () => {
      uang -= 250000;
      return "lose";
    },
    b: () => {
      uang -= 100000;
      return "lose";
    },
  },

  {
    id: {
      text: "Beli kopi kekinian Rp50.000?",
      a: "Beli",
      b: "Lewati",
    },
    en: {
      text: "Trendy coffee Rp50,000?",
      a: "Buy",
      b: "Skip",
    },
    a: () => {
      uang -= 50000;
      return "lose";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Ikut lomba dan menang Rp200.000! Mau ditabung?",
      a: "Pegang sendiri",
      b: "Tabung",
    },
    en: {
      text: "You won a contest! Rp200,000 prize! Save it?",
      a: "Keep it",
      b: "Save",
    },
    a: () => {
      uang += 200000;
      return "coin";
    },
    b: () => {
      tabungan += 200000;
      return "save";
    },
  },

  {
    id: {
      text: "Beli tiket konser Rp300.000?",
      a: "Beli tiket",
      b: "Lewati",
    },
    en: {
      text: "Buy concert tickets Rp300,000?",
      a: "Buy tickets",
      b: "Skip",
    },
    a: () => {
      uang -= 300000;
      return "lose";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Dapat gaji kecil dari tugas sampingan Rp120.000",
      a: "Simpan",
      b: "Tabung",
    },
    en: {
      text: "Earned Rp120,000 from a side gig",
      a: "Keep it",
      b: "Save it",
    },
    a: () => {
      uang += 120000;
      return "coin";
    },
    b: () => {
      tabungan += 120000;
      return "save";
    },
  },

  {
    id: {
      text: "Laptop error ringan, bayar perbaikan Rp90.000?",
      a: "Perbaiki",
      b: "Biarkan",
    },
    en: {
      text: "Laptop has minor issues, pay Rp90,000 to fix?",
      a: "Fix it",
      b: "Leave it",
    },
    a: () => {
      uang -= 90000;
      return "lose";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Dapat cashback belanja Rp40.000! Mau ditabung?",
      a: "Simpan",
      b: "Tabung",
    },
    en: {
      text: "Got Rp40,000 cashback! Save it?",
      a: "Keep it",
      b: "Save it",
    },
    a: () => {
      uang += 40000;
      return "coin";
    },
    b: () => {
      tabungan += 40000;
      return "save";
    },
  },

  {
    id: {
      text: "Beli skin game Rp80.000?",
      a: "Beli",
      b: "Lewati",
    },
    en: {
      text: "Buy a game skin for Rp80,000?",
      a: "Buy",
      b: "Skip",
    },
    a: () => {
      uang -= 80000;
      return "lose";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Menabung Rp100.000 hari ini?",
      a: "Tabung sekarang",
      b: "Nanti saja",
    },
    en: {
      text: "Save Rp100,000 today?",
      a: "Save now",
      b: "Maybe later",
    },
    a: () => {
      tabungan += 100000;
      return "save";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Teman minta pinjam uang Rp50.000?",
      a: "Pinjamkan",
      b: "Tolak",
    },
    en: {
      text: "Friend asks to borrow Rp50,000?",
      a: "Lend it",
      b: "Decline",
    },
    a: () => {
      uang -= 50000;
      return "lose";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Dapat THR kecil Rp150.000! Mau ditabung?",
      a: "Pegang sendiri",
      b: "Tabung",
    },
    en: {
      text: "Received a bonus of Rp150,000! Save it?",
      a: "Keep it",
      b: "Save it",
    },
    a: () => {
      uang += 150000;
      return "coin";
    },
    b: () => {
      tabungan += 150000;
      return "save";
    },
  },

  {
    id: {
      text: "Beli jaket baru Rp180.000?",
      a: "Beli",
      b: "Lewati",
    },
    en: {
      text: "Buy a new jacket for Rp180,000?",
      a: "Buy",
      b: "Skip",
    },
    a: () => {
      uang -= 180000;
      return "lose";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Jalan kaki hemat Rp20.000. Mau?",
      a: "Jalan kaki",
      b: "Naik kendaraan",
    },
    en: {
      text: "Walking saves Rp20,000. Do it?",
      a: "Walk",
      b: "Take transport",
    },
    a: () => {
      tabungan += 20000;
      return "save";
    },
    b: () => {
      uang -= 20000;
      return "lose";
    },
  },

  {
    id: {
      text: "Beli makanan cepat saji Rp60.000?",
      a: "Beli",
      b: "Masak sendiri",
    },
    en: {
      text: "Buy fast food for Rp60,000?",
      a: "Buy",
      b: "Cook at home",
    },
    a: () => {
      uang -= 60000;
      return "lose";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Ikut kursus online Rp130.000 untuk skill baru?",
      a: "Ikut kursus",
      b: "Lewati",
    },
    en: {
      text: "Join an online course for Rp130,000?",
      a: "Join",
      b: "Skip",
    },
    a: () => {
      uang -= 130000;
      return "lose";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Dapat bonus kerja kecil Rp90.000",
      a: "Simpan",
      b: "Tabung",
    },
    en: {
      text: "Got a small work bonus of Rp90,000",
      a: "Keep it",
      b: "Save it",
    },
    a: () => {
      uang += 90000;
      return "coin";
    },
    b: () => {
      tabungan += 90000;
      return "save";
    },
  },

  {
    id: {
      text: "Beli aksesoris HP Rp70.000?",
      a: "Beli",
      b: "Lewati",
    },
    en: {
      text: "Buy phone accessories for Rp70,000?",
      a: "Buy",
      b: "Skip",
    },
    a: () => {
      uang -= 70000;
      return "lose";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Bantu orang tua, dikasih Rp100.000. Mau ditabung?",
      a: "Pegang sendiri",
      b: "Tabung",
    },
    en: {
      text: "Helped your parents, received Rp100,000. Save it?",
      a: "Keep it",
      b: "Save it",
    },
    a: () => {
      uang += 100000;
      return "coin";
    },
    b: () => {
      tabungan += 100000;
      return "save";
    },
  },

  {
    id: {
      text: "Beli buku atau alat belajar Rp110.000?",
      a: "Beli",
      b: "Lewati",
    },
    en: {
      text: "Buy books or study materials for Rp110,000?",
      a: "Buy",
      b: "Skip",
    },
    a: () => {
      uang -= 110000;
      return "lose";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Diskon belanja bulanan, hemat Rp60.000!",
      a: "Belanja hemat",
      b: "Beli biasa",
    },
    en: {
      text: "Monthly shopping discount, save Rp60,000!",
      a: "Buy discounted",
      b: "Buy regular",
    },
    a: () => {
      uang -= 60000;
      return "neutral";
    },
    b: () => {
      uang -= 120000;
      return "lose";
    },
  },

  {
    id: {
      text: "Menang giveaway kecil Rp50.000! Mau ditabung?",
      a: "Pegang sendiri",
      b: "Tabung",
    },
    en: {
      text: "Won a small giveaway: Rp50,000! Save it?",
      a: "Keep it",
      b: "Save it",
    },
    a: () => {
      uang += 50000;
      return "coin";
    },
    b: () => {
      tabungan += 50000;
      return "save";
    },
  },

  {
    id: {
      text: "Biaya internet bulanan Rp75.000 jatuh tempo",
      a: "Bayar sekarang",
      b: "Tunda",
    },
    en: {
      text: "Monthly internet bill Rp75,000 is due",
      a: "Pay now",
      b: "Delay",
    },
    a: () => {
      uang -= 75000;
      return "lose";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Dapat uang saku tambahan Rp100.000!",
      a: "Simpan",
      b: "Tabung",
    },
    en: {
      text: "Received extra allowance Rp100,000!",
      a: "Keep it",
      b: "Save it",
    },
    a: () => {
      uang += 100000;
      return "coin";
    },
    b: () => {
      tabungan += 100000;
      return "save";
    },
  },

  {
    id: {
      text: "Beli makanan mewah Rp140.000?",
      a: "Beli",
      b: "Lewati",
    },
    en: {
      text: "Buy a fancy meal Rp140,000?",
      a: "Buy",
      b: "Skip",
    },
    a: () => {
      uang -= 140000;
      return "lose";
    },
    b: () => "neutral",
  },

  {
    id: {
      text: "Menabung konsisten Rp80.000 hari ini?",
      a: "Tabung",
      b: "Nanti saja",
    },
    en: {
      text: "Consistently save Rp80,000 today?",
      a: "Save",
      b: "Maybe later",
    },
    a: () => {
      tabungan += 80000;
      return "save";
    },
    b: () => "neutral",
  },
];
