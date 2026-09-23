// src/features/rambut/components/subtables/RambutPengurusSubTable.tsx
import React, { useMemo } from "react";
import type { PengurusItem } from "../RambutQueueTable";
import { StatusBadge, EmptyState } from "@/components/shared";
import { parseNumericIdPps, getAlamatStr } from "@/utils/userHelpers";
import { UserCheck, User, ShieldCheck, MapPin, Home, CheckCircle2, Trash2 } from "lucide-react";

interface Props {
  items: PengurusItem[];
  isLoading: boolean;
  page?: number;
  perPage?: number;
  onDeletePengurus?: (item: PengurusItem) => void;
}

export const RambutPengurusSubTable: React.FC<Props> = ({
  items,
  isLoading,
  page = 1,
  perPage = 15,
  onDeletePengurus,
}) => {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => parseNumericIdPps(a.id_pps) - parseNumericIdPps(b.id_pps));
  }, [items]);

  return (
    <table className="w-full min-w-[980px] text-xs text-left border-collapse table-fixed select-none font-sans">
      <thead>
        <tr className="h-10 bg-zinc-950 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          <th className="px-2.5 w-[45px] text-center">No</th>
          <th className="px-2.5 w-[95px]">ID PPS</th>
          <th className="px-2.5 w-[220px]">Nama</th>
          <th className="px-2.5 w-[160px] text-center">Jabatan</th>
          <th className="px-2.5 w-[110px]">Domisili</th>
          <th className="px-2.5 w-[180px]">Alamat</th>
          <th className="px-2.5 w-[95px] text-center">Status</th>
          <th className="px-2.5 w-[65px] text-center">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40">
        {isLoading ? (
          Array.from({ length: perPage || 5 }).map((_, idx) => (
            <tr key={`skel-p-${idx}`} className="h-10 animate-pulse">
              <td className="px-2.5 text-center"><div className="h-3.5 bg-zinc-800 rounded w-4 mx-auto" /></td>
              <td className="px-2.5"><div className="h-4 bg-zinc-800 rounded w-16" /></td>
              <td className="px-2.5"><div className="h-4 bg-zinc-800 rounded w-36" /></td>
              <td className="px-2.5 text-center"><div className="h-4 bg-zinc-800 rounded w-24 mx-auto" /></td>
              <td className="px-2.5"><div className="h-4 bg-zinc-800 rounded w-16" /></td>
              <td className="px-2.5"><div className="h-4 bg-zinc-800 rounded w-28" /></td>
              <td className="px-2.5 text-center"><div className="h-4 bg-zinc-800 rounded w-14 mx-auto" /></td>
              <td className="px-2.5 text-center"><div className="h-5 bg-zinc-800 rounded w-6 mx-auto" /></td>
            </tr>
          ))
        ) : sortedItems.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-6 py-12">
              <EmptyState
                icon={<UserCheck className="w-6 h-6 text-zinc-500" />}
                title="Tidak Ada Pengurus Ditemukan"
                description="Tambahkan pengurus baru secara manual atau impor via file Excel."
              />
            </td>
          </tr>
        ) : (
          sortedItems.map((p, idx) => {
            const rowNo = (page - 1) * perPage + idx + 1;
            const santriData = p.expand?.santri;
            const isAktif = p.status_aktif !== false;

            return (
              <tr key={p.id} className="h-10 hover:bg-zinc-800/40 transition-colors">
                {/* 1. No */}
                <td className="px-2.5 text-center text-zinc-500 font-mono text-[11px] truncate">
                  {rowNo}
                </td>

                {/* 2. ID PPS */}
                <td className="px-2.5 whitespace-nowrap">
                  <span className="inline-block px-1.5 py-0.5 rounded font-mono font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20">
                    {p.id_pps}
                  </span>
                </td>

                {/* 3. Nama */}
                <td className="px-2.5 truncate" title={santriData?.nama || "Pengurus / Petugas"}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="font-semibold text-zinc-200 truncate">
                      {santriData?.nama || "Pengurus / Petugas"}
                    </span>
                  </div>
                </td>

                {/* 4. Jabatan */}
                <td className="px-2.5 text-center whitespace-nowrap" title={p.jabatan || "Petugas Cukur"}>
                  <span className="inline-flex items-center gap-1 max-w-[150px] px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 truncate">
                    <ShieldCheck className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate">{p.jabatan || "Petugas Cukur"}</span>
                  </span>
                </td>

                {/* 5. Domisili */}
                <td className="px-2.5 text-purple-300 truncate font-sans">
                  <div className="flex items-center gap-1 min-w-0">
                    <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                    <span className="truncate">
                      {santriData?.domisili || santriData?.status_domisili || "-"}
                    </span>
                  </div>
                </td>

                {/* 6. Alamat */}
                <td className="px-2.5 text-zinc-400 truncate font-sans" title={getAlamatStr(santriData)}>
                  <div className="flex items-center gap-1 min-w-0">
                    <Home className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span className="truncate">{getAlamatStr(santriData)}</span>
                  </div>
                </td>

                {/* 7. Status */}
                <td className="px-2.5 text-center whitespace-nowrap">
                  <StatusBadge
                    variant={isAktif ? "success" : "danger"}
                    icon={isAktif ? <CheckCircle2 className="w-3 h-3" /> : undefined}
                  >
                    {isAktif ? "Aktif" : "Purna"}
                  </StatusBadge>
                </td>

                {/* 8. Aksi */}
                <td className="px-2.5 text-center whitespace-nowrap">
                  {onDeletePengurus && (
                    <button
                      type="button"
                      onClick={() => onDeletePengurus(p)}
                      className="w-6 h-6 inline-flex items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors active:scale-95"
                      title="Hapus Pengurus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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