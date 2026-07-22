// src/features/laporan/components/RambutReportPrint.tsx
import React from "react";
import type { PeriodeRambutResponse } from "@/types/pocketbase-types";
import type { WajibSetorExpanded, RiwayatSetorExpanded } from "@/features/rambut";

interface RambutReportPrintProps {
  periode: PeriodeRambutResponse | null;
  queueData: WajibSetorExpanded[];
  riwayatData: RiwayatSetorExpanded[];
  stats: { total: number; sudah: number; belum: number; dispensasi: number };
  reportType: "all" | "belum_setor" | "sudah_setor" | "riwayat";
  filterKategori: string;
}

export const RambutReportPrint = React.forwardRef<HTMLDivElement, RambutReportPrintProps>(
  ({ periode, queueData, riwayatData, stats, reportType, filterKategori }, ref) => {
    const todayStr = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const getJudulLaporan = () => {
      switch (reportType) {
        case "belum_setor": return "LAPORAN DAFTAR SANTRI BELUM SETOR CUKUR RAMBUT";
        case "sudah_setor": return "LAPORAN DAFTAR SANTRI SUDAH SETOR CUKUR RAMBUT";
        case "riwayat": return "LAPORAN LOG RIWAYAT TRANSAKSI SETOR RAMBUT";
        default: return "LAPORAN REKAPITULASI PENERTIBAN CUKUR RAMBUT SANTRI";
      }
    };

    return (
      <div className="hidden">
        <div ref={ref} className="p-8 bg-white text-black font-sans text-xs leading-normal">
          {/* KOP SURAT RESMI */}
          <div className="text-center border-b-2 border-black pb-4 mb-4">
            <h2 className="text-base font-bold uppercase tracking-wider">PONDOK PESANTREN SIDOGIRI</h2>
            <h1 className="text-lg font-black uppercase tracking-tight text-indigo-950">
              KETERTIBAN DAN KEAMANAN (TIBKAM 1745)
            </h1>
            <p className="text-[10px] text-gray-600">
              Sidogiri Krakatau Probolinggo Jawa Timur | Modul Laporan Rambut Santri
            </p>
          </div>

          {/* HEADER METAINFO */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-center underline uppercase mb-3">
              {getJudulLaporan()}
            </h3>
            <table className="w-full text-xs mb-3 border-collapse">
              <tbody>
                <tr>
                  <td className="w-28 font-bold py-0.5">Periode Ditinjau</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5">{periode?.nama_periode || "Semua Periode"}</td>
                  <td className="w-28 font-bold py-0.5">Filter Kategori</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5 uppercase">{filterKategori}</td>
                </tr>
                <tr>
                  <td className="font-bold py-0.5">Tanggal Cetak</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{todayStr}</td>
                  <td className="font-bold py-0.5">Total Target</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{stats.total} Santri</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABEL DATA CETAK */}
          {reportType !== "riwayat" ? (
            <table className="w-full border-collapse border border-black text-[11px] mb-6">
              <thead>
                <tr className="bg-gray-200 text-black border-b border-black">
                  <th className="border border-black p-1.5 text-center w-8">NO</th>
                  <th className="border border-black p-1.5 text-center w-20">ID PPS</th>
                  <th className="border border-black p-1.5 text-left">NAMA SANTRI</th>
                  <th className="border border-black p-1.5 text-center w-24">KATEGORI</th>
                  <th className="border border-black p-1.5 text-center w-28">DOMISILI</th>
                  <th className="border border-black p-1.5 text-center w-24">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {queueData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4 italic border border-black">Data kosong.</td>
                  </tr>
                ) : (
                  queueData.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-black p-1 text-center">{idx + 1}</td>
                      <td className="border border-black p-1 text-center font-mono font-bold">{item.id_pps}</td>
                      <td className="border border-black p-1 uppercase">{item.expand?.santri?.nama || "-"}</td>
                      <td className="border border-black p-1 text-center capitalize">{item.kategori_wajib?.replace("_", " ")}</td>
                      <td className="border border-black p-1 text-center">{item.expand?.santri?.domisili || item.expand?.santri?.status_domisili || "-"}</td>
                      <td className="border border-black p-1 text-center font-bold uppercase">{item.status_setor}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full border-collapse border border-black text-[11px] mb-6">
              <thead>
                <tr className="bg-gray-200 text-black border-b border-black">
                  <th className="border border-black p-1.5 text-center w-8">NO</th>
                  <th className="border border-black p-1.5 text-center w-20">ID PPS</th>
                  <th className="border border-black p-1.5 text-left">NAMA SANTRI</th>
                  <th className="border border-black p-1.5 text-left">PETUGAS</th>
                  <th className="border border-black p-1.5 text-center w-28">WAKTU ISTIWA</th>
                  <th className="border border-black p-1.5 text-left">CATATAN</th>
                </tr>
              </thead>
              <tbody>
                {riwayatData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4 italic border border-black">Data riwayat kosong.</td>
                  </tr>
                ) : (
                  riwayatData.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-black p-1 text-center">{idx + 1}</td>
                      <td className="border border-black p-1 text-center font-mono font-bold">{item.id_pps}</td>
                      <td className="border border-black p-1 uppercase">{item.expand?.santri?.nama || "-"}</td>
                      <td className="border border-black p-1">{item.expand?.petugas_eksekutor?.name || item.expand?.petugas_eksekutor?.username || "-"}</td>
                      <td className="border border-black p-1 text-center font-mono">{item.waktu_wis || "-"}</td>
                      <td className="border border-black p-1">{item.catatan || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* AREA TANDA TANGAN */}
          <div className="mt-8 flex justify-between items-end text-center">
            <div className="w-48">
              <p className="mb-12">Mengetahui,<br /><strong>Kepala Ketertiban</strong></p>
              <p className="font-bold underline">( .................................... )</p>
            </div>
            <div className="w-48">
              <p className="mb-12">Sidogiri, {todayStr.split(",")[1]?.trim() || todayStr}<br /><strong>Petugas Eksekutor</strong></p>
              <p className="font-bold underline">( .................................... )</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

RambutReportPrint.displayName = "RambutReportPrint";