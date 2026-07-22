// src/features/rambut/components/RapidScanPosModal.tsx
import React from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Zap, QrCode, ScanBarcode } from "lucide-react";

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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="POS Scan Setoran Rambut"
      icon={<ScanBarcode className="w-5 h-5 text-indigo-400" />}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-2.5 pt-0.5 select-none" onClick={focusInput}>
        {/* Sub-Header Bar */}
        <PosHeader
          wisTimeStr={wisTimeStr}
          enableSound={enableSound}
          onToggleSound={() => setEnableSound(!enableSound)}
          printMode={printMode}
          onChangePrintMode={setPrintMode}
        />

        {/* Main Scanner Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
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

            <PosResultCard lastResult={lastResult} />
          </div>

          <PosSessionLogs logs={sessionLogs} />
        </div>
      </div>
    </BaseModal>
  );
};