"use client";
import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
//  KONFIGURASI ADMIN
// ─────────────────────────────────────────────────────────────
const ADMIN_CREDENTIALS = [
  { username: "admin.bpt", password: "BPT@Komdigi2025", role: "Super Admin", avatar: "👑", color: "#6366f1" },
  { username: "operator1", password: "Operator@2025", role: "Operator Konten", avatar: "🛠️", color: "#3b82f6" },
];
const SESSION_MS = 30 * 60 * 1000;

// ─────────────────────────────────────────────────────────────
//  KONSTANTA
// ─────────────────────────────────────────────────────────────
const G = "linear-gradient(135deg,#6366f1 0%,#3b82f6 50%,#10b981 100%)";
const GR = "linear-gradient(135deg,#ef4444,#f97316)";

const FALLBACK_MSG =
  "Maaf, informasi tersebut tidak tersedia dalam sistem kami. " +
  "Untuk bantuan lebih lanjut, silakan hubungi tim BPT Komdigi:\n\n" +
  "• 📧 **Email:** bpt@komdigi.go.id\n" +
  "• 💬 **WhatsApp:** 0811-1166-784";

const QUICK_REPLIES = [
  "Apa itu BPT Komdigi?",
  "Jadwal DTS 2025",
  "Cara mendaftar DTS",
  "Apakah DTS gratis?",
  "Batas usia pendaftaran",
  "Kontak BPT Komdigi",
];

