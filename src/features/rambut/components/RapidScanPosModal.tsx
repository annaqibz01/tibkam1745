// src/components/rambut/RapidScanPosModal.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { parsePocketBaseError } from "@/utils/errorHandler";
import { dapatkanDetailWis } from "@/utils/waktuIstiwa";
import { BaseModal } from "@/components/shared/BaseModal";
import type { WajibSetorExpanded } from "../hooks/useRambut";
import {
  QrCode,
  Volume2,
  VolumeX,
  Printer,
  Clock,
  CheckCircle2,
  XCircle,
  Scissors,
  User,
  Zap,
  MapPin,
  Home,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";

interface RapidScanPosModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodeId?: string;
}

interface ScanSessionLog {
  id: string;
  idPps: string;
  namaSantri: string;
  tingkatan: string;
  kelas: string;
  timestampWis: string;
  status: "success" | "error";
  message: string;
}

// Helper Format Alamat
const getAlamatStr = (santri: any) => {
  if (!santri) return "-";
  const parts = [santri.desa, santri.kecamatan, santri.kabupaten]
    .map((v) => v?.toString().trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "-";
};

// 🔊 Web Audio API Synthesizer
const playAudioFeedback = (type: "success" | "error") => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    console.error("Audio feedback error:", e);
  }
};

