// src/components/kalender/KalenderTable.tsx
import React from "react";
import type { KalenderHijriyahResponse } from "../../../types/pocketbase-types";
import { CheckCircle2, Calendar, CalendarDays } from "lucide-react";

interface KalenderTableProps {
  items: KalenderHijriyahResponse[];
  isLoading: boolean;
  page?: number;
  perPage?: number;
}

export const KalenderTable: React.FC<KalenderTableProps> = ({
  items,
  isLoading,
  page = 1,
  perPage = 15,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 shadow-2xl backdrop-blur-xl min-h-[480px]">
      {/* 🔮 Garis Kilau Top-Border */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse table-auto">
          <thead>
            <tr className="bg-gray-950/80 border-b border-gray-800/80 text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider backdrop-blur-md">
              <th className="px-6 py-4 w-16 text-center">No</th>
              <th className="px-6 py-4 min-w-[200px]">Tanggal Masehi</th>
              <th className="px-6 py-4 min-w-[220px]">Format Hijriyah Resmi</th>
              <th className="px-6 py-4 w-36 text-center">Tgl Hijri</th>
              <th className="px-6 py-4 w-44 text-center">Bulan & Tahun</th>
              <th className="px-6 py-4 w-40 text-center">Status Pemetaan</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800/50 bg-gray-900/30">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse border-b border-gray-800/40">
                  {Array.from({ length: 6 }).map((_, cellIdx) => (
                    <td key={cellIdx} className="px-6 py-4">
                      <div className="h-4 bg-gray-800/60 rounded-lg w-24 mx-auto" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-gray-400 shadow-inner">
                      <CalendarDays className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-300">
                        Belum Ada Data Kalender Terdaftar
                      </p>
                      <p className="text-xs text-gray-500">
                        Klik tombol "Generate Bulan Baru" untuk membuat penanggalan.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((row, index) => {
                const rowNo = (page - 1) * perPage + index + 1;
                const dateMasehi = new Date(row.tanggal_masehi).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });

                return (
                  <tr
                    key={row.id}
                    className="group transition-colors duration-200 hover:bg-indigo-500/[0.03]"
                  >
                    {/* No */}
                    <td className="px-6 py-3.5 text-center text-gray-500 font-mono text-xs">
                      {rowNo}
                    </td>

                    {/* Tanggal Masehi */}
                    <td className="px-6 py-3.5 font-medium text-gray-200 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400/80" />
                        <span>{dateMasehi}</span>
                      </div>
                    </td>

                    {/* Format Hijriyah Resmi */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="inline-block px-3 py-1 rounded-xl font-mono text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-sm">
                        {row.string_hijri}
                      </span>
                    </td>

                    {/* Angka Tanggal Hijri */}
                    <td className="px-6 py-3.5 text-center font-mono font-bold text-white text-sm">
                      {row.tanggal_hijri || "-"}
                    </td>

                    {/* Bulan & Tahun */}
                    <td className="px-6 py-3.5 text-center text-xs font-mono text-indigo-300">
                      {row.bulan_hijri_nama} {row.tahun_hijri} H
                    </td>

                    {/* Status Pemetaan */}
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Valid
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};