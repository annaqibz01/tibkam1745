// src/components/rambut/RambutHistoryTable.tsx
import React from "react";
import type { RiwayatSetorExpanded } from "../../hooks/useRambut";
import { Clock, UserCheck, Calendar } from "lucide-react";

interface RambutHistoryTableProps {
  items: RiwayatSetorExpanded[];
  isLoading: boolean;
}

export const RambutHistoryTable: React.FC<RambutHistoryTableProps> = ({
  items,
  isLoading,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 shadow-2xl backdrop-blur-xl min-h-[420px]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse table-auto">
          <thead>
            <tr className="bg-gray-950/80 border-b border-gray-800/80 text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider">
              <th className="px-5 py-4 w-14 text-center">No</th>
              <th className="px-5 py-4 w-32">ID PPS</th>
              <th className="px-5 py-4 min-w-[200px]">Nama Santri</th>
              <th className="px-5 py-4 w-44">Waktu Masehi</th>
              <th className="px-5 py-4 w-36 text-center">Waktu WIS</th>
              <th className="px-5 py-4 min-w-[160px]">Petugas Eksekutor</th>
              <th className="px-5 py-4 min-w-[180px]">Catatan Eksekusi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800/50 bg-gray-900/30">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`skel-hist-${idx}`} className="animate-pulse">
                  {Array.from({ length: 7 }).map((_, cell) => (
                    <td key={cell} className="px-5 py-4">
                      <div className="h-4 bg-gray-800/60 rounded w-20 mx-auto" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-gray-500 font-mono text-xs">
                  Belum ada log histori eksekusi perapian rambut pada periode ini.
                </td>
              </tr>
            ) : (
              items.map((row, index) => (
                <tr key={row.id} className="hover:bg-indigo-500/[0.03] transition-colors">
                  <td className="px-5 py-3.5 text-center text-gray-500 font-mono text-xs">
                    {index + 1}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-indigo-400">
                    {row.id_pps}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-white">
                    {row.expand?.santri?.nama || "Santri"}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-300 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{new Date(row.tanggal_setor).toLocaleString("id-ID")}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center font-mono font-bold text-emerald-400 text-xs">
                    {row.waktu_wis}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-300 font-mono">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>@{row.expand?.petugas_eksekutor?.username || "operator"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 font-mono italic">
                    {row.catatan || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};