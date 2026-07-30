// src/features/laporan/components/LaporanTable.tsx
import React from "react";
import type { WajibSetorExpanded, RiwayatSetorExpanded } from "@/features/rambut";
import type { ReportType } from "../hooks/useLaporanRambut";
import { CheckCircle2, Clock, ShieldAlert, FileText, User, MapPin, Home, Moon } from "lucide-react";
import { HijriText } from "@/components/shared/HijriText";

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
    <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 shadow-2xl backdrop-blur-xl min-h-[480px]">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="overflow-x-auto custom-scrollbar">
        {!isRiwayat ? (
          <table className="w-full min-w-[1100px] text-xs text-left border-collapse table-fixed font-mono">
            <thead>
              <tr className="bg-gray-950/80 border-b border-gray-800/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider backdrop-blur-md select-none">
                <th className="px-3 py-3.5 w-[4%] text-center">No</th>
                <th className="px-3 py-3.5 w-[10%]">ID PPS</th>
                <th className="px-3 py-3.5 w-[20%] font-sans">Nama Santri</th>
                <th className="px-3 py-3.5 w-[12%] text-center">Kategori</th>
                <th className="px-3 py-3.5 w-[14%]">Tingkat / Kelas</th>
                <th className="px-3 py-3.5 w-[12%] font-sans">Domisili</th>
                <th className="px-3 py-3.5 w-[16%] font-sans">Alamat</th>
                <th className="px-3 py-3.5 w-[12%] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 bg-gray-900/30">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={`skel-q-${idx}`} className="animate-pulse border-b border-gray-800/40">
                    {Array.from({ length: 8 }).map((_, c) => (
                      <td key={c} className="px-3 py-3.5">
                        <div className="h-4 bg-gray-800/60 rounded-lg w-16 mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center font-sans">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3.5 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-gray-400">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-300">
                        Tidak Ada Data Terkait Filter Laporan
                      </p>
                    </div>
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
                    <tr key={row.id} className="group transition-colors duration-150 hover:bg-indigo-500/[0.04]">
                      <td className="px-3 py-3.5 text-center text-gray-500">{rowNo}</td>
                      
                      <td className="px-3 py-3.5 font-bold text-indigo-400 whitespace-nowrap overflow-hidden">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 inline-block">
                          {row.id_pps}
                        </span>
                      </td>

                      <td className="px-3 py-3.5 font-sans overflow-hidden">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <User className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          <span className="font-semibold text-gray-200 group-hover:text-indigo-300 transition-colors truncate" title={namaSantri}>
                            {namaSantri}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 text-center uppercase text-[10px] font-bold text-gray-400 overflow-hidden">
                        <span className="truncate block" title={row.kategori_wajib?.replace(/_/g, " ")}>
                          {row.kategori_wajib?.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="px-3 py-3.5 text-gray-300 overflow-hidden">
                        <span className="truncate block" title={tingkatKelasStr}>
                          {tingkatKelasStr}
                        </span>
                      </td>

                      <td className="px-3 py-3.5 font-sans text-indigo-300 overflow-hidden">
                        <div className="flex items-center gap-1 min-w-0">
                          <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="truncate" title={domisiliStr}>{domisiliStr}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 font-sans text-gray-400 overflow-hidden">
                        <div className="flex items-center gap-1 min-w-0">
                          <Home className="w-3 h-3 text-gray-500 shrink-0" />
                          <span className="truncate" title={alamatStr}>{alamatStr}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 text-center font-sans whitespace-nowrap overflow-hidden">
                        {row.status_setor === "sudah" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Sudah
                          </span>
                        ) : row.status_setor === "dispensasi" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            <ShieldAlert className="w-3 h-3" /> Izin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> Belum
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[1200px] text-xs text-left border-collapse table-fixed font-mono">
            <thead>
              <tr className="bg-gray-950/80 border-b border-gray-800/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider backdrop-blur-md select-none">
                <th className="px-3 py-3.5 w-[4%] text-center">No</th>
                <th className="px-3 py-3.5 w-[14%]">Tgl Hijriyah</th>
                <th className="px-3 py-3.5 w-[10%]">ID PPS</th>
                <th className="px-3 py-3.5 w-[18%] font-sans">Nama Santri</th>
                <th className="px-3 py-3.5 w-[12%] font-sans">Domisili</th>
                <th className="px-3 py-3.5 w-[14%] font-sans">Petugas Eksekutor</th>
                <th className="px-3 py-3.5 w-[10%] text-center">Waktu WIS</th>
                <th className="px-3 py-3.5 w-[18%]">Catatan Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 bg-gray-900/30">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={`skel-a-${idx}`} className="animate-pulse border-b border-gray-800/40">
                    {Array.from({ length: 8 }).map((_, c) => (
                      <td key={c} className="px-3 py-3.5">
                        <div className="h-4 bg-gray-800/60 rounded-lg w-16 mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center font-sans">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3.5 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-gray-400">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-300">
                        Tidak Ada Data Riwayat Transaksi Ditemukan
                      </p>
                    </div>
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
                    <tr key={row.id} className="group transition-colors duration-150 hover:bg-amber-500/[0.04]">
                      <td className="px-3 py-3.5 text-center text-gray-500">{rowNo}</td>

                      <td className="px-3 py-3.5 text-amber-300 whitespace-nowrap overflow-hidden">
                        <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 w-fit">
                          <Moon className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="font-bold text-[11px]">
                            <HijriText date={row.tanggal_setor || row.created} />
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 font-bold text-amber-400 whitespace-nowrap overflow-hidden">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 inline-block">
                          {row.id_pps}
                        </span>
                      </td>

                      <td className="px-3 py-3.5 font-sans overflow-hidden">
                        <span className="font-semibold text-gray-200 group-hover:text-amber-300 transition-colors truncate block" title={namaSantri}>
                          {namaSantri}
                        </span>
                      </td>

                      <td className="px-3 py-3.5 text-amber-300 font-sans overflow-hidden">
                        <div className="flex items-center gap-1 min-w-0">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate" title={domisiliStr}>{domisiliStr}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 font-sans text-gray-300 overflow-hidden">
                        <span className="truncate block" title={petugasNama}>{petugasNama}</span>
                      </td>

                      <td className="px-3 py-3.5 text-center font-bold text-emerald-400 whitespace-nowrap overflow-hidden">
                        {row.waktu_wis || "-"}
                      </td>

                      <td className="px-3 py-3.5 text-gray-400 italic overflow-hidden">
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