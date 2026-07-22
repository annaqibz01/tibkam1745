// src/features/laporan/components/LaporanTable.tsx
import React from "react";
import type { WajibSetorExpanded, RiwayatSetorExpanded } from "@/features/rambut";
import type { ReportType } from "../hooks/useLaporanRambut";
import { CheckCircle2, Clock, ShieldAlert, FileText, User } from "lucide-react";

interface LaporanTableProps {
  reportType: ReportType;
  items: any[];
  isLoading: boolean;
  page?: number;
  perPage?: number;
}

export const LaporanTable: React.FC<LaporanTableProps> = ({
  reportType,
  items,
  isLoading,
  page = 1,
  perPage = 15,
}) => {
  const isRiwayat = reportType === "riwayat";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 shadow-2xl backdrop-blur-xl min-h-[480px]">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="overflow-x-auto">
        {!isRiwayat ? (
          <table className="w-full text-xs text-left border-collapse table-auto font-mono">
            <thead>
              <tr className="bg-gray-950/80 border-b border-gray-800/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider backdrop-blur-md select-none">
                <th className="px-5 py-4 w-12 text-center">No</th>
                <th className="px-5 py-4 w-28">ID PPS</th>
                <th className="px-5 py-4 min-w-[200px] font-sans">Nama Santri</th>
                <th className="px-5 py-4 w-36 text-center">Kategori</th>
                <th className="px-5 py-4 w-32 font-sans">Domisili</th>
                <th className="px-5 py-4 w-32 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 bg-gray-900/30">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={`skel-q-${idx}`} className="animate-pulse border-b border-gray-800/40">
                    {Array.from({ length: 6 }).map((_, c) => (
                      <td key={c} className="px-5 py-3.5">
                        <div className="h-4 bg-gray-800/60 rounded-lg w-20 mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center font-sans">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3.5 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-gray-400">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-300">
                        Tidak Ada Data Terkait Filter Laporan
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((row: WajibSetorExpanded, index) => {
                  const rowNo = (page - 1) * perPage + index + 1;
                  const santriData = row.expand?.santri;

                  return (
                    <tr key={row.id} className="group transition-colors duration-150 hover:bg-indigo-500/[0.04]">
                      <td className="px-5 py-3.5 text-center text-gray-500">{rowNo}</td>
                      <td className="px-5 py-3.5 font-bold text-indigo-400">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                          {row.id_pps}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-sans whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          <span className="font-semibold text-gray-200 group-hover:text-indigo-300 transition-colors">
                            {santriData?.nama || "Santri"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center uppercase text-[10px] font-bold text-gray-400">
                        {row.kategori_wajib?.replace("_", " ")}
                      </td>
                      <td className="px-5 py-3.5 font-sans text-gray-300">
                        {santriData?.domisili || santriData?.status_domisili || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-center font-sans">
                        {row.status_setor === "sudah" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Sudah
                          </span>
                        ) : row.status_setor === "dispensasi" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            <ShieldAlert className="w-3 h-3" /> Izin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> Belum
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-xs text-left border-collapse table-auto font-mono">
            <thead>
              <tr className="bg-gray-950/80 border-b border-gray-800/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider backdrop-blur-md select-none">
                <th className="px-5 py-4 w-12 text-center">No</th>
                <th className="px-5 py-4 w-28">ID PPS</th>
                <th className="px-5 py-4 min-w-[200px] font-sans">Nama Santri</th>
                <th className="px-5 py-4 min-w-[160px] font-sans">Petugas Eksekutor</th>
                <th className="px-5 py-4 w-36 text-center">Waktu WIS</th>
                <th className="px-5 py-4 min-w-[180px]">Catatan Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 bg-gray-900/30">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={`skel-a-${idx}`} className="animate-pulse border-b border-gray-800/40">
                    {Array.from({ length: 6 }).map((_, c) => (
                      <td key={c} className="px-5 py-3.5">
                        <div className="h-4 bg-gray-800/60 rounded-lg w-20 mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center font-sans">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3.5 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-gray-400">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-300">
                        Tidak Ada Data Riwayat Transaksi Ditemukan
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((row: RiwayatSetorExpanded, index) => {
                  const rowNo = (page - 1) * perPage + index + 1;
                  const santriData = row.expand?.santri;
                  const petugasData = row.expand?.petugas_eksekutor;

                  return (
                    <tr key={row.id} className="group transition-colors duration-150 hover:bg-amber-500/[0.04]">
                      <td className="px-5 py-3.5 text-center text-gray-500">{rowNo}</td>
                      <td className="px-5 py-3.5 font-bold text-amber-400">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {row.id_pps}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-sans whitespace-nowrap">
                        <span className="font-semibold text-gray-200 group-hover:text-amber-300 transition-colors">
                          {santriData?.nama || "Santri"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-sans text-gray-300">
                        {petugasData?.name || petugasData?.username || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold text-emerald-400">
                        {row.waktu_wis || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 italic">
                        {row.catatan || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};