// src/features/rambut/components/RapidScanPosModal.tsx
import React from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { QrCode, ScanBarcode, Loader2 } from "lucide-react";
import { useRapidScanPos } from "../hooks/useRapidScanPos";
import { PosHeader } from "./pos/PosHeader";
import { PosResultCard } from "./pos/PosResultCard";
import { PosSessionLogs } from "./pos/PosSessionLogs";

interface RapidScanPosModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodeId?: string;
}

export const RapidScanPosModal: React.FC<RapidScanPosModalProps> = ({
  isOpen,
  onClose,
  periodeId,
}) => {
  const {
    enableSound,
    setEnableSound,
    printMode,
    setPrintMode,
    barcodeInput,
    setBarcodeInput,
    isProcessing,
    wisTimeStr,
    lastResult,
    sessionLogs,
    inputRef,
    focusInput,
    handleProcessScan,
  } = useRapidScanPos(isOpen, periodeId);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleProcessScan(barcodeInput);
    }
  };

  const getInputBorderClass = () => {
    if (isProcessing) return "border-amber-500 focus:border-amber-400";
    if (lastResult.status === "success") return "border-emerald-500/80 focus:border-emerald-400";
    if (lastResult.status === "error") return "border-rose-500/80 focus:border-rose-400";
    return "border-zinc-800 focus:border-indigo-500";
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="POS Scan Setoran Rambut"
      icon={<ScanBarcode className="w-4 h-4 text-indigo-400" />}
      maxWidth="max-w-5xl"
    >
      <div
        className="space-y-2.5 pt-0.5 select-none overflow-hidden px-0.5 font-sans"
        onClick={focusInput}
      >
        <PosHeader
          wisTimeStr={wisTimeStr}
          enableSound={enableSound}
          onToggleSound={() => setEnableSound(!enableSound)}
          printMode={printMode}
          onChangePrintMode={setPrintMode}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          <div className="lg:col-span-7 flex flex-col space-y-2.5 min-w-0">
            <div className="relative group shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-400">
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <QrCode className="w-4 h-4" />
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={(e) => e.target.select()}
                placeholder="SIAP SCAN KARTU SANTRI / KETIK ID PPS..."
                disabled={isProcessing}
                className={`w-full h-9 pl-9 pr-3 bg-zinc-950 border rounded-lg text-xs text-zinc-100 font-bold placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors ${getInputBorderClass()}`}
              />
            </div>
            <div className="flex-1 min-h-0">
              <PosResultCard lastResult={lastResult} />
            </div>
          </div>
          <div className="lg:col-span-5 min-w-0 flex flex-col">
            <PosSessionLogs logs={sessionLogs} />
          </div>
        </div>
      </div>
    </BaseModal>
  );
};