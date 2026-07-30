// src/features/laporan/utils/excel/excelHelpers.ts
import ExcelJS from "exceljs";
import { fetchHijriByDate } from "@/features/kalender";

export const COLOR_PRIMARY = "1B4D3E";
export const COLOR_SECONDARY = "0F766E";
export const COLOR_ZEBRA_FILL = "F8FAFC";
export const COLOR_BORDER = "CBD5E1";

export const STATUS_STYLES = {
  sudah: { fill: "DCFCE7", color: "15803D" },
  belum: { fill: "FEE2E2", color: "B91C1C" },
  dispensasi: { fill: "FEF3C7", color: "B45309" },
} as const;

export const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: COLOR_BORDER } },
  left: { style: "thin", color: { argb: COLOR_BORDER } },
  bottom: { style: "thin", color: { argb: COLOR_BORDER } },
  right: { style: "thin", color: { argb: COLOR_BORDER } },
};

export const applyA4PrintSetup = (
  worksheet: ExcelJS.Worksheet,
  orientation: "portrait" | "landscape" = "landscape",
  headerRowNumber: number = 4,
  strictSinglePage: boolean = false
) => {
  worksheet.pageSetup = {
    paperSize: 9,
    orientation,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: strictSinglePage ? 1 : 0,
    margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
    printTitlesRow: `${headerRowNumber}:${headerRowNumber}`,
  };

  worksheet.headerFooter = {
    oddFooter: '&L&"Segoe UI,Regular"&8TIBKAM 1745 - PONDOK PESANTREN SIDOGIRI&C&"Segoe UI,Regular"&8Halaman &P dari &N&R&8Tgl Cetak: &D',
    evenFooter: '&L&"Segoe UI,Regular"&8TIBKAM 1745 - PONDOK PESANTREN SIDOGIRI&C&"Segoe UI,Regular"&8Halaman &P dari &N&R&8Tgl Cetak: &D',
  };
};

export const applyHeaderStyle = (row: ExcelJS.Row, bgHex: string = COLOR_PRIMARY) => {
  row.height = 22;
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgHex } };
    cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = THIN_BORDER;
  });
};

export const autoFitColumnWidths = (
  worksheet: ExcelJS.Worksheet,
  minWidthMap: Record<number, number> = {},
  maxWidthMap: Record<number, number> = {}
) => {
  worksheet.columns?.forEach((column, colIndex) => {
    const colNum = colIndex + 1;
    let maxLen = 0;

    column.eachCell?.({ includeEmpty: true }, (cell, rowNum) => {
      if (rowNum <= 3) return;
      const val = cell.value ? cell.value.toString() : "";
      if (val.length > maxLen) maxLen = val.length;
    });

    const minW = minWidthMap[colNum] ?? 10;
    const maxW = maxWidthMap[colNum] ?? 35;
    column.width = Math.min(Math.max(maxLen + 3, minW), maxW);
  });
};

export const capitalizeText = (str?: string | null) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "-");
export const parseIdPps = (val?: string | number | null) => (!val ? "-" : !isNaN(Number(val)) ? Number(val) : String(val));
export const sanitizeFileName = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, "_");

export const getAlamatStr = (santri: any) => {
  if (!santri) return "-";
  const parts = [santri.desa, santri.kecamatan, santri.kabupaten].map((v) => v?.toString().trim()).filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "-";
};

const hijriCache = new Map<string, string | null>();
export const formatDateHijri = async (dateStr?: string | null): Promise<string> => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";

  const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  if (!hijriCache.has(dateKey)) {
    const res = await fetchHijriByDate(d);
    hijriCache.set(dateKey, res?.string_hijri || null);
  }
  return hijriCache.get(dateKey) || `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};