// src/components/master/MasterTable.tsx
import React, { useCallback, useMemo } from 'react';
import { Loader2, UserCheck, UserX, FileSpreadsheet } from 'lucide-react';
import type { MasterResponse } from '@/types/pocketbase-types';

// =============================================================================
// TYPES
// =============================================================================

interface MasterTableProps {
  items: MasterResponse[];
  isLoading: boolean;
  isFetching: boolean;
  isPendingToggle?: boolean;
  onToggleStatus?: (id: string, currentStatus: boolean, nama: string) => void;
  page?: number;
  perPage?: number;
}

// =============================================================================
// COMPONENT
// =============================================================================

const MasterTable: React.FC<MasterTableProps> = ({
  items,
  isLoading,
  isFetching,
  page = 1,
  perPage = 15,
}) => {

  // ---------------------------------------------------------------------------
  // Status Badge (MURNI PRESENTASI / READ-ONLY)
  // ---------------------------------------------------------------------------

  const renderStatusBadge = useCallback(
    (statusAktif: boolean) => {
      return (
        <div
          className={`
            inline-flex items-center justify-center w-8 h-8 rounded-xl select-none shadow-md transition-transform group-hover:scale-105
            ${
              statusAktif
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ring-2 ring-emerald-500/10'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 ring-2 ring-rose-500/10'
            }
          `}
          title={
            statusAktif
              ? 'Status: Aktif (Dikelola otomatis via Sinkronisasi Excel)'
              : 'Status: Nonaktif (Dikelola otomatis via Sinkronisasi Excel)'
          }
        >
          {statusAktif ? (
            <UserCheck className="w-4 h-4" />
          ) : (
            <UserX className="w-4 h-4" />
          )}
        </div>
      );
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Memoized data mapping (1 kolom = 1 field, tanpa aggregasi)
  // ---------------------------------------------------------------------------

  const rows = useMemo(() => {
    if (isLoading || items.length === 0) return [];
    return items.map((item, index) => {
      const alamatSatuKolom = [item.desa, item.kecamatan, item.kabupaten, item.provinsi]
        .map(val => val?.toString().trim())
        .filter(Boolean)
        .join(', ') || '-';

      return {
        key: item.id ?? index,
        no: (page - 1) * perPage + index + 1,
        id: item.id,
        id_pps: item.id_pps ?? '-',
        nama: item.nama ?? '-',
        alamat: alamatSatuKolom,
        tingkatan: item.tingkatan ?? '-',
        kelas: item.kelas ?? '-',
        status_domisili: item.status_domisili ?? '-',
        domisili: item.domisili ?? '-',
        nama_ayah: item.nama_ayah ?? '-',
        nama_ibu: item.nama_ibu ?? '-',
        nama_wali: item.nama_wali ?? '-',
        kontak_wali: item.kontak_wali ?? '-',
        status_aktif: item.status_aktif === undefined ? false : Boolean(item.status_aktif),
        alasan_update_status: item.alasan_update_status ?? '-',
        keterangan_update_domisi: item.keterangan_update_domisi ?? '-',
      };
    });
  }, [items, isLoading, page, perPage]);

  // ---------------------------------------------------------------------------
  // Skeleton rows
  // ---------------------------------------------------------------------------

  const skeletonRows = useMemo(() => {
    return Array.from({ length: 8 }).map((_, idx) => (
      <tr key={`skeleton-${idx}`} className="animate-pulse border-b border-gray-800/40">
        {Array.from({ length: 15 }).map((_, cellIdx) => (
          <td key={cellIdx} className="px-4 py-3.5">
            <div className="h-4 bg-gray-800/60 rounded-lg w-20 mx-auto" />
          </td>
        ))}
      </tr>
    ));
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 shadow-2xl backdrop-blur-xl min-h-[520px]">
      {/* 🔮 Garis Kilau Top-Border */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      {/* Fetching indicator */}
      {isFetching && (
        <div className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-mono font-medium text-indigo-300 bg-indigo-950/40 border-b border-indigo-500/20 backdrop-blur-md">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>Memperbarui data latar belakang...</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[2000px] text-center text-sm border-collapse table-auto">
          {/* Table Head */}
          <thead>
            <tr className="bg-gray-950/80 border-b border-gray-800/80 text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider backdrop-blur-md">
              <th className="px-4 py-4 w-14 whitespace-nowrap">No</th>
              <th className="px-4 py-4 w-32 whitespace-nowrap">ID PPS</th>
              <th className="px-4 py-4 min-w-[220px] whitespace-nowrap text-left">Nama Lengkap</th>
              <th className="px-4 py-4 min-w-[320px] whitespace-nowrap text-left">Alamat Asal</th>
              <th className="px-4 py-4 w-36 whitespace-nowrap">Tingkatan</th>
              <th className="px-4 py-4 w-28 whitespace-nowrap">Kelas</th>
              <th className="px-4 py-4 w-40 whitespace-nowrap">Status Domisili</th>
              <th className="px-4 py-4 min-w-[180px] whitespace-nowrap">Domisili</th>
              <th className="px-4 py-4 min-w-[180px] whitespace-nowrap text-left">Nama Ayah</th>
              <th className="px-4 py-4 min-w-[180px] whitespace-nowrap text-left">Nama Ibu</th>
              <th className="px-4 py-4 min-w-[180px] whitespace-nowrap text-left">Nama Wali</th>
              <th className="px-4 py-4 min-w-[160px] whitespace-nowrap">Kontak Wali</th>
              <th className="px-4 py-4 w-28 whitespace-nowrap">Status Aktif</th>
              <th className="px-4 py-4 min-w-[240px] whitespace-nowrap">Alasan Update</th>
              <th className="px-4 py-4 min-w-[240px] whitespace-nowrap">Ket. Update Domisili</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-800/50 bg-gray-900/30">
            {isLoading ? (
              skeletonRows
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={15} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-gray-400 shadow-inner">
                      <FileSpreadsheet className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-300">
                        Tidak Ada Data Master Santri Ditemukan
                      </p>
                      <p className="text-xs text-gray-500">
                        Ubah filter pencarian atau unggah berkas Excel baru untuk memperbarui data.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.key}
                  className="group transition-colors duration-200 hover:bg-indigo-500/[0.03]"
                >
                  {/* 1. No */}
                  <td className="px-4 py-3.5 text-gray-500 font-mono text-xs whitespace-nowrap">
                    {row.no}
                  </td>

                  {/* 2. ID PPS */}
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-400 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                      {row.id_pps}
                    </span>
                  </td>

                  {/* 3. Nama Lengkap */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-left">
                    <span className="font-semibold text-gray-200 text-sm group-hover:text-indigo-300 transition-colors">
                      {row.nama}
                    </span>
                  </td>

                  {/* 4. Alamat Asal */}
                  <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap text-left">
                    {row.alamat}
                  </td>

                  {/* 5. Tingkatan */}
                  <td className="px-4 py-3.5 text-xs text-gray-300 font-medium whitespace-nowrap">
                    {row.tingkatan}
                  </td>

                  {/* 6. Kelas */}
                  <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {row.kelas}
                  </td>

                  {/* 7. Status Domisili */}
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                      {row.status_domisili}
                    </span>
                  </td>

                  {/* 8. Kompleks Domisili */}
                  <td className="px-4 py-3.5 text-xs text-gray-300 font-semibold whitespace-nowrap">
                    {row.domisili}
                  </td>

                  {/* 9. Nama Ayah */}
                  <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap text-left">
                    {row.nama_ayah}
                  </td>

                  {/* 10. Nama Ibu */}
                  <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap text-left">
                    {row.nama_ibu}
                  </td>

                  {/* 11. Nama Wali */}
                  <td className="px-4 py-3.5 text-xs text-gray-300 whitespace-nowrap text-left">
                    {row.nama_wali}
                  </td>

                  {/* 12. Kontak Wali */}
                  <td className="px-4 py-3.5 text-xs text-gray-400 font-mono whitespace-nowrap">
                    {row.kontak_wali}
                  </td>

                  {/* 13. Status Aktif */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {renderStatusBadge(row.status_aktif)}
                  </td>

                  {/* 14. Alasan Update */}
                  <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {row.alasan_update_status}
                  </td>

                  {/* 15. Ket. Update Domisili */}
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                    {row.keterangan_update_domisi !== '-' ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
                        {row.keterangan_update_domisi}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
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