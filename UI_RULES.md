# 📐 TIBKAM1745 — DESKTOP UI/UX SPECIFICATION & ENGINEERING SYSTEM
Versi Dokumen: 2.0.0 (Workstation Edition)
Target Runtime: Tauri v2 Desktop (Windows 10 / Windows 11 Standard User / Non-Admin)
Lingkungan: 100% Offline, Local-First (Embedded PocketBase SQLite)
Prinsip Desain: Industrial, Data-Dense, Keyboard-Driven, Zero-Latency

Dokumen ini adalah kontrak baku rekayasa antarmuka (Design & Engineering Contract) untuk seluruh komponen, halaman, dialog, tabel, dan utilitas pada repositori tibkam1745. Seluruh kode baru maupun hasil refaktor WAJIB tunduk pada spesifikasi berikut tanpa pengecualian.

================================================================================
1. FILOSOFI & KARAKTER SISTEM
================================================================================

Aplikasi ini adalah software alat kerja operasional instansi (desktop workstation tool), bukan web konsumer, bukan landing page promosi, bukan aplikasi crypto/Web3, dan bukan game launcher.

1. Anti-Glow & Anti-Glassmorphism:
   - Dilarang keras menggunakan ambient glow blur (seperti blur-[60px], blur-[100px]).
   - Dilarang keras menggunakan background gradasi pelangi multi-stop (bg-gradient-to-r from-indigo... via-purple... to-pink...).
   - Dilarang menumpuk efek backdrop-blur di atas kontainer yang sudah memiliki blur.

2. Kepadatan Informasi Tinggi (High Data Density):
   - Di layar monitor laptop resolusi standar (1366x768 maupun 1080p), operator harus dapat melihat minimal 15–20 baris tabel sekaligus tanpa terpotong banner dekoratif raksasa atau padding kontrol yang gemuk.

3. Ergonomi Keyboard Desktop (Keyboard-First):
   - Alur pemindaian barcode, entri transaksi kasir/POS, navigasi antrean, dan pengisian modal dialog harus dapat diselesaikan 100% menggunakan shortcut keyboard tanpa menyentuh mouse.

4. Respon Visual Cepat (Zero-Latency Feel):
   - Animasi transisi maksimal berdurasi 120ms – 150ms dengan kurva ease-out linear.
   - Dilarang memakai animasi pegas membal (spring physics bouncy) pada komponen entri data dan filter.

================================================================================
2. TOKEN WARNA & PALET SEMANTIK (ZINC PALETTE)
================================================================================

Seluruh sistem menggunakan palet warna monokrom netral Zinc guna menciptakan kontras optimal dan kenyamanan mata operator saat bekerja berjam-jam:

A. Permukaan & Latar Belakang (Surfaces)
- App Canvas (Latar Terdalam): #09090b (bg-zinc-950)
- Panel / Card / Sidebar / Container Utama: #121215 (bg-zinc-900/90)
- Elevated Surface (Modal Dialog, Popover, Dropdown List): #18181b (bg-zinc-900)
- Sub-Surface (Input Box, Inner Card, Kolom Search): #0d0d11 (bg-zinc-950/80)

B. Garis Batas (Borders & Dividers)
- Border Standar (1px Solid): #27272a (border-zinc-800)
- Subtle Divider / Pembatas Baris: #1f1f23 (border-zinc-800/60)
- Border Hover Interaktif: #3f3f46 (border-zinc-700)
- Focus State: ring-1 ring-indigo-500 border-indigo-500

C. Aksen Status & Aksi Fungsional
Warna aksen HANYA digunakan sebagai sinyal status fungsional, dilarang untuk ornamen dekoratif:
- Primary Action: bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/30
- Sukses / Lunas / Terverifikasi: bg-emerald-500/10 text-emerald-400 border-emerald-500/20
- Pending / Antrean / Peringatan: bg-amber-500/10 text-amber-400 border-amber-500/20
- Danger / Gagal / Terkunci / Hapus: bg-rose-500/10 text-rose-400 border-rose-500/20
- Dispensasi Khusus / Jabatan Tertentu: bg-purple-500/10 text-purple-400 border-purple-500/20
- Netral / Muted / Nilai Kosong: bg-zinc-800/80 text-zinc-400 border-zinc-700/80

================================================================================
3. RITME KETINGGIAN VERTIKAL (STRICT SIZING RHYTHM)
================================================================================

Semua kontrol UI yang disusun horizontal berdampingan WAJIB RATA AIR dengan tinggi identik:

| Kategori Kontrol       | Tinggi Standar | Class Tailwind | Penerapan                                                                                             |
|------------------------|----------------|----------------|-------------------------------------------------------------------------------------------------------|
| Standard Control       | 36px           | h-9            | Input form, search box, tombol primer/sekunder, trigger dropdown, datepicker, tab segmented control   |
| Compact Control        | 28px           | h-7            | Tombol aksi di tabel (Setor, Izin, Struk, Hapus), tombol pagination                                   |
| Micro Badge / Tag      | 22px           | h-[22px]       | Status badge, tag kategori, indikator ringkas                                                         |
| Tabel Row Height       | ~36px          | py-2 px-3      | Ketinggian cell data tabel per baris                                                                  |
| OS Title Bar           | 36px           | h-9            | Custom titlebar window desktop Tauri                                                                  |

