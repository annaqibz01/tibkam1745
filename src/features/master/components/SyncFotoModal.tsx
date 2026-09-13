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
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 font-semibold";
    }
    if (currentIdx > targetIdx || currentStep === "completed") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold";
    }
    return "bg-zinc-950 text-zinc-500 border-zinc-800";
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Sinkronisasi Foto Santri"
      icon={<Image className="w-4 h-4 text-indigo-400" />}
      maxWidth="max-w-xl"
    >
      {/* Ketinggian dikunci permanen h-[480px] dengan flex-col justify-between */}
      <div className="h-[480px] flex flex-col justify-between font-sans select-none text-xs">
        {/* 1. Folder Selector (Tinggi h-12) */}
        <div className="h-12 shrink-0">
          {!selectedFolderPath ? (
            <div
              onClick={handleOpenNativeFolderPicker}
              className="h-full border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-lg px-3 flex items-center justify-center gap-2 bg-zinc-950/40 hover:bg-zinc-850 cursor-pointer transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-300">
                Pilih Folder Induk Foto Santri
              </span>
            </div>
          ) : (
            <div className="h-full px-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FolderCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-200 text-xs truncate">
                    {selectedFolderPath}
                  </p>
                  <p className="text-emerald-400 text-[10px]">Folder siap diproses</p>
                </div>
              </div>

              {!isSyncing && currentStep !== "completed" && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  title="Ganti Folder"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. Tahapan Progress Multi-Step */}
        <div className="grid grid-cols-4 gap-1.5 text-[10px] text-center shrink-0 my-1">
          <div className={`p-1.5 rounded-md border flex items-center justify-center gap-1 ${getStepBadgeClass("scanning")}`}>
            <FolderSearch className="w-3 h-3" />
            <span>1. Scan</span>
          </div>
          <div className={`p-1.5 rounded-md border flex items-center justify-center gap-1 ${getStepBadgeClass("matching")}`}>
            <CheckCircle2 className="w-3 h-3" />
            <span>2. Match</span>
          </div>
          <div className={`p-1.5 rounded-md border flex items-center justify-center gap-1 ${getStepBadgeClass("compressing")}`}>
            <Cpu className="w-3 h-3" />
            <span>3. Kompres</span>
          </div>
          <div className={`p-1.5 rounded-md border flex items-center justify-center gap-1 ${getStepBadgeClass("uploading")}`}>
            <UploadCloud className="w-3 h-3" />
            <span>4. Upload</span>
          </div>
        </div>

        {/* 3. Progress Status / Laporan (Tinggi h-14) */}
        <div className="h-14 shrink-0">
          {isSyncing ? (
            <div className="h-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col justify-center space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-300 font-medium flex items-center gap-1.5 truncate">
                  <Loader2 className="w-3 h-3 animate-spin text-indigo-400 shrink-0" />
                  <span className="truncate">{statusMessage}</span>
                </span>
                <span className="font-mono text-zinc-100 font-semibold">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : report && currentStep === "completed" ? (
            <div className="h-full p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col justify-center space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{report.isCancelled ? "Sinkronisasi Dibatalkan" : "Sinkronisasi Foto Selesai"}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-mono">
                <div className="bg-zinc-900 p-1 rounded border border-zinc-800">
                  <span className="text-zinc-500 block text-[8.5px]">Scanned</span>
                  <b className="text-zinc-200">{report.totalScanned}</b>
                </div>
                <div className="bg-zinc-900 p-1 rounded border border-zinc-800">
                  <span className="text-zinc-500 block text-[8.5px]">Match DB</span>
                  <b className="text-indigo-400">{report.matchedCount}</b>
                </div>
                <div className="bg-zinc-900 p-1 rounded border border-zinc-800">
                  <span className="text-zinc-500 block text-[8.5px]">Skipped</span>
                  <b className="text-zinc-400">{report.skippedUpToDate}</b>
                </div>
                <div className="bg-zinc-900 p-1 rounded border border-zinc-800">
                  <span className="text-zinc-500 block text-[8.5px]">Uploaded</span>
                  <b className="text-emerald-400">{report.successUpload}</b>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-2 text-zinc-400 text-[11px]">
              <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Foto dengan nama ID PPS santri yang cocok akan disinkronkan otomatis.</span>
            </div>
          )}
        </div>

        {/* 4. Terminal Log (Mengisi Ruang Dinamis dengan Scroll Internal) */}
        <div className="flex-1 min-h-0 my-1 p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 pb-1 border-b border-zinc-800 shrink-0">
            <span className="flex items-center gap-1 font-semibold">
              <Terminal className="w-3 h-3 text-zinc-400" /> Log Aktivitas
            </span>
            <span className="font-mono">{logs.length} entri</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 font-mono text-[10px] pt-1">
            {logs.length === 0 ? (
              <p className="text-zinc-600 italic text-center py-4">
                Siap memproses folder foto...
              </p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-1.5 leading-tight">
                  <span className="text-zinc-600 text-[9px] shrink-0">[{log.timestamp}]</span>
                  <span
                    className={
                      log.type === "success"
                        ? "text-emerald-400"
                        : log.type === "error"
                        ? "text-rose-400"
                        : log.type === "warning"
                        ? "text-amber-400"
                        : "text-zinc-300"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. Footer Actions (Tinggi h-9) */}
        <div className="shrink-0 flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          {isSyncing ? (
            <button
              type="button"
              onClick={handleStopSync}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Hentikan</span>
            </button>
          ) : currentStep === "completed" ? (
            <button
              type="button"
              onClick={handleCloseModal}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors active:scale-98"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Selesai & Tutup</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCloseModal}
                className="h-9 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleStartSync}
                disabled={!selectedFolderPath}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Mulai Sinkronisasi</span>
              </button>
            </>
          )}
        </div>
      </div>
    </BaseModal>
  );
};