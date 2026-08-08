// src/features/rambut/components/pos/PosHeader.tsx
import React from "react";
import { motion } from "framer-motion";
import { Clock, Volume2, VolumeX, Printer, ZapOff, PrinterCheck } from "lucide-react";
import type { PrintMode } from "@/types/printer";

interface PosHeaderProps {
  wisTimeStr: string;
  enableSound: boolean;
  onToggleSound: () => void;
  printMode: PrintMode;
  onChangePrintMode: (mode: PrintMode) => void;
}

export const PosHeader: React.FC<PosHeaderProps> = ({
  wisTimeStr,
  enableSound,
  onToggleSound,
  printMode,
  onChangePrintMode,
}) => {
  const modes: { id: PrintMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "off", label: "Off", icon: ZapOff },
    { id: "auto", label: "Auto", icon: Printer },
    { id: "silent", label: "Silent", icon: PrinterCheck },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-gray-950/80 border border-gray-800">
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-600/20 text-indigo-300 rounded-lg border border-indigo-500/30">
          MODE SCAN
        </span>
        <span className="text-[11px] font-mono text-gray-400 hidden sm:inline">
          Scan barcode / ketik ID PPS + Enter
        </span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Live Jam WIS */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-xs font-bold">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{wisTimeStr || "00:00:00 WIS"}</span>
        </div>

        {/* Toggle Sound */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSound();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all font-mono text-xs font-bold ${
            enableSound
              ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
              : "bg-gray-900 border-gray-800 text-gray-500"
          }`}
          title="Toggle Suara Beep (Shortcut: F1)"
        >
          {enableSound ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="text-[10px] text-gray-400">F1</span>
        </button>

        {/* Segmented Toggle 3-Mode Printing */}
        <div
          className="flex items-center bg-gray-900/90 border border-gray-800 p-0.5 rounded-xl text-xs font-mono select-none"
          onClick={(e) => e.stopPropagation()}
          title="Ganti Mode Cetak (Shortcut: F2)"
        >
          <span className="px-1.5 text-[10px] font-bold text-gray-500">F2</span>
          {modes.map((m) => {
            const isActive = printMode === m.id;
            const Icon = m.icon;

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onChangePrintMode(m.id)}
                className={`relative px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors duration-200 font-bold ${
                  isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePrintModeBg"
                    className={`absolute inset-0 rounded-lg shadow-md border ${
                      m.id === "silent"
                        ? "bg-emerald-600 border-emerald-400/40"
                        : m.id === "auto"
                        ? "bg-purple-600 border-purple-400/40"
                        : "bg-gray-800 border-gray-700"
                    }`}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? "text-white" : "text-gray-500"}`} />
                <span className="relative z-10 text-[11px]">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};