ATURAN KERAS: Dilarang menggunakan class h-12 (48px), h-11, atau angka acak seperti h-[42px] pada elemen kontrol kerja.

================================================================================
4. SISTEM SUDUT LENGKUNG (BORDER RADIUS)
================================================================================

Tinggalkan kelengkungan ekstrem mobile untuk memaksimalkan efisiensi ruang monitor desktop:

- Modal Dialog & Card Luar Utama: rounded-xl (12px)
- Semua Kontrol (Button, Input, Dropdown, Toolbar baris): rounded-lg (8px)
- Inner Items (Baris tabel, item menu dropdown, tag badge): rounded-md (6px)
- Badge Status Pill: rounded-md (6px) atau rounded-full khusus status dot mikro
- Avatar & Status Dot: rounded-full

ATURAN KERAS: Dilarang menggunakan rounded-3xl (24px) dan rounded-2xl (16px) pada komponen form dan tombol.

================================================================================
5. STANDAR TIPOGRAFI & PEMISAHAN PERAN FONT
================================================================================

Aplikasi memisahkan peran teks bacaan dan komputasi numerik secara disiplin:

A. Font Sans (font-sans: Inter / Roboto / Native System) — Porsi 90%
- Peruntukan: Nama santri, judul halaman, teks tombol aksi, label formulir, nama alamat, keterangan error, dan seluruh teks antarmuka umum.
- Ukuran Standar:
  * Judul Halaman Utama: text-xl font-bold tracking-tight text-white
  * Judul Modal / Card Header: text-sm font-semibold text-white
  * Body Teks & Isi Data Tabel: text-xs font-normal text-zinc-200
  * Label Input & Subteks: text-[11px] font-medium text-zinc-400

B. Font Monospace (font-mono: Consolas / JetBrains Mono) — Porsi Khusus Angka
- Peruntukan: HANYA untuk ID PPS, Jam Waktu Istiwa (WIS), NIK, NISN, Format Tanggal Numerik (2026-08-15), dan kalkulasi angka statistik.
- Ukuran Standar: Disetarakan dengan teks tetangganya (text-xs atau text-[11px] font-bold).

ATURAN KERAS: Dilarang membungkus tag form, table, atau div wrapper modal dengan class font-mono. Font mono disematkan spesifik hanya pada elemen span atau input yang memuat angka/ID.

================================================================================
6. ATURAN INTEGRASI TAURI & NATIVE WINDOW
================================================================================

1. Seleksi Teks Global (Copy-Paste Hak Operator):
   - Dilarang menonaktifkan seleksi teks global di level body (body { user-select: none; }).
   - Operator berhak memilih dan menyalin (Copy-Paste) Nama santri, ID PPS, NIK, dan Nomor HP wali ke software lain.
   - Sematkan class select-none hanya pada elemen navigasi, icon, tombol kontrol, dan titlebar.

2. Titlebar Tauri Custom (CustomTitleBar.tsx):
   - Tinggi terkunci persis h-9 (36px), border bawah border-zinc-800.
   - Atribut data-tauri-drag-region hanya aktif di area kosong dan logo (tidak boleh menimpa tombol kontrol window).
   - Tombol window (Minimize, Maximize, Close) menggunakan ukuran w-9 h-7 rounded-md hover:bg-zinc-800.

3. Isolasi Firewall (Zero UAC Prompt):
   - Eksekusi PocketBase binary di Rust WAJIB menyertakan argumen --http=127.0.0.1:8090 agar Windows Defender Firewall tidak pernah mendeteksi koneksi publik atau memunculkan pop-up izin Administrator.

================================================================================
7. SPESIFIKASI KOMPONEN INTI
================================================================================

A. BaseToolbar (src/components/shared/BaseToolbar.tsx)
- Seluruh elemen di dalam toolbar memiliki tinggi seragam h-9 (36px).
- Input pencarian: bg-zinc-900 border-zinc-800 text-xs text-white placeholder-zinc-500 rounded-lg.
- Ikon pencarian: w-4 h-4 text-zinc-500.
- Tombol refresh: Kotak presisi w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white shrink-0.
- Jarak horizontal antar filter: gap-2.

B. BaseModal (src/components/shared/BaseModal.tsx)
- Arsitektur Layout Tiga Tingkat:
  Outer Container: fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80
  Modal Window: w-full max-w-xl max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-2xl
  1. Header (Fixed): h-12 flex items-center justify-between px-4 border-b border-zinc-800
  2. Body (Scrollable): flex-1 overflow-y-auto p-4 custom-scrollbar font-sans
  3. Footer (Fixed): h-12 flex items-center justify-end px-4 border-t border-zinc-800 gap-2
