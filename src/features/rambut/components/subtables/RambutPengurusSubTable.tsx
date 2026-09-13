// src/features/rambut/components/subtables/RambutPengurusSubTable.tsx
import React, { useMemo } from "react";
import { parseNumericIdPps } from "../../hooks/useRambut";
import type { PengurusItem } from "../RambutQueueTable";
import { StatusBadge, EmptyState } from "@/components/shared";
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
  page = 1,
  perPage = 15,
  onDeletePengurus,
}) => {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => parseNumericIdPps(a.id_pps) - parseNumericIdPps(b.id_pps));
  }, [items]);

  return (
    <table className="w-full text-xs text-left border-collapse table-auto">
      <thead>
        <tr className="bg-zinc-950 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider select-none">
          <th className="px-2.5 py-2.5 w-8 text-center">No</th>
          <th className="px-2.5 py-2.5 w-20">ID PPS</th>
          <th className="px-2.5 py-2.5 min-w-[150px]">Nama</th>
          <th className="px-2.5 py-2.5 w-32 text-center">Jabatan</th>
          <th className="px-2.5 py-2.5 w-28 whitespace-nowrap">Domisili</th>
          <th className="px-2.5 py-2.5 min-w-[140px] max-w-[180px]">Alamat</th>
          <th className="px-2.5 py-2.5 w-24 text-center">Status</th>
          <th className="px-2.5 py-2.5 w-16 text-center">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40 font-sans">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <tr key={`skel-p-${idx}`} className="animate-pulse">
              {Array.from({ length: 8 }).map((_, c) => (
                <td key={c} className="px-2.5 py-2"><div className="h-4 bg-zinc-800 rounded w-16 mx-auto" /></td>
              ))}
            </tr>
          ))
        ) : sortedItems.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-6 py-8">
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
              <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                <td className="px-2.5 py-2 text-center text-zinc-500">{rowNo}</td>
                <td className="px-2.5 py-2 font-bold text-purple-400 whitespace-nowrap">
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">{p.id_pps}</span>
                </td>
                <td className="px-2.5 py-2 font-sans whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="font-semibold text-zinc-200">{santriData?.nama || "Pengurus / Petugas"}</span>
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
                <td className="px-2.5 py-2 text-zinc-400 whitespace-nowrap font-sans truncate max-w-[170px]" title={getAlamatStr(santriData)}>
                  <div className="flex items-center gap-1"><Home className="w-3 h-3 text-zinc-500 shrink-0" /><span className="truncate">{getAlamatStr(santriData)}</span></div>
                </td>
                <td className="px-2.5 py-2 text-center whitespace-nowrap font-sans">
                  <StatusBadge
                    variant={isAktif ? "success" : "danger"}
                    icon={isAktif ? <CheckCircle2 className="w-3 h-3" /> : undefined}
                  >
                    {isAktif ? "Aktif" : "Purna"}
                  </StatusBadge>
                </td>
                <td className="px-2.5 py-2 text-center whitespace-nowrap">
                  {onDeletePengurus && (
                    <button type="button" onClick={() => onDeletePengurus(p)} className="p-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Hapus">
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