export const RapidScanPosModal: React.FC<RapidScanPosModalProps> = ({
  isOpen,
  onClose,
  periodeId,
}) => {
  const queryClient = useQueryClient();

  const [enableSound, setEnableSound] = useState(true);
  const [autoPrint, setAutoPrint] = useState(false);

  const [barcodeInput, setBarcodeInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [lastResult, setLastResult] = useState<{
    status: "idle" | "success" | "error";
    message: string;
    santriName?: string;
    idPps?: string;
    tingkatanKelas?: string;
    domisili?: string;
    alamat?: string;
    waktuWis?: string;
    kategori?: string;
  }>({ status: "idle", message: "" });

  const [sessionLogs, setSessionLogs] = useState<ScanSessionLog[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [wisTimeStr, setWisTimeStr] = useState("");

  useEffect(() => {
    const updateWisClock = () => {
      const detailWis = dapatkanDetailWis();
      setWisTimeStr(detailWis.stringLengkap);
    };

    updateWisClock();
    const interval = setInterval(updateWisClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      focusInput();
    }
  }, [isOpen, focusInput]);

  const triggerAutoPrintReceipt = (idPps: string, nama: string) => {
    if (!autoPrint) return;

    const printWindow = window.open("", "_blank", "width=300,height=400");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Bukti Setor - ${idPps}</title>
          <style>
            body { font-family: monospace; font-size: 11px; padding: 10px; text-align: center; }
            .header { font-weight: bold; font-size: 13px; margin-bottom: 5px; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .info { text-align: left; margin: 4px 0; }
            .status { font-weight: bold; margin-top: 8px; border: 1px solid #000; padding: 4px; }
          </style>
        </head>
        <body>
          <div class="header">POS PERAPIAN RAMBUT</div>
          <div>Pondok Pesantren Sidogiri</div>
          <div class="divider"></div>
          <div class="info">ID PPS : <b>${idPps}</b></div>
          <div class="info">NAMA   : <b>${nama}</b></div>
          <div class="info">WAKTU  : ${wisTimeStr}</div>
          <div class="divider"></div>
          <div class="status">VERIFIKASI SETOR: LUNAS</div>
          <div class="divider"></div>
          <div style="font-size:9px; color:#555;">Simpan sebagai bukti perapian sah.</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // 🚀 4. LOGIKA PROSES SUBMIT SETORAN DENGAN PENGAMAN DOUBLE SCAN
  const handleProcessScan = async (codeToProcess: string) => {
    const queryCode = codeToProcess.trim();
    if (!queryCode || isProcessing) return;

    setIsProcessing(true);
    setBarcodeInput("");

    try {
      // A. Cari Record Santri Tanpa Membatasi Status 'belum' Terlebih Dahulu
      let filterQuery = `(id_pps = "${queryCode}" || santri.nama ~ "${queryCode}")`;
      if (periodeId) {
        filterQuery = `periode = "${periodeId}" && ` + filterQuery;
      }

      const matchRecord = await pb
        .collection("wajib_setor_rambut")
        .getFirstListItem<WajibSetorExpanded>(filterQuery, {
          expand: "santri,periode",
        });

      if (!matchRecord) {
        throw new Error(`Data PPS / Nama "${queryCode}" tidak ditemukan di antrean periode ini.`);
      }

      const santriData = matchRecord.expand?.santri;
      const santriNama = santriData?.nama || "Santri";
      const idPps = matchRecord.id_pps;

      // 🛡️ B. PENGAMAN 1: JIKA SUDAH SETOR SEBELUMNYA
      if (matchRecord.status_setor === "sudah") {
        throw new Error(`SANTRI ${santriNama.toUpperCase()} (${idPps}) SUDAH SETOR SEBELUMNYA!`);
      }

      // 🛡️ C. PENGAMAN 2: JIKA DISPENSASI
      if (matchRecord.status_setor === "dispensasi") {
        throw new Error(`SANTRI ${santriNama.toUpperCase()} (${idPps}) MEMILIKI STATUS DISPENSASI!`);
      }

      // D. PROSES SETORAN UNTUK STATUS 'BELUM'
      const nowIso = new Date().toISOString();
      const detailWis = dapatkanDetailWis();
      const currentUserId = pb.authStore.model?.id || "";

      const updatedRecord = await pb
        .collection("wajib_setor_rambut")
        .update(matchRecord.id, {
          status_setor: "sudah",
          tanggal_setor: nowIso,
        });

      await pb.collection("riwayat_setor_rambut").create({
        wajib_setor: matchRecord.id,
        santri: matchRecord.santri || matchRecord.expand?.santri?.id || "",
        id_pps: matchRecord.id_pps,
        periode: matchRecord.periode,
        tanggal_setor: nowIso,
        waktu_wis: detailWis.stringLengkap,
        petugas_eksekutor: currentUserId,
        catatan: `Setor POS Barcode pada ${detailWis.stringLengkap}`,
      });

      const tingkatan = santriData?.tingkatan || "-";
      const kelas = santriData?.kelas || "-";
      const domisiliStr = santriData?.domisili || santriData?.status_domisili || "-";
      const alamatStr = getAlamatStr(santriData);
      const kategoriStr = (matchRecord.kategori_wajib || "").replace("_", " ");

      setLastResult({
        status: "success",
        message: "SETORAN PERAPIAN RAMBUT TERVERIFIKASI LUNAS!",
        santriName: santriNama,
        idPps: matchRecord.id_pps,
        tingkatanKelas: `${tingkatan} / Kelas ${kelas}`,
        domisili: domisiliStr,
        alamat: alamatStr,
        waktuWis: detailWis.stringLengkap,
        kategori: kategoriStr,
      });

      if (enableSound) playAudioFeedback("success");
      triggerAutoPrintReceipt(matchRecord.id_pps, santriNama);

      setSessionLogs((prev) => [
        {
          id: updatedRecord.id + Date.now(),
          idPps: matchRecord.id_pps,
          namaSantri: santriNama,
          tingkatan,
          kelas,
          timestampWis: detailWis.stringLengkap,
          status: "success",
          message: "Lunas / Terverifikasi",
        },
        ...prev.slice(0, 9),
      ]);

      queryClient.invalidateQueries({ queryKey: ["rambut-wajib-setor-list-full"] });
      queryClient.invalidateQueries({ queryKey: ["rambut-riwayat-list"] });
      queryClient.invalidateQueries({ queryKey: ["rambut-stats-real"] });
    } catch (err: any) {
      const errMsg = parsePocketBaseError(err) || err.message || "Gagal memproses setoran.";

      setLastResult({
        status: "error",
        message: errMsg,
      });

      if (enableSound) playAudioFeedback("error");
    } finally {
      setIsProcessing(false);
      focusInput();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleProcessScan(barcodeInput);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="POS Scan Perapian Rambut"
      icon={<Zap className="w-5 h-5 text-indigo-400" />}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-2.5 pt-0.5 select-none" onClick={focusInput}>
        {/* SUB-HEADER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-gray-950/80 border border-gray-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-600/20 text-indigo-300 rounded-lg border border-indigo-500/30">
              MODE CEPAT
            </span>
            <span className="text-[11px] font-mono text-gray-400 hidden sm:inline">
              Arahkan scanner / ketik ID PPS lalu tekan Enter
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{wisTimeStr || "00:00:00 WIS"}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEnableSound(!enableSound);
              }}
              className={`p-1.5 rounded-xl border transition-all ${
                enableSound
                  ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                  : "bg-gray-900 border-gray-800 text-gray-500"
              }`}
              title={enableSound ? "Suara Beep Aktif" : "Suara Beep Bisu"}
            >
              {enableSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <div
              onClick={(e) => {
                e.stopPropagation();
                setAutoPrint(!autoPrint);
              }}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border font-mono text-xs cursor-pointer select-none transition-colors duration-200 ${
                autoPrint
                  ? "bg-purple-950/60 border-purple-500/40 text-purple-200"
                  : "bg-gray-900/80 border-gray-800 text-gray-400 hover:border-gray-700"
              }`}
              title="Cetak Bukti Otomatis"
            >
              <Printer
                className={`w-3.5 h-3.5 transition-colors ${
                  autoPrint ? "text-purple-400" : "text-gray-500"
                }`}
              />
              <span className="text-[11px] font-bold">Auto Print</span>

              <div
                className={`relative w-7 h-4 rounded-full p-0.5 flex items-center transition-colors duration-200 ${
                  autoPrint ? "bg-purple-600" : "bg-gray-800 border border-gray-700"
                }`}
              >
                <motion.div
                  className="w-3 h-3 rounded-full bg-white shadow-md"
                  animate={{ x: autoPrint ? 12 : 0 }}
                  transition={{ type: "spring", stiffness: 600, damping: 30 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* MAIN POS SCANNER CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* KOLOM KIRI: SCANNER INPUT & INFORMASI SANTRI */}
          <div className="lg:col-span-7 space-y-2.5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400">
                <QrCode className="w-4 h-4 animate-pulse" />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={focusInput}
                placeholder="READY SCAN BARCODE / KETIK ID PPS..."
                disabled={isProcessing}
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-950/80 border-2 border-indigo-500/60 rounded-2xl text-white text-sm font-mono font-bold placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-xl transition-all"
              />
            </div>

            {/* 🎯 KOTAK HASIL SCAN */}
            <div
              className={`p-3.5 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[250px] ${
                lastResult.status === "success"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10 shadow-xl"
                  : lastResult.status === "error"
                  ? "bg-rose-500/10 border-rose-500/40 text-rose-300 shadow-rose-500/10 shadow-xl"
                  : "bg-gray-950/40 border-gray-800 text-gray-500"
              }`}
            >
              {lastResult.status === "success" ? (
                <div className="w-full space-y-2.5 animate-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-center gap-1.5 bg-emerald-500/20 py-0.5 px-3 rounded-full border border-emerald-500/30 w-fit mx-auto text-emerald-300 font-mono text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>VERIFIKASI SETOR LUNAS</span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-extrabold border border-emerald-500/30">
                        ID PPS: {lastResult.idPps}
                      </span>
                      {lastResult.kategori && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold uppercase border border-indigo-500/30">
                          {lastResult.kategori}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-black text-white tracking-wide truncate">
                      {lastResult.santriName}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-left pt-2 border-t border-emerald-500/20 font-mono text-xs">
                    <div className="flex items-center gap-2 bg-gray-950/60 p-1.5 px-2.5 rounded-xl border border-emerald-500/20">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-semibold">Tingkatan / Kelas</p>
                        <p className="font-bold text-gray-200 text-[11px] truncate">{lastResult.tingkatanKelas}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-950/60 p-1.5 px-2.5 rounded-xl border border-emerald-500/20">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-semibold">Domisili / Daerah</p>
                        <p className="font-bold text-emerald-300 text-[11px] truncate">{lastResult.domisili}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-950/60 p-1.5 px-2.5 rounded-xl border border-emerald-500/20 sm:col-span-2">
                      <Home className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] text-gray-400 uppercase font-semibold">Alamat Asal Santri</p>
                        <p className="font-semibold text-gray-300 text-[11px] truncate" title={lastResult.alamat}>
                          {lastResult.alamat}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-emerald-400/80 pt-0.5 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Waktu Setor: <b>{lastResult.waktuWis}</b></span>
                  </div>
                </div>
              ) : lastResult.status === "error" ? (
                <div className="space-y-2 animate-in zoom-in-95 duration-150">
                  <div className="p-2.5 bg-rose-500/20 rounded-full w-fit mx-auto border border-rose-500/30">
                    <AlertTriangle className="w-8 h-8 text-rose-400 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-rose-300 tracking-wider">TIDAK DAPAT MEMPROSES</h3>
                    <p className="text-xs font-mono font-bold text-white mt-1 max-w-sm mx-auto bg-rose-950/50 p-2.5 rounded-xl border border-rose-500/30">
                      {lastResult.message}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-gray-500">
                  <Scissors className="w-8 h-8 mx-auto stroke-1" />
                  <p className="text-xs font-mono">
                    Arahkan barcode scanner KTP / Kartu Santri ke sensor...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN: HISTORI TRANSAKSI SESI INI */}
          <div className="lg:col-span-5 flex flex-col bg-gray-950/50 border border-gray-800 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-1.5">
              <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                Sesi Scan Terbaru ({sessionLogs.length})
              </span>
              <span className="text-[10px] font-mono text-gray-500">Waktu WIS</span>
            </div>

            <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 max-h-[250px] lg:max-h-[260px] pr-1">
              {sessionLogs.length === 0 ? (
                <div className="text-center py-10 text-xs font-mono text-gray-600">
                  Belum ada transaksi di sesi ini.
                </div>
              ) : (
                sessionLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between gap-2.5 text-xs font-mono animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-white truncate text-xs">{log.namaSantri}</p>
                        <p className="text-[10px] text-gray-400">
                          ID: <span className="text-indigo-300">{log.idPps}</span> • {log.tingkatan}/{log.kelas}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 shrink-0">
                      {log.timestampWis}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};