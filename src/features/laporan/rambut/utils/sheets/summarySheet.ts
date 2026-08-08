// src/features/laporan/utils/excel/sheets/summarySheet.ts
import ExcelJS from "exceljs";
import {
  COLOR_PRIMARY,
  COLOR_SECONDARY,
  COLOR_ZEBRA_FILL,
  THIN_BORDER,
  applyA4PrintSetup,
  applyHeaderStyle,
} from "../../../core/utils/excelHelpers";
import { generateChartBase64 } from "../../../core/utils/generateChart";
import type { WajibSetorExpanded } from "@/features/rambut/hooks/useRambut";

const renderKpiCard = (
  ws: ExcelJS.Worksheet,
  startCol: string,
  endCol: string,
  startRow: number,
  title: string,
  value: number,
  subtext: string,
  bgHex: string,
  textHex: string,
  borderHex: string
) => {
  const rowVal = startRow + 1;
  const rowSub = startRow + 2;

  ws.mergeCells(`${startCol}${startRow}:${endCol}${startRow}`);
  ws.mergeCells(`${startCol}${rowVal}:${endCol}${rowVal}`);
  ws.mergeCells(`${startCol}${rowSub}:${endCol}${rowSub}`);

  const cTitle = ws.getCell(`${startCol}${startRow}`);
  cTitle.value = title.toUpperCase();
  cTitle.font = { name: "Segoe UI", size: 8.5, bold: true, color: { argb: textHex } };
  cTitle.alignment = { horizontal: "center", vertical: "middle" };

  const cVal = ws.getCell(`${startCol}${rowVal}`);
  cVal.value = value;
  cVal.font = { name: "Segoe UI", size: 18, bold: true, color: { argb: textHex } };
  cVal.alignment = { horizontal: "center", vertical: "middle" };
  cVal.numFmt = "#,##0";

  const cSub = ws.getCell(`${startCol}${rowSub}`);
  cSub.value = subtext;
  cSub.font = { name: "Segoe UI", size: 8.5, italic: true, color: { argb: textHex } };
  cSub.alignment = { horizontal: "center", vertical: "middle" };

  const startColIdx = startCol.charCodeAt(0) - 64;
  const endColIdx = endCol.charCodeAt(0) - 64;

  const cardBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: borderHex } },
    left: { style: "thin", color: { argb: borderHex } },
    bottom: { style: "thin", color: { argb: borderHex } },
    right: { style: "thin", color: { argb: borderHex } },
  };

  for (let r = startRow; r <= rowSub; r++) {
    for (let c = startColIdx; c <= endColIdx; c++) {
      const cell = ws.getCell(r, c);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgHex } };
      cell.border = {
        top: r === startRow ? cardBorder.top : undefined,
        bottom: r === rowSub ? cardBorder.bottom : undefined,
        left: c === startColIdx ? cardBorder.left : undefined,
        right: c === endColIdx ? cardBorder.right : undefined,
      };
    }
  }
};

