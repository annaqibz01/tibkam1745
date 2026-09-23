// src/features/master/components/MasterTable.tsx
import React, { useMemo } from "react";
import { Loader2, FileSpreadsheet, UserCheck, UserX, User, MapPin } from "lucide-react";
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

  const skeletonRows = useMemo(() => {
    return Array.from({ length: perPage }).map((_, idx) => (
      <tr key={`skeleton-${idx}`} className="h-10 animate-pulse">
        <td className="px-3 text-center"><div className="h-3.5 bg-zinc-800 rounded w-4 mx-auto" /></td>
        <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-16" /></td>
        <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-36" /></td>
        <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-44" /></td>
        <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-20" /></td>
        <td className="px-3 text-center"><div className="h-4 bg-zinc-800 rounded w-8 mx-auto" /></td>
        <td className="px-3 text-center"><div className="h-4 bg-zinc-800 rounded w-16 mx-auto" /></td>
        <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-20" /></td>
        <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-24" /></td>
        <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-24" /></td>
        <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-24" /></td>
        <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-28" /></td>
        <td className="px-3 text-center"><div className="h-4 bg-zinc-800 rounded w-14 mx-auto" /></td>
        <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-32" /></td>
        <td className="px-3"><div className="h-4 bg-zinc-800 rounded w-28" /></td>
      </tr>
    ));
  }, [perPage]);

  return (
    <div className="relative rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm overflow-hidden font-sans select-none">
      {isFetching && !isLoading && (
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-center gap-1.5 px-3 py-1 text-[11px] font-sans text-indigo-300 bg-zinc-950/90 border-b border-zinc-800">
          <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
          <span>Memperbarui data master...</span>
        </div>
      )}

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[2240px] text-xs text-left border-collapse table-fixed">
          <thead>
            <tr className="h-10 bg-zinc-950 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider sticky top-0 z-10">
              <th className="px-3 w-[50px] text-center">No</th>
              <th className="px-3 w-[105px]">ID PPS</th>
              <th className="px-3 w-[220px]">Nama Lengkap</th>
              <th className="px-3 w-[260px]">Alamat Asal</th>
              <th className="px-3 w-[130px]">Tingkatan</th>
              <th className="px-3 w-[75px] text-center">Kelas</th>
              <th className="px-3 w-[120px] text-center">Status Domisili</th>
              <th className="px-3 w-[130px]">Domisili</th>
              <th className="px-3 w-[160px]">Nama Ayah</th>
              <th className="px-3 w-[160px]">Nama Ibu</th>
              <th className="px-3 w-[160px]">Nama Wali</th>
              <th className="px-3 w-[160px]">Kontak Wali</th>
              <th className="px-3 w-[105px] text-center">Status</th>
              <th className="px-3 w-[205px]">Alasan Update</th>
              <th className="px-3 w-[180px]">Ket. Update Domisili</th>
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
                <td colSpan={15} className="px-4 py-12">
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
                  className="h-10 cursor-pointer hover:bg-zinc-800/40 transition-colors"
                >
                  {/* 1. No */}
                  <td className="px-3 text-center text-zinc-500 font-mono text-[11px] truncate">
                    {row.no}
                  </td>

                  {/* 2. ID PPS */}
                  <td className="px-3 whitespace-nowrap">
                    <span className="inline-block px-1.5 py-0.5 rounded font-mono font-bold text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 select-text">
                      {row.id_pps}
                    </span>
                  </td>

                  {/* 3. Nama Lengkap */}
                  <td className="px-3 truncate" title={row.nama}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="font-semibold text-zinc-200 select-text truncate">
                        {row.nama}
                      </span>
                    </div>
                  </td>

                  {/* 4. Alamat Asal */}
                  <td className="px-3 text-zinc-400 truncate select-text" title={row.alamat}>
                    {row.alamat}
                  </td>

                  {/* 5. Tingkatan */}
                  <td className="px-3 text-zinc-300 truncate" title={row.tingkatan}>
                    {row.tingkatan}
                  </td>

                  {/* 6. Kelas */}
                  <td className="px-3 text-zinc-400 text-center font-mono whitespace-nowrap">
                    {row.kelas}
                  </td>

                  {/* 7. Status Domisili */}
                  <td className="px-3 text-center whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 border border-zinc-700 text-zinc-300">
                      {row.status_domisili}
                    </span>
                  </td>

                  {/* 8. Domisili */}
                  <td className="px-3 text-zinc-300 font-medium truncate" title={row.domisili}>
                    <div className="flex items-center gap-1 min-w-0">
                      <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span className="truncate">{row.domisili}</span>
                    </div>
                  </td>

                  {/* 9. Nama Ayah */}
                  <td className="px-3 text-zinc-400 truncate select-text" title={row.nama_ayah}>
                    {row.nama_ayah}
                  </td>

                  {/* 10. Nama Ibu */}
                  <td className="px-3 text-zinc-400 truncate select-text" title={row.nama_ibu}>
                    {row.nama_ibu}
                  </td>

                  {/* 11. Nama Wali */}
                  <td className="px-3 text-zinc-300 truncate select-text" title={row.nama_wali}>
                    {row.nama_wali}
                  </td>

                  {/* 12. Kontak Wali (Diperbaiki: truncate & select-text aktif) */}
                  <td
                    className="px-3 text-zinc-400 font-mono text-[11px] truncate select-text"
                    title={row.kontak_wali}
                  >
                    {row.kontak_wali}
                  </td>

                  {/* 13. Status */}
                  <td className="px-3 text-center whitespace-nowrap">
                    <StatusBadge
                      variant={row.status_aktif ? "success" : "danger"}
                      icon={row.status_aktif ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      dot
                    >
                      {row.status_aktif ? "Aktif" : "Nonaktif"}
                    </StatusBadge>
                  </td>

                  {/* 14. Alasan Update */}
                  <td className="px-3 text-zinc-400 truncate text-[11px]" title={row.alasan_update_status}>
                    {row.alasan_update_status}
                  </td>

                  {/* 15. Ket. Update Domisili */}
                  <td className="px-3 truncate" title={row.keterangan_update_domisi}>
                    {row.keterangan_update_domisi !== "-" ? (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300 truncate max-w-full">
                        {row.keterangan_update_domisi}
                      </span>
                    ) : (
                      <span className="text-zinc-600 font-mono">-</span>
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