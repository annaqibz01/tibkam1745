// src/components/rambut/subtables/RambutPengurusSubTable.tsx
import React, { useMemo } from "react";
import { parseNumericIdPps } from "../../hooks/useRambut";
import type { PengurusItem } from "../RambutQueueTable";
import { UserCheck, User, ShieldCheck, MapPin, Home, CheckCircle2, Trash2 } from "lucide-react";

interface Props {
  items: PengurusItem[];
  isLoading: boolean;
  page?: number;
  perPage?: number;
  onDeletePengurus?: (item: PengurusItem) => void;
}

const getAlamatStr = (santri: any) => {
  if (!santri) return "-";
  const parts = [santri.desa, santri.kecamatan, santri.kabupaten].map((v) => v?.toString().trim()).filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "-";
};

export const RambutPengurusSubTable: React.FC<Props> = ({
  items,
  isLoading,
  page = 1,        // 👈 1. Destruktur & beri default value
  perPage = 15,    // 👈 1. Destruktur & beri default value
  onDeletePengurus,
}) => {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => parseNumericIdPps(a.id_pps) - parseNumericIdPps(b.id_pps));
  }, [items]);

  return (
    <table className="w-full text-xs text-left border-collapse table-auto">
      <thead>
        <tr className="bg-gray-950/90 border-b border-gray-800/80 text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider backdrop-blur-md select-none">
          <th className="px-2.5 py-3 w-8 text-center">No</th>
          <th className="px-2.5 py-3 w-20">ID PPS</th>
          <th className="px-2.5 py-3 min-w-[150px]">Nama</th>
          <th className="px-2.5 py-3 w-32 text-center">Jabatan</th>
          <th className="px-2.5 py-3 w-28 whitespace-nowrap">Domisili</th>
          <th className="px-2.5 py-3 min-w-[140px] max-w-[180px]">Alamat</th>
          <th className="px-2.5 py-3 w-24 text-center">Status</th>
          <th className="px-2.5 py-3 w-16 text-center">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-800/50 bg-gray-900/30 font-mono">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <tr key={`skel-p-${idx}`} className="animate-pulse border-b border-gray-800/40">
              {Array.from({ length: 8 }).map((_, c) => (
                <td key={c} className="px-2.5 py-2.5"><div className="h-4 bg-gray-800/60 rounded-lg w-16 mx-auto" /></td>
              ))}
            </tr>
          ))
        ) : sortedItems.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-6 py-16 text-center font-sans">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-gray-400">
                  <UserCheck className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-xs font-semibold text-gray-300">Tidak Ada Pengurus Ditemukan</p>
              </div>
            </td>
          </tr>
        ) : (
          sortedItems.map((p, idx) => {
            const rowNo = (page - 1) * perPage + idx + 1; // 👈 2. Hitung nomor urut di sini
            const santriData = p.expand?.santri;
            const isAktif = p.status_aktif !== false;

            return (
              <tr key={p.id} className="group transition-colors duration-150 hover:bg-purple-500/[0.04]">
                <td className="px-2.5 py-2 text-center text-gray-500">{rowNo}</td>

                <td className="px-2.5 py-2 font-bold text-purple-400 whitespace-nowrap">
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">{p.id_pps}</span>
                </td>

                <td className="px-2.5 py-2 font-sans whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="font-semibold text-gray-200 group-hover:text-purple-300 transition-colors">{santriData?.nama || "Pengurus / Petugas"}</span>
                  </div>
                </td>

                <td className="px-2.5 py-2 text-center whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    <ShieldCheck className="w-3 h-3 text-indigo-400" />
                    <span>{p.jabatan || "Petugas Cukur"}</span>
                  </span>
                </td>

                <td className="px-2.5 py-2 text-purple-300 whitespace-nowrap font-sans">
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-purple-400 shrink-0" /><span>{santriData?.domisili || santriData?.status_domisili || "-"}</span></div>
                </td>

                <td className="px-2.5 py-2 text-gray-400 whitespace-nowrap font-sans truncate max-w-[170px]" title={getAlamatStr(santriData)}>
                  <div className="flex items-center gap-1"><Home className="w-3 h-3 text-gray-500 shrink-0" /><span className="truncate">{getAlamatStr(santriData)}</span></div>
                </td>

                <td className="px-2.5 py-2 text-center whitespace-nowrap font-sans">
                  {isAktif ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" />Aktif</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-800 text-gray-400 border border-gray-700">Purna</span>
                  )}
                </td>

                <td className="px-2.5 py-2 text-center whitespace-nowrap">
                  {onDeletePengurus && (
                    <button type="button" onClick={() => onDeletePengurus(p)} className="p-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-90" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};