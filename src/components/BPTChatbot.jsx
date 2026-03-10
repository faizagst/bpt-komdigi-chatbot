"use client";
import { useState, useRef, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
//  KONFIGURASI
// ═══════════════════════════════════════════════════════════════
const ADMIN_CREDS = [
  { username: "admin.bpt", password: "BPT@Komdigi2025", role: "Super Admin", avatar: "👑" },
  { username: "operator1", password: "Operator@2025", role: "Operator Konten", avatar: "🛠️" },
];
const SESSION_MS = 30 * 60 * 1000;
const G = "linear-gradient(135deg,#1e40af 0%,#2563eb 50%,#0ea5e9 100%)";
const G2 = "linear-gradient(135deg,#6366f1,#8b5cf6)";
const CONTACT = "📧 **bpt@komdigi.go.id** | 📞 **0811-1166-784** | 🌐 **bpt.komdigi.go.id**";

// ═══════════════════════════════════════════════════════════════
//  KNOWLEDGE BASE — FALLBACK ONLY
//  Di v8, KB hanya digunakan jika:
//    1. Tidak ada dokumen aktif, ATAU
//    2. Dokumen aktif tidak relevan dengan pertanyaan, DAN
//    3. Mode "Dokumen Saja" TIDAK aktif
// ═══════════════════════════════════════════════════════════════
const KB = [
  {
    id: "profil",
    topic: "Profil & Sejarah BPT Komdigi",
    tags: ["profil", "bpptik", "bpt komdigi", "tentang", "apa itu bpt", "siapa bpt", "sejarah", "lembaga", "instansi",
      "organisasi", "visi misi", "tugas fungsi", "transformasi", "balai pelatihan", "kominfo", "komdigi",
      "unit pelaksana teknis", "upt", "kementerian"],
    patterns: ["apa itu bpt", "siapa bpt komdigi", "ceritakan tentang", "profil lembaga", "sejarah bpptik",
      "bpptik jadi apa", "apa itu bpptik", "lembaga ini apa"],
    answer: `**Tentang BPT Komdigi**

**Balai Pelatihan Talenta Komunikasi dan Digital (BPT Komdigi)** — sebelumnya dikenal sebagai BPPTIK — adalah Unit Pelaksana Teknis (UPT) di bawah **Kementerian Komunikasi dan Digital Republik Indonesia**.

Per **Januari 2026**, BPPTIK resmi bertransformasi menjadi **BPT Komdigi**, memperluas mandatnya dalam pengembangan talenta digital nasional.

**Tugas & Fungsi:**
- Melaksanakan pelatihan vokasional di bidang TIK
- Uji kompetensi, sertifikasi, dan akreditasi program pelatihan pemerintah
- Pelayanan produk jasa TIK untuk masyarakat, ASN, dan industri

**Statistik Capaian:**
- 🎓 **70+** Program Pelatihan aktif
- 👨‍🏫 **16+** Tenaga Pengajar berpengalaman
- 📚 **120+** Materi Pelatihan tersedia
- 👥 **38.000+** Alumni tersertifikasi

**Dasar Hukum:** Peraturan Menteri Komunikasi dan Informatika RI Nomor 4 Tahun 2022 tentang Organisasi dan Tata Kerja BPPTIK.`
  },
  {
    id: "program_overview",
    topic: "Program Pelatihan — Daftar Lengkap",
    tags: ["program", "pelatihan", "jenis", "kategori", "daftar", "macam", "pilihan", "tersedia", "ada apa saja",
      "apa saja", "semua program", "seluruh program", "informasi program", "bidang pelatihan"],
    patterns: ["program apa saja", "pelatihan apa saja", "ada pelatihan apa", "jenis pelatihan", "kategori pelatihan",
      "mau ikut pelatihan apa", "pilihan program", "daftar program", "semua pelatihan", "apa saja yang tersedia",
      "bisa belajar apa", "bisa ikut apa", "program yang ada"],
    answer: `**Program Pelatihan BPT Komdigi**

BPT Komdigi menyelenggarakan **4 kategori utama** pelatihan:

---

**1. 🏫 Pelatihan Masyarakat Umum (PNBP)**
Pelatihan berbayar berbasis Penerimaan Negara Bukan Pajak, terbuka untuk masyarakat umum. Biaya terjangkau, bersertifikat SKKNI/BNSP.
→ Contoh: Web Developer, Jaringan Komputer, Operator Komputer, AI Marketing

**2. 🏛️ Pelatihan ASN**
Khusus Aparatur Sipil Negara dari seluruh K/L dan Pemerintah Daerah. Fokus transformasi digital birokrasi melalui program **Government Transformation Academy (GTA)**.

**3. ♿ Pelatihan Disabilitas**
Program inklusif dengan fasilitas dan pendampingan khusus penyandang disabilitas. Program VSGA Disabilitas tersedia dalam kerangka **Digital Talent Scholarship (DTS)**.

**4. 🎓 Digital Talent Scholarship (DTS) — GRATIS**
Beasiswa pelatihan 100% gratis dari pemerintah, mencakup:
- **FGA** (Fresh Graduate Academy) — lulusan D3/S1/S2
- **VSGA** (Vocational School Graduate Academy) — lulusan SMK
- **TA** (Thematic Academy) — masyarakat umum & ASN
- **ProA** (Professional Academy) — profesional aktif
- **GTA** (Government Transformation Academy) — ASN
- **KADA** (Korea-ASEAN Digital Academy) — program internasional

💡 Untuk jadwal & pendaftaran terbaru, cek **bpt.komdigi.go.id**`
  },
  {
    id: "pnbp",
    topic: "Pelatihan PNBP (Berbayar)",
    tags: ["pnbp", "berbayar", "biaya", "tarif", "harga", "bayar", "berapa", "berapa biaya", "berapa harga",
      "pelatihan berbayar", "bayar berapa", "biaya pelatihan", "tarif pelatihan"],
    patterns: ["berapa biaya", "berapa harga", "berapa tarif", "biaya pelatihan", "harga pelatihan",
      "tarif pnbp", "program pnbp", "pelatihan pnbp", "pelatihan berbayar", "bayar berapa"],
    answer: `**Pelatihan PNBP BPT Komdigi**

Pelatihan berbasis **Penerimaan Negara Bukan Pajak (PNBP)** sesuai PMK No. 177/PMK.02/2021.

**Program PNBP Terkini (2026):**

| Program | Biaya | Kuota |
|---|---|---|
| Pelatihan Asisten Pengembang Web | Rp **184.000** | 30 peserta |
| Pelatihan Teknisi Operator Komputer | Rp **184.000** | 30 peserta |
| Pelatihan Teknisi Jaringan Komputer Muda | Rp **588.800** | 30 peserta |
| Workshop Associate AI Marketing Analyst | Rp **588.800** | 30 peserta |

> 📌 Jadwal & program terbaru dapat berubah. Pantau di **bpt.komdigi.go.id**`
  },
  {
    id: "dts",
    topic: "Digital Talent Scholarship (DTS) — Gratis",
    tags: ["gratis", "dts", "beasiswa", "scholarship", "free", "tidak bayar", "tanpa biaya",
      "digital talent", "beasiswa digital", "pelatihan gratis"],
    patterns: ["pelatihan gratis", "ada yang gratis", "beasiswa", "dts", "digital talent scholarship",
      "tanpa biaya", "tidak bayar", "gratis enggak", "ada beasiswa"],
    answer: `**Digital Talent Scholarship (DTS) — 100% GRATIS**

Program beasiswa pelatihan digital dari **Kementerian Komunikasi dan Digital RI**. **Tidak ada biaya pendaftaran, pelatihan, maupun sertifikasi.**

**Akademi dalam DTS:**

| Akademi | Target | Batas Usia |
|---|---|---|
| **FGA** — Fresh Graduate Academy | Lulusan D3/S1/S2 | 21–30 tahun |
| **VSGA** — Vocational School Graduate Academy | Lulusan SMK TIK | 17–25 tahun |
| **TA** — Thematic Academy | Masyarakat umum & ASN | 18–45 tahun |
| **ProA** — Professional Academy | Profesional aktif | 25–50 tahun |
| **GTA** — Government Transformation Academy | ASN K/L & Pemda | Sesuai ketentuan |
| **KADA** — Korea-ASEAN Digital Academy | Profesional & ASN | Dibuka berkala |

**Cara Daftar DTS:**
1. Buka **digitalent.komdigi.go.id**
2. Buat akun & verifikasi email
3. Pilih akademi dan bidang pelatihan
4. Upload: KTP, ijazah, foto 3x4 latar merah
5. Ikuti tes seleksi online
6. Tunggu pengumuman (~2 minggu)`
  },
  {
    id: "gta",
    topic: "Government Transformation Academy (GTA) untuk ASN",
    tags: ["gta", "asn", "aparatur sipil", "pns", "pegawai negeri", "pemerintah", "birokrasi", "spbe",
      "transformasi pemerintah", "digital government", "kementerian", "pemda", "pelatihan asn"],
    patterns: ["pelatihan asn", "program untuk asn", "gta", "government transformation", "pns bisa ikut",
      "pelatihan pemerintah", "asn mau daftar", "asn bisa", "instansi pemerintah", "pemda ikut"],
    answer: `**Government Transformation Academy (GTA)**

Program pelatihan khusus **Aparatur Sipil Negara (ASN)** untuk mendukung transformasi digital birokrasi Indonesia, dalam kerangka **Digital Talent Scholarship (DTS)**.

**Topik Pelatihan GTA:**
- Pengantar SPBE (Sistem Pemerintahan Berbasis Elektronik)
- Tata Kelola Data Pemerintah
- Keamanan Informasi untuk Pemerintah
- Video Content Creator (Komunikasi Publik)
- Literasi Digital untuk Birokrasi

**Pelaksanaan:**
- Online & Offline (di kampus BPPTIK Cikarang)
- 2025: sudah berjalan hingga **Gelombang 8**

**Cara Daftar:** Melalui **digitalent.komdigi.go.id** atau pantau pengumuman di bpt.komdigi.go.id`
  },
  {
    id: "sertifikasi",
    topic: "Sertifikasi Kompetensi SKKNI/BNSP/LSP",
    tags: ["sertifikat", "sertifikasi", "lsp", "bnsp", "skkni", "kompetensi", "uji kompetensi",
      "bukti kompetensi", "standar kompetensi", "lsp bpptik", "akreditasi"],
    patterns: ["ada sertifikasi", "dapat sertifikat", "sertifikasi kompetensi", "uji kompetensi",
      "sertifikat bnsp", "skkni", "sertifikasi setelah pelatihan", "dapat sertifikat apa"],
    answer: `**Sertifikasi Kompetensi di BPT Komdigi**

**Lembaga Sertifikasi:**
- **LSP P2 BPPTIK** — berlisensi BNSP (lisensi diterbitkan 2019)
- Kunjungi: **lspbpptik.komdigi.go.id**

**Jenis Sertifikat:**
- **Sertifikat Kehadiran/Kompetensi** — minimal kehadiran 80%
- **Sertifikat SKKNI/BNSP** — setelah uji kompetensi resmi
- **Sertifikat Industri** — Cisco, AWS, Google, Microsoft (tergantung program)

> ✅ Sertifikasi BNSP diakui secara nasional dan menjadi nilai tambah di dunia kerja.`
  },
  {
    id: "pendaftaran",
    topic: "Cara Mendaftar Pelatihan",
    tags: ["daftar", "cara daftar", "registrasi", "bagaimana mendaftar", "langkah daftar", "ikut pelatihan",
      "cara ikut", "pendaftaran", "proses daftar", "gimana caranya daftar", "mau daftar"],
    patterns: ["cara mendaftar", "bagaimana daftar", "gimana caranya ikut", "langkah pendaftaran",
      "mau daftar pelatihan", "proses pendaftaran", "cara registrasi", "daftar pnbp", "daftar dts"],
    answer: `**Cara Mendaftar Pelatihan BPT Komdigi**

**🔵 Pelatihan PNBP (Berbayar):**
1. Buka **bpt.komdigi.go.id** → menu "Pelatihan"
2. Pilih program yang tersedia & klik "Daftar Pelatihan"
3. Login atau buat akun baru
4. Isi formulir & upload dokumen (KTP, dll.)
5. Lakukan pembayaran sesuai tarif PNBP
6. Konfirmasi kehadiran setelah pembayaran diterima

**🟢 Program DTS (Gratis):**
1. Buka **digitalent.komdigi.go.id**
2. Buat akun & verifikasi email
3. Pilih akademi (FGA/VSGA/TA/ProA/GTA/KADA)
4. Upload: KTP, ijazah terakhir, foto 3x4 latar merah
5. Ikuti **tes seleksi online**
6. Pantau pengumuman hasil seleksi (~2 minggu)

💡 **Tips:** Daftar secepatnya karena kuota terbatas (umumnya 30 peserta per batch).`
  },
  {
    id: "persyaratan",
    topic: "Syarat & Ketentuan Peserta",
    tags: ["syarat", "persyaratan", "ketentuan", "batas usia", "umur", "dokumen", "berkas",
      "siapa yang bisa", "syarat daftar", "ketentuan peserta", "dokumen apa", "eligible"],
    patterns: ["syarat pendaftaran", "apa syaratnya", "ketentuan peserta", "batas usia berapa",
      "dokumen yang dibutuhkan", "siapa yang boleh ikut", "persyaratan daftar", "syarat ikut pelatihan"],
    answer: `**Syarat & Ketentuan Peserta Pelatihan**

**Pelatihan PNBP (Masyarakat Umum):**
- Warga Negara Indonesia
- Tidak ada batasan usia khusus
- Dokumen: KTP/identitas diri

**Digital Talent Scholarship (DTS) — per akademi:**

| Akademi | Syarat | Usia |
|---|---|---|
| FGA | Lulusan D3/S1/S2 TIK | 21–30 th |
| VSGA | Lulusan SMK jurusan TIK | 17–25 th |
| TA | Masyarakat umum / ASN | 18–45 th |
| ProA | Profesional aktif, pengalaman min. 2 th | 25–50 th |
| GTA | ASN aktif dari K/L atau Pemda | Tidak dibatasi |

> ⚠️ Persyaratan dapat berubah setiap tahun. Cek selalu di **bpt.komdigi.go.id**`
  },
  {
    id: "jadwal",
    topic: "Jadwal, Batch & Gelombang Pelatihan",
    tags: ["jadwal", "kapan", "batch", "gelombang", "periode", "waktu", "tanggal", "mulai kapan",
      "buka kapan", "kapan dibuka", "jadwal 2025", "jadwal 2026", "gelombang berapa"],
    patterns: ["jadwal pelatihan", "kapan pelatihan", "kapan dibuka", "gelombang berapa",
      "kapan pendaftaran", "waktu pendaftaran", "jadwal 2026", "ada batch lagi"],
    answer: `**Jadwal & Batch Pelatihan BPT Komdigi**

**Pelatihan PNBP 2026 (data terkini):**
| Program | Pendaftaran | Pelaksanaan |
|---|---|---|
| Asisten Pengembang Web | 12–23 Feb 2026 | 26–27 Feb 2026 |
| Teknisi Operator Komputer | 12–23 Feb 2026 | 26–27 Feb 2026 |
| Teknisi Jaringan Komputer Muda | 12–23 Feb 2026 | 26–27 Feb 2026 |
| Workshop AI Marketing Analyst | 28 Jan–3 Feb 2026 | 2–6 Feb 2026 |

> ⚠️ Program di atas **sudah berakhir**. Pantau jadwal berikutnya di bpt.komdigi.go.id

📢 Untuk jadwal **terbaru**, pantau: **bpt.komdigi.go.id** → Publikasi → Pengumuman`
  },
  {
    id: "disabilitas",
    topic: "Program Khusus Penyandang Disabilitas",
    tags: ["disabilitas", "difabel", "berkebutuhan khusus", "inklusif", "vsga disabilitas",
      "program disabilitas", "ramah disabilitas", "pelatihan difabel"],
    patterns: ["ada pelatihan disabilitas", "program difabel", "vsga disabilitas", "pelatihan untuk difabel",
      "ramah disabilitas", "bisa ikut disabilitas", "program inklusif"],
    answer: `**Program Pelatihan untuk Penyandang Disabilitas**

BPT Komdigi memiliki program pelatihan **inklusif** yang dirancang khusus untuk penyandang disabilitas.

**Program Tersedia:**
- **VSGA Disabilitas** — Bagian dari Digital Talent Scholarship, khusus lulusan SMK penyandang disabilitas
- **Pelatihan Disabilitas Umum** — Program tersendiri dengan kurikulum yang disesuaikan

**Keunggulan Program:**
- Fasilitas kampus ramah disabilitas
- Pendampingan intensif selama pelatihan
- Instruktur terlatih untuk kebutuhan khusus

📩 Untuk info lebih detail: ${CONTACT}`
  },
  {
    id: "fasilitas",
    topic: "Fasilitas Kampus BPT Komdigi Cikarang",
    tags: ["fasilitas", "kampus", "gedung", "laboratorium", "lab", "asrama", "penginapan", "kamar",
      "basket", "futsal", "lapangan", "internet", "wifi", "lokasi", "cikarang", "bekasi"],
    patterns: ["fasilitas apa saja", "ada asrama", "ada penginapan", "lab komputer", "lokasi bpptik",
      "kampus cikarang", "ada lapangan olahraga", "fasilitas kampus", "bisa menginap"],
    answer: `**Fasilitas Kampus BPT Komdigi**

📍 **Lokasi:** Jl. Sekolah Hijau Kav. No.2, Simpangan, Kec. Cikarang Utara, Kabupaten Bekasi, Jawa Barat 17530

**Fasilitas Belajar:**
- 🖥️ Laboratorium komputer modern & interaktif
- 📡 Koneksi internet berkecepatan tinggi
- 📚 Ruang kelas teori dan praktik

**Fasilitas Penginapan:**
- 🏨 Asrama/penginapan berkualitas hotel

**Fasilitas Olahraga:**
- 🏀 Lapangan basket & ⚽ lapangan futsal`
  },
  {
    id: "kontak",
    topic: "Kontak & Informasi Resmi BPT Komdigi",
    tags: ["kontak", "hubungi", "telpon", "whatsapp", "email", "alamat", "lokasi", "nomor", "telepon",
      "bantuan", "customer service", "cs", "info", "informasi", "komunikasi"],
    patterns: ["cara menghubungi", "kontak bpt", "nomor whatsapp", "email bpt", "alamat kantor",
      "hubungi bpt", "tanya ke mana", "info lebih lanjut", "ada nomor telpon"],
    answer: `**Kontak Resmi BPT Komdigi**

📍 **Alamat:**
Jl. Sekolah Hijau Kav. No.2, Simpangan,
Kec. Cikarang Utara, Kabupaten Bekasi, Jawa Barat **17530**

📞 **WhatsApp:** **0811-1166-784**
📧 **Email:** **bpt@komdigi.go.id**
🌐 **Website:** **bpt.komdigi.go.id**

**Tautan Terkait:**
- LSP P2 BPPTIK: lspbpptik.komdigi.go.id
- LMS BLearning: blearning.komdigi.go.id
- DTS Portal: digitalent.komdigi.go.id`
  },
  {
    id: "mitra",
    topic: "Mitra & Kerjasama Institusi",
    tags: ["mitra", "kerjasama", "partner", "cisco", "aws", "bnsp", "lan", "koica", "google",
      "microsoft", "oracle", "ibm", "huawei", "meta", "internasional", "industri"],
    patterns: ["siapa mitra bpt", "kerjasama dengan siapa", "partner internasional", "mitra industri",
      "cisco training", "aws training", "ada kerjasama"],
    answer: `**Mitra & Kerjasama BPT Komdigi**

**🇮🇩 Mitra Nasional:**
- **LAN** (Lembaga Administrasi Negara) — akreditasi pelatihan ASN
- **BNSP** (Badan Nasional Sertifikasi Profesi) — lisensi LSP

**🌏 Mitra Internasional:**
- **KOICA** (Korea International Cooperation Agency) — program KADA
- **JICA** (Japan International Cooperation Agency)
- **ADB** (Asian Development Bank)

**💻 Mitra Teknologi:**
- **Cisco**, **AWS**, **Google**, **Microsoft**, **Meta**, **Oracle**, **IBM**, **Huawei**

> Kemitraan ini memungkinkan peserta mendapatkan sertifikasi yang diakui secara internasional.`
  },
  {
    id: "tailor_made",
    topic: "Tailor-Made / Corporate Training",
    tags: ["tailor made", "corporate", "instansi", "perusahaan", "kustomisasi", "custom training",
      "pelatihan korporat", "program khusus", "request pelatihan", "sesuai kebutuhan"],
    patterns: ["tailor made training", "corporate training", "pelatihan untuk instansi",
      "bisa custom", "pelatihan sesuai kebutuhan", "program untuk perusahaan"],
    answer: `**Tailor-Made Training / Corporate Training**

BPT Komdigi menyediakan program **pelatihan yang dikustomisasi** sesuai kebutuhan spesifik instansi pemerintah atau perusahaan.

**Keunggulan:**
- Materi disesuaikan dengan gap kompetensi organisasi
- Pengajar ahli di bidang yang dibutuhkan
- Dapat dilaksanakan di kampus BPT Komdigi (Cikarang) atau on-site

**Untuk Kerja Sama:**
📧 **bpt@komdigi.go.id**
📞 **0811-1166-784**`
  },
  {
    id: "lms",
    topic: "Platform Belajar Online (BLearning / LMS)",
    tags: ["lms", "blearning", "platform online", "e-learning", "belajar online", "kelas online", "daring",
      "aplikasi belajar", "portal belajar", "belajar dari rumah"],
    patterns: ["ada platform online", "bisa belajar online", "lms bpptik", "blearning", "kelas daring",
      "belajar dari rumah", "e-learning bpt"],
    answer: `**Platform Belajar Online BPT Komdigi**

🌐 **BLearning:** blearning.komdigi.go.id

**Fitur BLearning:**
- Akses materi pelatihan secara daring
- Video pembelajaran & modul digital
- Kuis dan evaluasi online
- Tracking progress belajar
- Sertifikat digital

> 💡 Akses LMS diberikan setelah konfirmasi keikutsertaan pelatihan.`
  },
  {
    id: "pengumuman",
    topic: "Pengumuman Hasil Seleksi & Informasi Terbaru",
    tags: ["pengumuman", "hasil seleksi", "lolos", "tidak lolos", "cek hasil", "seleksi",
      "pengumuman dts", "pengumuman gta", "diterima", "ditolak", "status pendaftaran"],
    patterns: ["pengumuman hasil", "cek hasil seleksi", "lihat pengumuman", "pengumuman dts",
      "hasil seleksi keluar", "kapan pengumuman", "cek status", "apakah lolos"],
    answer: `**Pengumuman & Hasil Seleksi**

**Cara Cek Pengumuman:**
1. Buka **bpt.komdigi.go.id** → Publikasi → Pengumuman
2. Atau cek langsung di **digitalent.komdigi.go.id** (untuk DTS)
3. Pantau media sosial resmi BPT Komdigi

> 📢 Pengumuman selalu diposting di website resmi.`
  },
  {
    id: "kada",
    topic: "Korea-ASEAN Digital Academy (KADA)",
    tags: ["kada", "korea asean", "koica", "internasional", "korea", "asean", "pelatihan internasional",
      "program luar negeri", "beasiswa internasional"],
    patterns: ["kada", "korea asean digital", "program korea", "pelatihan internasional",
      "ada program ke luar negeri", "beasiswa internasional"],
    answer: `**Korea-ASEAN Digital Academy (KADA)**

Program pelatihan digital **internasional** hasil kerjasama BPT Komdigi dengan **KOICA (Korea International Cooperation Agency)**.

**Keunggulan KADA:**
- Standar internasional Indonesia–Korea
- Sertifikasi yang diakui internasional
- Program **gratis** (dalam kerangka DTS)

**Cara Daftar:**
Pantau pengumuman di **bpt.komdigi.go.id** → Publikasi → Pengumuman

📧 Info lebih lanjut: **bpt@komdigi.go.id**`
  },
];

// ═══════════════════════════════════════════════════════════════
//  NLP ENGINE
// ═══════════════════════════════════════════════════════════════
const norm = (t) => t
  .toLowerCase()
  .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e").replace(/[ìíîï]/g, "i")
  .replace(/[òóôõö]/g, "o").replace(/[ùúûü]/g, "u")
  .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const STOPS = new Set([
  "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "adalah", "ini", "itu", "ada", "atau", "juga", "bisa", "sudah",
  "saya", "aku", "kamu", "anda", "kita", "mereka", "ya", "tidak", "bukan", "belum", "akan", "mau", "ingin",
  "boleh", "perlu", "harus", "apakah", "apa", "siapa", "dimana", "kapan", "bagaimana", "kenapa", "berapa",
  "sebuah", "suatu", "lebih", "sangat", "paling", "sekali", "lagi", "saja", "dong", "nih", "deh",
  "kan", "loh", "lah", "tuh", "wah", "oh", "ah", "eh", "hmm", "oke", "ok", "halo", "hai", "hi", "hey", "tolong", "mohon",
  "bantu", "tentang", "mengenai", "terkait", "soal", "masalah", "info", "informasi", "tanya",
  "gimana", "apa", "kalo", "kalau", "bila", "jika", "maka", "coba", "buat", "bikin", "minta", "kasih"
]);

const tokenize = (t) => norm(t).split(" ").filter(w => w.length > 2 && !STOPS.has(w));

const overlap = (setA, setB) => {
  let count = 0;
  for (const w of setA) for (const w2 of setB) {
    if (w === w2) { count += 2; break; }
    if (w.length > 3 && w2.length > 3) {
      if (w.startsWith(w2.slice(0, 4)) || w2.startsWith(w.slice(0, 4))) { count += 1; break; }
    }
  }
  return count;
};

function scoreEntry(entry, qRaw) {
  const q = norm(qRaw);
  const qTokens = tokenize(qRaw);
  let score = 0;
  for (const pat of entry.patterns) {
    const nPat = norm(pat);
    if (q.includes(nPat)) { score += 20 + nPat.length * 0.1; }
    else if (nPat.split(" ").filter(w => q.includes(w)).length >= Math.ceil(nPat.split(" ").length * 0.7)) {
      score += 12;
    }
  }
  for (const tag of entry.tags) {
    const nTag = norm(tag);
    if (q.includes(nTag)) { score += tag.includes(" ") ? 10 : 5; }
  }
  const topicTokens = tokenize(entry.topic + " " + entry.tags.join(" ") + " " + entry.patterns.join(" "));
  score += overlap(new Set(qTokens), new Set(topicTokens)) * 0.8;
  const topicNorm = norm(entry.topic);
  for (const qt of qTokens) {
    if (topicNorm.includes(qt) && qt.length > 3) score += 3;
  }
  return score;
}

function detectIntent(query) {
  if (!query || query.trim().length < 2) return null;
  const results = KB.map(entry => ({ entry, score: scoreEntry(entry, query) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!results.length) return null;
  const best = results[0];
  if (best.score < 2.5) return null;
  return { entry: best.entry, score: best.score };
}

function smartFallback(query) {
  const q = norm(query);
  if (/alumni|testimoni|review|lulusan/.test(q))
    return `Untuk informasi alumni dan testimoni, silakan kunjungi **bpt.komdigi.go.id**.\n\n${CONTACT}`;
  if (/kalender|agenda|acara|event/.test(q))
    return `Untuk kalender kegiatan terkini, cek langsung di **bpt.komdigi.go.id/Kalender**.\n\n${CONTACT}`;
  if (/pengajar|instruktur|dosen|trainer/.test(q))
    return `Informasi pengajar dapat dilihat di **bpt.komdigi.go.id/fpengajar**.\n\n${CONTACT}`;
  if (/berita|artikel|publikasi/.test(q))
    return `Publikasi & berita terbaru tersedia di **bpt.komdigi.go.id** → menu Publikasi.\n\n${CONTACT}`;
  if (/galeri|foto|video|dokumentasi/.test(q))
    return `Galeri foto dan video tersedia di **bpt.komdigi.go.id/Galeri**.\n\n${CONTACT}`;
  if (/laporan|akuntabilitas|anggaran/.test(q))
    return `Laporan resmi BPT Komdigi dapat diunduh di **bpt.komdigi.go.id** → menu Info Publik.\n\n${CONTACT}`;
  return `Maaf, informasi tersebut belum tersedia dalam sistem saya. Untuk pertanyaan lebih spesifik, silakan hubungi tim BPT Komdigi langsung:\n\n${CONTACT}`;
}

// ═══════════════════════════════════════════════════════════════
//  DOCUMENT ENGINE — Prioritas Utama v8
// ═══════════════════════════════════════════════════════════════
function chunkDoc(text, docName) {
  const lines = text.split("\n");
  const chunks = [];
  let cur = [], heading = "";

  const flush = () => {
    const t = cur.join("\n").trim();
    if (t.length > 40) chunks.push({ heading, text: t, doc: docName });
    cur = [];
  };

  const isHeadingLine = (tr) => {
    if (!tr) return false;
    // Markdown heading
    if (/^#{1,4}\s/.test(tr)) return true;
    // BAB/BAGIAN/PASAL
    if (/^(BAB|BAGIAN|PASAL|LAMPIRAN|ARTIKEL)\s+[IVX\d]+/i.test(tr)) return true;
    // "8. HAK DAN KEWAJIBAN..." — nomor diikuti teks judul
    if (/^\d+[\.\)]\s+[A-Z]/.test(tr) && tr.length < 100) return true;
    // ALL CAPS pendek (judul seksi), bukan bullet, bukan kalimat panjang
    if (/^[A-Z][A-Z\s\-&\/()]{5,}[:\.]?$/.test(tr) && tr.length < 80 && !tr.startsWith("-")) return true;
    return false;
  };

  for (const line of lines) {
    const tr = line.trim();
    // Baris dekoratif (----, ====) — masukkan ke chunk tapi jangan jadikan heading
    if (/^[-=*]{8,}$/.test(tr)) { cur.push(line); continue; }

    if (isHeadingLine(tr) && cur.length > 3) {
      // Flush chunk sebelumnya, mulai chunk baru dengan heading ini
      flush();
      heading = tr;
      cur = [line];
    } else {
      cur.push(line);
      // Hindari chunk terlalu besar
      if (cur.length > 80) flush();
    }
  }
  flush();
  return chunks;
}

function scoreChunk(chunk, qRaw) {
  const q = norm(qRaw);
  const qTokens = tokenize(qRaw);
  if (!qTokens.length) return 0;

  const cText = norm(chunk.text);
  const cTokens = tokenize(chunk.text);
  const headingNorm = norm(chunk.heading || "");
  let score = 0;
  let tokenHits = 0; // berapa token query yang benar-benar ditemukan

  for (const qt of qTokens) {
    if (qt.length < 3) continue;
    // TF dalam body chunk
    const tf = cTokens.filter(ct => ct === qt || ct.startsWith(qt.slice(0, 4))).length;
    if (tf > 0) {
      score += 1 + Math.log(1 + tf) * 0.8;
      tokenHits++;
    }
    // Bonus besar jika ada di heading chunk
    if (headingNorm.includes(qt)) { score += 6; tokenHits++; }
    // Bonus jika ada di sub-heading dalam chunk (mis. "Kewajiban Peserta:")
    const subMatch = chunk.text.split("\n").some(l => {
      const lt = l.trim();
      return lt.endsWith(":") && !lt.startsWith("-") && norm(lt).includes(qt);
    });
    if (subMatch) score += 4;
  }

  // ── KUNCI: Coverage ratio ──
  // Berapa persen token query yang ditemukan di chunk?
  const significantTokens = qTokens.filter(t => t.length >= 3);
  if (significantTokens.length > 0) {
    const coverage = tokenHits / significantTokens.length;
    // Penalti drastis jika kurang dari 60% token query ada di chunk
    if (coverage < 0.6) score *= 0.15;
    // Bonus jika semua token cocok
    if (coverage >= 1.0) score *= 1.5;
  }

  // Bonus phrase bigram
  const qPhrases = q.split(" ").filter(w => w.length > 3);
  for (let i = 0; i < qPhrases.length - 1; i++) {
    if (cText.includes(qPhrases[i] + " " + qPhrases[i + 1])) score += 3;
  }

  // Penalti chunk sangat pendek
  if (chunk.text.length < 80) score *= 0.6;
  return score;
}

function findDocChunks(query, docs, maxChunks = 2) {
  const active = docs.filter(d => d.active && d.status === "ready");
  if (!active.length) return [];

  const scored = [];
  for (const doc of active) {
    for (const chunk of doc.chunks) {
      const s = scoreChunk(chunk, query);
      if (s > 0.8) scored.push({ ...chunk, score: s, docName: doc.name });
    }
  }
  if (!scored.length) return [];

  scored.sort((a, b) => b.score - a.score);

  // Hanya ambil chunk yang skornya >= 50% dari chunk terbaik (lebih ketat dari 30%)
  // Ini mencegah chunk tidak relevan (kontak, tanda tangan) ikut masuk
  const maxScore = scored[0].score;
  const threshold = maxScore * 0.5;
  return scored.filter(c => c.score >= threshold).slice(0, maxChunks);
}

function buildDocAnswer(query, chunks) {
  if (!chunks.length) return null;

  const qTokens = tokenize(query);

  const extractRelevantSection = (c) => {
    const lines = c.text.split("\n");
    const normLines = lines.map(l => norm(l));

    // Cari baris yang paling cocok dengan query (sub-heading atau baris mengandung token)
    let anchorIdx = -1;
    let bestScore = 0;

    for (let i = 0; i < lines.length; i++) {
      const ln = normLines[i];
      let s = 0;
      for (const qt of qTokens) {
        if (ln.includes(qt)) s += (lines[i].trim().endsWith(":") ? 3 : 1);
      }
      if (s > bestScore) { bestScore = s; anchorIdx = i; }
    }

    // Jika tidak ada anchor spesifik, tampilkan dari awal chunk
    if (anchorIdx === -1 || bestScore === 0) anchorIdx = 0;

    // Mulai dari anchor, ambil ke atas sedikit untuk konteks (heading seksi)
    // Cari heading terdekat di atas anchor
    let startIdx = anchorIdx;
    for (let i = anchorIdx - 1; i >= 0; i--) {
      const lt = lines[i].trim();
      // Henti jika ketemu heading seksi (diakhiri ':' bukan bullet, atau all-caps pendek)
      if (lt.endsWith(":") && !lt.startsWith("-") && lt.length < 60) { startIdx = i; break; }
      if (i === 0) startIdx = 0;
    }

    // Ambil dari startIdx ke bawah sampai seksi berikutnya atau akhir
    const result = [];
    let inSection = true;
    for (let i = startIdx; i < lines.length; i++) {
      const lt = lines[i].trim();

      // Deteksi awal seksi baru (sub-heading berbeda) setelah kita sudah ambil konten
      if (i > startIdx + 2) {
        const isNewSection = lt.endsWith(":") && !lt.startsWith("-") && lt.length < 60;
        // Jika masuk seksi baru yang TIDAK relevan dengan query, stop
        if (isNewSection) {
          const sectionRelevant = qTokens.some(qt => norm(lt).includes(qt));
          if (!sectionRelevant && result.length > 3) break;
        }
      }

      result.push(lines[i]);

      // Batas maksimum: 40 baris per chunk untuk mencegah output terlalu panjang
      if (result.length >= 40) break;
    }

    return result.join("\n").trim();
  };

  const parts = chunks.map((c, i) => {
    const content = extractRelevantSection(c);
    const docLabel = `📄 *Dari: ${c.docName}*`;
    return i === 0
      ? `${docLabel}\n\n${content}`
      : `---\n${docLabel}\n\n${content}`;
  });

  return parts.join("\n\n");
}

// ═══════════════════════════════════════════════════════════════
//  GREETING HANDLER
// ═══════════════════════════════════════════════════════════════
const GREETINGS_RE = /^(halo+|hai+|hi+|hey+|hello+|hei+|helo+|oi+|oy|p+agi|siang|sore|malam|assalamu.*|selamat\s+(pagi|siang|sore|malam|datang)|permisi|hei)[\s!?.]*$/i;

const GREETING_REPLY = `Halo! 👋 Selamat datang di **Asisten BPT Komdigi**.

Saya siap membantu Anda dengan informasi seputar:
- 🎓 **Program Pelatihan** — PNBP, DTS, GTA, dan lainnya
- 📋 **Cara Pendaftaran** — syarat, dokumen, prosedur
- 💰 **Biaya & Jadwal** — tarif PNBP, batch terbaru
- 🏅 **Sertifikasi** — SKKNI, BNSP, LSP
- 📍 **Fasilitas & Kontak** — lokasi, WhatsApp

Silakan ketik pertanyaan Anda! 😊`;

// ═══════════════════════════════════════════════════════════════
//  QUERY PROCESSOR v8
//
//  Logika sumber jawaban:
//    0. Greeting         → balas sapaan
//    1. Cek KB intent    → jika KB sangat cocok (≥ 8) & doc kurang relevan → pakai KB
//    2. Cek dokumen      → jika doc relevan & KB tidak lebih baik → pakai dok
//    3. KB fallback      → jika ada intent KB apapun (≥ 2.5)
//    4. Smart fallback   → arahkan ke kontak
//
//  Kunci: dokumen HANYA menang jika topiknya BENAR-BENAR ada di dokumen
//  (bukan sekadar kata "program" atau "pelatihan" muncul di sana)
// ═══════════════════════════════════════════════════════════════
function processQuery(query, uploadedDocs, docOnlyMode = false) {
  const q = query.trim();
  if (!q) return { text: "Silakan ketik pertanyaan Anda 😊", source: "system" };

  // ── STEP 0: Greeting ──
  if (GREETINGS_RE.test(q)) {
    return { text: GREETING_REPLY, source: "system" };
  }

  // ── Hitung kedua skor sekaligus ──
  const docChunks = findDocChunks(q, uploadedDocs);
  const docScore = docChunks.length > 0 ? docChunks[0].score : 0;
  const intentResult = docOnlyMode ? null : detectIntent(q);
  const kbScore = intentResult ? intentResult.score : 0;

  // ── STEP 1: KB menang jika KB sangat kuat DAN dokumen tidak lebih baik ──
  // KB score ≥ 8 = KB punya jawaban yang spesifik untuk pertanyaan ini
  // KB juga menang jika kbScore > docScore (KB lebih relevan dari dokumen)
  if (!docOnlyMode && intentResult && kbScore >= 8 && kbScore >= docScore * 0.8) {
    return { text: intentResult.entry.answer, source: "kb", intentId: intentResult.entry.id };
  }

  // ── STEP 2: Dokumen menang jika cukup relevan ──
  // Threshold 5.0: dokumen harus benar-benar membahas topik ini, bukan sekadar
  // menyebut kata yang sama secara kebetulan
  const DOC_THRESHOLD = 5.0;
  if (docScore >= DOC_THRESHOLD) {
    const ans = buildDocAnswer(q, docChunks);
    return {
      text: ans,
      source: "doc",
      docNames: [...new Set(docChunks.map(c => c.docName))]
    };
  }

  // ── STEP 3: Mode dokumen saja → tidak pakai KB ──
  if (docOnlyMode) {
    const hasActiveDocs = uploadedDocs.filter(d => d.active && d.status === "ready").length > 0;
    return {
      text: hasActiveDocs
        ? `Maaf, informasi yang Anda tanyakan tidak ditemukan dalam dokumen yang tersedia.\n\nUntuk bantuan lebih lanjut:\n\n${CONTACT}`
        : `Belum ada dokumen aktif. Silakan hubungi admin.\n\n${CONTACT}`,
      source: "fallback"
    };
  }

  // ── STEP 4: KB fallback (intent apapun ≥ 2.5) ──
  if (intentResult && kbScore >= 2.5) {
    return { text: intentResult.entry.answer, source: "kb", intentId: intentResult.entry.id };
  }

  // ── STEP 5: Smart fallback ──
  return { text: smartFallback(q), source: "fallback" };
}

// ═══════════════════════════════════════════════════════════════
//  FILE EXTRACTION
// ═══════════════════════════════════════════════════════════════
function extractText(file) {
  return new Promise((res, rej) => {
    if (file.type === "application/pdf") {
      const fr = new FileReader();
      fr.onload = e => {
        try {
          const raw = Array.from(new Uint8Array(e.target.result)).map(b => String.fromCharCode(b)).join("");
          let text = "";
          const btEt = /BT[\s\S]*?ET/g; let m;
          while ((m = btEt.exec(raw)) !== null) {
            const bl = m[0]; let sm;
            const sr = /\(([^)]{1,200})\)\s*T[jJ]/g;
            while ((sm = sr.exec(bl)) !== null) text += sm[1].replace(/\\n/g, "\n").replace(/\\\d{3}/g, "") + " ";
          }
          if (text.trim().length < 50) {
            const al = /\(([^\)]{3,200})\)/g; let am;
            while ((am = al.exec(raw)) !== null)
              if (/[A-Za-z]{3,}/.test(am[1])) text += am[1] + "\n";
          }
          res(text.trim() || "[PDF: teks tidak dapat diekstrak otomatis]");
        } catch { rej(new Error("Gagal parse PDF")); }
      };
      fr.onerror = () => rej(new Error("Error membaca PDF"));
      fr.readAsArrayBuffer(file);
    } else {
      const fr = new FileReader();
      fr.onload = e => {
        let txt = e.target.result || "";
        if (file.type.includes("officedocument") || file.type.includes("msword"))
          txt = txt.replace(/<(?:w|a):t[^>]*>([^<]*)<\/(?:w|a):t>/g, (_, t) => t + " ")
            .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        res(txt);
      };
      fr.onerror = () => rej(new Error("Error membaca file"));
      fr.readAsText(file, "utf-8");
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════
const fmtSz = b => b < 1024 ? b + "B" : b < 1048576 ? (b / 1024).toFixed(1) + "KB" : (b / 1048576).toFixed(1) + "MB";
const fmtTime = ms => {
  const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, "0")}`;
};
const SUPPORTED = {
  "text/plain": { ext: "TXT", icon: "📄", col: "#16a34a" },
  "text/markdown": { ext: "MD", icon: "📝", col: "#16a34a" },
  "text/csv": { ext: "CSV", icon: "📊", col: "#0891b2" },
  "application/json": { ext: "JSON", icon: "🗂️", col: "#d97706" },
  "application/pdf": { ext: "PDF", icon: "📕", col: "#dc2626" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { ext: "DOCX", icon: "📘", col: "#2563eb" },
  "application/msword": { ext: "DOC", icon: "📘", col: "#2563eb" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { ext: "PPTX", icon: "📙", col: "#ea580c" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { ext: "XLSX", icon: "📗", col: "#16a34a" },
};

// ═══════════════════════════════════════════════════════════════
//  SOURCE BADGE CONFIG — menunjukkan asal jawaban ke pengguna
// ═══════════════════════════════════════════════════════════════
const SOURCE_BADGE = {
  doc: { label: "📄 Dari Dokumen", color: "#16a34a", bg: "#dcfce7" },
  kb: { label: "📚 Info Umum", color: "#2563eb", bg: "#dbeafe" },
  fallback: { label: "💬 Bantuan", color: "#d97706", bg: "#fef9c3" },
};

// ═══════════════════════════════════════════════════════════════
//  RENDERER MARKDOWN-LITE
// ═══════════════════════════════════════════════════════════════
function Md({ text }) {
  const lines = String(text).split("\n");
  const inline = (str) => {
    const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
      if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
      if (p.startsWith("`") && p.endsWith("`")) return <code key={i} style={{ background: "rgba(0,0,0,.07)", padding: "1px 5px", borderRadius: 4, fontFamily: "monospace", fontSize: "0.88em" }}>{p.slice(1, -1)}</code>;
      return p;
    });
  };
  const result = [];
  let inTable = false, tableRows = [], tableCols = [];
  const flushTable = () => {
    if (tableRows.length) {
      result.push(
        <div key={`t${result.length}`} style={{ overflowX: "auto", margin: "8px 0" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
            <thead>
              <tr>{tableCols.map((c, i) => (
                <th key={i} style={{ background: "rgba(37,99,235,.1)", padding: "5px 10px", textAlign: "left", border: "1px solid rgba(37,99,235,.2)", fontWeight: 700, whiteSpace: "nowrap" }}>{inline(c.trim())}</th>
              ))}</tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : "rgba(0,0,0,.03)" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "5px 10px", border: "1px solid rgba(0,0,0,.08)", verticalAlign: "top" }}>{inline(cell.trim())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = []; tableCols = []; inTable = false;
    }
  };
  lines.forEach((line, i) => {
    const tr = line.trim();
    if (tr.startsWith("|") && tr.endsWith("|")) {
      const cells = tr.slice(1, -1).split("|");
      if (/^[\s|\-:]+$/.test(tr)) return;
      if (!inTable) { tableCols = cells; inTable = true; }
      else tableRows.push(cells);
      return;
    }
    if (inTable) flushTable();
    if (/^###\s/.test(tr)) { result.push(<div key={i} style={{ fontWeight: 800, fontSize: 13, color: "#0f172a", margin: "10px 0 3px" }}>{inline(tr.slice(4))}</div>); return; }
    if (/^##\s/.test(tr)) { result.push(<div key={i} style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", margin: "10px 0 4px" }}>{inline(tr.slice(3))}</div>); return; }
    if (/^#\s/.test(tr)) { result.push(<div key={i} style={{ fontWeight: 900, fontSize: 15, color: "#0f172a", margin: "10px 0 4px" }}>{inline(tr.slice(2))}</div>); return; }
    if (/^---+$/.test(tr)) { result.push(<hr key={i} style={{ border: "none", borderTop: "1px solid rgba(0,0,0,.1)", margin: "8px 0" }} />); return; }
    if (tr.startsWith(">")) { result.push(<div key={i} style={{ borderLeft: "3px solid #2563eb", paddingLeft: 10, color: "#475569", fontStyle: "italic", margin: "4px 0", fontSize: 12.5 }}>{inline(tr.slice(1).trim())}</div>); return; }
    if (/^[-•*]\s/.test(tr) || /^\d+[\.\)]\s/.test(tr)) {
      const content = tr.replace(/^[-•*\d]+[\.\)]\s/, "");
      result.push(<div key={i} style={{ display: "flex", gap: 6, marginBottom: 2, paddingLeft: 4 }}>
        <span style={{ color: "#2563eb", flexShrink: 0, marginTop: 1, fontWeight: 700 }}>•</span>
        <span style={{ flex: 1 }}>{inline(content)}</span>
      </div>);
      return;
    }
    if (!tr) { result.push(<div key={i} style={{ height: 5 }} />); return; }
    result.push(<div key={i} style={{ marginBottom: 2, lineHeight: 1.6 }}>{inline(line)}</div>);
  });
  if (inTable) flushTable();
  return <>{result}</>;
}

// ═══════════════════════════════════════════════════════════════
//  QUICK REPLIES
// ═══════════════════════════════════════════════════════════════
const QUICK_REPLIES = [
  { label: "Program pelatihan apa saja?", q: "program pelatihan apa saja" },
  { label: "Cara mendaftar pelatihan", q: "bagaimana cara mendaftar pelatihan" },
  { label: "Ada pelatihan gratis?", q: "ada pelatihan gratis digital talent scholarship" },
  { label: "Biaya pelatihan PNBP", q: "berapa biaya pelatihan pnbp" },
  { label: "Syarat pendaftaran", q: "apa saja syarat pendaftaran" },
  { label: "Kontak BPT Komdigi", q: "kontak dan alamat bpt komdigi" },
];

// ═══════════════════════════════════════════════════════════════
//  ADMIN LOGIN
// ═══════════════════════════════════════════════════════════════
function LoginPage({ onLogin, onBack }) {
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const [show, setShow] = useState(false); const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false); const [shake, setShake] = useState(false);
  const uRef = useRef();
  useEffect(() => { uRef.current?.focus(); }, []);

  const submit = async () => {
    if (!u || !p) { setErr("Isi username dan password."); return; }
    setBusy(true); setErr("");
    await new Promise(r => setTimeout(r, 600));
    const found = ADMIN_CREDS.find(c => c.username === u.trim() && c.password === p);
    if (found) { onLogin({ ...found, loginTime: Date.now() }); }
    else { setBusy(false); setErr("Username atau password salah."); setShake(true); setTimeout(() => setShake(false), 500); setP(""); }
  };

  const inp = {
    background: "#1e293b", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10,
    padding: "10px 13px", fontSize: 13.5, color: "#f1f5f9", outline: "none", width: "100%",
    fontFamily: "inherit", transition: "border-color .2s"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060c1a", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: G, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 0 40px rgba(37,99,235,.5)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: "#f1f5f9", marginBottom: 3 }}>Admin Panel</h2>
          <p style={{ fontSize: 12, color: "#475569" }}>BPT Komdigi · Manajemen Dokumen Chatbot</p>
        </div>
        <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: "24px 22px", boxShadow: "0 24px 60px rgba(0,0,0,.6)", animation: shake ? "shake .4s ease" : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: .8, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Username</label>
              <input ref={uRef} value={u} onChange={e => { setU(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && submit()} style={inp} placeholder="Masukkan username"
                onFocus={e => e.target.style.borderColor = "#3b82f6"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: .8, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={show ? "text" : "password"} value={p} onChange={e => { setP(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && submit()} style={{ ...inp, paddingRight: 38 }} placeholder="Masukkan password"
                  onFocus={e => e.target.style.borderColor = "#3b82f6"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"} />
                <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex", padding: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {show ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}
                  </svg>
                </button>
              </div>
            </div>
            {err && <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#fca5a5", display: "flex", gap: 6 }}>⚠ {err}</div>}
            <button onClick={submit} disabled={busy} style={{ background: busy ? "#1e293b" : G, border: "none", borderRadius: 10, padding: "12px", fontSize: 13.5, fontWeight: 700, color: busy ? "#475569" : "#fff", cursor: busy ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: busy ? "none" : "0 4px 20px rgba(37,99,235,.4)", transition: "all .2s", marginTop: 2, fontFamily: "inherit" }}>
              {busy ? <><svg style={{ animation: "spin .7s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Memverifikasi...</> : "Masuk ke Admin Panel →"}
            </button>
            <button onClick={onBack} style={{ background: "none", border: "none", color: "#475569", fontSize: 12, cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}>← Kembali ke Website</button>
          </div>
          <div style={{ marginTop: 16, background: "rgba(37,99,235,.08)", border: "1px solid rgba(37,99,235,.2)", borderRadius: 9, padding: "10px 12px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", marginBottom: 5, textTransform: "uppercase", letterSpacing: .5 }}>Demo Credentials</p>
            {ADMIN_CREDS.map(c => (
              <p key={c.username} style={{ fontSize: 10.5, color: "#93c5fd", lineHeight: 2 }}>
                {c.avatar} <code style={{ background: "rgba(37,99,235,.15)", padding: "1px 5px", borderRadius: 4, fontFamily: "monospace" }}>{c.username}</code> / <code style={{ background: "rgba(37,99,235,.15)", padding: "1px 5px", borderRadius: 4, fontFamily: "monospace" }}>{c.password}</code>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN PANEL — v8: Tambah docOnlyMode toggle + preview dokumen
// ═══════════════════════════════════════════════════════════════
function AdminPanel({ admin, docs, setDocs, onLogout, docOnlyMode, setDocOnlyMode }) {
  const [section, setSection] = useState("upload");
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [sessLeft, setSessLeft] = useState(SESSION_MS - (Date.now() - admin.loginTime));
  const [previewDoc, setPreviewDoc] = useState(null); // ← BARU v8: preview dokumen
  const fileRef = useRef();

  useEffect(() => {
    const t = setInterval(() => {
      const left = SESSION_MS - (Date.now() - admin.loginTime);
      if (left <= 0) { onLogout(); clearInterval(t); } else setSessLeft(left);
    }, 1000);
    return () => clearInterval(t);
  }, [admin.loginTime, onLogout]);

  const handleFiles = useCallback(async (files) => {
    for (const file of Array.from(files)) {
      const info = SUPPORTED[file.type] || (file.name.endsWith(".txt") ? { ext: "TXT", icon: "📄", col: "#16a34a" } : null);
      if (!info) { alert(`Format "${file.name.split(".").pop()}" tidak didukung.`); continue; }
      if (file.size > 15 * 1024 * 1024) { alert("File terlalu besar (maks 15MB)"); continue; }
      const id = Date.now() + Math.random();
      setDocs(p => [...p, {
        id, name: file.name, size: file.size, type: file.type,
        ext: info.ext, icon: info.icon, extCol: info.col,
        status: "reading", active: true, chunks: [], by: admin.username,
        uploadedAt: Date.now()
      }]);
      setProcessing(id);
      try {
        const raw = await extractText(file);
        const chunks = chunkDoc(raw, file.name);
        setDocs(p => p.map(d => d.id === id ? { ...d, status: "ready", chunks, chars: raw.length } : d));
        setSection("manage");
      } catch (e) {
        setDocs(p => p.map(d => d.id === id ? { ...d, status: "error", error: e.message } : d));
      }
      setProcessing(null);
    }
  }, [admin.username, setDocs]);

  const warn = sessLeft < 5 * 60 * 1000;
  const activeCnt = docs.filter(d => d.active && d.status === "ready").length;

  const Btn = ({ id, icon, label, badge }) => (
    <button onClick={() => setSection(id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit", background: section === id ? "#eff6ff" : "transparent", color: section === id ? "#2563eb" : "#64748b", fontWeight: section === id ? 700 : 500, fontSize: 12.5, marginBottom: 2, transition: "all .15s" }}>
      <span>{icon}</span>{label}
      {badge != null && badge > 0 && <span style={{ marginLeft: "auto", background: "#2563eb", color: "#fff", borderRadius: 8, fontSize: 9.5, padding: "1px 6px", fontWeight: 700 }}>{badge}</span>}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Modal Preview Dokumen — BARU v8 */}
      {previewDoc && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setPreviewDoc(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 600, width: "100%", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 3 }}>👁 Preview: {previewDoc.name}</h3>
                <p style={{ fontSize: 12, color: "#64748b" }}>{previewDoc.chunks?.length || 0} chunk diindeks · {fmtSz(previewDoc.size)}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>✕</button>
            </div>
            {previewDoc.chunks?.length === 0 ? (
              <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>Tidak ada chunk yang berhasil diindeks.</p>
            ) : (
              previewDoc.chunks?.slice(0, 5).map((c, i) => (
                <div key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 5 }}>Chunk {i + 1} {c.heading ? `· ${c.heading.slice(0, 40)}` : ""}</p>
                  <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{c.text.slice(0, 300)}{c.text.length > 300 ? "..." : ""}</p>
                </div>
              ))
            )}
            {previewDoc.chunks?.length > 5 && <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center" }}>...dan {previewDoc.chunks.length - 5} chunk lainnya</p>}
          </div>
        </div>
      )}

      {/* Topbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 20px", display: "flex", alignItems: "center", gap: 12, height: 54, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: G, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 3.87-3.13 7-7 7S5 12.87 5 9a7 7 0 0 1 7-7z" /><path d="M2 20c0-3.31 4.48-6 10-6s10 2.69 10 6" /></svg>
        </div>
        <div><p style={{ fontSize: 12.5, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>BPT Komdigi</p><p style={{ fontSize: 10, color: "#94a3b8" }}>Admin Panel</p></div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: warn ? "#fef2f2" : "#f8fafc", border: `1px solid ${warn ? "#fecaca" : "#e2e8f0"}`, borderRadius: 8, padding: "4px 10px" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={warn ? "#ef4444" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: warn ? "#ef4444" : "#64748b" }}>{fmtTime(sessLeft)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8 }}>
          <span style={{ fontSize: 13 }}>{admin.avatar}</span>
          <div><p style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a" }}>{admin.username}</p><p style={{ fontSize: 9.5, color: "#94a3b8" }}>{admin.role}</p></div>
        </div>
        <button onClick={onLogout} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}>Keluar</button>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 54px)" }}>
        {/* Sidebar */}
        <div style={{ width: 196, background: "#fff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", padding: "14px 10px", flexShrink: 0 }}>
          <p style={{ fontSize: 9.5, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: .8, marginBottom: 7, paddingLeft: 11 }}>Menu</p>
          <Btn id="upload" icon="📤" label="Upload Dokumen" />
          <Btn id="manage" icon="📋" label="Kelola Dokumen" badge={docs.length} />
          <Btn id="settings" icon="⚙️" label="Pengaturan" />
          <div style={{ height: 1, background: "#f1f5f9", margin: "10px 0" }} />
          <p style={{ fontSize: 9.5, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: .8, marginBottom: 7, paddingLeft: 11 }}>Statistik</p>
          {[{ l: "Total", v: docs.length, c: "#2563eb" }, { l: "Aktif", v: activeCnt, c: "#10b981" }, { l: "Error", v: docs.filter(d => d.status === "error").length, c: "#ef4444" }].map(s => (
            <div key={s.l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 11px", borderRadius: 6, marginBottom: 1 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>{s.l}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: s.c }}>{s.v}</span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          {/* Mode indicator */}
          <div style={{ background: docOnlyMode ? "#dcfce7" : "#f0f9ff", border: `1px solid ${docOnlyMode ? "#86efac" : "#bae6fd"}`, borderRadius: 8, padding: "8px 10px" }}>
            <p style={{ fontSize: 10, color: docOnlyMode ? "#15803d" : "#0369a1", lineHeight: 1.6, fontWeight: 700 }}>
              {docOnlyMode ? "📄 Mode Dokumen Saja" : "🔄 Mode Hybrid"}
            </p>
            <p style={{ fontSize: 9.5, color: docOnlyMode ? "#166534" : "#0369a1", lineHeight: 1.5, marginTop: 2 }}>
              {docOnlyMode ? "KB dinonaktifkan" : "Dokumen + KB aktif"}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

          {/* ── UPLOAD ── */}
          {section === "upload" && (
            <div style={{ maxWidth: 600 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 5 }}>Upload Dokumen</h2>
              <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 20, lineHeight: 1.7 }}>
                Dokumen yang diupload menjadi <strong>sumber informasi prioritas utama</strong> chatbot. KB bawaan hanya digunakan sebagai fallback jika dokumen tidak relevan.
              </p>
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }} onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${dragOver ? "#2563eb" : "#e2e8f0"}`, borderRadius: 14, padding: "36px 20px", textAlign: "center", cursor: "pointer", background: dragOver ? "#eff6ff" : "#fff", transition: "all .2s", marginBottom: 16 }}>
                <input ref={fileRef} type="file" multiple hidden accept=".txt,.md,.csv,.json,.pdf,.docx,.doc,.pptx,.xlsx" onChange={e => handleFiles(e.target.files)} />
                <div style={{ width: 48, height: 48, borderRadius: 12, background: dragOver ? G : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", transition: "background .2s" }}>
                  {processing ? <svg style={{ animation: "spin .7s linear infinite" }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                    : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={dragOver ? "#fff" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>}
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#334155", marginBottom: 4 }}>{processing ? "Memproses dokumen..." : "Drag & Drop atau klik untuk upload"}</p>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>TXT · MD · PDF · DOCX · XLSX · CSV · JSON · Maks 15MB</p>
                {!processing && <span style={{ background: G, color: "#fff", borderRadius: 8, padding: "8px 20px", fontSize: 12.5, fontWeight: 700, display: "inline-block" }}>Pilih File</span>}
              </div>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 9, padding: "10px 13px" }}>
                <p style={{ fontSize: 12, color: "#92400e", lineHeight: 1.7 }}>
                  💡 <strong>Tips v8:</strong> Upload SK, Juknis, FAQ internal, atau Panduan resmi BPT Komdigi dalam format <strong>TXT atau MD</strong> untuk hasil terbaik. Chatbot akan menjawab <em>hanya</em> dari dokumen yang relevan.
                </p>
              </div>
            </div>
          )}

          {/* ── MANAGE ── */}
          {section === "manage" && (
            <div style={{ maxWidth: 700 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 3 }}>Kelola Dokumen</h2>
                  <p style={{ fontSize: 12.5, color: "#64748b" }}>Aktifkan/nonaktifkan dokumen sebagai sumber jawaban chatbot.</p>
                </div>
                <button onClick={() => setSection("upload")} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>+ Upload Baru</button>
              </div>
              {docs.length === 0 ? (
                <div style={{ background: "#fff", border: "2px dashed #e2e8f0", borderRadius: 12, padding: "44px 20px", textAlign: "center" }}>
                  <p style={{ fontSize: 36, marginBottom: 8 }}>📂</p>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: "#94a3b8", marginBottom: 14 }}>Belum ada dokumen</p>
                  <button onClick={() => setSection("upload")} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Upload Sekarang</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {activeCnt > 0 && (
                    <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <p style={{ fontSize: 12.5, color: "#0369a1" }}><strong>{activeCnt} dokumen aktif</strong> — chatbot menggunakan dokumen ini sebagai sumber prioritas.</p>
                    </div>
                  )}
                  {docs.length > 1 && (
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginBottom: 4 }}>
                      <button onClick={() => setDocs(p => p.map(d => d.status === "ready" ? { ...d, active: true } : d))} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "5px 10px", fontSize: 11.5, fontWeight: 600, color: "#16a34a", cursor: "pointer", fontFamily: "inherit" }}>Aktifkan Semua</button>
                      <button onClick={() => setDocs(p => p.map(d => d.status === "ready" ? { ...d, active: false } : d))} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 10px", fontSize: 11.5, fontWeight: 600, color: "#dc2626", cursor: "pointer", fontFamily: "inherit" }}>Nonaktifkan Semua</button>
                    </div>
                  )}
                  {docs.map(doc => (
                    <div key={doc.id} style={{ background: "#fff", borderRadius: 11, border: `1.5px solid ${doc.status === "error" ? "#fecaca" : doc.active && doc.status === "ready" ? "#bfdbfe" : "#e2e8f0"}`, transition: "border-color .2s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 9, background: `${doc.extCol}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{doc.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</p>
                            <span style={{ background: `${doc.extCol}15`, color: doc.extCol, borderRadius: 4, padding: "1px 5px", fontWeight: 800, fontSize: 9.5, flexShrink: 0 }}>{doc.ext}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 10.5, color: "#94a3b8" }}>{fmtSz(doc.size)}</span>
                            {doc.status === "ready" && <span style={{ fontSize: 10.5, color: "#10b981" }}>✓ {doc.chunks.length} chunk</span>}
                            {doc.status === "reading" && <span style={{ fontSize: 10.5, color: "#2563eb" }}>⏳ Memproses...</span>}
                            {doc.status === "error" && <span style={{ fontSize: 10.5, color: "#ef4444" }}>⚠ {doc.error}</span>}
                            {doc.by && <span style={{ fontSize: 10, color: "#a5b4fc" }}>👤 {doc.by}</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          {/* Tombol Preview — BARU v8 */}
                          {doc.status === "ready" && (
                            <button onClick={() => setPreviewDoc(doc)} style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 6, padding: "4px 9px", fontSize: 11, fontWeight: 600, color: "#0369a1", cursor: "pointer", fontFamily: "inherit" }}>
                              👁 Preview
                            </button>
                          )}
                          {doc.status === "reading" && <svg style={{ animation: "spin .7s linear infinite" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>}
                          {doc.status === "ready" && (
                            <div onClick={() => setDocs(p => p.map(d => d.id === doc.id ? { ...d, active: !d.active } : d))} style={{ width: 38, height: 21, borderRadius: 11, background: doc.active ? "#2563eb" : "#e2e8f0", position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
                              <div style={{ position: "absolute", top: 2.5, left: doc.active ? 19 : 2.5, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.25)" }} />
                            </div>
                          )}
                          <button onClick={() => setDocs(p => p.filter(d => d.id !== doc.id))} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS — BARU v8 ── */}
          {section === "settings" && (
            <div style={{ maxWidth: 560 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 5 }}>Pengaturan Chatbot</h2>
              <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 24, lineHeight: 1.7 }}>Konfigurasi perilaku chatbot dalam merespons pertanyaan pengguna.</p>

              {/* Mode Dokumen Saja */}
              <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Mode Dokumen Saja</p>
                    <p style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.6 }}>
                      Jika diaktifkan, chatbot <strong>hanya</strong> menjawab dari dokumen yang diunggah. Knowledge Base bawaan (profil, jadwal, program, dll.) dinonaktifkan sepenuhnya.
                    </p>
                  </div>
                  {/* Toggle switch */}
                  <div onClick={() => setDocOnlyMode(v => !v)} style={{ width: 46, height: 26, borderRadius: 13, background: docOnlyMode ? "#16a34a" : "#e2e8f0", position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0, marginTop: 2 }}>
                    <div style={{ position: "absolute", top: 3, left: docOnlyMode ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.3)" }} />
                  </div>
                </div>
                <div style={{ marginTop: 12, padding: "9px 12px", borderRadius: 9, background: docOnlyMode ? "#dcfce7" : "#fef9c3", border: `1px solid ${docOnlyMode ? "#86efac" : "#fde68a"}` }}>
                  <p style={{ fontSize: 11.5, color: docOnlyMode ? "#15803d" : "#92400e", fontWeight: 600 }}>
                    {docOnlyMode
                      ? "✅ Aktif — Chatbot hanya menjawab dari dokumen. KB bawaan dinonaktifkan."
                      : "⚠️ Nonaktif — Chatbot menggunakan dokumen + KB bawaan sebagai fallback."}
                  </p>
                </div>
              </div>

              {/* Info mode hybrid */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 8 }}>📊 Alur Jawaban v8</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { step: "1", label: "Cari di Dokumen Aktif", desc: "Selalu diutamakan", c: "#16a34a", bg: "#dcfce7" },
                    { step: "2", label: docOnlyMode ? "Fallback (KB dinonaktifkan)" : "Cari di KB Bawaan", desc: docOnlyMode ? "Dokumen tidak relevan → pesan fallback" : "Dokumen tidak relevan → gunakan KB", c: docOnlyMode ? "#94a3b8" : "#2563eb", bg: docOnlyMode ? "#f1f5f9" : "#dbeafe" },
                    { step: "3", label: "Smart Fallback", desc: "Arahkan ke kontak resmi", c: "#d97706", bg: "#fef9c3" },
                  ].map(item => (
                    <div key={item.step} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: item.bg, borderRadius: 8, opacity: item.step === "2" && docOnlyMode ? 0.5 : 1 }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: item.c, color: "#fff", fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.step}</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{item.label}</p>
                        <p style={{ fontSize: 10.5, color: "#64748b" }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CHAT WIDGET — v8: terima docOnlyMode dari props
// ═══════════════════════════════════════════════════════════════
function ChatWidget({ docs, docOnlyMode }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{
    id: 0, from: "bot",
    text: "Halo! Saya **Asisten BPT Komdigi** 👋\n\nAda yang bisa saya bantu? Tanyakan informasi seputar program pelatihan, pendaftaran, sertifikasi, atau hal lainnya.",
    time: new Date()
  }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const endRef = useRef(); const inputRef = useRef();
  const activeDocs = docs.filter(d => d.active && d.status === "ready");

  useEffect(() => { if (open) { endRef.current?.scrollIntoView({ behavior: "smooth" }); setUnread(0); } }, [msgs, open]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const send = async (text = input) => {
    const q = text.trim(); if (!q || typing) return;
    setInput("");
    const userMsg = { id: Date.now(), from: "user", text: q, time: new Date() };
    setMsgs(p => [...p, userMsg]);
    setTyping(true);
    const delay = 300 + Math.min(q.length * 8, 800);
    await new Promise(r => setTimeout(r, delay));
    // ← v8: teruskan docOnlyMode ke processQuery
    const result = processQuery(q, docs, docOnlyMode);
    const botMsg = {
      id: Date.now() + 1, from: "bot", text: result.text, time: new Date(),
      source: result.source, docNames: result.docNames
    };
    setMsgs(p => [...p, botMsg]);
    setTyping(false);
    if (!open) setUnread(n => n + 1);
  };

  const timeStr = (d) => `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;

  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pop{0%{opacity:0;transform:scale(.8) translateY(10px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes fadeUp{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.6)}50%{box-shadow:0 0 0 8px rgba(37,99,235,0)}}
        .qr-btn:hover{background:#eff6ff!important;border-color:#2563eb!important;color:#2563eb!important}
        .msg-in{animation:fadeUp .25s ease forwards}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:2px}
      `}</style>

      {/* Widget Launcher */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
        {!open && unread > 0 && (
          <div style={{ position: "absolute", top: -6, right: -6, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, zIndex: 1, animation: "pulse 2s infinite" }}>{unread}</div>
        )}
        <button onClick={() => setOpen(!open)} style={{ width: 54, height: 54, borderRadius: "50%", background: G, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(37,99,235,.5)", transition: "transform .2s", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
          {open
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          }
        </button>
      </div>

      {/* Chat Window */}
      {open && (
        <div style={{ position: "fixed", bottom: 90, right: 24, width: 360, height: 560, background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,.18)", display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 9998, animation: "pop .2s ease", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>

          {/* Header */}
          <div style={{ background: G, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 3.87-3.13 7-7 7S5 12.87 5 9a7 7 0 0 1 7-7z" /><path d="M2 20c0-3.31 4.48-6 10-6s10 2.69 10 6" /></svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13.5, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>Asisten BPT Komdigi</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.75)", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                Online {activeDocs.length > 0 && `· ${activeDocs.length} dok. aktif`}
                {docOnlyMode && <span style={{ marginLeft: 4, background: "rgba(255,255,255,.2)", borderRadius: 4, padding: "1px 5px", fontSize: 10 }}>📄 Dok Only</span>}
              </p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px" }}>
            {msgs.map((msg, i) => (
              <div key={msg.id} className={i === msgs.length - 1 && msg.from === "bot" ? "msg-in" : ""} style={{ display: "flex", flexDirection: msg.from === "user" ? "row-reverse" : "row", gap: 7, marginBottom: 12, alignItems: "flex-end" }}>
                {msg.from === "bot" && (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: G, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13 }}>🤖</div>
                )}
                <div style={{ maxWidth: "80%" }}>
                  <div style={{ background: msg.from === "user" ? G : "#f8fafc", borderRadius: msg.from === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px", padding: "9px 12px", fontSize: 13, color: msg.from === "user" ? "#fff" : "#1e293b", lineHeight: 1.5, border: msg.from === "bot" ? "1px solid #e2e8f0" : "none", boxShadow: msg.from === "bot" ? "0 1px 4px rgba(0,0,0,.05)" : "none" }}>
                    {msg.from === "bot" ? <Md text={msg.text} /> : msg.text}
                  </div>
                  {/* Source badge — v8: lebih lengkap */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3, justifyContent: msg.from === "user" ? "flex-end" : "flex-start", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>{timeStr(msg.time)}</span>
                    {msg.source && SOURCE_BADGE[msg.source] && (
                      <span style={{ fontSize: 9.5, background: SOURCE_BADGE[msg.source].bg, color: SOURCE_BADGE[msg.source].color, borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>
                        {SOURCE_BADGE[msg.source].label}
                      </span>
                    )}
                    {msg.docNames?.length > 0 && (
                      <span style={{ fontSize: 9, color: "#94a3b8", fontStyle: "italic" }}>{msg.docNames[0].length > 20 ? msg.docNames[0].slice(0, 20) + "…" : msg.docNames[0]}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", gap: 7, marginBottom: 12, alignItems: "flex-end" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: G, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13 }}>🤖</div>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px 16px 16px 16px", padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#94a3b8", animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick replies */}
          {msgs.length === 1 && (
            <div style={{ padding: "0 12px 8px", display: "flex", flexWrap: "wrap", gap: 6 }}>
              {QUICK_REPLIES.map(qr => (
                <button key={qr.q} className="qr-btn" onClick={() => send(qr.q)} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: "5px 11px", fontSize: 11.5, color: "#475569", cursor: "pointer", fontFamily: "inherit", transition: "all .15s", fontWeight: 500 }}>{qr.label}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "8px 12px 12px", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 7, alignItems: "center", background: "#f8fafc", borderRadius: 24, border: "1.5px solid #e2e8f0", padding: "4px 4px 4px 14px", transition: "border-color .2s" }}
              onFocus={e => e.currentTarget.style.borderColor = "#2563eb"} onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Ketik pertanyaan..." style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "#1e293b", outline: "none", fontFamily: "inherit" }} disabled={typing} />
              <button onClick={() => send()} disabled={!input.trim() || typing} style={{ width: 34, height: 34, borderRadius: "50%", background: input.trim() && !typing ? G : "#e2e8f0", border: "none", cursor: input.trim() && !typing ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s", flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </button>
            </div>
            <p style={{ fontSize: 9.5, color: "#cbd5e1", textAlign: "center", marginTop: 6 }}>Chatbot BPT Komdigi v8 · bpt.komdigi.go.id</p>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOT APP — v8: docOnlyMode dikelola di root dan dibagikan
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("site");
  const [admin, setAdmin] = useState(null);
  // Mengambil data dari localStorage saat pertama kali load
  const [docs, setDocs] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bpt_docs");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  // Menyimpan ke localStorage setiap kali ada perubahan pada state docs
  useEffect(() => {
    localStorage.setItem("bpt_docs", JSON.stringify(docs));
  }, [docs]);
  const [docOnlyMode, setDocOnlyMode] = useState(false); // ← BARU v8

  const handleLogin = (user) => { setAdmin(user); setView("admin"); };
  const handleLogout = () => { setAdmin(null); setView("site"); };

  if (view === "login") return <LoginPage onLogin={handleLogin} onBack={() => setView("site")} />;
  if (view === "admin") return (
    <AdminPanel
      admin={admin} docs={docs} setDocs={setDocs} onLogout={handleLogout}
      docOnlyMode={docOnlyMode} setDocOnlyMode={setDocOnlyMode}
    />
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Navbar */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", alignItems: "center", height: 58, gap: 16, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,.05)" }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: G, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🎓</div>
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>BPT Komdigi</p>
          <p style={{ fontSize: 10, color: "#94a3b8" }}>Kementerian Komunikasi dan Digital RI</p>
        </div>
        <div style={{ flex: 1 }} />
        <a href="https://bpt.komdigi.go.id" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Website Resmi ↗</a>
        <button onClick={() => setView("login")} style={{ background: G, color: "#fff", border: "none", borderRadius: 9, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          Admin
        </button>
      </nav>

      {/* Hero */}
      <div style={{ background: G, padding: "52px 24px", textAlign: "center", color: "#fff" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.15)", borderRadius: 20, padding: "5px 14px", marginBottom: 16, fontSize: 12, fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
          Chatbot Resmi BPT Komdigi
        </div>
        <h1 style={{ fontSize: "clamp(22px,5vw,36px)", fontWeight: 900, marginBottom: 10, lineHeight: 1.2 }}>Selamat Datang di<br />BPT Komdigi</h1>
        <p style={{ fontSize: "clamp(13px,2.5vw,16px)", opacity: .85, maxWidth: 520, margin: "0 auto 24px", lineHeight: 1.6 }}>Balai Pelatihan Talenta Komunikasi dan Digital — Unit Pelaksana Teknis Kementerian Komunikasi dan Digital RI</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://bpt.komdigi.go.id/fpelatihan/kategori" target="_blank" rel="noopener noreferrer" style={{ background: "#fff", color: "#2563eb", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 7 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
            Lihat Program
          </a>
          <a href="https://digitalent.komdigi.go.id" target="_blank" rel="noopener noreferrer" style={{ background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 7 }}>
            🎓 DTS Gratis
          </a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "#fff", padding: "20px 24px", display: "flex", justifyContent: "center", gap: 0, borderBottom: "1px solid #e2e8f0" }}>
        {[["70+", "Program Pelatihan", "#2563eb"], ["16+", "Pengajar", "#0891b2"], ["120+", "Materi", "#6366f1"], ["38.000+", "Alumni", "#10b981"]].map(([v, l, c]) => (
          <div key={l} style={{ textAlign: "center", padding: "10px 24px", borderRight: "1px solid #f1f5f9" }}>
            <p style={{ fontSize: "clamp(16px,3vw,22px)", fontWeight: 900, color: c, lineHeight: 1 }}>{v}</p>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 20px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 6, textAlign: "center" }}>Program Unggulan</h2>
        <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 28 }}>Klik tombol chat di pojok kanan bawah untuk bertanya lebih lanjut</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          {[
            { icon: "🏫", title: "Pelatihan PNBP", desc: "Pelatihan berbayar bersertifikat SKKNI/BNSP untuk masyarakat umum", c: "#2563eb" },
            { icon: "🏛️", title: "Pelatihan ASN", desc: "Program GTA khusus Aparatur Sipil Negara — transformasi digital birokrasi", c: "#6366f1" },
            { icon: "🎓", title: "DTS Gratis", desc: "Digital Talent Scholarship — beasiswa pelatihan 100% gratis dari pemerintah", c: "#10b981" },
            { icon: "♿", title: "Inklusif", desc: "Program pelatihan khusus penyandang disabilitas dengan fasilitas ramah difabel", c: "#f97316" },
          ].map(card => (
            <div key={card.title} style={{ background: "#fff", borderRadius: 14, padding: "20px 18px", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,.04)", transition: "transform .2s,box-shadow .2s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,.04)"; }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${card.c}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>{card.icon}</div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>{card.title}</h3>
              <p style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.6 }}>{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Contact bar */}
        <div style={{ background: G, borderRadius: 14, padding: "18px 22px", marginTop: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Butuh Informasi Lebih Lanjut?</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)" }}>Tim BPT Komdigi siap membantu Anda</p>
          </div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {[{ icon: "📞", label: "0811-1166-784", href: "https://wa.me/628111166784" }, { icon: "📧", label: "bpt@komdigi.go.id", href: "mailto:bpt@komdigi.go.id" }, { icon: "🌐", label: "bpt.komdigi.go.id", href: "https://bpt.komdigi.go.id" }].map(c => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 8, padding: "7px 13px", fontSize: 12, fontWeight: 600, color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>{c.icon} {c.label}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Chatbot Widget */}
      <ChatWidget docs={docs} docOnlyMode={docOnlyMode} />
    </div>
  );
}
