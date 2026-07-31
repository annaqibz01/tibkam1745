# 🚀 TIBKAM 1745 - Integrated System Portal

![Version](https://img.shields.io/badge/version-1.3.0-indigo?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2.7-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?style=for-the-badge&logo=typescript)
![Tauri](https://img.shields.io/badge/Tauri-2.11.3-FFC107?style=for-the-badge&logo=tauri)
![PocketBase](https://img.shields.io/badge/PocketBase-0.27.0-B80000?style=for-the-badge&logo=pocketbase)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.3.2-38BDF8?style=for-the-badge&logo=tailwindcss)

**TIBKAM 1745** adalah platform aplikasi desktop & web terpadu yang dirancang khusus untuk mengelola operasional Ketertiban dan Keamanan (TIBKAM) Pondok Pesantren Sidogiri. Aplikasi ini mengintegrasikan data induk santri, layanan penertiban perapian rambut, titik jepit kalender Hijriyah pesantren, POS *rapid scan barcode*, serta pelaporan & ekspor data tingkat lanjut secara real-time.

---

## 📋 Daftar Isi

- [🚀 TIBKAM 1745 - Integrated System Portal](#-tibkam-1745---integrated-system-portal)
  - [📋 Daftar Isi](#-daftar-isi)
  - [✨ Fitur Utama](#-fitur-utama)
    - [🛡️ 1. Otentikasi \& Keamanan Sesi (RBAC)](#️-1-otentikasi--keamanan-sesi-rbac)
    - [📊 2. Dashboard Executive Real-Time](#-2-dashboard-executive-real-time)
    - [🗄️ 3. Pusat Data Master Santri](#️-3-pusat-data-master-santri)
    - [✂️ 4. Layanan Perapian Rambut \& POS Rapid Scan](#️-4-layanan-perapian-rambut--pos-rapid-scan)
    - [📑 5. Laporan \& Export Excel Multisheet](#-5-laporan--export-excel-multisheet)
    - [📅 6. Kalender Hijriyah Pesantren](#-6-kalender-hijriyah-pesantren)
    - [👤 7. Manajemen Profil \& Kredensial](#-7-manajemen-profil--kredensial)
  - [🏗️ Arsitektur \& Struktur Direktori](#️-arsitektur--struktur-direktori)
  - [🛠️ Teknologi \& Dependensi Utama](#️-teknologi--dependensi-utama)
  - [💡 Algoritma \& Fitur Unggulan](#-algoritma--fitur-unggulan)
    - [1. Kalkulasi Astronomi Waktu Istiwa' (WIS)](#1-kalkulasi-astronomi-waktu-istiwa-wis)
    - [2. Smart Sync Massal Excel-to-PocketBase](#2-smart-sync-massal-excel-to-pocketbase)
    - [3. Export Excel Multi-Sheet Bergambar \& Barcode Code39](#3-export-excel-multi-sheet-bergambar--barcode-code39)
    - [4. Integrasi Native Tauri \& Auto Backup](#4-integrasi-native-tauri--auto-backup)
  - [⚙️ Panduan Instalasi \& Pengembangan](#️-panduan-instalasi--pengembangan)
    - [Prasyarat Sistem](#prasyarat-sistem)
    - [Langkah-Langkah Setup](#langkah-langkah-setup)
  - [🔑 Variabel Lingkungan (.env)](#-variabel-lingkungan-env)
  - [🗄️ Skema Koleksi PocketBase](#️-skema-koleksi-pocketbase)
  - [📄 Lisensi](#-lisensi)

---

## ✨ Fitur Utama

### 🛡️ 1. Otentikasi & Keamanan Sesi (RBAC)
- **Role-Based Access Control**: Mendukung role `admin`, `admin_rambut`, `rambut` (petugas), dan `umum`.
- **Manajemen Sesi Aman**: Menggunakan `sessionStorage` terenkripsi via SDK PocketBase dengan auto-logout untuk akun non-aktif.
- **Proteksi Rute**: Guard Rute berbasis role yang mencegah akses tanpa wewenang.

### 📊 2. Dashboard Executive Real-Time
- **Sapaan & Live Clock WIS**: Jam digital Waktu Istiwa' Sidogiri yang berdetak real-time tanpa re-render berlebih.
- **Statistik Santri Mukim & LPPS**: Ringkasan otomatis sebaran santri PPS (Daerah A–T, Z) dan LPPS.
- **Sebaran Tingkatan & Kompleks**: Visualisasi persentase jenjang pendidikan (Idadiyah, Ibtidaiyah, Tsanawiyah, Aliyah, Kuliah Syariah).
- **Live Feed Activity Log**: Log aktivitas pendaftaran pengguna baru secara real-time.

### 🗄️ 3. Pusat Data Master Santri
- **Pencarian & Multi-Filter**: Filter dinamis (cascading) berdasarkan Status Aktif, Tingkatan, Kelas, Status Domisili, dan Daerah.
- **Smart Excel Import**: Sinkronisasi massal data santri berbasis file Excel `YYYY-MM-DD-database.xlsx` dengan deteksi *Inserted*, *Updated*, *Soft-Deleted*, dan *Skipped*.
- **Detail Modal Santri**: Informasi lengkap identitas kependudukan (NIK, KK, NISN), data wali, serta histori update.

### ✂️ 4. Layanan Perapian Rambut & POS Rapid Scan
- **POS Scan Barcode**: Scan kartu santri berkecepatan tinggi dengan umpan balik audio (Web Audio API) dan cetak struk otomatis.
- **Siklus Periode Setoran**: Pengelolaan periode perapian rambut Hijriyah dengan validasi irisan tanggal syariat (29/30 hari).
- **Sistem Dispensasi & Verifikasi**: Opsi pemberian izin resmi (dispensasi) dan verifikasi perapian rambut dengan timestamp WIS.
- **Import & Kelola Pengurus**: Manajemen petugas cukur dan import data pengurus via Excel.

### 📑 5. Laporan & Export Excel Multisheet
- **Laporan Komprehensif**: Rekapitulasi target wajib setor, santri belum/sudah setor, serta log riwayat transaksi.
- **Export Workbook ExcelJS**: Menghasilkan file Excel profesional dengan 4 Sheet:
  1. *Rekapitulasi*: KPI Cards & Donut Chart Distribusi (HTML5 Canvas).
  2. *Daftar Wajib Setor*: Tabel antrean lengkap dengan styling zebra.
  3. *Riwayat Setor Rambut*: Audit trail transaksi lengkap dengan Waktu Istiwa'.
  4. *Pengurus & Petugas*: Daftar petugas beserta gambar Barcode Code39 otomatis.

### 📅 6. Kalender Hijriyah Pesantren
- **Tampilan Dinding (Grid)**: Preview kalender dinding bulanan dengan penanda khusus hari Jumat dan hari ini.
- **Mapping Titik Jepit Masehi-Hijriyah**: Generator pemetaan tanggal Masehi ke Hijriyah resmi Pondok Pesantren Sidogiri.

### 👤 7. Manajemen Profil & Kredensial
- **Edit Profil & Foto**: Pengubahan nama lengkap dan pas foto profil dengan pratinjau langsung.
- **Ganti & Reset Password**: Fitur ubah kata sandi mandiri dan reset kata sandi oleh administrator.

---

## 🏗️ Arsitektur & Struktur Direktori

Proyek ini dibangun dengan arsitektur **Feature-First / Domain-Driven Modular**, memisahkan logika bisnis ke dalam direktori fitur yang mandiri di bawah `src/features/`.

```
tibkam1745/
├── generate-tree.js           # Script pembentuk struktur pohon direktori
├── generate-types.js          # Generator TypeScript types dari PocketBase
├── index.html                 # Entry point HTML utama
├── package.json               # Konfigurasi dependensi & npm scripts
├── postcss.config.js          # Konfigurasi PostCSS & Tailwind
├── tailwind.config.js         # Konfigurasi Tailwind CSS
├── tsconfig.json              # Konfigurasi TypeScript Compiler
├── vite.config.ts             # Konfigurasi Vite & Build Targets
│
├── src/
│   ├── main.tsx               # Point masuk React DOM & QueryClientProvider
│   ├── App.tsx                # Rute navigasi aplikasi (React Router)
│   ├── index.css              # Style global & kustomisasi scrollbar
│   ├── vite-env.d.ts          # Deklarasi tipe Vite
│   │
│   ├── components/
│   │   └── shared/            # Komponen reusabel lintas modul
│   │       ├── BaseModal.tsx                  # Wrapper modal dengan Framer Motion
│   │       ├── BaseToolbar.tsx                # Input pencarian & toolbar universal
│   │       ├── CustomDatePickerHijriyah.tsx   # Picker tanggal Hijriyah
│   │       ├── CustomDatePickerMasehi.tsx     # Picker tanggal Masehi dengan Masehi-Hijri
│   │       ├── HijriText.tsx                  # Text renderer konversi Masehi ke Hijri
│   │       ├── NotificationToast.tsx          # Pop-up notifikasi toast portal
│   │       └── PageTransition.tsx             # Transisi animasi antar halaman
│   │
│   ├── context/
│   │   └── ToastContext.tsx   # Context provider untuk notifikasi toast global
│   │
│   ├── features/              # Arsitektur Berbasis Fitur (Feature Modules)
│   │   ├── auth/              # Modul Otentikasi & Guard Rute
│   │   ├── dashboard/         # Modul Dashboard Executive & Stat Summary
│   │   ├── kalender/          # Modul Kalender Hijriyah & Grid Preview
│   │   ├── laporan/           # Modul Laporan & Export ExcelJS Multisheet
│   │   ├── master/            # Modul Pusat Data Induk Santri & Smart Import
│   │   ├── profile/           # Modul Pengaturan Profil & Kata Sandi
│   │   ├── rambut/            # Modul Layanan Perapian Rambut & POS Rapid Scan
│   │   └── users/             # Modul Manajemen Pengguna & Otorisasi
│   │
│   ├── hooks/                 # Custom React Hooks Global
│   │   ├── useAutoBackup.ts   # Silent auto-backup DB lokal via Tauri Rust
│   │   ├── usePrinter.ts      # Integrasi printer POS termal
│   │   └── useWaktuIstiwa.ts  # Hook real-time jam Waktu Istiwa' Sidogiri
│   │
│   ├── layouts/
│   │   └── DashboardLayout/   # Layout utama aplikasi dengan Sidebar collapsible
│   │
│   ├── lib/
│   │   └── pocketbase.ts      # Client SDK PocketBase & Session Storage
│   │
│   ├── types/                 # Definisi Tipe TypeScript
│   │   ├── pocketbase-types.ts# Type auto-generated dari PocketBase DB
│   │   └── printer.ts         # Tipe konfigurasi mode printer POS
│   │
│   └── utils/                 # Utility Functions Global
│       ├── dateHelpers.ts     # Parsing & formatting tanggal lokal (Bebas UTC Offset Bug)
│       ├── errorHandler.ts    # Parser error PocketBase Client
│       ├── printer.ts         # Utility eksekusi cetak struk (Tauri/Browser)
│       ├── userHelpers.ts     # Constants & badge styling role
│       └── waktuIstiwa.ts     # Formula Astronomi Jean Meeus Waktu Istiwa'
│
└── src-tauri/                 # Backend Rust (Desktop Application Shell)
    ├── Cargo.toml             # Manifest dependensi Rust & Tauri
    ├── tauri.conf.json        # Konfigurasi Tauri Desktop
    └── src/
        ├── lib.rs             # Application runner & lifecycle handler
        ├── main.rs            # Entry point Rust binary
        ├── state.rs           # State management proses PocketBase
        ├── commands/          # Command Handler Tauri (Printer & Backup)
        └── services/          # Service Layer Rust (PocketBase Spawn, Backup, Printer)
```

---

## 🛠️ Teknologi & Dependensi Utama

| Kategori | Teknologi / Library | Versi | Kegunaan |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.2.7` | Framework UI Utama |
| **Language** | TypeScript | `^6.0.3` | Type Safety & Developer Experience |
| **Build Tool** | Vite | `^8.1.3` | Bundler & Development Server super cepat |
| **Desktop Shell** | Tauri | `^2.11.3` | Native Desktop Application Wrapper (Rust) |
| **Backend / DB** | PocketBase | `^0.27.0` | Embedded SQLite, Auth, & Realtime API |
| **Styling** | Tailwind CSS | `^4.3.2` | Utility-first CSS Framework |
| **Animation** | Framer Motion | `^12.42.2` | Animasi UI & Transisi Halaman |
| **State & Query** | TanStack React Query | `^5.101.2` | Server State Management & Caching |
| **Routing** | React Router DOM | `^7.18.1` | Navigasi SPA (HashRouter Mode) |
| **Form & Validation**| React Hook Form + Zod | `^7.82.0` / `^4.4.3` | Penanganan Form & Validasi Skema |
| **Excel Export** | ExcelJS / SheetJS (XLSX) | `^4.4.0` / `^0.18.5` | Generator Workbook Excel Multisheet & Reader |
| **Icons** | Lucide React | `^1.23.0` | Set Ikon Modern & Konsisten |

---

## 💡 Algoritma & Fitur Unggulan

### 1. Kalkulasi Astronomi Waktu Istiwa' (WIS)
Lokasi Masjid Jami' Sidogiri berada pada koordinat bujur **112°50'09.38" E** (112.8359388° E). Sistem mengimplementasikan algoritma presisi tinggi berbasis **Astronomi Jean Meeus (NOAA/NASA)** di file `src/utils/waktuIstiwa.ts` untuk menghitung *Equation of Time (EoT)*:

$$\text{EoT} = y \sin(2L_0) - 2e \sin(M) + 4e y \sin(M) \cos(2L_0) - \frac{1}{2} y^2 \sin(4L_0) - \frac{5}{4} e^2 \sin(2M)$$

Hasil kalkulasi dikalibrasi dengan selisih bujur terhadap WIB (105° E) untuk memberikan jam Istiwa' berakurasi tinggi tingkat observatorium.

### 2. Smart Sync Massal Excel-to-PocketBase
Proses import file `YYYY-MM-DD-database.xlsx` di modul Master (`src/features/master/utils/syncExcelToPocketBase.ts`) menggunakan algoritma perbandingan memori (*In-Memory Hash Map*) dan *Batch Chunk Transaction* (150 item/batch):
- **Baru**: ID PPS belum ada di DB ➔ Auto Create (`status_aktif = true`).
- **Pembaruan**: ID PPS sudah ada & data berubah ➔ Auto Update.
- **Soft Delete**: ID PPS ada di DB tapi tidak tercantum di file Excel terbaru ➔ Auto Soft Delete (`status_aktif = false`).
- **Skipped**: Data identik ➔ Dilewati tanpa beban kueri DB.

### 3. Export Excel Multi-Sheet Bergambar & Barcode Code39
Di modul Laporan (`src/features/laporan/utils/exportRambutExcel.ts`), sistem membuat workbook ExcelJS yang siap cetak A4 Landscape:
- **Sheet 1 (Rekapitulasi)**: Menampilkan KPI Cards dan grafik Donut Chart berbasis HTML5 Canvas murni yang di-render ke gambar Base64 PNG.
- **Sheet 2 & 3 (Data & Log Audit)**: Ditulis dengan format tabel profesional, rumus `SUBTOTAL` otomatis, dan styling zebra.
- **Sheet 4 (Pengurus)**: Generasi gambar Barcode Code39 otomatis untuk setiap ID PPS pengurus.

### 4. Integrasi Native Tauri & Auto Backup
- **Silent Thermal Print**: Menembak gambar struk Base64 langsung ke printer thermal POS Windows tanpa dialog print lewat sidecar Rust (`printer_service.exe`).
- **Silent Auto-Backup**: Setiap kali aplikasi dibuka, hook `useAutoBackup` memicu fungsi Rust untuk mengkopi file `data.db` ke folder `Documents/Tibkam1745_Backups/` dengan rotasi otomatis menyimpan 7 cadangan harian terakhir.

---

## ⚙️ Panduan Instalasi & Pengembangan

### Prasyarat Sistem
- **Node.js**: Versi `18.x` atau lebih baru
- **npm**: Versi `9.x` atau lebih baru
- **Rust Toolchain**: (Jika ingin melakukan build desktop Tauri)

### Langkah-Langkah Setup

1. **Clone Repositori**:
   ```bash
   git clone [https://github.com/username/tibkam1745.git](https://github.com/username/tibkam1745.git)
   cd tibkam1745
   ```

2. **Instal Dependensi**:
   ```bash
   npm install
   ```

3. **Pengembangan Frontend (Mode Web / Browser)**:
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses melalui `http://localhost:5173`.

4. **Generate TypeScript Types dari PocketBase**:
   ```bash
   npm run typegen
   ```

5. **Build Produksi Web**:
   ```bash
   npm run build
   ```

6. **Pengembangan Desktop (Tauri)**:
   ```bash
   npx tauri dev
   ```

7. **Build Binary Installer Desktop (.exe / .msi)**:
   ```bash
   npx tauri build
   ```

---

## 🔑 Variabel Lingkungan (.env)

Buat file `.env` di root proyek untuk mengonfigurasi koneksi PocketBase dan script generator tipe:

```env
# URL Instance PocketBase Server
VITE_PB_URL=[http://127.0.0.1:8090](http://127.0.0.1:8090)

# Kredensial Admin untuk Script pocketbase-typegen
PB_URL=[http://127.0.0.1:8090](http://127.0.0.1:8090)
PB_EMAIL=admin@tibkam.local
PB_PASSWORD=password_admin_rahasia
```

---

## 🗄️ Skema Koleksi PocketBase

Aplikasi ini mengandalkan skema koleksi berikut pada PocketBase:

| Nama Koleksi | Tipe | Deskripsi Utama |
| :--- | :--- | :--- |
| `users` | Auth | Pengguna sistem (`admin`, `admin_rambut`, `rambut`, `umum`) |
| `master` | Base | Database induk seluruh santri (Mukim & LPPS) |
| `periode_rambut` | Base | Periode perapian rambut bulanan (`draft`, `aktif`, `selesai`) |
| `wajib_setor_rambut` | Base | Antrean santri & pengurus wajib setor per periode |
| `riwayat_setor_rambut` | Base | Log transaksi audit trail setoran perapian rambut |
| `pengurus_santri` | Base | Registrasi pengurus/petugas pondok |
| `kalender_hijriyah` | Base | Pemetaan tanggal Masehi ke Hijriyah resmi Sidogiri |

---

## 📄 Lisensi

Copyright (c) 2026 annaqibz01. All rights reserved.

This software and all associated documentation files are the intellectual property 
of annaqibz01.

Unauthorized copying, modification, distribution, sublicensing, or reverse 
engineering of this software, via any medium, is strictly prohibited. 
Any use of this software without prior written permission is a violation 
of copyright law.