- Anti Modal Inception:
  Dilarang menumpuk modal di atas modal yang sedang terbuka. Dialog konfirmasi (misal: Konfirmasi Hapus atau Konfirmasi Ubah Status) wajib menggantikan tampilan modal yang sedang aktif atau menggunakan komponen konfirmasi inline.
- Ergonomi Input:
  Field input pertama otomatis fokus saat modal terbuka (autoFocus atau inputRef.focus()).
  Menekan tombol Escape wajib memicu onClose.

C. Tabel Data & Subtabel
- Header Tabel (thead): sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider.
- Padding Baris Data: py-2 px-3 (menghasilkan tinggi baris kompak ~36px).
- Hover State: hover:bg-zinc-800/40 transition-colors duration-100.
- Badge ID PPS Santri: font-mono font-bold text-xs text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20.
- Kolom Nomor: w-10 text-center font-mono text-zinc-500 text-xs.

D. Notifikasi Toast vs Validasi Formulir
- Toast Notification (NotificationToast):
  HANYA digunakan untuk konfirmasi hasil operasi asynchronous (contoh: "Data berhasil disimpan", "Batch import selesai", "Gagal koneksi database").
- Validasi Input Formulir:
  DILARANG memicu Toast saat pengguna sedang mengetik form.
  Pesan kesalahan input wajib tampil inline di bawah kotak field input terkait:
  Struktur: text-[11px] font-sans text-rose-400 mt-1 (* Pesan validasi error)

================================================================================
8. SPESIFIKASI WORKSPACE POS & HARDWARE INTEGRATION
================================================================================

Khusus modul pemindaian cepat rambut (RapidScanPos):

1. Input Anti-Drop Scanner Barcode:
   - Kotak input barcode scanner DILARANG MENGGUNAKAN ATRIBUT disabled={isProcessing}.
   - Indikator proses loading ditampilkan pada kartu hasil verifikasi, sementara kursor input harus selalu aktif menerima ketikan laser barcode berikutnya tanpa jeda.

2. Audio Beep Singleton (posAudio.ts):
   - Pemicu sinyal audio beep wajib menggunakan instance AudioContext global tunggal (singleton) yang di-resume otomatis, guna mencegah error batas alokasi hardware sound context pada WebView2.

3. Pencetakan Struk Thermal Otomatis:
   - Parameter printer mode silent dibiarkan bernilai string kosong ("") agar sistem langsung mencetak ke printer default Windows.
   - Kanvas render gambar struk wajib membaca tinggi aktual dokumen secara dinamis (doc.body.scrollHeight) agar struk transaksi panjang tidak terpotong pada batas statis 1000px.

================================================================================
9. KONVENSI DATABASE & WAKTU (LOCAL-FIRST OFFLINE)
================================================================================

1. Kueri Rentang Tanggal (WIB vs UTC):
   - PocketBase menyimpan kolom waktu dalam UTC. Jangan menggunakan substring (~ "YYYY-MM-") untuk memfilter tanggal.
   - Selalu gunakan perbandingan rentang eksplisit:
     tanggal_masehi >= "${startOfDayUTC}" && tanggal_masehi <= "${endOfDayUTC}".

2. Kalkulasi Waktu Istiwa (WIS):
   - Nilai waktu Istiwa (dapatkanDetailWis) dirancang khusus untuk live-clock jam dan log catatan audit operasional.
   - Dilarang menggunakan string WIS sebagai fallback untuk fungsi penampil tanggal Hijriyah.

================================================================================
10. CHECKLIST VALIDASI KODE (CODE REVIEW CRITERIA)
================================================================================

Sebelum sebuah komponen atau fitur dinyatakan selesai, wajib lolos uji checklist berikut:

[ ] Tidak ada class blur-[...] (ambient blur kabut) di seluruh markup file.
[ ] Tidak ada class bg-gradient-to-... yang memadukan lebih dari satu warna pelangi.
[ ] Semua input, button toolbar, selector kalender, dan dropdown trigger memiliki tinggi h-9 (36px).
[ ] Semua button aksi di dalam baris tabel memiliki tinggi h-7 (28px).
[ ] Radius border hanya menggunakan rounded-xl (modal/card) atau rounded-lg (kontrol).
[ ] Teks nama santri, label, dan tombol menggunakan font-sans.
[ ] Font font-mono terisolasi hanya pada ID PPS, jam Istiwa, NIK, dan tanggal numerik.
[ ] Tidak ada modal dialog yang memicu modal dialog baru di atasnya (no nested modals).
[ ] Validasi form ditampilkan inline di bawah input, bukan melempar toast pop-up melayang.
[ ] Teks santri pada tabel dapat di-blok dan di-copy oleh kursor mouse operator.
[ ] Input scanner POS tidak memiliki atribut disabled saat loading.