const SUPPORTED = {
  "text/plain": { ext: "TXT", icon: "📄", color: "#16a34a" },
  "text/markdown": { ext: "MD", icon: "📝", color: "#16a34a" },
  "text/csv": { ext: "CSV", icon: "📊", color: "#0891b2" },
  "application/json": { ext: "JSON", icon: "🗂️", color: "#d97706" },
  "application/pdf": { ext: "PDF", icon: "📕", color: "#dc2626" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { ext: "DOCX", icon: "📘", color: "#2563eb" },
  "application/msword": { ext: "DOC", icon: "📘", color: "#2563eb" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { ext: "PPTX", icon: "📙", color: "#ea580c" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { ext: "XLSX", icon: "📗", color: "#16a34a" },
};

// ─────────────────────────────────────────────────────────────
//  SEARCH ENGINE — 100% lokal
// ─────────────────────────────────────────────────────────────
function tokenize(t) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}
const SYN = {
  daftar: ["registrasi", "mendaftar", "pendaftaran", "apply"],
  gratis: ["bebas biaya", "free", "tidak berbayar", "beasiswa", "scholarship"],
  jadwal: ["schedule", "waktu", "tanggal", "kapan", "batch"],
  sertifikat: ["certificate", "sertifikasi", "ijazah", "lulus"],
  kontak: ["contact", "hubungi", "alamat", "email", "telepon", "whatsapp"],
  syarat: ["persyaratan", "requirement", "ketentuan", "kriteria"],
  pelatihan: ["training", "kursus", "belajar", "kelas", "program", "akademi"],
  mitra: ["partner", "kerjasama", "kolaborasi"],
  karier: ["kerja", "pekerjaan", "job"],
  usia: ["umur", "age", "tahun"],
  absen: ["kehadiran", "gugur"],
  visi: ["tujuan"], misi: ["tugas", "fungsi"],
};
function expandQ(tokens) {
  const ex = new Set(tokens);
  for (const t of tokens)
    for (const [k, al] of Object.entries(SYN))
      if (t === k || al.includes(t)) { ex.add(k); al.forEach(a => ex.add(a)); }
  return [...ex];
}
function chunkDoc(text, name) {
  const lines = text.split("\n"), chunks = [];
  let cur = [], heading = "";
  for (const line of lines) {
    const tr = line.trim();
    if (/^[A-Z0-9]{2,}[\s\-—:]+[A-Z]/.test(tr) || /^\d+\.\s+[A-Z]/.test(tr) || /^(BAGIAN|BAB|SECTION)\s+[A-Z0-9]/.test(tr)) {
      if (cur.length > 2) chunks.push({ heading, lines: cur.join("\n"), doc: name });
      heading = tr; cur = [tr]; continue;
    }
    if (/^T\s*:/.test(tr)) {
      if (cur.length > 1) chunks.push({ heading, lines: cur.join("\n"), doc: name });
      cur = [tr]; continue;
    }
    if (tr === "" && cur.length > 8) { chunks.push({ heading, lines: cur.join("\n"), doc: name }); cur = []; continue; }
    if (!/^[=\-]{10,}$/.test(tr)) cur.push(line);
  }
  if (cur.length > 1) chunks.push({ heading, lines: cur.join("\n"), doc: name });
  return chunks.filter(c => c.lines.trim().length > 30);
}
function scoreChunk(chunk, qTokens, raw) {
  const text = chunk.lines.toLowerCase(), tokens = tokenize(chunk.lines), tSet = new Set(tokens);
  let s = 0;
  if (text.includes(raw.toLowerCase())) s += 15;
  for (const qt of qTokens) if (tSet.has(qt)) { const f = tokens.filter(t => t === qt).length; s += 2 + Math.min(f - 1, 3); }
  tokens.slice(0, 10).forEach(t => qTokens.includes(t) && (s += 3));
  if (/^T\s*:/m.test(chunk.lines)) s += 2;
  tokenize(chunk.heading).forEach(t => qTokens.includes(t) && (s += 4));
  return s;
}
function searchDocs(query, docs) {
  if (!docs.length) return null;
  const tokens = expandQ(tokenize(query.trim()));
  if (!tokens.length) return null;
  const all = [];
  for (const doc of docs)
    for (const chunk of doc.chunks) {
      const score = scoreChunk(chunk, tokens, query.trim());
      if (score > 0) all.push({ ...chunk, score, docLabel: doc.name });
    }
  if (!all.length) return null;
  all.sort((a, b) => b.score - a.score);
  const best = all[0], results = all.filter(c => c.score >= best.score * 0.75).slice(0, 2);
  return {
    text: results.map((r, i) => (i > 0 ? "\n\n---\n\n" : "") + r.lines.trim().replace(/^T\s*:\s*/m, "").replace(/\nJ\s*:\s*/g, "\n").trim()).join(""),
    docs: [...new Set(results.map(r => r.docLabel))], score: best.score
  };
}
const SKB = [
  { k: ["bpt", "komdigi", "apa", "tentang", "profil"], a: "**BPT Komdigi** (Badan Pengembangan Talenta) adalah unit kerja di bawah Kementerian Komunikasi dan Digital RI yang bertugas merancang dan mengelola program pengembangan talenta digital Indonesia, termasuk **Digital Talent Scholarship (DTS)**." },
  { k: ["dts", "digital talent", "beasiswa", "scholarship", "program"], a: "**Digital Talent Scholarship (DTS)** adalah program beasiswa pelatihan digital **GRATIS 100%** dari Kementerian Komunikasi dan Digital RI dengan 6 akademi: FGA, VSGA, TA, ProA, DLA, dan GTA (baru 2025)." },
  { k: ["jadwal", "batch", "kapan", "tanggal"], a: "**Jadwal DTS 2025:**\n\n• **Batch 1:** Pendaftaran 15 Jan–15 Feb 2025 | Pelatihan Maret–Agustus 2025\n• **Batch 2:** Pendaftaran 1 Jun–30 Jun 2025 | Pelatihan Agustus–Desember 2025" },
  { k: ["gratis", "biaya", "bayar", "free"], a: "Program DTS **100% GRATIS**:\n\n• ✅ Tidak ada biaya pendaftaran\n• ✅ Tidak ada biaya pelatihan\n• ✅ Tidak ada biaya ujian sertifikasi" },
  { k: ["daftar", "mendaftar", "cara", "langkah"], a: "**Cara Mendaftar DTS 2025:**\n\n1. Kunjungi **digitalent.kominfo.go.id**\n2. Buat akun & verifikasi email\n3. Lengkapi profil dan pilih akademi\n4. Upload dokumen (KTP, ijazah, foto 3x4)\n5. Ikuti tes seleksi online\n6. Tunggu pengumuman via email" },
  { k: ["kontak", "hubungi", "email", "telepon", "whatsapp", "alamat"], a: "**Kontak Resmi BPT Komdigi:**\n\n• 📧 digitalent@kominfo.go.id\n• 📞 Call Center: 159 (Senin–Jumat 08.00–17.00)\n• 💬 WhatsApp: 0811-1000-159\n• 🌐 digitalent.kominfo.go.id\n• 📍 Jl. Medan Merdeka Barat No.9, Jakarta Pusat" },
  { k: ["syarat", "persyaratan", "dokumen"], a: "**Dokumen Pendaftaran:**\n\n• KTP yang masih berlaku\n• Ijazah atau SKL\n• Transkrip nilai (FGA & ProA)\n• Pas foto 3x4 (latar merah)\n• Surat rekomendasi (DLA & GTA)" },
  { k: ["usia", "umur", "batas"], a: "**Batas Usia per Akademi:**\n\n• **FGA:** 21–30 tahun\n• **VSGA:** 17–25 tahun\n• **TA:** 18–45 tahun\n• **ProA:** 25–50 tahun\n• **DLA:** Tidak ada batas\n• **GTA:** Sesuai ketentuan ASN" },
  { k: ["sertifikat", "sertifikasi", "certificate", "lulus"], a: "Peserta yang lulus mendapat:\n\n• 📜 Sertifikat dari Kementerian Kominfo\n• 🏆 Sertifikasi industri (AWS, Google, Microsoft, Cisco, Meta)\n\nSyarat: kehadiran minimal **80%** dan selesaikan tugas akhir." },
  { k: ["mitra", "partner", "kerjasama"], a: "**Mitra BPT Komdigi:**\n\n**Global:** AWS, Google, Microsoft, Cisco, Oracle, IBM, Meta, Huawei\n**Nasional:** Telkom, Gojek, Tokopedia, BCA, Mandiri, PLN\n**Akademik:** 150+ universitas di Indonesia" },
  {
    k: ["halo", "hi", "hello", "halo!", "pagi", "siang", "sore"],
    a: "Halo! Saya **Asisten Resmi BPT Komdigi** 👋\n\nSaya dapat menjawab pertanyaan seputar program Digital Talent Scholarship, pendaftaran, dan layanan BPT Komdigi.\n\nSilakan pilih topik atau ketik pertanyaan Anda:"
  },
];
function staticSearch(q) {
  const tokens = tokenize(q);
  let best = null, bs = 0;
  for (const item of SKB) { const s = item.k.filter(k => tokens.some(t => t.includes(k) || k.includes(t))).length; if (s > bs) { bs = s; best = item; } }
  return bs > 0 ? best?.a : null;
}

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
function RenderText({ text }) {
  return <span>{text.split("\n").map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : p);
    if (/^[\•\-\*]\s/.test(line.trim()) || /^\d+\.\s/.test(line.trim()))
      return <span key={i} style={{ display: "block", paddingLeft: 12, marginBottom: 3 }}>{parts.map((p, j) => typeof p === "string" ? p.replace(/^[\•\-\*\d\.]\s+/, "") : p)}</span>;
    return <span key={i}>{parts}{i < arr.length - 1 && <br />}</span>;
  })}</span>;
}
function fmtSize(b) { return b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB"; }
function fmtTime(ms) { const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000); return `${m}:${String(s).padStart(2, "0")}`; }

