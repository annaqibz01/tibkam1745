// src/features/master/components/MasterTable.tsx
import React, { useMemo } from "react";
import { Loader2, FileSpreadsheet, UserCheck, UserX } from "lucide-react";
import type { MasterResponse } from "@/types/pocketbase-types";
import { StatusBadge, EmptyState } from "@/components/shared";

interface MasterTableProps {
  items: MasterResponse[];
  isLoading: boolean;
  isFetching: boolean;
  page?: number;
  perPage?: number;
  onSelectSantri?: (santri: MasterResponse) => void;
}

export const MasterTable: React.FC<MasterTableProps> = ({
  items,
  isLoading,
  isFetching,
  page = 1,
  perPage = 15,
  onSelectSantri,
}) => {
  const rows = useMemo(() => {
    if (isLoading || items.length === 0) return [];
    return items.map((item, index) => {
      const alamatSatuKolom =
        [item.desa, item.kecamatan, item.kabupaten, item.provinsi]
          .map((val) => val?.toString().trim())
          .filter(Boolean)
          .join(", ") || "-";

      return {
        rawRecord: item,
        key: item.id ?? index,
        no: (page - 1) * perPage + index + 1,
        id: item.id,
        id_pps: item.id_pps ?? "-",
        nama: item.nama ?? "-",
        alamat: alamatSatuKolom,
        tingkatan: item.tingkatan ?? "-",
        kelas: item.kelas ?? "-",
        status_domisili: item.status_domisili ?? "-",
        domisili: item.domisili ?? "-",
        nama_ayah: item.nama_ayah ?? "-",
        nama_ibu: item.nama_ibu ?? "-",
        nama_wali: item.nama_wali ?? "-",
        kontak_wali: item.kontak_wali ?? "-",
        status_aktif: item.status_aktif === undefined ? false : Boolean(item.status_aktif),
        alasan_update_status: item.alasan_update_status ?? "-",
        keterangan_update_domisi: item.keterangan_update_domisi ?? "-",
      };
    });
  }, [items, isLoading, page, perPage]);

  // Skeleton rows kompak presisi perPage baris (~36px per baris)
  const skeletonRows = useMemo(() => {
    return Array.from({ length: perPage }).map((_, idx) => (
      <tr key={`skeleton-${idx}`} className="animate-pulse">
        {Array.from({ length: 15 }).map((_, cellIdx) => (
          <td key={cellIdx} className="px-3 py-2">
            <div className="h-4 bg-zinc-800 rounded w-16 mx-auto" />
          </td>
        ))}
      </tr>
    ));
  }, [perPage]);

  return (
    <div className="relative rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm overflow-hidden font-sans select-none">
      {/* Top Subtle Sync Indicator */}
      {isFetching && !isLoading && (
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-center gap-1.5 px-3 py-1 text-[11px] font-sans text-indigo-300 bg-zinc-950/90 border-b border-zinc-800">
          <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
          <span>Memperbarui data master...</span>
        </div>
      )}

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[2000px] text-xs text-left border-collapse table-auto">
          <thead>
            <tr className="bg-zinc-950 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider sticky top-0 z-10">
              <th className="px-3 py-2.5 w-12 text-center font-sans">No</th>
              <th className="px-3 py-2.5 w-28 font-sans">ID PPS</th>
              <th className="px-3 py-2.5 min-w-[220px] font-sans">Nama Lengkap</th>
              <th className="px-3 py-2.5 min-w-[260px] font-sans">Alamat Asal</th>
              <th className="px-3 py-2.5 w-32 font-sans">Tingkatan</th>
              <th className="px-3 py-2.5 w-20 font-sans text-center">Kelas</th>
              <th className="px-3 py-2.5 w-28 text-center font-sans">Status Domisili</th>
              <th className="px-3 py-2.5 min-w-[140px] font-sans">Domisili</th>
              <th className="px-3 py-2.5 min-w-[160px] font-sans">Nama Ayah</th>
              <th className="px-3 py-2.5 min-w-[160px] font-sans">Nama Ibu</th>
              <th className="px-3 py-2.5 min-w-[160px] font-sans">Nama Wali</th>
              <th className="px-3 py-2.5 min-w-[140px] font-sans">Kontak Wali</th>
              <th className="px-3 py-2.5 w-24 text-center font-sans">Status</th>
              <th className="px-3 py-2.5 min-w-[200px] font-sans">Alasan Update</th>
              <th className="px-3 py-2.5 min-w-[200px] font-sans">Ket. Update Domisili</th>
            </tr>
          </thead>

          <tbody
            className={`divide-y divide-zinc-800/60 bg-zinc-900/40 transition-opacity duration-150 ${
              isFetching && !isLoading ? "opacity-40 pointer-events-none" : "opacity-100"
            }`}
          >
            {isLoading ? (
              skeletonRows
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={15} className="px-4 py-10">
                  <EmptyState
                    icon={<FileSpreadsheet className="w-6 h-6 text-zinc-500" />}
                    title="Tidak Ada Data Master Santri"
                    description="Coba sesuaikan kata kunci pencarian atau kombinasi filter kriteria Anda."
                  />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onSelectSantri && onSelectSantri(row.rawRecord)}
                  className="cursor-pointer hover:bg-zinc-800/40 transition-colors"
                >
                  {/* Nomor Urut */}
                  <td className="px-3 py-2 text-center text-zinc-500 font-mono text-xs whitespace-nowrap">
                    {row.no}
                  </td>

                  {/* ID PPS */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                      {row.id_pps}
                    </span>
                  </td>

                  {/* Nama Santri (Bisa di-copy) */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="font-medium text-zinc-200 select-text" title={row.nama}>
                      {row.nama}
                    </span>
                  </td>

                  {/* Alamat */}
                  <td className="px-3 py-2 text-zinc-400 whitespace-nowrap select-text" title={row.alamat}>
                    {row.alamat}
                  </td>

                  {/* Tingkatan */}
                  <td className="px-3 py-2 text-zinc-300 whitespace-nowrap">
                    {row.tingkatan}
                  </td>

                  {/* Kelas */}
                  <td className="px-3 py-2 text-zinc-400 text-center whitespace-nowrap font-mono">
                    {row.kelas}
                  </td>

                  {/* Status Domisili */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 border border-zinc-700 text-zinc-300">
                      {row.status_domisili}
                    </span>
                  </td>

                  {/* Kompleks Domisili */}
                  <td className="px-3 py-2 text-zinc-300 font-medium whitespace-nowrap">
                    {row.domisili}
                  </td>

                  {/* Nama Ayah */}
                  <td className="px-3 py-2 text-zinc-400 whitespace-nowrap select-text">
                    {row.nama_ayah}
                  </td>

                  {/* Nama Ibu */}
                  <td className="px-3 py-2 text-zinc-400 whitespace-nowrap select-text">
                    {row.nama_ibu}
                  </td>

                  {/* Nama Wali */}
                  <td className="px-3 py-2 text-zinc-300 whitespace-nowrap select-text">
                    {row.nama_wali}
                  </td>

                  {/* Kontak Wali */}
                  <td className="px-3 py-2 text-zinc-400 font-mono whitespace-nowrap select-text">
                    {row.kontak_wali}
                  </td>

                  {/* Status Aktif / Nonaktif */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <StatusBadge
                      variant={row.status_aktif ? "success" : "danger"}
                      icon={row.status_aktif ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      dot
                    >
                      {row.status_aktif ? "Aktif" : "Nonaktif"}
                    </StatusBadge>
                  </td>

                  {/* Alasan Update */}
                  <td className="px-3 py-2 text-zinc-400 whitespace-nowrap text-[11px]">
                    {row.alasan_update_status}
                  </td>

                  {/* Keterangan Update Domisili */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    {row.keterangan_update_domisi !== "-" ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        {row.keterangan_update_domisi}
                      </span>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
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

export default MasterTable;