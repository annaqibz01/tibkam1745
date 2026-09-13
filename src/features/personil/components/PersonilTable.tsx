// src/features/personil/components/PersonilTable.tsx
import React, { useMemo } from "react";
import { Loader2, ShieldCheck, UserCheck, UserX } from "lucide-react";
import type { PersonilWithExpand } from "../hooks/usePersonil";
import { StatusBadge, EmptyState } from "@/components/shared";

interface PersonilTableProps {
  items: PersonilWithExpand[];
  isLoading: boolean;
  isFetching: boolean;
  page?: number;
  perPage?: number;
  onSelectPersonil?: (personil: PersonilWithExpand) => void;
}

const PersonilTable: React.FC<PersonilTableProps> = ({
  items,
  isLoading,
  isFetching,
  page = 1,
  perPage = 15,
  onSelectPersonil,
}) => {
  const rows = useMemo(() => {
    if (isLoading || items.length === 0) return [];
    return items.map((item, index) => {
      const santri = item.expand?.santri;

      return {
        rawRecord: item,
        key: item.id ?? index,
        no: (page - 1) * perPage + index + 1,
        id: item.id,
        id_pps: item.id_pps ?? "-",
        nama: santri?.nama ?? "Tanpa Nama",
        jabatan_tibkam: item.jabatan_tibkam ?? "-",
        domisili: santri?.domisili ?? "-",
        kelas: santri?.kelas ?? "-",
        tingkatan: santri?.tingkatan ?? "-",
        status_aktif: item.status_aktif === undefined ? false : Boolean(item.status_aktif),
      };
    });
  }, [items, isLoading, page, perPage]);

  const skeletonRows = useMemo(() => {
    return Array.from({ length: perPage }).map((_, idx) => (
      <tr key={`skeleton-${idx}`} className="animate-pulse">
        {Array.from({ length: 7 }).map((_, cellIdx) => (
          <td key={cellIdx} className="px-3 py-2">
            <div className="h-4 bg-zinc-800 rounded w-16 mx-auto" />
          </td>
        ))}
      </tr>
    ));
  }, [perPage]);

  return (
    <div className="relative rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm overflow-hidden font-sans select-none">
      {/* Indikator fetching halus di atas tabel */}
      {isFetching && !isLoading && (
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-center gap-1.5 px-3 py-1 text-[11px] font-sans text-indigo-300 bg-zinc-950/90 border-b border-zinc-800">
          <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
          <span>Memperbarui data personil...</span>
        </div>
      )}

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[850px] text-xs text-left border-collapse table-auto">
          <thead>
            <tr className="bg-zinc-950 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider sticky top-0 z-10">
              <th className="px-3 py-2.5 w-12 text-center font-sans">No</th>
              <th className="px-3 py-2.5 w-28 font-sans">ID PPS</th>
              <th className="px-3 py-2.5 min-w-[220px] font-sans">Nama Personil</th>
              <th className="px-3 py-2.5 min-w-[160px] font-sans">Jabatan Tibkam</th>
              <th className="px-3 py-2.5 min-w-[160px] font-sans">Kompleks Domisili</th>
              <th className="px-3 py-2.5 w-24 font-sans text-center">Kelas</th>
              <th className="px-3 py-2.5 w-28 text-center font-sans">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40">
            {isLoading ? (
              skeletonRows
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10">
                  <EmptyState
                    icon={<ShieldCheck className="w-6 h-6 text-zinc-500" />}
                    title="Tidak Ada Data Personil Ditemukan"
                    description="Coba sesuaikan kata kunci pencarian atau kombinasi filter kriteria Anda."
                  />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onSelectPersonil && onSelectPersonil(row.rawRecord)}
                  className="cursor-pointer hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="px-3 py-2 text-center text-zinc-500 font-mono text-xs whitespace-nowrap">
                    {row.no}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                      {row.id_pps}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="font-medium text-zinc-200 select-text" title={row.nama}>
                      {row.nama}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20">
                      {row.jabatan_tibkam}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-zinc-300 font-medium whitespace-nowrap">
                    {row.domisili}
                  </td>
                  <td className="px-3 py-2 text-zinc-400 text-center whitespace-nowrap font-mono">
                    {row.kelas}
                  </td>
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <StatusBadge
                      variant={row.status_aktif ? "success" : "danger"}
                      icon={row.status_aktif ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      dot
                    >
                      {row.status_aktif ? "Aktif" : "Nonaktif"}
                    </StatusBadge>
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

export default PersonilTable;