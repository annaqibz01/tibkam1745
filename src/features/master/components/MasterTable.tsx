// src/features/master/components/MasterTable.tsx
import React, { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, UserCheck, UserX, FileSpreadsheet } from 'lucide-react';
import type { MasterResponse } from '@/types/pocketbase-types';

interface MasterTableProps {
  items: MasterResponse[];
  isLoading: boolean;
  isFetching: boolean;
  page?: number;
  perPage?: number;
  onSelectSantri?: (santri: MasterResponse) => void;
}

const MasterTable: React.FC<MasterTableProps> = ({
  items,
  isLoading,
  isFetching,
  page = 1,
  perPage = 15,
  onSelectSantri,
}) => {
  const renderStatusBadge = useCallback((statusAktif: boolean) => {
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
      >
        {statusAktif ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
      </div>
    );
  }, []);

  const rows = useMemo(() => {
    if (isLoading || items.length === 0) return [];
    return items.map((item, index) => {
      const alamatSatuKolom =
        [item.desa, item.kecamatan, item.kabupaten, item.provinsi]
          .map((val) => val?.toString().trim())
          .filter(Boolean)
          .join(', ') || '-';

      return {
        rawRecord: item,
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

  const tableKey = useMemo(() => {
    return `page-${page}-item-${items[0]?.id || 'empty'}`;
  }, [page, items]);

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

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 shadow-2xl backdrop-blur-xl min-h-[520px]">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      {isFetching && !isLoading && (
        <div className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-mono font-medium text-indigo-300 bg-indigo-950/40 border-b border-indigo-500/20 backdrop-blur-md">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>Memperbarui data...</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[2000px] text-center text-sm border-collapse table-auto font-mono">
          <thead>
            <tr className="bg-gray-950/80 border-b border-gray-800/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider backdrop-blur-md">
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

          <AnimatePresence mode="wait">
            {isLoading ? (
              <tbody key="loading-body" className="divide-y divide-gray-800/50 bg-gray-900/30">
                {skeletonRows}
              </tbody>
            ) : rows.length === 0 ? (
              <tbody key="empty-body" className="divide-y divide-gray-800/50 bg-gray-900/30">
                <tr>
                  <td colSpan={15} className="px-6 py-20 text-center font-sans">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-gray-400 shadow-inner">
                        <FileSpreadsheet className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-300">
                          Tidak Ada Data Master Santri Ditemukan
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <motion.tbody
                key={tableKey}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="divide-y divide-gray-800/50 bg-gray-900/30 transform-gpu"
                style={{ willChange: "opacity, transform" }}
              >
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onSelectSantri && onSelectSantri(row.rawRecord)}
                    className="group cursor-pointer transition-colors duration-150 hover:bg-indigo-500/[0.05]"
                  >
                    <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                      {row.no}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-bold text-indigo-400 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                        {row.id_pps}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-left font-sans">
                      <span className="font-semibold text-gray-200 text-sm group-hover:text-indigo-300 transition-colors">
                        {row.nama}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap text-left font-sans">
                      {row.alamat}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-300 font-medium whitespace-nowrap font-sans">
                      {row.tingkatan}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {row.kelas}
                    </td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap font-sans">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                        {row.status_domisili}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-300 font-semibold whitespace-nowrap font-sans">
                      {row.domisili}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap text-left font-sans">
                      {row.nama_ayah}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap text-left font-sans">
                      {row.nama_ibu}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-300 whitespace-nowrap text-left font-sans">
                      {row.nama_wali}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 font-mono whitespace-nowrap">
                      {row.kontak_wali}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {renderStatusBadge(row.status_aktif)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap font-sans">
                      {row.alasan_update_status}
                    </td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap font-sans">
                      {row.keterangan_update_domisi !== '-' ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
                          {row.keterangan_update_domisi}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </motion.tbody>
            )}
          </AnimatePresence>
        </table>
      </div>
    </div>
  );
};

export default MasterTable;