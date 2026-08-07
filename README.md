# TIBKAM 1745

**Sistem Layanan Terpadu Ketertiban dan Keamanan (TIBKAM) 1745 Pondok Pesantren Sidogiri**

Aplikasi desktop native berbasis **Tauri 2** + **React 19** dengan backend lokal **PocketBase** yang dijalankan sebagai sidecar. Sistem digunakan untuk mengelola santri, penertiban rambut, kalender Hijriyah, pembuatan laporan, serta kontrol akses pengguna secara terpadu.

---

## 1. Daftar Isi

- [Fitur Utama](#2-fitur-utama)
- [Tech Stack](#3-tech-stack)
- [Arsitektur Aplikasi](#4-arsitektur-aplikasi)
- [Struktur Proyek](#5-struktur-proyek)
- [Environment Variables](#6-environment-variables)
- [Menjalankan Aplikasi](#7-menjalankan-aplikasi)
- [Scripts](#8-scripts)
- [Database & Koleksi PocketBase](#9-database--koleksi-pocketbase)
- [Role & Hak Akses Route](#10-role--hak-akses-route)
- [Fitur Detail](#11-fitur-detail)
- [Sistem Backup](#12-sistem-backup)
- [Sistem Printing](#13-sistem-printing)
- [Kalender Hijriyah & Waktu Istiwa](#14-kalender-hijriyah--waktu-istiwa)

---

## 2. Fitur Utama

- **Autentikasi & Otorisasi**  
  Login dengan username/password, proteksi route berbasis role, refresh sesi otomatis, serta deteksi akun nonaktif.

- **Dashboard Terpadu**  
  Dashboard dinamis berdasarkan role, statistik santri, statistik pengguna, jam digital Waktu Istiwa' Sidogiri, dan sapaan real-time.

- **Manajemen Master Santri**  
  Database induk santri dengan pencarian, filter berantai, detail santri, serta sinkronisasi massal via file Excel `YYYY-MM-DD-database.xlsx`.

- **Kalender Hijriyah**  
  Pemetaan tanggal Masehi ke Hijriyah, generate bulan baru 29/30 hari, tampilan grid kalender dinding, dan tabel data.

- **Layanan Rambut Santri**  
  Periode setoran, generate antrean wajib setor, verifikasi setor, dispensasi, POS barcode scanner, cetak struk, log audit, serta manajemen pengurus/petugas.

- **Laporan & Export Excel**  
  Export laporan rambut ke `.xlsx` dengan 4 sheet: Rekapitulasi, Daftar Wajib Setor, Riwayat Setor, dan Pengurus/Petugas. Lengkap dengan barcode ID PPS, donut chart, serta print setup A4.

- **Manajemen Pengguna**  
  CRUD pengguna, reset password, ubah avatar, role dan status akun. Admin Rambut hanya dapat membuat akun ber-role `rambut`.

- **Profil Pengguna**  
  Edit profil, ganti foto, dan ubah password sendiri.

- **Auto Backup**  
  Backup `data.db` otomatis sekali sehari ke folder `Documents/Tibkam1745_Backups`.

---

## 3. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19, Vite 8, TypeScript 6 |
| UI & Styling | Tailwind CSS 4, Framer Motion, Lucide Icons |
| Data Fetching | TanStack React Query 5 |
| Form & Validasi | React Hook Form, Zod |
| Routing | React Router 7 (HashRouter) |
| Barcode & Scanner | `html-to-image`, `html2canvas`, input scanner mode |
| Excel | ExcelJS, SheetJS (xlsx) |
| Backend Embedded | PocketBase 0.27 + SQLite |
| Desktop Shell | Tauri 2, Rust 2021 |
| Print Service | Native sidecar `printer_service.exe` |
| Type Generator | `pocketbase-typegen` |

---

## 4. Arsitektur Aplikasi

### 4.1 Alur Utama

1. Aplikasi Tauri diluncurkan.
2. Rust akan memastikan tidak ada proses `pocketbase.exe` yang bertabrakan.
3. Rust menyalin `koleksi_awal.db` menjadi `data.db` pada `AppData` jika database belum ada.
4. PocketBase dijalankan secara lokal pada `http://127.0.0.1:8090`.
5. Frontend React melakukan koneksi ke PocketBase melalui URL dinamis:
   - `VITE_PB_URL` jika tersedia.
   - `http://127.0.0.1:8090` saat mode development atau dalam lingkungan Tauri.
   - `/` jika di-host langsung oleh PocketBase `pb_public`.
6. Sesi autentikasi disimpan pada `sessionStorage`.

### 4.2 Komponen Utama

| Komponen | Lokasi | Fungsi |
|---|---|---|
| `ProtectedRoute` | `src/features/auth/components/ProtectedRoute.tsx` | Gerbang autentikasi dan RBAC |
| `DashboardLayout` | `src/layouts/DashboardLayout/` | Layout utama + Sidebar |
| `BaseModal` | `src/components/shared/BaseModal.tsx` | Modal reusable dengan portal |
| `BaseToolbar` | `src/components/shared/BaseToolbar.tsx` | Pencarian + refresh + slot filter |
| `CustomDatePickerHijriyah` | `src/components/shared/` | Date picker Hijriyah dari database |
| `CustomDatePickerMasehi` | `src/components/shared/` | Date picker Masehi sekaligus menampilkan Hijriyah |
| `useRambut` | `src/features/rambut/hooks/useRambut.ts` | Business logic modul rambut |
| `useRapidScanPos` | `src/features/rambut/hooks/useRapidScanPos.ts` | Logic POS barcode scanner |
| `exportRambutToExcel` | `src/features/laporan/utils/exportRambutExcel.ts` | Export Excel multi-sheet |

### 4.3 Tauri Commands

| Command Rust | Dipanggil dari Frontend | Deskripsi |
|---|---|---|
| `get_available_printers` | `src/utils/printer.ts` | Mengambil daftar printer Windows |
| `print_image_silently` | `src/utils/printer.ts` | Print gambar ke printer default secara silent |
| `execute_native_auto_backup` | `src/hooks/useAutoBackup.ts` | Backup `data.db` ke Documents |

---

## 5. Struktur Proyek

```text
tibkam1745/
├── src/                                  # Source code utama aplikasi frontend (React + TypeScript)
│   ├── App.tsx                           # Komponen utama root React
│   ├── main.tsx                          # Entry point render DOM React
│   ├── index.css                         # Styling global & konfigurasi Tailwind CSS
│   ├── components/                       # Komponen UI yang digunakan di banyak tempat
│   │   └── shared/                       # Komponen umum yang dapat dipakai ulang
│   │       ├── BaseModal.tsx             # Komponen dialog modal standar
│   │       ├── BaseToolbar.tsx           # Baris alat/aksi standar halaman
│   │       ├── GlassDropdown.tsx         # Dropdown UI dengan efek glassmorphism
│   │       ├── CustomDatePickerHijriyah.tsx # Komponen pemilih tanggal kalender Hijriyah
│   │       ├── CustomDatePickerMasehi.tsx   # Komponen pemilih tanggal kalender Masehi
│   │       ├── EmptyState.tsx            # Tampilan visual saat data kosong
│   │       ├── HijriText.tsx             # Komponen untuk pemformatan teks tanggal Hijriyah
│   │       ├── NotificationToast.tsx     # Komponen tampilan notifikasi toast
│   │       ├── PageHeader.tsx            # Header standar bagian atas halaman
│   │       ├── PageTransition.tsx        # Efek animasi transisi antar halaman
│   │       ├── SegmentedControl.tsx      # Komponen tombol pilihan segmen/tab
│   │       └── StatusBadge.tsx           # Badge indikator status
│   ├── context/                          # State management global via React Context
│   │   └── ToastContext.tsx              # Context penyedia sistem notifikasi toast
│   ├── features/                         # Modul bisnis terisolasi berdasarkan fitur
│   │   ├── auth/                         # Fitur autentikasi (login, logout, hak akses)
│   │   ├── dashboard/                    # Fitur halaman utama & ringkasan statistik
│   │   ├── kalender/                     # Fitur pengelolaan kalender & penanggalan
│   │   ├── laporan/                      # Fitur pencetakan & rekapitulasi laporan
│   │   ├── master/                       # Fitur manajemen data induk (Master Data)
│   │   ├── profile/                      # Fitur manajemen profil pengguna/lembaga
│   │   ├── rambut/                       # Modul khusus pangkas rambut/layanan spesifik
│   │   └── users/                        # Fitur manajemen akun & peran pengguna
│   ├── hooks/                            # Custom React Hooks
│   │   ├── useAutoBackup.ts              # Hook logika otomatisasi pembuatan cadangan data
│   │   ├── usePrinter.ts                 # Hook antarmuka perintah pencetakan struk/laporan
│   │   └── useWaktuIstiwa.ts             # Hook perhitungan otomatis waktu Istiwa
│   ├── layouts/                          # Template tata letak halaman
│   │   └── DashboardLayout/              # Tata letak utama halaman berdasar sidebar & header
│   ├── lib/                              # Integrasi pustaka pihak ketiga
│   │   └── pocketbase.ts                 # Inisialisasi Klien PocketBase SDK
│   ├── types/                            # Deklarasi tipe data TypeScript
│   │   ├── pocketbase-types.ts           # Definisi tipe skema database PocketBase
│   │   └── printer.ts                    # Definisi tipe konfigurasi & payload printer
│   └── utils/                            # Fungsi pembantu (helper logic)
│       ├── dateHelpers.ts                # Fungsi pembantu konversi & format tanggal
│       ├── errorHandler.ts               # Handler penanganan error terpusat
│       ├── printer.ts                    # Utility pembentukan data struk pencetakan
│       ├── userHelpers.ts                # Utility ekstraksi & pemformatan data user
│       └── waktuIstiwa.ts                # Algoritma perhitungan waktu Istiwa
├── src-tauri/                            # Source code backend desktop (Tauri / Rust)
│   ├── bin/                              # File biner eksternal yang dibundel
│   │   ├── pocketbase.exe                # Executable database backend PocketBase
│   │   ├── koleksi_awal.db               # Database SQLite/PocketBase bawaan awal
│   │   └── printer_service.exe           # Biner sidecar service printer bawaan
│   ├── src/                              # Source code Rust
│   │   ├── commands/                     # Tauri Commands (fungsi Rust yang dipanggil dari TS)
│   │   │   ├── backup.rs                 # Perintah pencadangan & pemulihan data
│   │   │   ├── mod.rs                    # Eksport seluruh modul commands
│   │   │   └── printer.rs                # Perintah komunikasi dengan printer hardware
│   │   ├── services/                     # Layanan latar belakang Rust
│   │   │   ├── backup.rs                 # Proses enkripsi/kompresi backup database
│   │   │   ├── pocketbase.rs             # Pengelola lifecycle & jalannya proses PocketBase
│   │   │   └── printer.rs                # Layanan pengelolaan soket/port printer
│   │   ├── lib.rs                        # Pustaka utama pembangun aplikasi Tauri v2
│   │   ├── main.rs                       # Entry point aplikasi Rust/Tauri
│   │   └── state.rs                      # Pengelola state aplikasi internal di sisi Rust
│   └── tauri.conf.json                   # Konfigurasi aplikasi Tauri (jendela, izin, build)
├── public/                               # Aset statis terbuka (bebas diakses langsung)
│   ├── favicon.ico                       # Ikon tab peramban/aplikasi
│   ├── logo_struk.svg                    # Gambar logo khusus untuk dicetak di struk
│   ├── logo_tibkam_1745.svg              # Logo utama aplikasi
│   └── logo_tibkam_sayap_saja.svg        # Aset gambar logo variasi
├── sidecars/                             # Project terpisah yang dikompilasi menjadi biner tambahan
│   └── printer-service/                  # Microservice khusus pencetakan berbasis Go
│       ├── go.mod                        # File dependensi modul Go
│       └── main.go                       # Entry point program printer service Go
├── generate-tree.js                      # Skrip pembuatan otomatis struktur direktori
├── generate-types.js                     # Skrip ekstraksi tipe otomatis dari skema database
├── postcss.config.js                     # Konfigurasi plugin PostCSS
├── tailwind.config.js                    # Konfigurasi tema, warna, & breakpoint Tailwind CSS
├── tsconfig.json                         # Konfigurasi utama TypeScript untuk frontend
├── tsconfig.node.json                    # Konfigurasi TypeScript untuk lingkungan Node/Vite
├── vite.config.ts                        # Konfigurasi bundler Vite
├── package.json                          # Manifest dependensi & skrip npm
└── README.md                             # Dokumentasi utama proyek
```

Setiap fitur dikemas dalam folder `src/features/<modul>` dengan pola:

```text
features/<modul>/
├── components/ # Komponen UI internal modul
├── hooks/      # Custom hooks internal modul
├── pages/      # Komponen tampilan halaman fitur
├── utils/      # Fungsi helper internal modul
└── index.ts    # Public API gerbang modul
```

`index.ts` berperan sebagai public API gerbang modul.

---

## 6. Environment Variables

Buat file `.env` dari `.env.example`.

| Variable | Deskripsi |
|---|---|
| `VITE_PB_URL` | URL PocketBase. Jika kosong maka otomatis memakai `http://127.0.0.1:8090` di mode dev/Tauri, atau `/` jika di-host oleh PocketBase |
| `PB_URL` | URL PocketBase untuk type generation |
| `PB_EMAIL` | Email admin PocketBase untuk type generation |
| `PB_PASSWORD` | Password admin PocketBase untuk type generation |

Contoh file `.env`:

    VITE_PB_URL=http://127.0.0.1:8090
    PB_URL=http://127.0.0.1:8090
    PB_EMAIL=admin@example.com
    PB_PASSWORD=passwordAdmin

---

## 7. Menjalankan Aplikasi

### 7.1 Mode Web Development

    npm install
    npm run dev

Akses aplikasi di `http://localhost:5173`.

### 7.2 Mode Production Web

    npm run build
    npm run preview

### 7.3 Mode Desktop Tauri

Pastikan Rust dan Tauri CLI sudah terinstal.

    npm install
    npx tauri dev

Build installer desktop:

    npx tauri build

### 7.4 Build Output

`vite.config.ts` mendeteksi lingkungan Tauri secara otomatis:

- Jika ada variable environment `TAURI_*`, output build diarahkan ke `dist/`.
- Jika tidak, output build diarahkan ke `../backend/pb_public` untuk dihost oleh PocketBase.

---

## 8. Scripts

| Script | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan Vite dev server pada port 5173 |
| `npm run build` | Build aplikasi React |
| `npm run preview` | Preview hasil build |
| `npm run clean` | Menghapus `dist` dan `src-tauri/target` |
| `npm run typegen` | Generate TypeScript types dari PocketBase |

`npm run typegen` memerlukan `.env` dengan `PB_URL`, `PB_EMAIL`, dan `PB_PASSWORD`.

Command yang dijalankan:

    node --env-file=.env generate-types.js

---

## 9. Database & Koleksi PocketBase

Backend menggunakan **PocketBase** dengan database SQLite bernama `data.db`.

### 9.1 Inisialisasi Database

- File `src-tauri/bin/koleksi_awal.db` akan disalin menjadi `data.db` pada folder `AppData/pb_data/` saat pertama kali aplikasi dijalankan.
- PocketBase dijalankan dengan flag `serve --dir <pb_data> --migrationsDir <pb_migrations>`.

### 9.2 Koleksi Utama

| Koleksi | Deskripsi |
|---|---|
| `users` | Data pengguna, role, avatar, status aktif |
| `master` | Database induk santri |
| `kalender_hijriyah` | Pemetaan tanggal Masehi ke Hijriyah |
| `periode_rambut` | Periode setoran rambut |
| `wajib_setor_rambut` | Antrean santri wajib setor per periode |
| `riwayat_setor_rambut` | Log transaksi verifikasi setor |
| `pengurus_santri` | Data pengurus/petugas khusus wajib setor |

### 9.3 Collection Types

TypeScript types untuk seluruh koleksi dibuat otomatis oleh `pocketbase-typegen` dan disimpan di:

    src/types/pocketbase-types.ts

---

## 10. Role & Hak Akses Route

| Route | Admin | Admin Rambut | Rambut | Umum |
|---|---:|---:|---:|---:|
| `/dashboard` | ✅ | ✅ | ✅ | ✅ |
| `/profile` | ✅ | ✅ | ✅ | ✅ |
| `/master` | ✅ | ✅ | ✅ | ✅ |
| `/users` | ✅ | ✅ | ❌ | ❌ |
| `/rambut` | ✅ | ✅ | ✅ | ❌ |
| `/laporan/rambut` | ✅ | ✅ | ✅ | ❌ |
| `/kalender` | ✅ | ✅ | ✅ | ❌ |

Routing utama berada di `src/App.tsx`.

### 10.1 Aturan Khusus

- `admin_rambut` hanya dapat membuat akun baru dengan role `rambut`.
- Petugas `rambut` hanya bisa melakukan eksekusi setor jika:
  - Periode berstatus `aktif`.
  - Tanggal hari ini berada dalam rentang periode.
- `admin` dan `admin_rambut` dapat melakukan bypass aturan periode untuk kebutuhan operasional.

---

## 11. Fitur Detail

### 11.1 Autentikasi

- Login manual dengan `username` atau `email`.
- Sesi disimpan di `sessionStorage`.
- Auto-redirect jika sudah login.
- Token session di-refresh otomatis.
- Akun dengan `status = false` tidak dapat login dan sesinya langsung dibersihkan.

### 11.2 Dashboard

- Sapaan berdasarkan waktu lokal.
- Menampilkan jam digital Waktu Istiwa' Sidogiri.
- Menampilkan tanggal Masehi dan Hijriyah hari ini.
- Statistik santri aktif, PPS, LPPS, sebaran tingkatan, dan sebaran domisili.
- Statistik pengguna khusus role admin.
- Log pendaftaran pengguna terbaru.

### 11.3 Master Santri

- Pencarian nama atau ID PPS.
- Filter berantai: status, tingkatan, kelas, status domisili, dan kompleks domisili.
- Detail lengkap santri.
- Import Excel dengan format nama wajib: `YYYY-MM-DD-database.xlsx`.
- Proses sinkronisasi:
  - Data baru → `insert`.
  - Data berubah → `update`.
  - Data tidak ada di Excel → `soft delete` / nonaktif.
  - Data sama → `skipped`.

### 11.4 Kalender Hijriyah

- Generate bulan Hijriyah dengan ketentuan 29 atau 30 hari.
- Deteksi bulan sudah dipetakan.
- Deteksi bentrok tanggal Masehi.
- Tampilan grid kalender dinding.
- Tampilan tabel data dengan pagination.
- Penanda hari Jumat dan hari ini.

### 11.5 Layanan Rambut

- Membuat, mengelola, mengaktifkan, menyelesaikan, dan menghapus periode.
- Generate antrean dari:
  - Santri aktif PPS tingkatan Aliyah dan Kuliah Syariah.
  - Pengurus/petugas aktif dengan status domisili PPS.
- Smart sync rekonsiliasi antrean.
- Verifikasi setor dengan mencatat Waktu Istiwa'.
- Dispensasi khusus.
- POS barcode scanner.
- Cetak ulang struk.
- Log audit trail.
- Manajemen pengurus dan import pengurus via Excel.

### 11.6 Laporan & Export Excel

Export file `.xlsx` dengan 4 sheet:

1. **Rekapitulasi**
   - KPI total, sudah, belum, dispensasi.
   - Donut chart distribusi status.
   - Rincian per kategori.

2. **Daftar Wajib Setor**
   - Data antrean lengkap.
   - Status setor dengan warna.

3. **Riwayat Setor Rambut**
   - Log audit transaksi.
   - Tanggal Hijriyah, Waktu WIS, petugas eksekutor.

4. **Pengurus & Petugas**
   - Data pengurus aktif.
   - Barcode ID PPS otomatis.

### 11.7 Profil

- Melihat profil lengkap.
- Edit nama dan avatar.
- Hapus avatar.
- Ubah password sendiri dengan validasi.

### 11.8 Manajemen Pengguna

- Tambah pengguna.
- Edit nama, status, avatar.
- Reset password tanpa password lama.
- Hapus pengguna permanen.
- Filter berdasarkan role dan status.
- Khusus `admin_rambut`, data yang muncul hanya user ber-role `rambut`.

---

## 12. Sistem Backup

### 12.1 Auto Backup

Hook `useAutoBackup` dipanggil oleh `DashboardLayout`.

Proses:

1. Cek autentikasi PocketBase valid.
2. Cek `localStorage` dengan key `tibkam_last_auto_backup_date`.
3. Jika belum backup hari ini, panggil command Rust `execute_native_auto_backup`.
4. Rust menyalin `data.db` ke `Documents/Tibkam1745_Backups/backup_tibkam_YYYY-MM-DD.db`.
5. Backup lama disimpan maksimal 7 file.
6. Tanggal backup terakhir disimpan ke `localStorage`.

---

## 13. Sistem Printing

### 13.1 Mode Print

| Mode | Deskripsi |
|---|---|
| `off` | Tidak mencetak |
| `auto` | Membuka dialog print browser melalui iframe tersembunyi |
| `silent` | Print langsung via printer default Windows menggunakan `printer_service.exe` |

### 13.2 Silent Print Flow

1. Frontend mengubah HTML struk menjadi gambar PNG base64.
2. Gambar dikirim ke command Rust `print_image_silently`.
3. Rust memanggil `printer_service.exe` dengan payload JSON melalui stdin.
4. `printer_service.exe` mencetak gambar ke printer yang dipilih.

### 13.3 Struk Bukti Setor

Struk berisi:

- ID PPS.
- Nama santri.
- Kelas / tingkatan.
- Domisili.
- Alamat.
- Tanggal Hijriyah.
- Waktu Istiwa'.
- Penerima / petugas eksekutor.

---

## 14. Kalender Hijriyah & Waktu Istiwa

### 14.1 Waktu Istiwa'

Perhitungan menggunakan standar astronomi **Jean Meeus / NOAA**:

- Equation of Time.
- Julian Date.
- Julian Century.
- Kemiringan aksis Bumi (`obliquity`).
- Koreksi bujur Sidogiri `112.8359388° E`.
- Offset waktu pondok.

Hasil ditampilkan sebagai `HH:mm:ss WIS` dan diperbarui setiap 50ms dengan optimasi re-render.

### 14.2 Kalender Hijriyah

Kalender tersimpan eksplisit di koleksi `kalender_hijriyah`, bukan hasil kalkulasi runtime. Data direntang oleh admin melalui modul Kalender.

Setiap record berisi:

- `tanggal_masehi`
- `tanggal_hijri`
- `bulan_hijri_angka`
- `bulan_hijri_nama`
- `tahun_hijri`
- `string_hijri`

---

## 15. Catatan Pengembangan

### 15.1 Menambah Feature Baru

1. Buat folder baru di `src/features/<nama-feature>`.
2. Gunakan struktur `components`, `hooks`, `pages`, `utils`.
3. Buat `index.ts` sebagai public API.
4. Daftarkan route di `src/App.tsx`.
5. Gunakan `ProtectedRoute` untuk membatasi akses.

### 15.2 Generate Tree

Untuk membuat file `directory-tree.txt`:

    node generate-tree.js

### 15.3 Generate Type PocketBase

    npm run typegen

Pastikan `.env` sudah diisi.

---

## 16. Lisensi

Copyright (c) 2026 annaqibz01. All rights reserved.

This software and all associated documentation files are the intellectual property 
of annaqibz01.

Unauthorized copying, modification, distribution, sublicensing, or reverse 
engineering of this software, via any medium, is strictly prohibited. 
Any use of this software without prior written permission is a violation 
of copyright law.

---

Dibangun dengan React, TypeScript, Tauri, Rust, Tailwind CSS, PocketBase, dan dedikasi untuk Pondok Pesantren Sidogiri.