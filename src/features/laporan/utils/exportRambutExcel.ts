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

// 🎨 PALET WARNA & STYLES PREMIUM (Tema Sidogiri Emerald & Slate)
const COLOR_PRIMARY = "1B4D3E";     // Dark Emerald Green (Header Utama)
const COLOR_SECONDARY = "0F766E";   // Deep Teal (Header Sub-Tabel)
const COLOR_ZEBRA_FILL = "F8FAFC";  // Slate-50 Soft Gray
const COLOR_BORDER = "CBD5E1";      // Slate-300 Clear Border

// Warna Badge Status
const STATUS_STYLES = {
  sudah: { fill: "DCFCE7", color: "15803D" },      // Soft Green
  belum: { fill: "FEE2E2", color: "B91C1C" },      // Soft Red
  dispensasi: { fill: "FEF3C7", color: "B45309" }, // Soft Amber/Yellow
} as const;

// Border Tipis Slate
const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: COLOR_BORDER } },
  left: { style: "thin", color: { argb: COLOR_BORDER } },
  bottom: { style: "thin", color: { argb: COLOR_BORDER } },
  right: { style: "thin", color: { argb: COLOR_BORDER } },
};

// 🖨️ HELPER: PENGATURAN CETAK KERTAS A4
const applyA4PrintSetup = (
  worksheet: ExcelJS.Worksheet,
  orientation: "portrait" | "landscape" = "landscape",
  headerRowNumber: number = 4,
  strictSinglePage: boolean = false
) => {
  worksheet.pageSetup = {
    paperSize: 9, // 9 = Kertas A4
    orientation: orientation,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: strictSinglePage ? 1 : 0, // Strict 1 Halaman Pas untuk Rekapitulasi
    margins: {
      left: 0.4,
      right: 0.4,
      top: 0.5,
      bottom: 0.5,
      header: 0.2,
      footer: 0.2,
    },
    printTitlesRow: `${headerRowNumber}:${headerRowNumber}`,
  };

  worksheet.headerFooter = {
    oddFooter: '&L&"Segoe UI,Regular"&8TIBKAM 1745 - PONDOK PESANTREN SIDOGIRI&C&"Segoe UI,Regular"&8Halaman &P dari &N&R&8Tgl Cetak: &D',
    evenFooter: '&L&"Segoe UI,Regular"&8TIBKAM 1745 - PONDOK PESANTREN SIDOGIRI&C&"Segoe UI,Regular"&8Halaman &P dari &N&R&8Tgl Cetak: &D',
  };
};

// 📏 HELPER: AUTO FIT LEBAR KOLOM DINAMIS
const autoFitColumnWidths = (
  worksheet: ExcelJS.Worksheet,
  minWidthMap: Record<number, number> = {},
  maxWidthMap: Record<number, number> = {}
) => {
  worksheet.columns?.forEach((column, colIndex) => {
    const colNum = colIndex + 1;
    let maxLen = 0;

    column.eachCell?.({ includeEmpty: true }, (cell, rowNum) => {
      if (rowNum <= 3) return; // Abaikan baris judul Kop atas

      const cellValue = cell.value ? cell.value.toString() : "";
      if (cellValue.length > maxLen) {
        maxLen = cellValue.length;
      }
    });

    const minW = minWidthMap[colNum] ?? 10;
    const maxW = maxWidthMap[colNum] ?? 35;

    const calculatedWidth = Math.max(maxLen + 4, minW);
    column.width = Math.min(calculatedWidth, maxW);
  });
};

// 🛠️ HELPER UTILITIES DATA & CACHING HIJRIYAH
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
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

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

const formatDateHijri = async (
  dateStr?: string | null,
  includeTime: boolean = false
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

  return formatDateClean(dateStr);
};

const parseIdPps = (val?: string | number | null): string | number => {
  if (!val) return "-";
  const num = Number(val);
  return !isNaN(num) ? num : String(val);
};

const sanitizeFileName = (str: string): string => str.replace(/[^a-zA-Z0-9_-]/g, "_");

