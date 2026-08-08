// src/features/laporan/utils/exportRambutExcel.ts
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { capitalizeText, formatDateHijri, sanitizeFileName } from "../../core/utils/excelHelpers";
import { buildSummarySheet } from "./sheets/summarySheet";
import { buildQueueSheet } from "./sheets/queueSheet";
import { buildRiwayatSheet } from "./sheets/riwayatSheet";
import { buildPengurusSheet } from "./sheets/pengurusSheet";
import type { PeriodeRambutResponse } from "@/types/pocketbase-types";
import type { WajibSetorExpanded, RiwayatSetorExpanded } from "@/features/rambut/hooks/useRambut";

export interface ExportRambutParams {
  periode: PeriodeRambutResponse | null;
  queueData: WajibSetorExpanded[];
  riwayatData: RiwayatSetorExpanded[];
  pengurusData?: any[];
  stats: { total: number; sudah: number; belum: number; dispensasi: number };
}

export const exportRambutToExcel = async ({
  periode,
  queueData,
  riwayatData,
  pengurusData,
  stats,
}: ExportRambutParams): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Pondok Pesantren Sidogiri - TIBKAM 1745";
  workbook.created = new Date();

  const namaPeriode = capitalizeText(periode?.nama_periode || "Semua Periode");
  const todayMasehi = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const todayHijri = await formatDateHijri(new Date().toISOString());
  const tanggalExport = todayHijri !== "-" ? `${todayHijri} (${todayMasehi})` : todayMasehi;

  // Render Ke-4 Sheet Modular
  buildSummarySheet(workbook, namaPeriode, tanggalExport, stats, queueData);
  await buildQueueSheet(workbook, namaPeriode, tanggalExport, queueData);
  await buildRiwayatSheet(workbook, namaPeriode, tanggalExport, riwayatData);
  await buildPengurusSheet(workbook, namaPeriode, tanggalExport, pengurusData);

  // Trigger Download
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Laporan_Rambut_${sanitizeFileName(namaPeriode)}.xlsx`);
};