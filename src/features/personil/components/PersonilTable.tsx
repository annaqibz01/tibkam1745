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

  // 🎯 SKELETON PRESIASI: Jumlah baris disamakan persis dengan perPage (15) & tinggi h-[52px]
  const skeletonRows = useMemo(() => {
    return Array.from({ length: perPage }).map((_, idx) => (
      <tr key={`skeleton-${idx}`} className="animate-pulse border-b border-gray-800/40 h-[52px]">
        <td className="px-4 py-3 text-gray-600 text-xs">{idx + 1}</td>
        <td className="px-4 py-3">
          <div className="h-5 bg-gray-800/60 rounded-md w-16 mx-auto" />
        </td>
        <td className="px-4 py-3 text-left">
          <div className="h-4 bg-gray-800/60 rounded-lg w-40" />
        </td>
        <td className="px-4 py-3">
          <div className="h-5 bg-gray-800/60 rounded-lg w-24 mx-auto" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 bg-gray-800/60 rounded-lg w-20 mx-auto" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 bg-gray-800/60 rounded-lg w-12 mx-auto" />
        </td>
        <td className="px-4 py-3">
          <div className="h-5 bg-gray-800/60 rounded-full w-16 mx-auto" />
        </td>
      </tr>
    ));
  }, [perPage]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 shadow-2xl backdrop-blur-xl min-h-[580px] flex flex-col justify-between select-none">
      {/* Garis Aksen Top Border */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none" />

      {/* Indikator Pembaruan Data Real-time (Top Bar Overlay) */}
      {isFetching && !isLoading && (
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-mono font-medium text-indigo-300 bg-indigo-950/90 border-b border-indigo-500/30 backdrop-blur-md transition-opacity">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>Memperbarui data...</span>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto w-full custom-scrollbar flex-1">
        <table className="w-full min-w-[850px] text-center text-sm border-collapse table-auto font-mono">
          <thead>
            <tr className="bg-gray-950/90 border-b border-gray-800/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider backdrop-blur-md select-none h-12">
              <th className="px-4 py-3 w-16 whitespace-nowrap">No</th>
              <th className="px-4 py-3 w-32 whitespace-nowrap">ID PPS</th>
              <th className="px-4 py-3 min-w-[220px] whitespace-nowrap text-left font-sans">Nama Personil</th>
              <th className="px-4 py-3 min-w-[160px] whitespace-nowrap font-sans">Jabatan Tibkam</th>
              <th className="px-4 py-3 min-w-[160px] whitespace-nowrap font-sans">Kompleks Domisili</th>
              <th className="px-4 py-3 w-28 whitespace-nowrap">Kelas</th>
              <th className="px-4 py-3 w-32 whitespace-nowrap font-sans">Status</th>
            </tr>
          </thead>

          {/* 🎯 SMOOTH PAGINATION: Redupkan tabel lama halus saat memuat halaman baru */}
          <tbody
            className={`divide-y divide-gray-800/50 bg-gray-900/30 transition-opacity duration-200 ${
              isFetching && !isLoading ? "opacity-40 pointer-events-none" : "opacity-100"
            }`}
          >
            {isLoading ? (
              skeletonRows
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12">
                  <EmptyState
                    icon={<ShieldCheck className="w-8 h-8 text-gray-400" />}
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
                  className="group cursor-pointer transition-colors duration-150 hover:bg-indigo-500/[0.06] h-[52px]"
                >
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {row.no}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-indigo-400 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                      {row.id_pps}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-left font-sans">
                    <span className="font-semibold text-gray-200 text-xs group-hover:text-indigo-300 transition-colors">
                      {row.nama}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-amber-300 font-bold whitespace-nowrap font-sans">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      {row.jabatan_tibkam}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300 font-semibold whitespace-nowrap font-sans">
                    {row.domisili}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {row.kelas}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-sans">
                    <StatusBadge
                      variant={row.status_aktif ? "success" : "danger"}
                      icon={row.status_aktif ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
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