// 🚀 EXPORT MAIN FUNCTION
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
  workbook.creator = "Pondok Pesantren Sidogiri - TIBKAM 1745";
  workbook.created = new Date();

  const namaPeriode = capitalizeText(periode?.nama_periode || "Semua Periode");

  const todayHijri = await getHijriDateString(new Date());
  const todayMasehi = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const tanggalExport = todayHijri ? `${todayHijri} (${todayMasehi})` : todayMasehi;

  const applyHeaderStyle = (row: ExcelJS.Row, bgHex: string = COLOR_PRIMARY) => {
    row.height = 28;
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: bgHex },
      };
      cell.font = { name: "Segoe UI", size: 10.5, bold: true, color: { argb: "FFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = THIN_BORDER;
    });
  };

  // =========================================================================
  // SHEET 1: REKAPITULASI (EXECUTIVE REPORT - 1 LEMBAR A4 LANDSCAPE)
  // =========================================================================
  const wsSummary = workbook.addWorksheet("Rekapitulasi", {
    views: [{ showGridLines: true }],
  });

  // Strict 1 Halaman A4 Landscape Pas
  applyA4PrintSetup(wsSummary, "landscape", 1, true);

  // 1. KOP JUDUL UTAMA
  wsSummary.addRow(["LAPORAN REKAPITULASI SETORAN RAMBUT SANTRI"]).font = {
    name: "Segoe UI", size: 16, bold: true, color: { argb: COLOR_PRIMARY },
  };
  wsSummary.addRow([`PONDOK PESANTREN SIDOGIRI - TIBKAM 1745  |  Periode: ${namaPeriode}  |  Tanggal Export: ${tanggalExport}`]).font = {
    name: "Segoe UI", size: 10, italic: true, color: { argb: "475569" },
  };
  wsSummary.addRow([]); // Blank Row 3

  // 2. KELOMPOK TABEL I: METRIK KINERJA UTAMA (Baris 4-9)
  wsSummary.addRow(["I. RINGKASAN METRIK KINERJA UTAMA"]).font = {
    name: "Segoe UI", size: 11, bold: true, color: { argb: COLOR_PRIMARY },
  };

  const headerTable1 = wsSummary.addRow(["Status Setor", "Jumlah (Santri)", "Persentase (%)", "", "", ""]);
  applyHeaderStyle(headerTable1, COLOR_PRIMARY);

  // Merge Header Tabel I agar Melebar Rapi
  wsSummary.mergeCells("A5:C5");
  wsSummary.mergeCells("D5:F5");
  headerTable1.getCell(1).value = "Status Setor Santri";
  headerTable1.getCell(2).value = "Jumlah (Santri)";
  headerTable1.getCell(3).value = "Persentase (%)";

  const t1Data = [
    ["Sudah Setor", stats.sudah, stats.total > 0 ? stats.sudah / stats.total : 0],
    ["Belum Setor", stats.belum, stats.total > 0 ? stats.belum / stats.total : 0],
    ["Dispensasi", stats.dispensasi, stats.total > 0 ? stats.dispensasi / stats.total : 0],
    ["Total Target Wajib Setor", stats.total, 1],
  ];

  t1Data.forEach((r, idx) => {
    const row = wsSummary.addRow([r[0], "", r[1], "", r[2], ""]);
    row.height = 22;
    const isTotal = idx === 3;
    const rNum = row.number;

    wsSummary.mergeCells(`A${rNum}:B${rNum}`);
    wsSummary.mergeCells(`C${rNum}:D${rNum}`);
    wsSummary.mergeCells(`E${rNum}:F${rNum}`);

    const c1 = row.getCell(1);
    const c3 = row.getCell(3);
    const c5 = row.getCell(5);

    c1.font = { name: "Segoe UI", size: 10, bold: isTotal };
    c3.font = { name: "Segoe UI", size: 10, bold: isTotal };
    c5.font = { name: "Segoe UI", size: 10, bold: isTotal };

    c1.alignment = { horizontal: "left", vertical: "middle" };
    c3.alignment = { horizontal: "right", vertical: "middle" };
    c5.alignment = { horizontal: "right", vertical: "middle" };

    c3.numFmt = "#,##0";
    c5.numFmt = "0.0%";

    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = THIN_BORDER;
      if (isTotal) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "E2E8F0" } };
      } else if (idx % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ZEBRA_FILL } };
      }
    });
  });

  wsSummary.addRow([]); // Blank Row 11

  // 3. KALKULASI & KELOMPOK TABEL II: RINCIAN PER KATEGORI (Baris 12-18)
  const katMap: Record<string, { sudah: number; belum: number; dispensasi: number; total: number }> = {
    aliyah: { sudah: 0, belum: 0, dispensasi: 0, total: 0 },
    kuliah_syariah: { sudah: 0, belum: 0, dispensasi: 0, total: 0 },
    pengurus_petugas: { sudah: 0, belum: 0, dispensasi: 0, total: 0 },
  };

  queueData.forEach((item) => {
    const k = item.kategori_wajib || "aliyah";
    if (!katMap[k]) katMap[k] = { sudah: 0, belum: 0, dispensasi: 0, total: 0 };
    katMap[k].total++;
    if (item.status_setor === "sudah") katMap[k].sudah++;
    else if (item.status_setor === "dispensasi") katMap[k].dispensasi++;
    else katMap[k].belum++;
  });

  wsSummary.addRow(["II. RINCIAN PER KATEGORI WAJIB SETOR"]).font = {
    name: "Segoe UI", size: 11, bold: true, color: { argb: COLOR_PRIMARY },
  };

  const headerTable2 = wsSummary.addRow(["Kategori Wajib Setor", "Sudah Setor", "Belum Setor", "Dispensasi", "Total Target", "Capaian (%)"]);
  applyHeaderStyle(headerTable2, COLOR_SECONDARY);

  const katListKeys: Array<keyof typeof katMap> = ["aliyah", "kuliah_syariah", "pengurus_petugas"];
  katListKeys.forEach((key, idx) => {
    const d = katMap[key];
    const capaianKat = d.total > 0 ? d.sudah / d.total : 0;
    const row = wsSummary.addRow([
      KATEGORI_LABEL_MAP[key] || key,
      d.sudah,
      d.belum,
      d.dispensasi,
      d.total,
      capaianKat,
    ]);
    row.height = 22;

    row.eachCell((cell, colNum) => {
      cell.font = { name: "Segoe UI", size: 10 };
      cell.border = THIN_BORDER;
      if (colNum === 1) cell.alignment = { horizontal: "left", vertical: "middle" };
      else cell.alignment = { horizontal: "right", vertical: "middle" };

      if ([2, 3, 4, 5].includes(colNum)) cell.numFmt = "#,##0";
      if (colNum === 6) cell.numFmt = "0.0%";

      if (idx % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ZEBRA_FILL } };
      }
    });
  });

  // Baris Total Tabel II
  const totalKatRow = wsSummary.addRow([
    "Total Keseluruhan",
    stats.sudah,
    stats.belum,
    stats.dispensasi,
    stats.total,
    stats.total > 0 ? stats.sudah / stats.total : 0,
  ]);
  totalKatRow.height = 24;
  totalKatRow.eachCell((cell, colNum) => {
    cell.font = { name: "Segoe UI", size: 10, bold: true };
    cell.border = THIN_BORDER;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "E2E8F0" } };
    if (colNum === 1) cell.alignment = { horizontal: "left", vertical: "middle" };
    else cell.alignment = { horizontal: "right", vertical: "middle" };

    if ([2, 3, 4, 5].includes(colNum)) cell.numFmt = "#,##0";
    if (colNum === 6) cell.numFmt = "0.0%";
  });

  // Atur Lebar Kolom Proporsional Memenuhi A4 Landscape
  wsSummary.getColumn(1).width = 30; // Kategori / Status
  wsSummary.getColumn(2).width = 18; // Sudah / Detail
  wsSummary.getColumn(3).width = 18; // Belum
  wsSummary.getColumn(4).width = 18; // Dispensasi
  wsSummary.getColumn(5).width = 20; // Total
  wsSummary.getColumn(6).width = 20; // Capaian

  // =========================================================================
  // SHEET 2: DAFTAR WAJIB SETOR (LANDSCAPE A4)
  // =========================================================================
  const wsQueue = workbook.addWorksheet("Daftar Wajib Setor", {
    views: [{ showGridLines: true, state: "frozen", ySplit: 4 }],
  });

  applyA4PrintSetup(wsQueue, "landscape", 4, false);

  wsQueue.addRow(["DAFTAR TARGET WAJIB SETOR CUKUR RAMBUT SANTRI"]).font = {
    name: "Segoe UI", size: 18, bold: true, color: { argb: COLOR_PRIMARY },
  };
  wsQueue.addRow([`Periode: ${namaPeriode} | Tanggal Export: ${tanggalExport}`]).font = {
    name: "Segoe UI", size: 11, italic: true, color: { argb: "64748B" },
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
    "Tanggal Setor",
    "Keterangan",
  ];
  const headerRowQueue = wsQueue.addRow(headersQueue);
  applyHeaderStyle(headerRowQueue, COLOR_PRIMARY);

  const queueExportData = await Promise.all(
    queueData.map(async (item) => {
      const santri = item.expand?.santri;
      const statusKey = item.status_setor as keyof typeof STATUS_STYLES;
      const statusStyle = STATUS_STYLES[statusKey];
      
      const keteranganText = (item as any).catatan || (item as any).keterangan || "-";
      const tglSetorHijri = await formatDateHijri(item.tanggal_setor, false);

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
      item.tanggalSetor,
      item.keterangan,
    ]);

    row.height = 22;

    row.eachCell((cell, colNum) => {
      cell.font = { name: "Segoe UI", size: 9.5, color: { argb: "1E293B" } };
      cell.border = THIN_BORDER;

      if (index % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ZEBRA_FILL } };
      }

      if ([1, 2, 4, 5, 6, 7, 8, 9].includes(colNum)) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else if (colNum === 10) {
        cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }

      if (colNum === 8 && item.statusStyle) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: item.statusStyle.fill } };
        cell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: item.statusStyle.color } };
      }
    });
  });

  autoFitColumnWidths(
    wsQueue,
    { 1: 5, 2: 10, 3: 22, 4: 16, 5: 14, 6: 8, 7: 8, 8: 14, 9: 16, 10: 25 },
    { 1: 6, 2: 14, 3: 32, 4: 20, 5: 18, 6: 12, 7: 12, 8: 16, 9: 20, 10: 45 }
  );

  // =========================================================================
  // SHEET 3: LOG RIWAYAT TRANSAKSI (LANDSCAPE A4)
  // =========================================================================
  const wsRiwayat = workbook.addWorksheet("Riwayat Setor Rambut", {
    views: [{ showGridLines: true, state: "frozen", ySplit: 4 }],
  });

  applyA4PrintSetup(wsRiwayat, "landscape", 4, false);

  wsRiwayat.addRow(["LOG RIWAYAT AUDIT TRANSAKSI SETOR RAMBUT"]).font = {
    name: "Segoe UI", size: 18, bold: true, color: { argb: COLOR_PRIMARY },
  };
  wsRiwayat.addRow(["Pencatatan real-time petugas eksekutor dan waktu Istiwa"]).font = {
    name: "Segoe UI", size: 11, italic: true, color: { argb: "64748B" },
  };
  wsRiwayat.addRow([]);

  const headersRiwayat = [
    "No", "ID PPS", "Nama Santri", "Petugas Eksekutor", "Tanggal (Hijriyah)", "Waktu WIS", "Catatan Operasional",
  ];
  const headerRowRiwayat = wsRiwayat.addRow(headersRiwayat);
  applyHeaderStyle(headerRowRiwayat, COLOR_SECONDARY);

  const riwayatExportData = await Promise.all(
    riwayatData.map(async (item) => {
      const santri = item.expand?.santri;
      const eksekutor = item.expand?.petugas_eksekutor;

      const eksekutorUsername = eksekutor?.username || "-";
      const tglHijri = await formatDateHijri(item.tanggal_setor, false);

      return {
        idPps: parseIdPps(item.id_pps),
        namaSantri: santri?.nama || "-",
        eksekutor: eksekutorUsername,
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

    row.height = 22;

    row.eachCell((cell, colNum) => {
      cell.font = { name: "Segoe UI", size: 9.5, color: { argb: "1E293B" } };
      cell.border = THIN_BORDER;

      if (index % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ZEBRA_FILL } };
      }

      if ([1, 2, 4, 5, 6].includes(colNum)) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else if (colNum === 7) {
        cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }
    });
  });

  autoFitColumnWidths(
    wsRiwayat,
    { 1: 5, 2: 10, 3: 22, 4: 16, 5: 18, 6: 14, 7: 30 },
    { 1: 6, 2: 14, 3: 38, 4: 22, 5: 22, 6: 18, 7: 45 }
  );

  // =========================================================================
  // DOWNLOAD FILE
  // =========================================================================
  const buffer = await workbook.xlsx.writeBuffer();
  const cleanFileName = `Laporan_Rambut_${sanitizeFileName(namaPeriode)}.xlsx`;
  saveAs(new Blob([buffer]), cleanFileName);
};