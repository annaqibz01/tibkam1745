// src/features/laporan/rambut/components/LaporanTable.tsx
import React from "react";
import type { WajibSetorExpanded, RiwayatSetorExpanded } from "@/features/rambut";
import type { ReportType } from "../hooks/useLaporanRambut";
import { StatusBadge, EmptyState, HijriText } from "@/components/shared";
import { CheckCircle2, Clock, ShieldAlert, FileText, User, MapPin, Home, Moon } from "lucide-react";

interface LaporanTableProps {
  reportType: ReportType;
  items: any[];
  isLoading: boolean;
  page?: number;
  perPage?: number;
}

const getAlamatStr = (santri: any) => {
  if (!santri) return "-";
  const parts = [santri.desa, santri.kecamatan, santri.kabupaten]
    .map((v) => v?.toString().trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "-";
};

export const LaporanTable: React.FC<LaporanTableProps> = ({
  reportType,
  items,
  isLoading,
  page = 1,
  perPage = 15,
}) => {
  const isRiwayat = reportType === "riwayat";

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm overflow-hidden font-sans select-none">
      <div className="overflow-x-auto custom-scrollbar">
        {!isRiwayat ? (
          <table className="w-full min-w-[1100px] text-xs text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider sticky top-0 z-10">
                <th className="px-3 py-2.5 w-12 text-center">No</th>
                <th className="px-3 py-2.5 w-24">ID PPS</th>
                <th className="px-3 py-2.5 w-[22%]">Nama Santri</th>
                <th className="px-3 py-2.5 w-[12%] text-center">Kategori</th>
                <th className="px-3 py-2.5 w-[14%]">Tingkat / Kelas</th>
                <th className="px-3 py-2.5 w-[12%]">Domisili</th>
                <th className="px-3 py-2.5 w-[16%]">Alamat</th>
                <th className="px-3 py-2.5 w-28 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={`skel-q-${idx}`} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, c) => (
                      <td key={c} className="px-3 py-2">
                        <div className="h-4 bg-zinc-800 rounded w-16 mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10">
                    <EmptyState
                      icon={<FileText className="w-6 h-6 text-zinc-500" />}
                      title="Tidak Ada Data Terkait Filter Laporan"
                      description="Coba pilih periode lain atau sesuaikan parameter filter laporan Anda."
                    />
                  </td>
                </tr>
              ) : (
                items.map((row: WajibSetorExpanded, index) => {
                  const rowNo = (page - 1) * perPage + index + 1;
                  const santriData = row.expand?.santri;
                  const namaSantri = santriData?.nama || "Santri";
                  const domisiliStr = santriData?.domisili || santriData?.status_domisili || "-";
                  const alamatStr = getAlamatStr(santriData);
                  const tingkatKelasStr = `${santriData?.tingkatan || "-"} / ${santriData?.kelas || "-"}`;

                  return (
                    <tr key={row.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-3 py-2 text-center text-zinc-500 font-mono">
                        {rowNo}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          {row.id_pps}
                        </span>
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="font-medium text-zinc-200 truncate select-text" title={namaSantri}>
                            {namaSantri}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2 text-center uppercase text-[10px] font-medium text-zinc-400">
                        <span className="truncate block" title={row.kategori_wajib?.replace(/_/g, " ")}>
                          {row.kategori_wajib?.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="px-3 py-2 text-zinc-300">
                        <span className="truncate block" title={tingkatKelasStr}>
                          {tingkatKelasStr}
                        </span>
                      </td>

                      <td className="px-3 py-2 text-zinc-300">
                        <div className="flex items-center gap-1 min-w-0">
                          <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span className="truncate" title={domisiliStr}>{domisiliStr}</span>
                        </div>
                      </td>

                      <td className="px-3 py-2 text-zinc-400">
                        <div className="flex items-center gap-1 min-w-0">
                          <Home className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span className="truncate" title={alamatStr}>{alamatStr}</span>
                        </div>
                      </td>

                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {row.status_setor === "sudah" ? (
                          <StatusBadge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>
                            Sudah
                          </StatusBadge>
                        ) : row.status_setor === "dispensasi" ? (
                          <StatusBadge variant="purple" icon={<ShieldAlert className="w-3 h-3" />}>
                            Izin
                          </StatusBadge>
                        ) : (
                          <StatusBadge variant="warning" icon={<Clock className="w-3 h-3" />}>
                            Belum
                          </StatusBadge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[1200px] text-xs text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider sticky top-0 z-10">
                <th className="px-3 py-2.5 w-12 text-center">No</th>
                <th className="px-3 py-2.5 w-36">Tgl Hijriyah</th>
                <th className="px-3 py-2.5 w-24">ID PPS</th>
                <th className="px-3 py-2.5 w-[20%]">Nama Santri</th>
                <th className="px-3 py-2.5 w-[12%]">Domisili</th>
                <th className="px-3 py-2.5 w-[14%]">Petugas Eksekutor</th>
                <th className="px-3 py-2.5 w-24 text-center">Waktu WIS</th>
                <th className="px-3 py-2.5 w-[18%]">Catatan Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={`skel-a-${idx}`} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, c) => (
                      <td key={c} className="px-3 py-2">
                        <div className="h-4 bg-zinc-800 rounded w-16 mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10">
                    <EmptyState
                      icon={<FileText className="w-6 h-6 text-zinc-500" />}
                      title="Tidak Ada Data Riwayat Transaksi"
                      description="Belum ada transaksi setor yang tercatat untuk kriteria filter ini."
                    />
                  </td>
                </tr>
              ) : (
                items.map((row: RiwayatSetorExpanded, index) => {
                  const rowNo = (page - 1) * perPage + index + 1;
                  const santriData = row.expand?.santri;
                  const petugasData = row.expand?.petugas_eksekutor;
                  const namaSantri = santriData?.nama || "Santri";
                  const domisiliStr = santriData?.domisili || santriData?.status_domisili || "-";
                  const petugasNama = petugasData?.name || petugasData?.username || "-";
                  const catatanStr = row.catatan || "-";

                  return (
                    <tr key={row.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-3 py-2 text-center text-zinc-500 font-mono">
                        {rowNo}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-amber-300 font-mono text-[11px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 w-fit">
                          <Moon className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>
                            <HijriText date={row.tanggal_setor || row.created} />
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          {row.id_pps}
                        </span>
                      </td>

                      <td className="px-3 py-2">
                        <span className="font-medium text-zinc-200 truncate block select-text" title={namaSantri}>
                          {namaSantri}
                        </span>
                      </td>

                      <td className="px-3 py-2 text-zinc-300">
                        <div className="flex items-center gap-1 min-w-0">
                          <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span className="truncate" title={domisiliStr}>{domisiliStr}</span>
                        </div>
                      </td>

                      <td className="px-3 py-2 text-zinc-300">
                        <span className="truncate block" title={petugasNama}>{petugasNama}</span>
                      </td>

                      <td className="px-3 py-2 text-center font-mono font-bold text-emerald-400 text-xs whitespace-nowrap">
                        {row.waktu_wis || "-"}
                      </td>

                      <td className="px-3 py-2 text-zinc-400 text-[11px]">
                        <span className="truncate block" title={catatanStr}>{catatanStr}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};