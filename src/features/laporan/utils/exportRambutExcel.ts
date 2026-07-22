// src/features/laporan/utils/exportRambutExcel.ts
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { fetchHijriByDate } from "@/features/kalender";
import type {
  PeriodeRambutResponse,
  WajibSetorRambutKategoriWajibOptions,
  WajibSetorRambutStatusSetorOptions,
} from "@/types/pocketbase-types";
import type { WajibSetorExpanded, RiwayatSetorExpanded } from "@/features/rambut/hooks/useRambut";

// ==========================================
// 1. PALET WARNA & STYLES (Tema Sidogiri Emerald)
// ==========================================

const COLOR_HEADER_FILL = "1B4D3E"; // Dark Emerald Green
const COLOR_ZEBRA_FILL = "F8FAFC";  // Slate-50 Soft Gray
const COLOR_BORDER = "E2E8F0";      // Gray-200

// Warna Badge Status (Background Soft + Teks Bold)
const STATUS_STYLES = {
  sudah: { fill: "DCFCE7", color: "15803D" },     // Soft Green
  belum: { fill: "FEE2E2", color: "B91C1C" },     // Soft Red
  dispensasi: { fill: "FEF3C7", color: "B45309" },// Soft Yellow/Amber
} as const;

// Border Tipis Abu-abu
const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: COLOR_BORDER } },
  left: { style: "thin", color: { argb: COLOR_BORDER } },
  bottom: { style: "thin", color: { argb: COLOR_BORDER } },
  right: { style: "thin", color: { argb: COLOR_BORDER } },
};

// ==========================================
// 2. HELPER UTILITIES & CACHING HIJRIYAH
// ==========================================

const KATEGORI_LABEL_MAP: Record<string, string> = {
  aliyah: "Aliyah",
  kuliah_syariah: "Kuliah Syariah",
  pengurus_petugas: "Pengurus / Petugas",
};

const STATUS_LABEL_MAP: Record<string, string> = {
  sudah: "SUDAH SETOR",
  belum: "BELUM SETOR",
  dispensasi: "DISPENSASI",
};

const capitalizeText = (str?: string | null): string => {
  if (!str) return "-";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatKategoriLabel = (kat?: WajibSetorRambutKategoriWajibOptions): string =>
  kat ? KATEGORI_LABEL_MAP[kat] ?? capitalizeText(kat) : "-";

const formatStatusLabel = (status?: WajibSetorRambutStatusSetorOptions | string): string =>
  status ? STATUS_LABEL_MAP[status] ?? String(status).toUpperCase() : "-";

const formatDateClean = (dateStr?: string | null): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";

  const pad = (n: number) => String(n).padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Cache internal agar query PocketBase tidak berulang untuk tanggal yang sama
const hijriCache = new Map<string, string | null>();

const getHijriDateString = async (dateInput?: string | Date | null): Promise<string | null> => {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  if (!hijriCache.has(dateKey)) {
    const res = await fetchHijriByDate(d);
    hijriCache.set(dateKey, res?.string_hijri || null);
  }

  return hijriCache.get(dateKey) || null;
};

/**
 * Formatter tanggal ke Hijriyah (+ waktu Masehi)
 * Contoh: "22 Safar 1448 H (17:45)"
 */
const formatDateHijri = async (
  dateStr?: string | null,
  includeTime: boolean = true
): Promise<string> => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";

  const stringHijri = await getHijriDateString(d);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const timeStr = `${hours}:${minutes}`;

  if (stringHijri) {
    return includeTime ? `${stringHijri} (${timeStr})` : stringHijri;
  }

  // Fallback ke Masehi jika record di database kalender_hijriyah belum diset
  return formatDateClean(dateStr);
};

/**
 * Mengonversi nilai ID PPS agar tidak memicu peringatan Segitiga Hijau di Excel
 */
const parseIdPps = (val?: string | number | null): string | number => {
  if (!val) return "-";
  const num = Number(val);
  return !isNaN(num) ? num : String(val);
};

const sanitizeFileName = (str: string): string => str.replace(/[^a-zA-Z0-9_-]/g, "_");

// ==========================================
// 3. MAIN EXPORT FUNCTION
// ==========================================

export interface ExportRambutParams {
  periode: PeriodeRambutResponse | null;
  queueData: WajibSetorExpanded[];
  riwayatData: RiwayatSetorExpanded[];
  stats: {
    total: number;
    sudah: number;
    belum: number;
    dispensasi: number;
  };
}

