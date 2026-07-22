// src/features/rambut/components/pos/PosResultCard.tsx
import React from "react";
import { CheckCircle2, AlertTriangle, Scissors, GraduationCap, MapPin, Home, Clock, UserCheck } from "lucide-react";
import type { LastResultState } from "../../hooks/useRapidScanPos";

interface PosResultCardProps {
  lastResult: LastResultState;
}

export const PosResultCard: React.FC<PosResultCardProps> = ({ lastResult }) => {
  return (
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
            <span>VERIFIKASI SETOR RAMBUT</span>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-extrabold border border-emerald-500/30">
                ID PPS: {lastResult.idPps}
              </span>
            </div>
            <h2 className="text-lg font-black text-white tracking-wide truncate">
              {lastResult.santriName}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-left pt-2 border-t border-emerald-500/20 font-mono text-xs">
            <div className="flex items-center gap-2 bg-gray-950/60 p-1.5 px-2.5 rounded-xl border border-emerald-500/20">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] text-gray-400 uppercase font-semibold">Kelas</p>
                <p className="font-bold text-gray-200 text-[11px] truncate uppercase">
                  {lastResult.kelasTingkatan || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-950/60 p-1.5 px-2.5 rounded-xl border border-emerald-500/20">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] text-gray-400 uppercase font-semibold">Domisili</p>
                <p className="font-bold text-emerald-300 text-[11px] truncate">
                  {lastResult.domisili || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-950/60 p-1.5 px-2.5 rounded-xl border border-emerald-500/20 sm:col-span-2">
              <Home className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] text-gray-400 uppercase font-semibold">Alamat</p>
                <p className="font-semibold text-gray-300 text-[11px] truncate" title={lastResult.alamat}>
                  {lastResult.alamat || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-emerald-400/80 pt-0.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>
                {lastResult.tanggalHijri} {lastResult.waktu ? `(${lastResult.waktu})` : ""}
              </span>
            </div>
            {lastResult.penerima && (
              <div className="flex items-center gap-1 text-gray-400">
                <UserCheck className="w-3 h-3 text-indigo-400" />
                <span>Penerima: <b className="text-indigo-300 uppercase">{lastResult.penerima}</b></span>
              </div>
            )}
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
            Arahkan Kartu santri ke barcode scanner
          </p>
        </div>
      )}
    </div>
  );
};