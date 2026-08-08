// src/features/master/components/SyncFotoModal.tsx
import React, { useState, useRef } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { open } from "@tauri-apps/plugin-dialog";
import {
  syncFotoToPocketBase,
  type SyncFotoReport,
  type LogType,
} from "../utils/syncFotoToPocketBase";
import {
  Image,
  FolderSearch,
  CheckCircle2,
  Loader2,
  Cpu,
  UploadCloud,
  Terminal,
  FolderOpen,
  RefreshCw,
  FolderCheck,
  Play,
  Square,
  Info,
} from "lucide-react";

interface SyncFotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessSync: () => void;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: LogType;
}

export const SyncFotoModal: React.FC<SyncFotoModalProps> = ({
  isOpen,
  onClose,
  onSuccessSync,
}) => {
  const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "idle" | "scanning" | "matching" | "compressing" | "uploading" | "completed"
  >("idle");
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [report, setReport] = useState<SyncFotoReport | null>(null);

  const cancelRef = useRef(false);

  const addLog = (message: string, type: LogType = "info") => {
    const timestamp = new Date().toLocaleTimeString("id-ID");
    setLogs((prev) => [{ timestamp, message, type }, ...prev.slice(0, 99)]);
  };

  const handleOpenNativeFolderPicker = async () => {
    if (isSyncing) return;
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Pilih Folder Induk Foto Santri",
      });

      if (selected && typeof selected === "string") {
        setSelectedFolderPath(selected);
      }
    } catch (err: any) {
      addLog(`Gagal membuka dialog folder: ${err?.message || err}`, "error");
    }
  };

  const handleReset = () => {
    if (isSyncing) return;
    setSelectedFolderPath(null);
    setCurrentStep("idle");
    setProgressPercent(0);
    setReport(null);
    setLogs([]);
  };

  const handleStartSync = async () => {
    if (!selectedFolderPath || isSyncing) return;

    cancelRef.current = false;
    setIsSyncing(true);
    setLogs([]);
    setReport(null);
    setProgressPercent(0);

    try {
      const res = await syncFotoToPocketBase(
        selectedFolderPath,
        (prog) => {
          setCurrentStep(prog.step);
          setProgressPercent(prog.percent);
          setStatusMessage(prog.message);
        },
        (msg, type) => {
          addLog(msg, type);
        },
        () => cancelRef.current
      );

      setReport(res);
      setCurrentStep("completed");
      setProgressPercent(100);
      setStatusMessage(res.isCancelled ? "Sinkronisasi dibatalkan." : "Sinkronisasi foto selesai!");
    } catch (err: any) {
      addLog(`Terjadi kesalahan: ${err.message}`, "error");
      setStatusMessage("Gagal memproses sinkronisasi foto.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStopSync = () => {
    if (!isSyncing) return;
    cancelRef.current = true;
    addLog("Menghentikan proses sinkronisasi...", "warning");
  };

  const handleCloseModal = () => {
    if (isSyncing) {
      handleStopSync();
      return;
    }
    if (currentStep === "completed") {
      onSuccessSync();
    }
    handleReset();
    onClose();
  };

  const getStepBadgeClass = (stepName: string) => {
    const steps = ["scanning", "matching", "compressing", "uploading", "completed"];
    const currentIdx = steps.indexOf(currentStep);
    const targetIdx = steps.indexOf(stepName);

    if (currentIdx === targetIdx) {
      return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 ring-2 ring-indigo-500/20 font-bold";
    }
    if (currentIdx > targetIdx || currentStep === "completed") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold";
    }
    return "bg-gray-900 text-gray-500 border-gray-800";
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Smart Incremental Sync Foto Santri"
      icon={<Image className="w-5 h-5 text-indigo-400" />}
      maxWidth="max-w-2xl"
    >
      {/* 🛑 CONTAINER PRESISI: TINGGI 490PX DENGAN TERKUNCI BOTTOM FOOTER */}
      <div className="h-[490px] flex flex-col justify-between font-mono text-xs select-none">
        
        {/* 1. SLOT DROPZONE / FOLDER TERPILIH (SHRINK-0, TINGGI 66PX) */}
        <div className="h-[66px] shrink-0">
          {!selectedFolderPath ? (
            <div
              onClick={handleOpenNativeFolderPicker}
              className="h-full border-2 border-dashed border-gray-800 hover:border-indigo-500/50 rounded-2xl px-4 flex items-center justify-center gap-3 bg-gray-950/40 hover:bg-indigo-500/[0.02] cursor-pointer transition-all duration-200 group"
            >
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">
                  Klik untuk Memilih Folder Foto Santri
                </p>
                <p className="text-gray-500 text-[10px] mt-0.5">
                  Membuka Windows File Explorer Native
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full px-4 rounded-2xl bg-gray-950/80 border border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <FolderCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-xs truncate">
                    {selectedFolderPath}
                  </p>
                  <p className="text-emerald-400 text-[10px] mt-0.5 font-bold">
                    ✓ Folder Terpilih & Siap Diproses
                  </p>
                </div>
              </div>

              {!isSyncing && currentStep !== "completed" && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors shrink-0 ml-2"
                  title="Ganti Folder"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. TAHAPAN PROGRESS MULTI-STEP (SHRINK-0) */}
        <div className="grid grid-cols-4 gap-1.5 text-[10px] text-center shrink-0 my-1.5">
          <div className={`p-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 ${getStepBadgeClass("scanning")}`}>
            <FolderSearch className="w-3.5 h-3.5" />
            <span>1. Scan Foto</span>
          </div>
          <div className={`p-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 ${getStepBadgeClass("matching")}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>2. Match DB</span>
          </div>
          <div className={`p-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 ${getStepBadgeClass("compressing")}`}>
            <Cpu className="w-3.5 h-3.5" />
            <span>3. Kompresi Go</span>
          </div>
          <div className={`p-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 ${getStepBadgeClass("uploading")}`}>
            <UploadCloud className="w-3.5 h-3.5" />
            <span>4. Upload DB</span>
          </div>
        </div>

        {/* 3. SLOT MONITORING STATUS / PROGRESS / LAPORAN (SHRINK-0, TINGGI 66PX) */}
        <div className="h-[66px] shrink-0">
          {isSyncing ? (
            <div className="h-full p-3 rounded-2xl bg-gray-950/90 border border-gray-800 flex flex-col justify-center space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-indigo-300 font-bold flex items-center gap-2 truncate">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 shrink-0" />
                  <span className="truncate">{statusMessage}</span>
                </span>
                <span className="font-bold text-white shrink-0">{progressPercent}%</span>
              </div>

              <div className="w-full h-2.5 bg-gray-900 border border-gray-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : report && currentStep === "completed" ? (
            <div className={`h-full p-2.5 rounded-2xl border flex flex-col justify-center space-y-1 ${report.isCancelled ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"}`}>
              <div className="flex items-center gap-2 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{report.isCancelled ? "Sinkronisasi Dibatalkan" : "Sinkronisasi Foto Selesai!"}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-[9.5px] text-gray-300 font-mono">
                <div className="bg-gray-950/60 p-1 rounded-lg border border-gray-800/80 text-center">
                  <span className="text-gray-500 block text-[8.5px]">Scanned</span>
                  <b className="text-white text-xs">{report.totalScanned}</b>
                </div>
                <div className="bg-gray-950/60 p-1 rounded-lg border border-gray-800/80 text-center">
                  <span className="text-gray-500 block text-[8.5px]">Match DB</span>
                  <b className="text-indigo-300 text-xs">{report.matchedCount}</b>
                </div>
                <div className="bg-gray-950/60 p-1 rounded-lg border border-gray-800/80 text-center">
                  <span className="text-gray-500 block text-[8.5px]">Skipped</span>
                  <b className="text-emerald-400 text-xs">{report.skippedUpToDate}</b>
                </div>
                <div className="bg-gray-950/60 p-1 rounded-lg border border-gray-800/80 text-center">
                  <span className="text-gray-500 block text-[8.5px]">Uploaded</span>
                  <b className="text-purple-300 text-xs">{report.successUpload}</b>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full p-3 rounded-2xl bg-gray-950/40 border border-gray-800/80 flex items-center gap-2.5 text-gray-400">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <p className="text-[10.5px] leading-relaxed">
                Hanya memproses foto yang sesuai nama berkasnya dengan <b>ID PPS Santri</b>. Foto yang sudah sama versi subfoldernya di DB akan otomatis dilewati.
              </p>
            </div>
          )}
        </div>

        {/* 4. TERMINAL LOG (FLEX-1 MIN-H-0: DILENGKAPI SCROLL INTERNAL TANPA MENDORONG FOOTER) */}
        <div className="flex-1 min-h-0 my-1.5 p-2.5 rounded-2xl bg-gray-950 border border-gray-800 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between text-[10px] text-gray-500 border-b border-gray-800/80 pb-1 mb-1 shrink-0">
            <span className="flex items-center gap-1.5 font-bold">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Live Status Terminal
            </span>
            <span>{logs.length} entri</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 font-mono text-[10px]">
            {logs.length === 0 ? (
              <p className="text-gray-600 italic py-6 text-center">
                Pilih folder foto untuk memulai sinkronisasi...
              </p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-gray-600 text-[9px] shrink-0">[{log.timestamp}]</span>
                  <span
                    className={
                      log.type === "success"
                        ? "text-emerald-400"
                        : log.type === "error"
                        ? "text-rose-400"
                        : log.type === "warning"
                        ? "text-amber-300"
                        : "text-gray-300"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. FOOTER BUTTON ACTIONS (SHRINK-0, SELALU TAMPIL DI BAWAH) */}
        <div className="shrink-0 pt-2 border-t border-gray-800 flex items-center justify-end gap-2.5">
          {isSyncing ? (
            <button
              type="button"
              onClick={handleStopSync}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Hentikan Sync</span>
            </button>
          ) : currentStep === "completed" ? (
            <button
              type="button"
              onClick={handleCloseModal}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 active:scale-95 transition-all border border-emerald-400/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Selesai & Tutup</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white text-xs font-bold transition-all"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleStartSync}
                disabled={!selectedFolderPath}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-95 transition-all border border-indigo-400/30 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Mulai Sinkronisasi Foto</span>
              </button>
            </>
          )}
        </div>
      </div>
    </BaseModal>
  );
};