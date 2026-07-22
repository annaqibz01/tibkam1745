// src/features/rambut/components/subtables/RambutQueueSubTable.tsx
import React, { useMemo, useState } from "react";
import {
  parseNumericIdPps,
  type WajibSetorExpanded,
} from "../../hooks/useRambut";
import { pb } from "@/lib/pocketbase";
import { triggerAutoPrintReceipt } from "../../utils/posPrinter";
import { fetchHijriByDate } from "@/features/kalender";
import {
  Scissors,
  User,
  MapPin,
  Home,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Printer,
  Loader2,
} from "lucide-react";

interface Props {
  items: WajibSetorExpanded[];
  isLoading: boolean;
  page: number;
  perPage: number;
  canExecute: boolean;
  onOpenExecuteModal: (item: WajibSetorExpanded) => void;
  onOpenDispensasiModal: (item: WajibSetorExpanded) => void;
}

const getAlamatStr = (santri: any) => {
  if (!santri) return "-";
  const parts = [santri.desa, santri.kecamatan, santri.kabupaten]
    .map((v) => v?.toString().trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "-";
};

export const RambutQueueSubTable: React.FC<Props> = ({
  items,
  isLoading,
  page,
  perPage,
  canExecute,
  onOpenExecuteModal,
  onOpenDispensasiModal,
}) => {
  const [printingId, setPrintingId] = useState<string | null>(null);

  const sortedItems = useMemo(() => {
    return [...items].sort(
      (a, b) => parseNumericIdPps(a.id_pps) - parseNumericIdPps(b.id_pps),
    );
  }, [items]);

  const handlePrintFromRiwayat = async (wajibSetorId: string) => {
    try {
      setPrintingId(wajibSetorId);

      const log = await pb
        .collection("riwayat_setor_rambut")
        .getFirstListItem(`wajib_setor = "${wajibSetorId}"`, {
          expand: "santri,petugas_eksekutor",
        });

      if (log) {
        const santri = log.expand?.santri;
        const petugas = log.expand?.petugas_eksekutor;

        // Fetch Tanggal Hijriyah
        const hijriData = await fetchHijriByDate(log.tanggal_setor);
        const stringHijri = hijriData?.string_hijri || "-";

        // Format Kelas dulu baru Tingkatan (misal: "2 MLH-A ALIYAH" / "GURU KULIYAH SYARIAH")
        const kelasVal = santri?.kelas ? `${santri.kelas}` : "";
        const tingkatanVal = santri?.tingkatan || "";
        const kelasTingkatanStr = [kelasVal, tingkatanVal].filter(Boolean).join(" ");

        triggerAutoPrintReceipt({
          idPps: log.id_pps || santri?.id_pps || "-",
          nama: santri?.nama || "Santri",
          kelasTingkatan: kelasTingkatanStr,
          domisili: santri?.domisili || santri?.status_domisili || "-",
          alamat: getAlamatStr(santri),
          tanggalHijri: stringHijri,
          waktu: log.waktu_wis || "-",
          penerima: (petugas?.username || "PETUGAS TIBKAM").toUpperCase(),
        });
      }
    } catch (err) {
      console.error("❌ Gagal mengambil log riwayat setor untuk dicetak:", err);
    } finally {
      setPrintingId(null);
    }
  };

  return (
    <table className="w-full text-xs text-left border-collapse table-auto">
      <thead>
        <tr className="bg-gray-950/90 border-b border-gray-800/80 text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider backdrop-blur-md select-none">
          <th className="px-2.5 py-3 w-8 text-center">No</th>
          <th className="px-2.5 py-3 w-20">ID PPS</th>
          <th className="px-2.5 py-3 min-w-[150px]">Nama</th>
          <th className="px-2.5 py-3 w-28 whitespace-nowrap">Domisili</th>
          <th className="px-2.5 py-3 min-w-[140px] max-w-[180px]">Alamat</th>
          <th className="px-2.5 py-3 min-w-[130px]">Tingkatan / Kelas</th>
          <th className="px-2.5 py-3 w-24 text-center">Kategori</th>
          <th className="px-2.5 py-3 w-24 text-center">Status</th>
          <th className="px-2.5 py-3 w-28 text-center">Aksi</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-800/50 bg-gray-900/30 font-mono">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <tr
              key={`skel-q-${idx}`}
              className="animate-pulse border-b border-gray-800/40"
            >
              {Array.from({ length: 9 }).map((_, c) => (
                <td key={c} className="px-2.5 py-2.5">
                  <div className="h-4 bg-gray-800/60 rounded-lg w-16 mx-auto" />
                </td>
              ))}
            </tr>
          ))
        ) : sortedItems.length === 0 ? (
          <tr>
            <td colSpan={9} className="px-6 py-16 text-center font-sans">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-gray-400">
                  <Scissors className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-xs font-semibold text-gray-300">
                  Tidak Ada Data Antrean Wajib Setor
                </p>
              </div>
            </td>
          </tr>
        ) : (
          sortedItems.map((row, index) => {
            const rowNo = (page - 1) * perPage + index + 1;
            const santriData = row.expand?.santri;

            return (
              <tr
                key={row.id}
                className="group transition-colors duration-150 hover:bg-indigo-500/[0.04]"
              >
                <td className="px-2.5 py-2 text-center text-gray-500">
                  {rowNo}
                </td>

                <td className="px-2.5 py-2 font-bold text-indigo-400 whitespace-nowrap">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {row.id_pps}
                  </span>
                </td>

                <td className="px-2.5 py-2 font-sans whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="font-semibold text-gray-200 group-hover:text-indigo-300 transition-colors">
                      {santriData?.nama || "Tanpa Nama"}
                    </span>
                  </div>
                </td>

                <td className="px-2.5 py-2 text-indigo-300 whitespace-nowrap font-sans">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>
                      {santriData?.domisili ||
                        santriData?.status_domisili ||
                        "-"}
                    </span>
                  </div>
                </td>

                <td
                  className="px-2.5 py-2 text-gray-400 whitespace-nowrap font-sans truncate max-w-[170px]"
                  title={getAlamatStr(santriData)}
                >
                  <div className="flex items-center gap-1">
                    <Home className="w-3 h-3 text-gray-500 shrink-0" />
                    <span className="truncate">{getAlamatStr(santriData)}</span>
                  </div>
                </td>

                <td className="px-2.5 py-2 text-gray-400 whitespace-nowrap">
                  {santriData?.tingkatan || "-"} / {santriData?.kelas || "-"}
                </td>

                <td className="px-2.5 py-2 text-center whitespace-nowrap">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                    {row.kategori_wajib?.replace(/_/g, " ")}
                  </span>
                </td>

                <td className="px-2.5 py-2 text-center whitespace-nowrap font-sans">
                  {row.status_setor === "sudah" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Sudah
                    </span>
                  ) : row.status_setor === "dispensasi" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      <ShieldAlert className="w-3 h-3" /> Izin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      <Clock className="w-3 h-3" /> Belum
                    </span>
                  )}
                </td>

                <td className="px-2.5 py-2 text-center whitespace-nowrap">
                  {row.status_setor === "belum" && canExecute ? (
                    <div className="flex items-center justify-center gap-1 font-sans">
                      <button
                        type="button"
                        onClick={() => onOpenExecuteModal(row)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[10px] font-semibold shadow active:scale-95 transition-all"
                      >
                        <Scissors className="w-3 h-3" /> Setor
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenDispensasiModal(row)}
                        className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-purple-300 hover:bg-purple-500/10 text-[10px] font-semibold active:scale-95 transition-all"
                      >
                        <ShieldAlert className="w-3 h-3 text-purple-400" /> Izin
                      </button>
                    </div>
                  ) : row.status_setor === "sudah" ? (
                    <button
                      type="button"
                      disabled={printingId === row.id}
                      onClick={() => handlePrintFromRiwayat(row.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold active:scale-95 transition-all disabled:opacity-50"
                      title="Cetak Ulang Bukti Setor"
                    >
                      {printingId === row.id ? (
                        <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                      ) : (
                        <Printer className="w-3 h-3 text-emerald-400" />
                      )}
                      <span>Struk</span>
                    </button>
                  ) : (
                    <span className="text-gray-500">-</span>
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