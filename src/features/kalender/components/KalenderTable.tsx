// src/features/kalender/components/KalenderTable.tsx
import React from "react";
import type { KalenderHijriyahResponse } from "@/types/pocketbase-types";
import { StatusBadge, EmptyState } from "@/components/shared";
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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm overflow-hidden font-sans select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse table-auto">
          <thead>
            <tr className="bg-zinc-950 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider sticky top-0 z-10">
              <th className="px-3 py-2.5 w-12 text-center">No</th>
              <th className="px-3 py-2.5 min-w-[180px]">Tanggal Masehi</th>
              <th className="px-3 py-2.5 min-w-[180px]">Format Hijriyah Resmi</th>
              <th className="px-3 py-2.5 w-24 text-center">Tgl Hijri</th>
              <th className="px-3 py-2.5 w-36 text-center">Bulan & Tahun</th>
              <th className="px-3 py-2.5 w-28 text-center">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, cellIdx) => (
                    <td key={cellIdx} className="px-3 py-2">
                      <div className="h-4 bg-zinc-800 rounded w-20 mx-auto" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10">
                  <EmptyState
                    icon={<CalendarDays className="w-6 h-6 text-zinc-500" />}
                    title="Belum Ada Data Kalender Terdaftar"
                    description="Klik tombol 'Generate Bulan Baru' untuk memetakan penanggalan."
                  />
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
                    className="hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-3 py-2 text-center text-zinc-500 font-mono">
                      {rowNo}
                    </td>

                    <td className="px-3 py-2 font-medium text-zinc-200 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{dateMasehi}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {row.string_hijri}
                      </span>
                    </td>

                    <td className="px-3 py-2 text-center font-mono font-bold text-zinc-100 text-sm">
                      {row.tanggal_hijri || "-"}
                    </td>

                    <td className="px-3 py-2 text-center font-mono text-xs text-zinc-400">
                      {row.bulan_hijri_nama} {row.tahun_hijri} H
                    </td>

                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <StatusBadge
                        variant="success"
                        icon={<CheckCircle2 className="w-3 h-3" />}
                      >
                        Valid
                      </StatusBadge>
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