// src/features/rambut/components/pos/PosSessionLogs.tsx
import React, { useState } from "react";
import { User, Printer, Loader2, History } from "lucide-react";
import { triggerAutoPrintReceipt } from "../../utils/posPrinter";
import { pb } from "@/lib/pocketbase";
import { fetchHijriByDate } from "@/features/kalender";
import type { ScanSessionLog } from "../../hooks/useRapidScanPos";

interface PosSessionLogsProps {
  logs: ScanSessionLog[];
}

export const PosSessionLogs: React.FC<PosSessionLogsProps> = ({ logs }) => {
  const [printingId, setPrintingId] = useState<string | null>(null);

  const handlePrintFromLog = async (logItem: ScanSessionLog) => {
    try {
      setPrintingId(logItem.id);

      let logRecord = null;
      try {
        logRecord = await pb
          .collection("riwayat_setor_rambut")
          .getOne(logItem.id, {
            expand: "santri,petugas_eksekutor",
          });
      } catch {
        logRecord = await pb
          .collection("riwayat_setor_rambut")
          .getFirstListItem(`id_pps = "${logItem.idPps}"`, {
            sort: "-created",
            expand: "santri,petugas_eksekutor",
          });
      }

      if (logRecord) {
        const santri = logRecord.expand?.santri;
        const petugas = logRecord.expand?.petugas_eksekutor;

        const hijriData = await fetchHijriByDate(logRecord.tanggal_setor);
        const stringHijri = hijriData?.string_hijri || "-";

        const kelasVal = santri?.kelas || logItem.kelas;
        const tingkatanVal = santri?.tingkatan || logItem.tingkatan || "";
        const kelasTingkatanStr = [kelasVal, tingkatanVal].filter(Boolean).join(" ");

        const addressParts = [santri?.desa, santri?.kecamatan, santri?.kabupaten]
          .map((v) => v?.toString().trim())
          .filter(Boolean);
        const alamatStr = addressParts.length > 0 ? addressParts.join(", ") : "-";

        triggerAutoPrintReceipt({
          idPps: logRecord.id_pps || logItem.idPps,
          nama: santri?.nama || logItem.namaSantri || "Santri",
          kelasTingkatan: kelasTingkatanStr,
          domisili: santri?.domisili || santri?.status_domisili || "-",
          alamat: alamatStr,
          tanggalHijri: stringHijri,
          waktu: logRecord.waktu_wis || logItem.timestampWis || "-",
          penerima: (petugas?.username || "PETUGAS TIBKAM").toUpperCase(),
        });
      }
    } catch (err) {
      console.error("❌ Gagal mengambil data riwayat setor dari log POS:", err);
    } finally {
      setPrintingId(null);
    }
  };

  return (
    <div className="flex flex-col bg-gray-950/50 border border-gray-800 rounded-2xl p-3 space-y-2 h-[380px]">
      {/* HEADER SESI SCAN */}
      <div className="flex items-center justify-between border-b border-gray-800/80 pb-1.5 shrink-0">
        <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sesi Scan Terbaru ({logs.length})</span>
        </span>
      </div>

      {/* DYNAMIC SCROLL CONTAINER INTERNAL */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10 text-xs font-mono text-gray-600 space-y-1">
            <History className="w-8 h-8 opacity-30 stroke-1" />
            <p>Belum ada setoran di sesi ini.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-2 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between gap-2.5 text-xs font-mono hover:border-gray-700 transition-all animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <div className="flex items-center gap-2 truncate min-w-0">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <p className="font-bold text-white truncate text-xs">
                    {log.namaSantri}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    ID: <span className="text-indigo-300 font-bold">{log.idPps}</span> •{" "}
                    {log.tingkatan}/{log.kelas}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                  {log.timestampWis}
                </span>

                <button
                  type="button"
                  disabled={printingId === log.id}
                  onClick={() => handlePrintFromLog(log)}
                  className="p-1.5 rounded-lg bg-gray-900 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-300 border border-gray-800 hover:border-emerald-500/30 transition-all active:scale-90 disabled:opacity-50"
                  title="Cetak Ulang Struk Bukti Setor"
                >
                  {printingId === log.id ? (
                    <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  ) : (
                    <Printer className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};