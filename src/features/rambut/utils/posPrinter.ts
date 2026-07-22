// src/features/rambut/utils/posPrinter.ts
import type { 
  RiwayatSetorRambutResponse, 
  MasterResponse, 
  UsersResponse, 
  WajibSetorRambutResponse 
} from '@/types/pocketbase-types';
import { fetchHijriByDate } from '@/features/kalender';
import { executePrint } from '@/utils/printer';
import type { PrintMode } from '@/types/printer';

export type RiwayatSetorExpanded = RiwayatSetorRambutResponse<{
  santri?: MasterResponse;
  petugas_eksekutor?: UsersResponse;
  wajib_setor?: WajibSetorRambutResponse;
}>;

export interface ReceiptDetails {
  idPps: string;
  nama: string;
  kelasTingkatan?: string;
  domisili?: string;
  alamat?: string;
  tanggalHijri?: string;
  waktu?: string;
  penerima?: string;
}

export const getAlamatStr = (santri: any) => {
  if (!santri) return "-";
  const parts = [santri.desa, santri.kecamatan, santri.kabupaten]
    .map((v) => v?.toString().trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "-";
};

/**
 * 🎨 Desain Template Struk 80mm Presisi Fisik (Footer Single Line)
 */
export const buildReceiptHtml = (data: ReceiptDetails) => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Bukti Setor - ${data.idPps}</title>
      <style>
        /* 🎯 SETTING HALAMAN PRINT BROWSER (MODE AUTO) */
        @page {
          size: 80mm auto;
          margin: 0;
        }

        * { 
          box-sizing: border-box; 
          -webkit-font-smoothing: antialiased; 
          font-weight: 800 !important; 
        }

        /* 🎯 KUNCI LEBAR CETAK FISIK KETAT KE 70mm */
        html, body {
          width: 70mm !important;
          max-width: 70mm !important;
          margin: 0 auto !important;
          padding: 1.5mm !important;
          background: #ffffff;
          color: #000000;
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
          line-height: 1.18;
        }

        .receipt-box {
          border: 1.5px solid #000;
          padding: 0.8mm 2mm 1.5mm 2mm;
          width: 100%;
        }

        .text-center { text-align: center; }
        .bold { font-weight: 800; }
        .uppercase { text-transform: uppercase; }

        .logo {
          width: 200px;
          height: auto;
          max-height: 75px;
          display: block;
          margin: -1px auto -4px auto;
          object-fit: contain;
        }

        .title-dept { font-size: 10px; font-weight: 800; letter-spacing: 0.5px; }
        .title-document { font-size: 12px; font-weight: 800; letter-spacing: 0.5px; margin: 1px 0; }
        .divider { border-top: 1.5px dashed #000; margin: 2.5px 0; }

        .info-table { width: 100%; border-collapse: collapse; font-size: 11px; }
        .info-table td { padding: 0.8px 0; vertical-align: top; }
        .label-col { width: 32%; font-weight: 800; }
        .sep-col { width: 5%; text-align: center; }
        .value-col { width: 63%; }

        /* ⚡ FIX FOOTER: MENCEGAH TEXT WRAP KELUAR BARIS */
        .footer-text { 
          font-size: 9px; 
          font-weight: 800; 
          text-align: center; 
          margin-top: 2px;
          white-space: nowrap; 
          letter-spacing: -0.2px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-box">
        <div class="text-center">
          <img src="/logo_struk.svg" alt="Logo" class="logo" />
          <div class="title-dept">KETERTIBAN & KEAMANAN</div>
        </div>
        <div class="divider"></div>
        <div class="text-center title-document">BUKTI SETOR RAMBUT</div>
        <div class="divider"></div>
        <table class="info-table">
          <tr><td class="label-col">ID PPS</td><td class="sep-col">:</td><td class="value-col bold">${data.idPps}</td></tr>
          <tr><td class="label-col">NAMA</td><td class="sep-col">:</td><td class="value-col bold uppercase">${data.nama}</td></tr>
          ${data.kelasTingkatan ? `<tr><td class="label-col">KELAS</td><td class="sep-col">:</td><td class="value-col uppercase">${data.kelasTingkatan}</td></tr>` : ""}
          ${data.domisili ? `<tr><td class="label-col">DOMISILI</td><td class="sep-col">:</td><td class="value-col">${data.domisili}</td></tr>` : ""}
          ${data.alamat ? `<tr><td class="label-col">ALAMAT</td><td class="sep-col">:</td><td class="value-col">${data.alamat}</td></tr>` : ""}
          ${data.tanggalHijri ? `<tr><td class="label-col">TANGGAL</td><td class="sep-col">:</td><td class="value-col bold">${data.tanggalHijri}</td></tr>` : ""}
          ${data.waktu ? `<tr><td class="label-col">WAKTU</td><td class="sep-col">:</td><td class="value-col">${data.waktu}</td></tr>` : ""}
          ${data.penerima ? `<tr><td class="label-col">PENERIMA</td><td class="sep-col">:</td><td class="value-col uppercase">${data.penerima}</td></tr>` : ""}
        </table>
        <div class="divider"></div>
        <div class="footer-text">*** Simpan sebagai bukti setor yang sah ***</div>
      </div>
    </body>
  </html>
`;

export const triggerAutoPrintReceipt = (
  dataOrIdPps: string | ReceiptDetails,
  namaParam?: string,
  waktuParam?: string,
  mode: PrintMode = 'auto'
) => {
  let data: ReceiptDetails;
  if (typeof dataOrIdPps === "object") {
    data = dataOrIdPps;
  } else {
    data = {
      idPps: dataOrIdPps,
      nama: namaParam || "-",
      waktu: waktuParam || "-",
    };
  }

  const htmlContent = buildReceiptHtml(data);
  executePrint(htmlContent, { mode });
};

export const printReceiptFromRiwayatLog = async (log: RiwayatSetorExpanded, mode: PrintMode = 'auto') => {
  const santri = log.expand?.santri;
  const petugas = log.expand?.petugas_eksekutor;

  const kelasVal = santri?.kelas ? `${santri.kelas}` : "";
  const tingkatanVal = santri?.tingkatan || "";
  const kelasTingkatanStr = [kelasVal, tingkatanVal].filter(Boolean).join(" ");

  const hijriData = await fetchHijriByDate(log.tanggal_setor);
  const stringHijri = hijriData?.string_hijri || "-";
  const penerimaJabatan = (petugas?.username || "PETUGAS TIBKAM").toUpperCase();

  triggerAutoPrintReceipt({
    idPps: log.id_pps || santri?.id_pps || "-",
    nama: santri?.nama || "Santri",
    kelasTingkatan: kelasTingkatanStr,
    domisili: santri?.domisili || santri?.status_domisili || "-",
    alamat: getAlamatStr(santri),
    tanggalHijri: stringHijri,
    waktu: log.waktu_wis || "-",
    penerima: penerimaJabatan,
  }, undefined, undefined, mode);
};