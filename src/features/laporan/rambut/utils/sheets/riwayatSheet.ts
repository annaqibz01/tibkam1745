// src/features/laporan/utils/excel/sheets/riwayatSheet.ts
import ExcelJS from "exceljs";
import {
  COLOR_PRIMARY,
  COLOR_SECONDARY,
  COLOR_ZEBRA_FILL,
  THIN_BORDER,
  applyA4PrintSetup,
  applyHeaderStyle,
  autoFitColumnWidths,
  formatDateHijri,
  getAlamatStr,
  parseIdPps,
} from "../../../core/utils/excelHelpers";
import type { RiwayatSetorExpanded } from "@/features/rambut/hooks/useRambut";

export const buildRiwayatSheet = async (
  workbook: ExcelJS.Workbook,
  namaPeriode: string,
  tanggalExport: string,
  riwayatData: RiwayatSetorExpanded[]
) => {
  const ws = workbook.addWorksheet("Riwayat Setor Rambut", { views: [{ showGridLines: true, state: "frozen", ySplit: 4 }] });
  applyA4PrintSetup(ws, "landscape", 4, false);

  ws.addRow(["LOG RIWAYAT AUDIT SETOR RAMBUT"]).font = { name: "Segoe UI", size: 16, bold: true, color: { argb: COLOR_PRIMARY } };
  ws.addRow([`Periode: ${namaPeriode} | Tanggal Export: ${tanggalExport}`]).font = { name: "Segoe UI", size: 10, italic: true, color: { argb: "64748B" } };
  ws.addRow([]);

  const headers = ["No", "ID PPS", "Nama", "Alamat", "Domisili", "Petugas Eksekutor", "Tanggal (Hijriyah)", "Waktu WIS", "Catatan Operasional"];
  applyHeaderStyle(ws.addRow(headers), COLOR_SECONDARY);

  const exportData = await Promise.all(
    riwayatData.map(async (item) => {
      const santri = item.expand?.santri;
      const eksekutor = item.expand?.petugas_eksekutor;
      return {
        idPps: parseIdPps(item.id_pps),
        nama: santri?.nama || "-",
        alamat: getAlamatStr(santri),
        domisili: santri?.domisili || santri?.status_domisili || "-",
        eksekutor: eksekutor?.name || eksekutor?.username || "-",
        tanggalHijri: await formatDateHijri(item.tanggal_setor),
        waktuWis: item.waktu_wis || "-",
        catatan: item.catatan || "-",
      };
    })
  );

  exportData.forEach((item, index) => {
    const currentRowIdx = index + 5;
    const row = ws.addRow([
      { formula: `SUBTOTAL(103, $B$5:B${currentRowIdx})` },
      item.idPps,
      item.nama,
      item.alamat,
      item.domisili,
      item.eksekutor,
      item.tanggalHijri,
      item.waktuWis,
      item.catatan,
    ]);

    row.height = 17;
    row.eachCell((cell, colNum) => {
      cell.font = { name: "Segoe UI", size: 9, color: { argb: "1E293B" } };
      cell.border = THIN_BORDER;
      if (index % 2 === 1) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ZEBRA_FILL } };
      cell.alignment = { horizontal: [1, 2, 5, 7, 8].includes(colNum) ? "center" : "left", vertical: "middle" };
    });
  });

  autoFitColumnWidths(ws, { 1: 5, 2: 10, 3: 22, 4: 18, 5: 10, 6: 16, 7: 16, 8: 14, 9: 25 }, { 1: 6, 2: 14, 3: 35, 4: 30, 5: 14, 6: 22, 7: 20, 8: 18, 9: 45 });
};