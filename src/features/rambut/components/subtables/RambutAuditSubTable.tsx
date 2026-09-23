// src/features/rambut/components/subtables/RambutAuditSubTable.tsx
import React, { useMemo } from "react";
import type { RiwayatSetorExpanded } from "../../types";
import { HijriText } from "@/components/shared/HijriText";
import { parseNumericIdPps, getAlamatStr } from "@/utils/userHelpers";
import { History, Moon, User, MapPin, Home } from "lucide-react";

interface Props {
  items: RiwayatSetorExpanded[];
  isLoading: boolean;
  page?: number;
  perPage?: number;
}

export const RambutAuditSubTable: React.FC<Props> = ({
  items,
  isLoading,
  page = 1,
  perPage = 15,
}) => {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => parseNumericIdPps(a.id_pps) - parseNumericIdPps(b.id_pps));
  }, [items]);

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full min-w-[1150px] text-xs text-left border-collapse table-fixed select-none font-sans">
        <thead>
          <tr className="h-10 bg-zinc-950 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            <th className="px-3 w-[45px] text-center">No</th>
            {/* Diperlebar ke 195px agar badge tanggal Hijriyah tidak menempel ke ID PPS */}
            <th className="px-3 w-[195px]">Tgl Hijriyah</th>
            <th className="px-3 w-[105px]">ID PPS</th>
            <th className="px-3 w-[205px]">Nama Santri</th>
            <th className="px-3 w-[95px]">Domisili</th>
            <th className="px-3 w-[175px]">Alamat</th>
            <th className="px-3 w-[105px] text-center">Waktu</th>
            <th className="px-3 w-[105px]">Petugas</th>
            <th className="px-3 w-[120px]">Catatan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40">
          {isLoading ? (
            Array.from({ length: perPage || 5 }).map((_, idx) => (
              <tr key={`skel-a-${idx}`} className="h-10 animate-pulse">
                <td className="px-3 text-center"><div className="h-3.5 bg-zinc-800 rounded w-4 mx-auto" /></td>
                <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-36" /></td>
                <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-16" /></td>
                <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-36" /></td>
                <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-16" /></td>
                <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-28" /></td>
                <td className="px-3 text-center"><div className="h-4 bg-zinc-800 rounded w-16 mx-auto" /></td>
                <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-16" /></td>
                <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-16" /></td>
              </tr>
            ))
          ) : sortedItems.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400">
                    <History className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-300">Belum Ada Log Transaksi Audit Trail</p>
                </div>
              </td>
            </tr>
          ) : (
            sortedItems.map((logItem, idx) => {
              const rowNo = (page - 1) * perPage + idx + 1;
              const log = logItem as any;
              const santriData = log.expand?.santri;
              const petugasData = log.expand?.petugas_eksekutor;

              return (
                <tr key={log.id} className="h-10 hover:bg-zinc-800/40 transition-colors">
                  {/* 1. No */}
                  <td className="px-3 text-center text-zinc-500 font-mono text-[11px] truncate">
                    {rowNo}
                  </td>

                  {/* 2. Tgl Hijriyah */}
                  <td className="px-3 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
                      <Moon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">
                        <HijriText date={log.tanggal_setor || log.created} />
                      </span>
                    </div>
                  </td>

                  {/* 3. ID PPS */}
                  <td className="px-3 whitespace-nowrap">
                    <span className="inline-block px-1.5 py-0.5 rounded font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20">
                      {log.id_pps || santriData?.id_pps || "-"}
                    </span>
                  </td>

                  {/* 4. Nama */}
                  <td className="px-3 truncate" title={santriData?.nama || "Santri"}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="font-semibold text-zinc-200 truncate">
                        {santriData?.nama || "Santri"}
                      </span>
                    </div>
                  </td>

                  {/* 5. Domisili */}
                  <td className="px-3 text-amber-300 truncate font-sans">
                    <div className="flex items-center gap-1 min-w-0">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">
                        {santriData?.domisili || santriData?.status_domisili || "-"}
                      </span>
                    </div>
                  </td>

                  {/* 6. Alamat */}
                  <td className="px-3 text-zinc-400 truncate font-sans" title={getAlamatStr(santriData)}>
                    <div className="flex items-center gap-1 min-w-0">
                      <Home className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span className="truncate">{getAlamatStr(santriData)}</span>
                    </div>
                  </td>

                  {/* 7. Waktu */}
                  <td className="px-3 text-center font-mono font-bold text-emerald-400 whitespace-nowrap">
                    {log.waktu_wis || "-"}
                  </td>

                  {/* 8. Petugas */}
                  <td className="px-3 text-zinc-300 truncate font-sans" title={petugasData?.name || petugasData?.username || "Sistem"}>
                    <span className="truncate block">
                      {petugasData?.name || petugasData?.username || "Sistem"}
                    </span>
                  </td>

                  {/* 9. Catatan */}
                  <td className="px-3 text-zinc-400 truncate font-sans" title={log.catatan_operasional || log.catatan || "-"}>
                    <span className="truncate block">
                      {log.catatan_operasional || log.catatan || "-"}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};