// src/features/rambut/components/subtables/RambutQueueSubTable.tsx
import React, { useMemo, useState } from "react";
import type { WajibSetorExpanded } from "../../types";
import { pb } from "@/lib/pocketbase";
import { triggerAutoPrintReceipt } from "../../utils/posPrinter";
import { fetchHijriByDate } from "@/features/kalender";
import { StatusBadge, EmptyState } from "@/components/shared";
import { parseNumericIdPps, getAlamatStr } from "@/utils/userHelpers";
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
  Lock,
} from "lucide-react";

interface Props {
  items: WajibSetorExpanded[];
  isLoading: boolean;
  page: number;
  perPage: number;
  canExecute: boolean;
  disabledReason?: string;
  onOpenExecuteModal: (item: WajibSetorExpanded) => void;
  onOpenDispensasiModal: (item: WajibSetorExpanded) => void;
}

export const RambutQueueSubTable: React.FC<Props> = ({
  items,
  isLoading,
  page,
  perPage,
  canExecute,
  disabledReason = "Transaksi dikunci. Periode tidak aktif atau di luar jadwal operasional.",
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
        const hijriData = await fetchHijriByDate(log.tanggal_setor);
        const stringHijri = hijriData?.string_hijri || "-";
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
    <table className="w-full min-w-[1050px] text-xs text-left border-collapse table-fixed select-none font-sans">
      <thead>
        <tr className="h-10 bg-zinc-950 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          <th className="px-2.5 w-[45px] text-center">No</th>
          <th className="px-2.5 w-[95px]">ID PPS</th>
          <th className="px-2.5 w-[210px]">Nama</th>
          <th className="px-2.5 w-[110px]">Domisili</th>
          <th className="px-2.5 w-[170px]">Alamat</th>
          <th className="px-2.5 w-[130px]">Tingkatan / Kelas</th>
          <th className="px-2.5 w-[115px] text-center">Kategori</th>
          <th className="px-2.5 w-[95px] text-center">Status</th>
          <th className="px-2.5 w-[135px] text-center">Aksi</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40">
        {isLoading ? (
          Array.from({ length: perPage || 8 }).map((_, idx) => (
            <tr key={`skel-q-${idx}`} className="h-10 animate-pulse">
              <td className="px-2.5 text-center"><div className="h-3.5 bg-zinc-800 rounded w-4 mx-auto" /></td>
              <td className="px-2.5"><div className="h-4 bg-zinc-800 rounded w-16" /></td>
              <td className="px-2.5"><div className="h-4 bg-zinc-800 rounded w-36" /></td>
              <td className="px-2.5"><div className="h-4 bg-zinc-800 rounded w-20" /></td>
              <td className="px-2.5"><div className="h-4 bg-zinc-800 rounded w-28" /></td>
              <td className="px-2.5"><div className="h-4 bg-zinc-800 rounded w-20" /></td>
              <td className="px-2.5 text-center"><div className="h-4 bg-zinc-800 rounded w-16 mx-auto" /></td>
              <td className="px-2.5 text-center"><div className="h-4 bg-zinc-800 rounded w-14 mx-auto" /></td>
              <td className="px-2.5 text-center"><div className="h-6 bg-zinc-800 rounded w-24 mx-auto" /></td>
            </tr>
          ))
        ) : sortedItems.length === 0 ? (
          <tr>
            <td colSpan={9} className="px-6 py-12">
              <EmptyState
                icon={<Scissors className="w-6 h-6 text-zinc-500" />}
                title="Tidak Ada Data Antrean Wajib Setor"
                description="Pastikan antrean periode telah di-generate atau sesuaikan filter Anda."
              />
            </td>
          </tr>
        ) : (
          sortedItems.map((row, index) => {
            const rowNo = (page - 1) * perPage + index + 1;
            const santriData = row.expand?.santri;

            return (
              <tr key={row.id} className="h-10 hover:bg-zinc-800/40 transition-colors">
                {/* 1. No */}
                <td className="px-2.5 text-center text-zinc-500 font-mono text-[11px] truncate">
                  {rowNo}
                </td>

                {/* 2. ID PPS */}
                <td className="px-2.5 whitespace-nowrap">
                  <span className="inline-block px-1.5 py-0.5 rounded font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20">
                    {row.id_pps}
                  </span>
                </td>

                {/* 3. Nama */}
                <td className="px-2.5 truncate" title={santriData?.nama || "Tanpa Nama"}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="font-semibold text-zinc-200 truncate">
                      {santriData?.nama || "Tanpa Nama"}
                    </span>
                  </div>
                </td>

                {/* 4. Domisili */}
                <td className="px-2.5 text-indigo-300 truncate font-sans">
                  <div className="flex items-center gap-1 min-w-0">
                    <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate">
                      {santriData?.domisili || santriData?.status_domisili || "-"}
                    </span>
                  </div>
                </td>

                {/* 5. Alamat */}
                <td className="px-2.5 text-zinc-400 truncate font-sans" title={getAlamatStr(santriData)}>
                  <div className="flex items-center gap-1 min-w-0">
                    <Home className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span className="truncate">{getAlamatStr(santriData)}</span>
                  </div>
                </td>

                {/* 6. Tingkatan / Kelas */}
                <td className="px-2.5 text-zinc-400 truncate font-mono text-[11px]">
                  {santriData?.tingkatan || "-"} / {santriData?.kelas || "-"}
                </td>

                {/* 7. Kategori */}
                <td className="px-2.5 text-center whitespace-nowrap">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                    {row.kategori_wajib?.replace(/_/g, " ")}
                  </span>
                </td>

                {/* 8. Status */}
                <td className="px-2.5 text-center whitespace-nowrap">
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

                {/* 9. Aksi: Slot Terkunci Mutlak */}
                <td className="px-2.5 text-center whitespace-nowrap">
                  <div className="w-[125px] h-7 mx-auto flex items-center justify-center">
                    {row.status_setor === "belum" ? (
                      canExecute ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenExecuteModal(row)}
                            className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold shadow-sm transition-colors active:scale-95"
                          >
                            <Scissors className="w-3 h-3" />
                            <span>Setor</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenDispensasiModal(row)}
                            className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-zinc-900 border border-zinc-800 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/30 text-[10px] font-semibold transition-colors active:scale-95"
                          >
                            <ShieldAlert className="w-3 h-3 text-purple-400" />
                            <span>Izin</span>
                          </button>
                        </div>
                      ) : (
                        <div
                          className="inline-flex items-center justify-center gap-1 h-6 px-2.5 rounded-md bg-zinc-950/80 border border-zinc-800 text-zinc-500 text-[10px] font-mono cursor-not-allowed select-none"
                          title={disabledReason}
                        >
                          <Lock className="w-3 h-3 text-zinc-600" />
                          <span>Terkunci</span>
                        </div>
                      )
                    ) : row.status_setor === "sudah" ? (
                      <button
                        type="button"
                        disabled={printingId === row.id}
                        onClick={() => handlePrintFromRiwayat(row.id)}
                        className="inline-flex items-center justify-center gap-1.5 h-6 px-3 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold transition-colors active:scale-95 disabled:opacity-50"
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
                      <span className="text-zinc-600 font-mono text-sm leading-none">-</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};