// ─────────────────────────────────────────────────────────────
//  VIEW: HALAMAN ADMIN PENUH (terpisah dari chat widget)
// ─────────────────────────────────────────────────────────────
function AdminPage({ admin, docs, setDocs, onLogout }) {
  const [dragOver, setDragOver] = useState(false);
  const [processingId, setProcId] = useState(null);
  const [sessionLeft, setSessLeft] = useState(SESSION_MS - (Date.now() - admin.loginTime));
  const [activeSection, setActiveSection] = useState("upload"); // "upload"|"manage"
  const fileRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      const left = SESSION_MS - (Date.now() - admin.loginTime);
      if (left <= 0) { onLogout(); clearInterval(t); } else setSessLeft(left);
    }, 1000);
    return () => clearInterval(t);
  }, [admin.loginTime, onLogout]);

  const extractText = useCallback((file) => new Promise((res, rej) => {
    if (file.type === "application/pdf") {
      const fr = new FileReader();
      fr.onload = e => {
        try {
          const raw = Array.from(new Uint8Array(e.target.result)).map(b => String.fromCharCode(b)).join("");
          let text = "";
          const btEt = /BT[\s\S]*?ET/g; let m;
          while ((m = btEt.exec(raw)) !== null) {
            const sr = /\(([^)]*)\)\s*T[jJ]/g, bl = m[0]; let sm;
            while ((sm = sr.exec(bl)) !== null) text += sm[1].replace(/\\n/g, "\n").replace(/\\\d{3}/g, "") + " ";
          }
          if (text.trim().length < 50) { const al = /\(([^\)]{3,200})\)/g; let am; while ((am = al.exec(raw)) !== null) if (/[A-Za-z]{3,}/.test(am[1])) text += am[1].trim() + "\n"; }
          res(text.trim() || "[PDF: Tidak dapat mengekstrak teks]");
        } catch { rej(new Error("Gagal membaca PDF")); }
      };
      fr.onerror = () => rej(new Error("Gagal membaca file"));
      fr.readAsArrayBuffer(file);
    } else {
      const fr = new FileReader();
      fr.onload = e => {
        let txt = e.target.result || "";
        if (file.type.includes("officedocument") || file.type.includes("msword"))
          txt = txt.replace(/<(?:w|a):t[^>]*>([^<]*)<\/(?:w|a):t>/g, (_, t) => t + " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        res(txt);
      };
      fr.onerror = () => rej(new Error("Gagal membaca file"));
      fr.readAsText(file, "utf-8");
    }
  }), []);

  const handleFiles = useCallback(async (fileList) => {
    for (const file of Array.from(fileList)) {
      const info = SUPPORTED[file.type] || (file.name.endsWith(".txt") ? { ext: "TXT", icon: "📄", color: "#16a34a" } : null);
      if (!info) { alert(`Format "${file.name}" tidak didukung.`); continue; }
      if (file.size > 15 * 1024 * 1024) { alert(`"${file.name}" terlalu besar (maks 15MB).`); continue; }
      const docId = Date.now() + Math.random();
      setProcId(docId);
      setDocs(p => [...p, { id: docId, name: file.name, size: file.size, ext: info.ext, icon: info.icon, extColor: info.color, active: true, chunks: [], status: "reading", error: null, uploadedBy: admin.username, uploadedAt: Date.now() }]);
      try {
        const raw = await extractText(file);
        const chunks = chunkDoc(raw, file.name);
        setDocs(p => p.map(d => d.id === docId ? { ...d, status: "ready", chunks, rawLen: raw.length } : d));
        setActiveSection("manage");
      } catch (err) {
        setDocs(p => p.map(d => d.id === docId ? { ...d, status: "error", error: err.message } : d));
      }
      setProcId(null);
    }
  }, [admin.username, setDocs, extractText]);

  const readyDocs = docs.filter(d => d.status === "ready");
  const activeDocs = docs.filter(d => d.active && d.status === "ready");
  const pct = (sessionLeft / SESSION_MS) * 100;
  const warn = sessionLeft < 5 * 60 * 1000;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

      {/* ── TOPBAR ADMIN ── */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid rgba(255,255,255,.06)", padding: "0 28px", display: "flex", alignItems: "center", gap: 16, height: 60, flexShrink: 0 }}>
        {/* Logo area */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: G, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 3.87-3.13 7-7 7S5 12.87 5 9a7 7 0 0 1 7-7z" /><path d="M2 20c0-3.31 4.48-6 10-6s10 2.69 10 6" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>BPT Komdigi</p>
            <p style={{ fontSize: 10, color: "#64748b" }}>Admin Panel</p>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Session timer */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: warn ? "rgba(239,68,68,.1)" : "rgba(255,255,255,.04)", border: `1px solid ${warn ? "rgba(239,68,68,.3)" : "rgba(255,255,255,.08)"}`, borderRadius: 10, padding: "6px 12px" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={warn ? "#ef4444" : "#64748b"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <div>
            <p style={{ fontSize: 10, color: warn ? "#ef4444" : "#64748b", fontWeight: 700 }}>Sesi berakhir</p>
            <p style={{ fontSize: 12, fontWeight: 800, color: warn ? "#ef4444" : "#94a3b8" }}>{fmtTime(sessionLeft)}</p>
          </div>
          {/* Mini progress */}
          <div style={{ width: 36, height: 4, background: "rgba(255,255,255,.08)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: warn ? GR : G, borderRadius: 2, transition: "width 1s" }} />
          </div>
        </div>

        {/* Admin badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "6px 12px" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: G, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
            {admin.avatar}
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{admin.username}</p>
            <p style={{ fontSize: 10, color: "#64748b" }}>{admin.role}</p>
          </div>
        </div>

        {/* Logout */}
        <button onClick={onLogout} style={{ background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 9, padding: "7px 14px", fontSize: 12, fontWeight: 700, color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,.22)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,.12)"; }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Keluar
        </button>
      </div>

      {/* ── KONTEN ADMIN ── */}
      <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>

        {/* SIDEBAR */}
        <div style={{ width: 220, background: "#fff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "20px 14px 12px" }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>Manajemen</p>
            {[
              { id: "upload", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>, label: "Upload Dokumen" },
              { id: "manage", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>, label: "Kelola Dokumen", badge: docs.length || null },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
                background: activeSection === item.id ? "linear-gradient(135deg,rgba(99,102,241,.1),rgba(16,185,129,.08))" : "transparent",
                color: activeSection === item.id ? "#6366f1" : "#64748b", fontWeight: activeSection === item.id ? 700 : 500, fontSize: 13,
                transition: "all .15s", fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 2,
              }}>
                <span style={{ color: activeSection === item.id ? "#6366f1" : "#94a3b8" }}>{item.icon}</span>
                {item.label}
                {item.badge && <span style={{ marginLeft: "auto", background: "#6366f1", color: "#fff", borderRadius: 8, fontSize: 10, padding: "1px 7px", fontWeight: 700 }}>{item.badge}</span>}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#f1f5f9", margin: "0 14px" }} />

          {/* Stats sidebar */}
          <div style={{ padding: "14px" }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>Ringkasan</p>
            {[
              { label: "Total Dokumen", value: docs.length, color: "#6366f1" },
              { label: "Dok. Aktif", value: activeDocs.length, color: "#10b981" },
              { label: "Dok. Error", value: docs.filter(d => d.status === "error").length, color: "#ef4444" },
            ].map(stat => (
              <div key={stat.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f8fafc" }}>
                <p style={{ fontSize: 12, color: "#64748b" }}>{stat.label}</p>
                <span style={{ fontSize: 14, fontWeight: 800, color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Bottom note */}
          <div style={{ padding: 14, borderTop: "1px solid #f1f5f9" }}>
            <div style={{ background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.18)", borderRadius: 9, padding: "9px 11px" }}>
              <p style={{ fontSize: 10.5, color: "#065f46", lineHeight: 1.6 }}>
                🔒 Pemrosesan lokal di browser. Data tidak dikirim ke server.
              </p>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", background: "#f8fafc" }}>

          {/* ── SECTION: UPLOAD ── */}
          {activeSection === "upload" && (
            <div style={{ padding: "28px 32px", maxWidth: 740, margin: "0 auto" }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Upload Dokumen</h2>
                <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.6 }}>
                  Tambahkan dokumen pengetahuan BPT Komdigi. Chatbot akan memprioritaskan jawaban dari dokumen yang diupload.
                </p>
              </div>

              {/* Drop Zone besar */}
              <div
                className={`dropzone ${dragOver ? "dragover" : ""}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? "#6366f1" : "#cbd5e1"}`,
                  borderRadius: 18, padding: "48px 24px", textAlign: "center", cursor: "pointer",
                  background: dragOver ? "rgba(99,102,241,.04)" : "#fff",
                  transition: "all .2s", marginBottom: 20,
                }}
              >
                <input ref={fileRef} type="file" multiple hidden accept=".txt,.md,.csv,.json,.pdf,.docx,.doc,.pptx,.xlsx" onChange={e => handleFiles(e.target.files)} />
                <div style={{ width: 64, height: 64, borderRadius: 18, background: dragOver ? G : "linear-gradient(135deg,#f1f5f9,#e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", transition: "all .2s" }}>
                  {processingId
                    ? <svg style={{ animation: "spin .7s linear infinite" }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={dragOver ? "#fff" : "#6366f1"} strokeWidth="2.2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                    : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={dragOver ? "#fff" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  }
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  {processingId ? "Memproses dokumen..." : dragOver ? "Lepaskan file di sini" : "Drag & Drop file atau klik untuk memilih"}
                </p>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
                  TXT · MD · CSV · JSON · PDF · DOCX · PPTX · XLSX
                </p>
                {!processingId && (
                  <span style={{ display: "inline-block", background: G, color: "#fff", borderRadius: 10, padding: "10px 28px", fontSize: 13.5, fontWeight: 700 }}>
                    Pilih File
                  </span>
                )}
                <p style={{ fontSize: 11, color: "#cbd5e1", marginTop: 12 }}>Maks. 15MB per file</p>
              </div>

              {/* Format cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10 }}>
                {Object.values(SUPPORTED).filter((v, i, a) => a.findIndex(x => x.ext === v.ext) === i).map(f => (
                  <div key={f.ext} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ fontSize: 20 }}>{f.icon}</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.ext}</p>
                      <p style={{ fontSize: 10.5, color: "#94a3b8" }}>Didukung</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SECTION: KELOLA ── */}
          {activeSection === "manage" && (
            <div style={{ padding: "28px 32px", maxWidth: 800, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Kelola Dokumen</h2>
                  <p style={{ fontSize: 13.5, color: "#64748b" }}>Aktifkan/nonaktifkan dokumen sebagai sumber jawaban chatbot.</p>
                </div>
                <button onClick={() => setActiveSection("upload")} style={{ background: G, color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Upload Baru
                </button>
              </div>

              {docs.length === 0 ? (
                <div style={{ background: "#fff", border: "2px dashed #e2e8f0", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>Belum ada dokumen</p>
                  <p style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 20 }}>Upload dokumen SK, Juknis, FAQ, atau Panduan BPT Komdigi.</p>
                  <button onClick={() => setActiveSection("upload")} style={{ background: G, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    Upload Sekarang
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Status banner */}
                  {activeDocs.length > 0 && (
                    <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,.07),rgba(16,185,129,.07))", border: "1px solid rgba(99,102,241,.2)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: G, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#4338ca" }}>✦ {activeDocs.length} dari {readyDocs.length} dokumen aktif</p>
                        <p style={{ fontSize: 11.5, color: "#6366f1" }}>Chatbot akan memprioritaskan jawaban dari dokumen yang aktif.</p>
                      </div>
                    </div>
                  )}

                  {/* Toggle semua */}
                  {readyDocs.length > 1 && (
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => setDocs(p => p.map(d => d.status === "ready" ? { ...d, active: true } : d))} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#16a34a", cursor: "pointer" }}>
                        Aktifkan Semua
                      </button>
                      <button onClick={() => setDocs(p => p.map(d => d.status === "ready" ? { ...d, active: false } : d))} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#dc2626", cursor: "pointer" }}>
                        Nonaktifkan Semua
                      </button>
                    </div>
                  )}

                  {/* Daftar dokumen */}
                  {docs.map(doc => (
                    <div key={doc.id} style={{ background: "#fff", borderRadius: 14, border: `1.5px solid ${doc.status === "error" ? "#fecaca" : doc.active && doc.status === "ready" ? "rgba(99,102,241,.25)" : "#e2e8f0"}`, overflow: "hidden", transition: "border .2s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                        {/* File icon besar */}
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${doc.extColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                          {doc.icon}
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</p>
                            <span style={{ background: `${doc.extColor}18`, color: doc.extColor, borderRadius: 5, padding: "1px 7px", fontWeight: 800, fontSize: 10, flexShrink: 0 }}>{doc.ext}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <p style={{ fontSize: 11.5, color: "#94a3b8" }}>{fmtSize(doc.size)}</p>
                            {doc.status === "ready" && <p style={{ fontSize: 11.5, color: "#10b981" }}>✓ {doc.chunks.length} segmen</p>}
                            {doc.status === "reading" && <p style={{ fontSize: 11.5, color: "#6366f1" }}>⏳ Memproses...</p>}
                            {doc.status === "error" && <p style={{ fontSize: 11.5, color: "#ef4444" }}>⚠️ {doc.error}</p>}
                            {doc.uploadedBy && <p style={{ fontSize: 11, color: "#c4b5fd" }}>👤 {doc.uploadedBy}</p>}
                            {doc.uploadedAt && <p style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(doc.uploadedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>}
                          </div>
                        </div>
                        {/* Controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                          {doc.status === "reading" && (
                            <svg style={{ animation: "spin .7s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                          )}
                          {doc.status === "ready" && (
                            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                              <div onClick={() => setDocs(p => p.map(d => d.id === doc.id ? { ...d, active: !d.active } : d))}
                                style={{ width: 44, height: 24, borderRadius: 12, background: doc.active ? "#10b981" : "#e2e8f0", position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
                                <div style={{ position: "absolute", top: 4, left: doc.active ? 22 : 4, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 2px 6px rgba(0,0,0,.2)" }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: doc.active ? "#10b981" : "#94a3b8", minWidth: 52 }}>{doc.active ? "Aktif" : "Nonaktif"}</span>
                            </label>
                          )}
                          <button onClick={() => setDocs(p => p.filter(d => d.id !== doc.id))}
                            style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .15s", flexShrink: 0 }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fef2f2"; }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  VIEW: LOGIN PAGE ADMIN
// ─────────────────────────────────────────────────────────────
function AdminLoginPage({ onSuccess, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const uRef = useRef(null);

  useEffect(() => { uRef.current?.focus(); }, []);

  const doLogin = async () => {
    if (!username || !password) { setError("Username dan password wajib diisi."); return; }
    setLoading(true); setError("");
    await new Promise(r => setTimeout(r, 700));
    const match = ADMIN_CREDENTIALS.find(c => c.username === username.trim() && c.password === password);
    if (match) { onSuccess({ ...match, loginTime: Date.now() }); }
    else { setLoading(false); setError("Username atau password salah."); setShake(true); setTimeout(() => setShake(false), 600); setPassword(""); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0f172a 0%,#1e293b 60%,#0f2027 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: G, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 8px 28px rgba(99,102,241,.45)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Admin Panel</h2>
          <p style={{ fontSize: 13, color: "#64748b" }}>BPT Komdigi · Manajemen Dokumen Chatbot</p>
        </div>

        {/* Card login */}
        <div style={{
          background: "rgba(255,255,255,.97)", borderRadius: 20, padding: "28px 28px 24px",
          boxShadow: "0 24px 70px rgba(0,0,0,.35)",
          animation: shake ? "shake .5s ease" : "fadeUp .4s ease",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Username */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Username</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </span>
                <input ref={uRef} value={username} onChange={e => { setUsername(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && doLogin()}
                  placeholder="Masukkan username"
                  style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 11, padding: "10px 12px 10px 36px", fontSize: 13.5, color: "#1e293b", outline: "none", background: "#f8fafc", transition: "border .2s" }}
                  onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </span>
                <input type={showPass ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && doLogin()}
                  placeholder="Masukkan password"
                  style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 11, padding: "10px 36px 10px 36px", fontSize: 13.5, color: "#1e293b", outline: "none", background: "#f8fafc", transition: "border .2s" }}
                  onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
                <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 2 }}>
                  {showPass
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, padding: "9px 12px", display: "flex", gap: 8 }}>
                <span style={{ color: "#ef4444", flexShrink: 0 }}>⚠</span>
                <p style={{ fontSize: 12, color: "#dc2626" }}>{error}</p>
              </div>
            )}

            {/* Login btn */}
            <button onClick={doLogin} disabled={loading} style={{
              background: loading ? "#e2e8f0" : G, color: loading ? "#94a3b8" : "#fff", border: "none", borderRadius: 11,
              padding: "12px", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s", marginTop: 2,
              boxShadow: loading ? "none" : "0 4px 18px rgba(99,102,241,.4)",
            }}>
              {loading
                ? <><svg style={{ animation: "spin .7s linear infinite" }} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Memverifikasi...</>
                : <><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>Masuk ke Admin Panel</>
              }
            </button>

            <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 12.5, color: "#94a3b8", cursor: "pointer", textDecoration: "underline", textAlign: "center" }}>
              ← Kembali ke Website
            </button>
          </div>

          {/* Demo creds */}
          <div style={{ marginTop: 20, background: "rgba(99,102,241,.06)", border: "1px solid rgba(99,102,241,.15)", borderRadius: 10, padding: "11px 13px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", marginBottom: 5 }}>🔑 Demo Credentials</p>
            {ADMIN_CREDENTIALS.map(c => (
              <p key={c.username} style={{ fontSize: 11, color: "#6366f1", lineHeight: 1.8 }}>
                {c.avatar} <code style={{ background: "rgba(99,102,241,.1)", padding: "1px 5px", borderRadius: 4, fontSize: 10.5 }}>{c.username}</code>
                {" / "}
                <code style={{ background: "rgba(99,102,241,.1)", padding: "1px 5px", borderRadius: 4, fontSize: 10.5 }}>{c.password}</code>
                <span style={{ color: "#a5b4fc", fontSize: 10 }}> — {c.role}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  KOMPONEN UTAMA — mengatur view yang ditampilkan
// ─────────────────────────────────────────────────────────────
export default function App() {
  // "website" | "admin-login" | "admin-panel"
  const [view, setView] = useState("website");
  const [adminSession, setAdmin] = useState(null);
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

  // Chat state (tetap di website)
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([{
    id: 0, role: "bot",
    text: "Halo! Saya **Asisten Resmi BPT Komdigi** 👋\n\nSaya dapat menjawab pertanyaan seputar program Digital Talent Scholarship, pendaftaran, dan layanan BPT Komdigi.\n\nSilakan pilih topik atau ketik pertanyaan Anda:",
  }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const idRef = useRef(1);

  useEffect(() => { if (chatOpen) setTimeout(() => inputRef.current?.focus(), 80); }, [chatOpen]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const sendMessage = useCallback(async (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    setMessages(p => [...p, { id: idRef.current++, role: "user", text: q }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 500 + Math.random() * 400));
    const activeDocs = docs.filter(d => d.active && d.status === "ready" && d.chunks.length > 0);
    let answer = null, srcDocs = [], fromDoc = false;
    if (activeDocs.length > 0) { const res = searchDocs(q, activeDocs); if (res && res.score >= 3) { answer = res.text; srcDocs = res.docs; fromDoc = true; } }
    if (!answer) answer = staticSearch(q);
    setTyping(false);
    setMessages(p => [...p, { id: idRef.current++, role: "bot", text: answer || FALLBACK_MSG, srcDocs: fromDoc ? srcDocs : [], fromDoc }]);
  }, [input, docs]);

  const activeDocs = docs.filter(d => d.active && d.status === "ready");

  // ── ROUTING ──
  if (view === "admin-login") return <AdminLoginPage onSuccess={s => { setAdmin(s); setView("admin-panel"); }} onBack={() => setView("website")} />;
  if (view === "admin-panel" && adminSession) return <AdminPage admin={adminSession} docs={docs} setDocs={setDocs} onLogout={() => { setAdmin(null); setView("website"); }} />;

  // ── VIEW WEBSITE (user biasa + chat widget) ──
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#0f172a;min-height:100vh}
        .cs::-webkit-scrollbar{width:3px} .cs::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.9) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes db{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        @keyframes pr{0%{transform:scale(1);opacity:.65}100%{transform:scale(1.6);opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}
        @keyframes fadeUp2{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .mi{animation:fadeUp .28s ease forwards}
        .wi{animation:scaleIn .32s cubic-bezier(.34,1.4,.64,1) forwards;transform-origin:bottom right}
        .dot{animation:db 1.2s infinite ease-in-out;display:inline-block;width:7px;height:7px;border-radius:50%;background:#94a3b8}
        .dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
        .fab-r::after{content:'';position:absolute;inset:0;border-radius:50%;background:${G};animation:pr 2s ease-out infinite;z-index:-1}
        .fab:hover{transform:scale(1.09)!important}
        .qb:hover{background:#f97316!important;color:#fff!important;border-color:#f97316!important}
        .sb:hover:not(:disabled){transform:scale(1.06);filter:brightness(1.08)}
        input,textarea,button{font-family:'Plus Jakarta Sans',sans-serif}
        code{background:#f1f5f9;padding:1px 5px;border-radius:4px;font-size:10.5px;color:#6366f1}
        .dropzone:hover{border-color:#a5b4fc!important}
      `}</style>

      {/* ── HALAMAN UTAMA WEBSITE ── */}
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0f172a 0%,#1e293b 60%,#0f2027 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", gap: 18 }}>
        <div style={{ background: G, borderRadius: 100, padding: "7px 22px", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#fff", textTransform: "uppercase" }}>
          Badan Pengembangan Talenta Digital
        </div>
        <h1 style={{ fontSize: "clamp(2.2rem,6vw,3.8rem)", fontWeight: 800, textAlign: "center", lineHeight: 1.1, background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          BPT Komdigi
        </h1>
        <p style={{ color: "#64748b", fontSize: 15, textAlign: "center", maxWidth: 480 }}>
          Kementerian Komunikasi dan Digital Republik Indonesia<br />
          <span style={{ color: "#475569", fontSize: 13 }}>Chatbot Asisten Resmi · Powered by Document Intelligence</span>
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {[["600.000+", "Alumni DTS"], ["6", "Akademi"], ["200K", "Target 2025"], ["100%", "Gratis"]].map(([n, l]) => (
            <div key={l} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "12px 20px", textAlign: "center" }}>
              <p style={{ fontWeight: 800, fontSize: 20, background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{n}</p>
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{l}</p>
            </div>
          ))}
        </div>

        {/* Tombol Admin — tersembunyi di bawah halaman */}
        <button onClick={() => setView("admin-login")} style={{
          marginTop: 16, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 10, padding: "8px 18px", fontSize: 12, color: "#475569", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, transition: "all .2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,.4)"; e.currentTarget.style.color = "#94a3b8"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "#475569"; }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Admin Panel
        </button>
      </div>

      {/* ── FAB CHAT ── */}
      {!chatOpen && (
        <button className="fab fab-r" onClick={() => setChatOpen(true)} style={{ position: "fixed", bottom: 28, right: 28, width: 64, height: 64, borderRadius: "50%", background: G, border: "none", cursor: "pointer", boxShadow: "0 8px 32px rgba(99,102,241,.55)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .2s", zIndex: 9999 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {activeDocs.length > 0 && (
            <span style={{ position: "absolute", top: 3, right: 3, minWidth: 18, height: 18, background: "#f97316", borderRadius: 9, border: "2.5px solid #0f172a", fontSize: 9.5, color: "#fff", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
              {activeDocs.length}
            </span>
          )}
        </button>
      )}

      {/* ── CHAT WIDGET — bersih, tanpa tab admin ── */}
      {chatOpen && (
        <div className="wi" style={{ position: "fixed", bottom: 24, right: 24, width: "min(400px,calc(100vw - 32px))", height: "min(620px,calc(100vh - 48px))", borderRadius: 22, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 32px 100px rgba(0,0,0,.55)", zIndex: 9999, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

          {/* Header */}
          <div style={{ background: G, padding: "15px 16px", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,.4)", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>Asisten BPT Komdigi</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.75)", display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 6px #10b981" }} />
                {activeDocs.length > 0 ? `${activeDocs.length} dok. aktif` : "Online · Siap Membantu"}
              </p>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: "rgba(255,255,255,.18)", border: "none", color: "#fff", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>×</button>
          </div>

          {/* Messages */}
          <div className="cs" style={{ flex: 1, overflowY: "auto", padding: "14px 13px", background: "#f8fafc", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map(msg => (
              <div key={msg.id} className="mi" style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-end", gap: 7 }}>
                {msg.role === "bot" && (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: G, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                )}
                <div style={{ maxWidth: "79%", padding: "10px 13px", fontSize: 13.5, lineHeight: 1.7, wordBreak: "break-word", background: msg.role === "user" ? "linear-gradient(135deg,#6366f1,#3b82f6)" : "#fff", color: msg.role === "user" ? "#fff" : "#1e293b", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", boxShadow: msg.role === "user" ? "0 4px 16px rgba(99,102,241,.3)" : "0 2px 10px rgba(0,0,0,.07)" }}>
                  {msg.fromDoc && msg.srcDocs?.length > 0 && (
                    <div style={{ marginBottom: 7 }}>
                      {msg.srcDocs.map(d => (
                        <span key={d} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "linear-gradient(135deg,rgba(99,102,241,.12),rgba(16,185,129,.12))", border: "1px solid rgba(99,102,241,.25)", color: "#6366f1", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 7, marginRight: 4 }}>
                          📎 {d}
                        </span>
                      ))}
                    </div>
                  )}
                  <RenderText text={msg.text} />
                </div>
              </div>
            ))}

            {typing && (
              <div className="mi" style={{ display: "flex", alignItems: "flex-end", gap: 7 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: G, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
                <div style={{ background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "13px 17px", boxShadow: "0 2px 10px rgba(0,0,0,.07)", display: "flex", gap: 5 }}>
                  <span className="dot" /><span className="dot" /><span className="dot" />
                </div>
              </div>
            )}

            {messages.length === 1 && !typing && (
              <div style={{ paddingLeft: 35, marginTop: 2 }}>
                <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8, fontWeight: 600 }}>Pertanyaan cepat:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {QUICK_REPLIES.map(qr => (
                    <button key={qr} className="qb" onClick={() => sendMessage(qr)} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 100, padding: "6px 14px", fontSize: 12, color: "#6366f1", fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>{qr}</button>
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ background: "#fff", borderTop: "1px solid #e2e8f0", padding: "11px 12px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ketik pertanyaan Anda..."
              style={{ flex: 1, border: "1.5px solid #e2e8f0", borderRadius: 11, padding: "9px 13px", fontSize: 13.5, color: "#1e293b", background: "#f8fafc", outline: "none", transition: "border .2s" }}
              onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
            <button className="sb" onClick={() => sendMessage()} disabled={!input.trim() || typing} style={{ width: 40, height: 40, borderRadius: 11, border: "none", flexShrink: 0, background: input.trim() && !typing ? "linear-gradient(135deg,#f97316,#fb923c)" : "#e2e8f0", cursor: input.trim() && !typing ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", boxShadow: input.trim() && !typing ? "0 4px 14px rgba(249,115,22,.4)" : "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !typing ? "#fff" : "#94a3b8"} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div style={{ background: "#fff", textAlign: "center", padding: "5px", borderTop: "1px solid #f1f5f9", fontSize: 10, color: "#94a3b8", flexShrink: 0 }}>
            🤖 Asisten Resmi · <strong style={{ color: "#6366f1" }}>BPT Komdigi</strong> · Kementerian Komunikasi dan Digital RI
          </div>
        </div>
      )}
    </>
  );
}
