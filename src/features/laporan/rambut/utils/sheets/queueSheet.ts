// src/features/laporan/utils/excel/sheets/queueSheet.ts
import ExcelJS from "exceljs";
import {
  COLOR_PRIMARY,
  COLOR_ZEBRA_FILL,
  STATUS_STYLES,
  THIN_BORDER,
  applyA4PrintSetup,
  applyHeaderStyle,
  autoFitColumnWidths,
  formatDateHijri,
  getAlamatStr,
  parseIdPps,
} from "../../../core/utils/excelHelpers";
import type { WajibSetorExpanded } from "@/features/rambut/hooks/useRambut";

export const buildQueueSheet = async (
  workbook: ExcelJS.Workbook,
  namaPeriode: string,
  tanggalExport: string,
  queueData: WajibSetorExpanded[]
) => {
  const ws = workbook.addWorksheet("Daftar Wajib Setor", { views: [{ showGridLines: true, state: "frozen", ySplit: 4 }] });
  applyA4PrintSetup(ws, "landscape", 4, false);

  ws.addRow(["DAFTAR WAJIB SETOR RAMBUT SANTRI PONDOK PESANTREN SIDOGIRI"]).font = { name: "Segoe UI", size: 16, bold: true, color: { argb: COLOR_PRIMARY } };
  ws.addRow([`Periode: ${namaPeriode} | Tanggal Export: ${tanggalExport}`]).font = { name: "Segoe UI", size: 10, italic: true, color: { argb: "64748B" } };
  ws.addRow([]);

  const headers = ["No", "ID PPS", "Nama", "Alamat", "Tingkatan", "Kelas", "Domisili", "Status Setor", "Tanggal Setor", "Keterangan"];
  applyHeaderStyle(ws.addRow(headers), COLOR_PRIMARY);

  const exportData = await Promise.all(
    queueData.map(async (item) => {
      const santri = item.expand?.santri;
      return {
        idPps: parseIdPps(item.id_pps),
        nama: santri?.nama || "-",
        alamat: getAlamatStr(santri),
        tingkatan: santri?.tingkatan || "-",
        kelas: santri?.kelas || "-",
        domisili: santri?.domisili || santri?.status_domisili || "-",
        statusText: item.status_setor === "sudah" ? "SUDAH SETOR" : item.status_setor === "dispensasi" ? "DISPENSASI" : "BELUM SETOR",
        statusStyle: STATUS_STYLES[item.status_setor as keyof typeof STATUS_STYLES],
        keterangan: (item as any).catatan || (item as any).keterangan || "-",
        tanggalSetor: await formatDateHijri(item.tanggal_setor),
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
      item.tingkatan,
      item.kelas,
      item.domisili,
      item.statusText,
      item.tanggalSetor,
      item.keterangan,
    ]);

    row.height = 17;
    row.eachCell((cell, colNum) => {
      cell.font = { name: "Segoe UI", size: 9, color: { argb: "1E293B" } };
      cell.border = THIN_BORDER;
      if (index % 2 === 1) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ZEBRA_FILL } };
      cell.alignment = { horizontal: [1, 2, 5, 6, 7, 8, 9].includes(colNum) ? "center" : "left", vertical: "middle" };

      if (colNum === 8 && item.statusStyle) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: item.statusStyle.fill } };
        cell.font = { name: "Segoe UI", size: 8.5, bold: true, color: { argb: item.statusStyle.color } };
      }
    });
  });

  autoFitColumnWidths(ws, { 1: 5, 2: 10, 3: 22, 4: 18, 5: 14, 6: 8, 7: 8, 8: 14, 9: 16, 10: 22 }, { 1: 6, 2: 14, 3: 32, 4: 30, 5: 18, 6: 12, 7: 12, 8: 16, 9: 20, 10: 40 });
};