export const buildSummarySheet = (
  workbook: ExcelJS.Workbook,
  namaPeriode: string,
  tanggalExport: string,
  stats: { total: number; sudah: number; belum: number; dispensasi: number },
  queueData: WajibSetorExpanded[]
) => {
  const ws = workbook.addWorksheet("Rekapitulasi", { views: [{ showGridLines: true }] });
  
  applyA4PrintSetup(ws, "landscape", 1, true);

  // Set Widths A-H (Total ~112 units)
  ws.getColumn(1).width = 28; // Col A: Kategori Wajib Setor
  ws.getColumn(2).width = 12; // Col B: Sub/Padding
  ws.getColumn(3).width = 14; // Col C: Sudah Setor
  ws.getColumn(4).width = 14; // Col D: Belum Setor
  ws.getColumn(5).width = 14; // Col E: Dispensasi
  ws.getColumn(6).width = 16; // Col F: Total Target
  ws.getColumn(7).width = 16; // Col G: Capaian %
  ws.getColumn(8).width = 14; // Col H: Extra

  // 1. KOP JUDUL
  ws.addRow(["PONDOK PESANTREN SIDOGIRI — TIBKAM 1745"]).font = {
    name: "Segoe UI", size: 9, bold: true, color: { argb: "64748B" },
  };
  ws.addRow(["LAPORAN REKAPITULASI & METRIK SETORAN RAMBUT SANTRI"]).font = {
    name: "Segoe UI", size: 15, bold: true, color: { argb: COLOR_PRIMARY },
  };
  ws.addRow([`Periode: ${namaPeriode}   |   Tanggal Export: ${tanggalExport}`]).font = {
    name: "Segoe UI", size: 9.5, italic: true, color: { argb: "475569" },
  };
  ws.addRow([]); // Blank Row 4

  // 2. VISUAL KPI CARDS (Baris 5-7)
  const pctSudah = stats.total > 0 ? ((stats.sudah / stats.total) * 100).toFixed(1) : "0.0";
  const pctBelum = stats.total > 0 ? ((stats.belum / stats.total) * 100).toFixed(1) : "0.0";
  const pctDispensasi = stats.total > 0 ? ((stats.dispensasi / stats.total) * 100).toFixed(1) : "0.0";

  renderKpiCard(ws, "A", "B", 5, "TOTAL TARGET WAJIB SETOR", stats.total, "100.0% Target Terdaftar", "F1F5F9", "1E293B", "94A3B8");
  renderKpiCard(ws, "C", "D", 5, "SUDAH SETOR", stats.sudah, `${pctSudah}% Capaian Tuntas`, "DCFCE7", "15803D", "86EFAC");
  renderKpiCard(ws, "E", "F", 5, "BELUM SETOR", stats.belum, `${pctBelum}% Belum Tindakan`, "FEE2E2", "B91C1C", "FCA5A5");
  renderKpiCard(ws, "G", "H", 5, "DISPENSASI KHUSUS", stats.dispensasi, `${pctDispensasi}% Izin Berhalangan`, "FEF3C7", "B45309", "FDE047");

  ws.getRow(5).height = 15;
  ws.getRow(6).height = 26;
  ws.getRow(7).height = 15;

  ws.addRow([]); // Blank Row 8

  // 3. SECTION I: DIAGRAM DISTRIBUSI (Baris 9)
  ws.addRow(["I. VISUALISASI DIAGRAM DISTRIBUSI SETORAN"]).font = {
    name: "Segoe UI", size: 10.5, bold: true, color: { argb: COLOR_PRIMARY },
  };

  // Embed Donut Chart Image
  const chartBase64 = generateChartBase64(stats.sudah, stats.belum, stats.dispensasi);
  if (chartBase64) {
    const chartImgId = workbook.addImage({
      base64: chartBase64,
      extension: "png",
    });
    ws.addImage(chartImgId, {
      tl: { col: 0.8, row: 9.2 },
      ext: { width: 560, height: 170 }, // Tinggi disesuaikan 170px
      editAs: "oneCell",
    });
  }

  // 11 Baris Kosong khusus untuk menampung gambar chart tanpa menimpa Section II
  for (let i = 0; i < 11; i++) {
    const r = ws.addRow([]);
    r.height = 18;
  }

  // 4. SECTION II: TABEL RINCIAN PER KATEGORI (Dimulai dari Baris 21)
  ws.addRow(["II. RINCIAN METRIK PER KATEGORI WAJIB SETOR"]).font = {
    name: "Segoe UI", size: 10.5, bold: true, color: { argb: COLOR_PRIMARY },
  };

  const headerTable = ws.addRow([
    "Kategori Wajib Setor", "",
    "Sudah Setor",
    "Belum Setor",
    "Dispensasi",
    "Total Target",
    "% Capaian Tuntas", ""
  ]);
  
  applyHeaderStyle(headerTable, COLOR_PRIMARY);
  ws.mergeCells(`A${headerTable.number}:B${headerTable.number}`);
  ws.mergeCells(`G${headerTable.number}:H${headerTable.number}`);

  headerTable.getCell(1).value = "Kategori Wajib Setor";
  headerTable.getCell(3).value = "Sudah Setor";
  headerTable.getCell(4).value = "Belum Setor";
  headerTable.getCell(5).value = "Dispensasi";
  headerTable.getCell(6).value = "Total Target";
  headerTable.getCell(7).value = "% Capaian Tuntas";

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

  const labels: Record<string, string> = {
    aliyah: "Aliyah",
    kuliah_syariah: "Kuliah Syariah",
    pengurus_petugas: "Pengurus / Petugas",
  };

  ["aliyah", "kuliah_syariah", "pengurus_petugas"].forEach((key, idx) => {
    const d = katMap[key];
    const capaianKat = d.total > 0 ? d.sudah / d.total : 0;

    const row = ws.addRow([
      labels[key], "",
      d.sudah,
      d.belum,
      d.dispensasi,
      d.total,
      capaianKat, ""
    ]);
    row.height = 20;
    const rNum = row.number;

    ws.mergeCells(`A${rNum}:B${rNum}`);
    ws.mergeCells(`G${rNum}:H${rNum}`);

    const c1 = row.getCell(1);
    const c3 = row.getCell(3);
    const c4 = row.getCell(4);
    const c5 = row.getCell(5);
    const c6 = row.getCell(6);
    const c7 = row.getCell(7);

    c1.font = { name: "Segoe UI", size: 9.5 };
    c3.font = { name: "Segoe UI", size: 9.5 };
    c4.font = { name: "Segoe UI", size: 9.5 };
    c5.font = { name: "Segoe UI", size: 9.5 };
    c6.font = { name: "Segoe UI", size: 9.5, bold: true };
    c7.font = { name: "Segoe UI", size: 9.5, bold: true };

    c1.alignment = { horizontal: "left", vertical: "middle" };
    c3.alignment = { horizontal: "right", vertical: "middle" };
    c4.alignment = { horizontal: "right", vertical: "middle" };
    c5.alignment = { horizontal: "right", vertical: "middle" };
    c6.alignment = { horizontal: "right", vertical: "middle" };
    c7.alignment = { horizontal: "right", vertical: "middle" };

    c3.numFmt = "#,##0";
    c4.numFmt = "#,##0";
    c5.numFmt = "#,##0";
    c6.numFmt = "#,##0";
    c7.numFmt = "0.0%";

    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = THIN_BORDER;
      if (idx % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ZEBRA_FILL } };
      }
    });
  });

  // Total Row
  const totalRow = ws.addRow([
    "TOTAL KESELURUHAN", "",
    stats.sudah,
    stats.belum,
    stats.dispensasi,
    stats.total,
    stats.total > 0 ? stats.sudah / stats.total : 0, ""
  ]);
  totalRow.height = 22;
  const totNum = totalRow.number;

  ws.mergeCells(`A${totNum}:B${totNum}`);
  ws.mergeCells(`G${totNum}:H${totNum}`);

  totalRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
    cell.font = { name: "Segoe UI", size: 9.5, bold: true };
    cell.border = THIN_BORDER;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "E2E8F0" } };

    if (colNum === 1) cell.alignment = { horizontal: "left", vertical: "middle" };
    else cell.alignment = { horizontal: "right", vertical: "middle" };

    if ([3, 4, 5, 6].includes(colNum)) cell.numFmt = "#,##0";
    if (colNum === 7) cell.numFmt = "0.0%";
  });
};