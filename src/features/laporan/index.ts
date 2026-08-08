// src/features/laporan/index.ts

// Shared Core Utilities
export * from "./core/utils/excelHelpers";
export * from "./core/utils/generateBarcode";
export * from "./core/utils/generateChart";

// Sub-Modul Rambut
export * from "./rambut/pages/LaporanRambutPage";
export * from "./rambut/hooks/useLaporanRambut";

// Sub-Modul Penyidik (Nanti ditambahkan di sini saat dikembangkan)
// export * from "./penyidik/pages/LaporanPenyidikPage";
// Tambahkan di src/features/laporan/index.ts
export * from "./components/LaporanRedirect";