export const exportRambutToExcel = async ({
  periode,
  queueData,
  riwayatData,
  stats,
}: ExportRambutParams): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Pondok Pesantren Sidogiri";
  workbook.created = new Date();

  const namaPeriode = capitalizeText(periode?.nama_periode || "Semua Periode");

  // Tanggal Cetak menggunakan Format Hijriyah
  const todayHijri = await getHijriDateString(new Date());
  const todayMasehi = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const tanggalExport = todayHijri ? `${todayHijri} (${todayMasehi})` : todayMasehi;

  const applyHeaderStyle = (row: ExcelJS.Row) => {
    row.height = 28;
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLOR_HEADER_FILL },
      };
      cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = THIN_BORDER;
    });
  };

  // --------------------------------------------------------
  // SHEET 1: RINGKASAN REKAPITULASI
  // --------------------------------------------------------
  const wsSummary = workbook.addWorksheet("Ringkasan Rekap", {
    views: [{ showGridLines: true }],
  });

  wsSummary.addRow(["LAPORAN REKAPITULASI PENERTIBAN CUKUR RAMBUT SANTRI"]).font = {
    name: "Segoe UI", size: 14, bold: true, color: { argb: COLOR_HEADER_FILL },
  };
  wsSummary.addRow(["PONDOK PESANTREN SIDOGIRI"]).font = {
    name: "Segoe UI", size: 11, bold: true, color: { argb: "475569" },
  };
  wsSummary.addRow([]);

  wsSummary.addRow(["Periode Ditinjau:", namaPeriode]).font = { name: "Segoe UI", size: 10 };
  wsSummary.addRow(["Tanggal Cetak:", tanggalExport]).font = { name: "Segoe UI", size: 10 };
  wsSummary.addRow([]);

  wsSummary.addRow(["INDIKATOR KINERJA / METRIK UTAMA"]).font = {
    name: "Segoe UI", size: 11, bold: true, color: { argb: COLOR_HEADER_FILL },
  };

  const headerRowSummary = wsSummary.addRow(["Indikator / Metrik", "Jumlah (Santri)", "Persentase (%)"]);
  applyHeaderStyle(headerRowSummary);

  const capaian = stats.total > 0 ? stats.sudah / stats.total : 0;
  const summaryRows = [
    ["Total Target Wajib Setor", stats.total, 1],
    ["Jumlah Sudah Setor", stats.sudah, capaian],
    ["Jumlah Belum Setor", stats.belum, stats.total > 0 ? stats.belum / stats.total : 0],
    ["Jumlah Dispensasi", stats.dispensasi, stats.total > 0 ? stats.dispensasi / stats.total : 0],
  ];

  summaryRows.forEach((r, idx) => {
    const row = wsSummary.addRow(r);
    row.height = 24;

    row.getCell(1).font = { name: "Segoe UI", size: 10, bold: idx === 0 };
    row.getCell(2).font = { name: "Segoe UI", size: 10, bold: idx === 0 };
    row.getCell(3).font = { name: "Segoe UI", size: 10, bold: idx === 0 };

    row.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(2).alignment = { horizontal: "right", vertical: "middle" };
    row.getCell(3).alignment = { horizontal: "right", vertical: "middle" };

    row.getCell(2).numFmt = "#,##0";
    row.getCell(3).numFmt = "0.0%";

    row.eachCell((cell) => {
      cell.border = THIN_BORDER;
      if (idx % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ZEBRA_FILL } };
      }
    });
  });

  wsSummary.getColumn(1).width = 34;
  wsSummary.getColumn(2).width = 20;
  wsSummary.getColumn(3).width = 18;

  // --------------------------------------------------------
  // SHEET 2: DAFTAR WAJIB SETOR (QUEUE)
  // --------------------------------------------------------
  const wsQueue = workbook.addWorksheet("Daftar Wajib Setor", {
    views: [{ showGridLines: true, state: "frozen", ySplit: 4 }],
  });

  wsQueue.addRow(["DAFTAR TARGET WAJIB SETOR CUKUR RAMBUT"]).font = {
    name: "Segoe UI", size: 26, bold: true, color: { argb: COLOR_HEADER_FILL },
  };
  wsQueue.addRow([`Periode: ${namaPeriode}`]).font = {
    name: "Segoe UI", size: 14, italic: true, color: { argb: "64748B" },
  };
  wsQueue.addRow([]);

  const headersQueue = [
    "No",
    "ID PPS",
    "Nama Santri",
    "Kategori Wajib Setor",
    "Tingkatan",
    "Kelas",
    "Domisili",
    "Status Setor",
    "Keterangan",
    "Tanggal Setor",
  ];
  const headerRowQueue = wsQueue.addRow(headersQueue);
  applyHeaderStyle(headerRowQueue);

  // Pre-fetch format tanggal Hijriyah secara async
  const queueExportData = await Promise.all(
    queueData.map(async (item) => {
      const santri = item.expand?.santri;
      const statusKey = item.status_setor as keyof typeof STATUS_STYLES;
      const statusStyle = STATUS_STYLES[statusKey];
      const keteranganText = (item as any).keterangan || (item as any).catatan || "-";
      const tglSetorHijri = await formatDateHijri(item.tanggal_setor);

      return {
        idPps: parseIdPps(item.id_pps),
        nama: santri?.nama || "-",
        kategori: formatKategoriLabel(item.kategori_wajib),
        tingkatan: santri?.tingkatan || "-",
        kelas: santri?.kelas || "-",
        domisili: santri?.domisili || santri?.status_domisili || "-",
        statusSetorText: formatStatusLabel(item.status_setor),
        statusStyle,
        keterangan: keteranganText,
        tanggalSetor: tglSetorHijri,
      };
    })
  );

  queueExportData.forEach((item, index) => {
    const row = wsQueue.addRow([
      index + 1,
      item.idPps,
      item.nama,
      item.kategori,
      item.tingkatan,
      item.kelas,
      item.domisili,
      item.statusSetorText,
      item.keterangan,
      item.tanggalSetor,
    ]);

    row.height = 24;

    row.eachCell((cell, colNum) => {
      cell.font = { name: "Segoe UI", size: 10, color: { argb: "1E293B" } };
      cell.border = THIN_BORDER;

      if (index % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ZEBRA_FILL } };
      }

      if ([1, 2, 5, 6, 10].includes(colNum)) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else if (colNum === 8) {
        // Status Setor Badge
        cell.alignment = { horizontal: "center", vertical: "middle" };
        if (item.statusStyle) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: item.statusStyle.fill } };
          cell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: item.statusStyle.color } };
        }
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }
    });
  });

  // Lebar Kolom Presisi Sheet 2
  wsQueue.getColumn(1).width = 8;   // No
  wsQueue.getColumn(2).width = 16;  // ID PPS
  wsQueue.getColumn(3).width = 32;  // Nama Santri
  wsQueue.getColumn(4).width = 22;  // Kategori Wajib Setor
  wsQueue.getColumn(5).width = 18;  // Tingkatan
  wsQueue.getColumn(6).width = 14;  // Kelas
  wsQueue.getColumn(7).width = 22;  // Domisili
  wsQueue.getColumn(8).width = 18;  // Status Setor
  wsQueue.getColumn(9).width = 32;  // Keterangan
  wsQueue.getColumn(10).width = 28; // Tanggal Setor (Diperlebar untuk format Hijriyah)

  // --------------------------------------------------------
  // SHEET 3: LOG RIWAYAT TRANSAKSI
  // --------------------------------------------------------
  const wsRiwayat = workbook.addWorksheet("Riwayat Setor Rambut", {
    views: [{ showGridLines: true, state: "frozen", ySplit: 4 }],
  });

  wsRiwayat.addRow(["LOG RIWAYAT SETOR RAMBUT"]).font = {
    name: "Segoe UI", size: 26, bold: true, color: { argb: COLOR_HEADER_FILL },
  };
  wsRiwayat.addRow(["Pencatatan real-time petugas eksekutor dan waktu Istiwa"]).font = {
    name: "Segoe UI", size: 14, italic: true, color: { argb: "64748B" },
  };
  wsRiwayat.addRow([]);

  const headersRiwayat = [
    "No", "ID PPS", "Nama Santri", "Petugas Eksekutor", "tanggal", "Waktu", "Catatan",
  ];
  const headerRowRiwayat = wsRiwayat.addRow(headersRiwayat);
  applyHeaderStyle(headerRowRiwayat);

  const riwayatExportData = await Promise.all(
    riwayatData.map(async (item) => {
      const santri = item.expand?.santri;
      const eksekutor = item.expand?.petugas_eksekutor;
      const namaEksekutor = capitalizeText(eksekutor?.name || eksekutor?.username || "-");
      const tglHijri = await formatDateHijri(item.tanggal_setor, false); // Format Tanggal Hijriyah saja

      return {
        idPps: parseIdPps(item.id_pps),
        namaSantri: santri?.nama || "-",
        eksekutor: namaEksekutor,
        tanggalHijri: tglHijri,
        waktuWis: item.waktu_wis || "-",
        catatan: item.catatan || "-",
      };
    })
  );

  riwayatExportData.forEach((item, index) => {
    const row = wsRiwayat.addRow([
      index + 1,
      item.idPps,
      item.namaSantri,
      item.eksekutor,
      item.tanggalHijri,
      item.waktuWis,
      item.catatan,
    ]);

    row.height = 24;

    row.eachCell((cell, colNum) => {
      cell.font = { name: "Segoe UI", size: 10, color: { argb: "1E293B" } };
      cell.border = THIN_BORDER;

      if (index % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ZEBRA_FILL } };
      }

      if ([1, 2, 5, 6].includes(colNum)) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }
    });
  });

  wsRiwayat.getColumn(1).width = 8;
  wsRiwayat.getColumn(2).width = 16;
  wsRiwayat.getColumn(3).width = 32;
  wsRiwayat.getColumn(4).width = 22;
  wsRiwayat.getColumn(5).width = 24; // Tanggal Hijriyah
  wsRiwayat.getColumn(6).width = 18; // Waktu WIS
  wsRiwayat.getColumn(7).width = 38; // Catatan

  // --------------------------------------------------------
  // DOWNLOAD FILE
  // --------------------------------------------------------
  const buffer = await workbook.xlsx.writeBuffer();
  const cleanFileName = `Laporan_Rambut_${sanitizeFileName(namaPeriode)}.xlsx`;
  saveAs(new Blob([buffer]), cleanFileName);
};