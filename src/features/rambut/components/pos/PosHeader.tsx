// src/features/rambut/components/pos/PosHeader.tsx
import React from "react";
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
    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-600/20 text-indigo-300 rounded border border-indigo-500/30">
          MODE SCAN
        </span>
        <span className="text-[11px] text-zinc-400 hidden sm:inline">
          Scan barcode / ketik ID PPS + Enter
        </span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-xs font-bold">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{wisTimeStr || "00:00:00 WIS"}</span>
        </div>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleSound(); }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors font-sans text-xs font-medium ${
            enableSound
              ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
              : "bg-zinc-900 border-zinc-800 text-zinc-500"
          }`}
          title="Toggle Suara Beep (Shortcut: F1)"
        >
          {enableSound ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="text-[10px] text-zinc-400">F1</span>
        </button>

        <div
          className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs select-none"
          onClick={(e) => e.stopPropagation()}
          title="Ganti Mode Cetak (Shortcut: F2)"
        >
          <span className="px-1.5 text-[10px] font-bold text-zinc-500">F2</span>
          {modes.map((m) => {
            const isActive = printMode === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onChangePrintMode(m.id)}
                className={`relative px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors font-medium ${
                  isActive ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-zinc-500"}`} />
                <span className="text-[11px]">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};