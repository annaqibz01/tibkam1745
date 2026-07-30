// src/features/laporan/utils/excel/sheets/pengurusSheet.ts
import ExcelJS from "exceljs";
import { pb } from "@/lib/pocketbase";
import {
  COLOR_PRIMARY,
  COLOR_SECONDARY,
  COLOR_ZEBRA_FILL,
  THIN_BORDER,
  applyA4PrintSetup,
  applyHeaderStyle,
  autoFitColumnWidths,
  getAlamatStr,
  parseIdPps,
} from "../excelHelpers";
import { generateBarcodeBase64 } from "../generateBarcode";

export const buildPengurusSheet = async (
  workbook: ExcelJS.Workbook,
  namaPeriode: string,
  tanggalExport: string,
  pengurusData?: any[]
) => {
  const ws = workbook.addWorksheet("Pengurus & Petugas", {
    views: [{ showGridLines: true, state: "frozen", ySplit: 4 }],
  });

  applyA4PrintSetup(ws, "landscape", 4, false);

  ws.addRow(["DAFTAR PENGURUS DAN PETUGAS WAJIB SETOR PONDOK PESANTREN SIDOGIRI"]).font = {
    name: "Segoe UI",
    size: 16,
    bold: true,
    color: { argb: COLOR_PRIMARY },
  };
  ws.addRow([`Periode: ${namaPeriode} | Tanggal Export: ${tanggalExport}`]).font = {
    name: "Segoe UI",
    size: 10,
    italic: true,
    color: { argb: "64748B" },
  };
  ws.addRow([]);

  const headers = [
    "No",
    "ID PPS",
    "Nama",
    "Jabatan",
    "Domisili",
    "Alamat",
    "Status",
    "Barcode ID PPS",
  ];
  applyHeaderStyle(ws.addRow(headers), COLOR_SECONDARY);

  // Ambil data pengurus jika tidak disediakan oleh caller
  let listPengurus = pengurusData;
  if (!listPengurus || listPengurus.length === 0) {
    try {
      listPengurus = await pb.collection("pengurus_santri").getFullList<any>({
        expand: "santri",
        sort: "-created",
      });
    } catch (e) {
      listPengurus = [];
    }
  }

  listPengurus.forEach((p, index) => {
    const currentRowIdx = index + 5;
    const santri = p.expand?.santri;
    const isAktif = p.status_aktif !== false;

    const row = ws.addRow([
      { formula: `SUBTOTAL(103, $B$5:B${currentRowIdx})` },
      parseIdPps(p.id_pps),
      santri?.nama || "Pengurus / Petugas",
      p.jabatan || "Petugas Cukur",
      santri?.domisili || santri?.status_domisili || "-",
      getAlamatStr(santri),
      isAktif ? "AKTIF" : "PURNA",
      "", // Tempat gambar Barcode
    ]);

    // 🌟 TINGGI BARIS DISAMAKAN: 17pt (Identik dengan Sheet 2 & 3)
    row.height = 17;

    row.eachCell((cell, colNum) => {
      cell.font = { name: "Segoe UI", size: 9, color: { argb: "1E293B" } };
      cell.border = THIN_BORDER;

      if (index % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ZEBRA_FILL } };
      }

      if ([1, 2, 5, 7].includes(colNum)) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }

      if (colNum === 7) {
        cell.font = {
          name: "Segoe UI",
          size: 8.5,
          bold: true,
          color: { argb: isAktif ? "15803D" : "64748B" },
        };
      }
    });

    // Tempelkan gambar Barcode PNG ke kolom H (Disesuaikan untuk tinggi baris 17pt)
    const barcodeBase64 = generateBarcodeBase64(String(p.id_pps || ""));
    if (barcodeBase64) {
      const imageId = workbook.addImage({
        base64: barcodeBase64,
        extension: "png",
      });

      ws.addImage(imageId, {
        tl: { col: 7.05, row: currentRowIdx - 1 + 0.05 },
        ext: { width: 110, height: 20 }, // Ukuran barcode presisi untuk tinggi sel 17pt
        editAs: "oneCell",
      });
    }
  });

  autoFitColumnWidths(
    ws,
    { 1: 5, 2: 10, 3: 22, 4: 18, 5: 10, 6: 18, 7: 10, 8: 20 },
    { 1: 6, 2: 14, 3: 35, 4: 28, 5: 14, 6: 30, 7: 12, 8: 24 }
  );
};