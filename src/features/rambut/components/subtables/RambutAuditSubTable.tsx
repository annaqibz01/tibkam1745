// src/components/rambut/subtables/RambutAuditSubTable.tsx
import React, { useMemo } from "react";
import { parseNumericIdPps, type RiwayatSetorExpanded } from "../../hooks/useRambut";
import { HijriText } from "../../../../components/shared/HijriText";
import { History, Moon, User, MapPin, Home } from "lucide-react";

interface Props {
  items: RiwayatSetorExpanded[];
  isLoading: boolean;
}

const getAlamatStr = (santri: any) => {
  if (!santri) return "-";
  const parts = [santri.desa, santri.kecamatan, santri.kabupaten].map((v) => v?.toString().trim()).filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "-";
};

export const RambutAuditSubTable: React.FC<Props> = ({ items, isLoading }) => {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => parseNumericIdPps(a.id_pps) - parseNumericIdPps(b.id_pps));
  }, [items]);

  return (
    <div className="overflow-x-auto hide-scrollbar">
      {/* ⚡ KUNCI PERBAIKAN: Menggunakan table-fixed dan min-w agar kolom terkunci sejajar */}
      <table className="w-full min-w-[1200px] text-xs text-left border-collapse table-fixed">
        <thead>
          <tr className="bg-gray-950/90 border-b border-gray-800/80 text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider backdrop-blur-md select-none">
            <th className="px-2.5 py-3 w-[4%] text-center">No</th>
            <th className="px-2.5 py-3 w-[16%]">Tgl Hijriyah</th>
            <th className="px-2.5 py-3 w-[10%]">ID PPS</th>
            <th className="px-2.5 py-3 w-[16%]">Nama Santri</th>
            <th className="px-2.5 py-3 w-[12%]">Domisili</th>
            <th className="px-2.5 py-3 w-[16%]">Alamat</th>
            <th className="px-2.5 py-3 w-[10%] text-center">Waktu</th>
            <th className="px-2.5 py-3 w-[10%]">Petugas</th>
            <th className="px-2.5 py-3 w-[16%]">Catatan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50 bg-gray-900/30 font-mono">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={`skel-a-${idx}`} className="animate-pulse border-b border-gray-800/40">
                {Array.from({ length: 9 }).map((_, c) => (
                  <td key={c} className="px-2.5 py-2.5">
                    <div className="h-4 bg-gray-800/60 rounded-lg w-16 mx-auto" />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedItems.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-16 text-center font-sans">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-gray-400">
                    <History className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-xs font-semibold text-gray-300">Belum Ada Log Transaksi Audit Trail</p>
                </div>
              </td>
            </tr>
          ) : (
            sortedItems.map((logItem, idx) => {
              const log = logItem as any;
              const santriData = log.expand?.santri;
              const petugasData = log.expand?.petugas_eksekutor;

              return (
                <tr key={log.id} className="group transition-colors duration-150 hover:bg-amber-500/[0.04]">
                  <td className="px-2.5 py-2 text-center text-gray-500">{idx + 1}</td>

                  <td className="px-2.5 py-2 text-amber-300 whitespace-nowrap overflow-hidden">
                    <div className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 w-fit">
                      <Moon className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="font-bold text-[11px]">
                        <HijriText date={log.tanggal_setor || log.created} />
                      </span>
                    </div>
                  </td>

                  <td className="px-2.5 py-2 font-bold text-amber-400 whitespace-nowrap overflow-hidden">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {log.id_pps || santriData?.id_pps || "-"}
                    </span>
                  </td>

                  <td className="px-2.5 py-2 font-sans whitespace-nowrap truncate overflow-hidden">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-semibold text-gray-200 truncate">{santriData?.nama || "Santri"}</span>
                    </div>
                  </td>

                  <td className="px-2.5 py-2 text-amber-300 whitespace-nowrap font-sans truncate overflow-hidden">
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{santriData?.domisili || santriData?.status_domisili || "-"}</span>
                    </div>
                  </td>

                  <td className="px-2.5 py-2 text-gray-400 whitespace-nowrap font-sans truncate overflow-hidden" title={getAlamatStr(santriData)}>
                    <div className="flex items-center gap-1 truncate">
                      <Home className="w-3 h-3 text-gray-500 shrink-0" />
                      <span className="truncate">{getAlamatStr(santriData)}</span>
                    </div>
                  </td>

                  <td className="px-2.5 py-2 text-center font-bold text-emerald-400 whitespace-nowrap overflow-hidden">
                    {log.waktu_wis || "-"}
                  </td>
                  
                  <td className="px-2.5 py-2 text-gray-300 whitespace-nowrap font-sans truncate overflow-hidden">
                    {petugasData?.name || petugasData?.username || "Sistem"}
                  </td>
                  
                  {/* ⚡ KUNCI PERBAIKAN: Tambahkan truncate agar teks catatan panjang tidak merusak kelebaran kolom */}
                  <td className="px-2.5 py-2 text-gray-400 whitespace-nowrap truncate overflow-hidden" title={log.catatan_operasional || log.catatan || "-"}>
                    {log.catatan_operasional || log.catatan || "-"}
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