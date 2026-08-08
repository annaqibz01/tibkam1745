// src/features/rambut/components/pos/PosResultCard.tsx
import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Scissors,
  GraduationCap,
  MapPin,
  Home,
  Clock,
  UserCheck,
  XCircle,
} from "lucide-react";
import type { LastResultState } from "../../hooks/useRapidScanPos";
import { pb } from "@/lib/pocketbase";

interface PosResultCardProps {
  lastResult: LastResultState;
}

export const PosResultCard: React.FC<PosResultCardProps> = ({ lastResult }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [lastResult]);

  const fotoUrl = lastResult.fotoUrl
    ? lastResult.fotoUrl
    : lastResult.foto && lastResult.record
    ? pb.getFileUrl(lastResult.record, lastResult.foto)
    : null;

  return (
    <div
      className={`p-3 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between text-center h-[335px] ${
        lastResult.status === "success"
          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10 shadow-xl"
          : lastResult.status === "error"
          ? "bg-rose-500/10 border-rose-500/40 text-rose-300 shadow-rose-500/10 shadow-xl"
          : "bg-gray-950/40 border-gray-800 text-gray-500"
      }`}
    >
      {lastResult.status === "success" ? (
        <div className="w-full space-y-2.5 animate-in zoom-in-95 duration-150 my-auto">
          {/* BADGE VERIFIKASI */}
          <div className="flex items-center justify-center gap-1.5 bg-emerald-500/20 py-0.5 px-3 rounded-full border border-emerald-500/30 w-fit mx-auto text-emerald-300 font-mono text-[10px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>VERIFIKASI SETOR RAMBUT</span>
          </div>

          {/* HERO PROFILE: FOTO SANTRI (PROPORSI PASFOTO 3:4) */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3.5 px-1 text-center sm:text-left">
            <div className="relative w-24 h-32 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 flex items-center justify-center text-white shadow-xl shadow-emerald-600/25 border-2 border-emerald-400/40 shrink-0 overflow-hidden group mx-auto sm:mx-0">
              {fotoUrl && !imageError ? (
                <img
                  src={fotoUrl}
                  alt={lastResult.santriName || "Foto Santri"}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="font-sans font-extrabold text-4xl leading-none tracking-wider uppercase select-none drop-shadow-md">
                  {lastResult.santriName ? lastResult.santriName.charAt(0) : "?"}
                </span>
              )}
            </div>

            {/* DETAIL NAMA & ID PPS */}
            <div className="space-y-1 min-w-0 flex-1 pt-0.5">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-extrabold border border-emerald-500/30">
                  ID PPS: {lastResult.idPps}
                </span>
              </div>

              <h2 className="text-lg font-black text-white tracking-wide truncate">
                {lastResult.santriName}
              </h2>

              <p className="text-[11px] font-mono text-emerald-400 font-bold">
                ✓ Setoran Berhasil Diverifikasi
              </p>
            </div>
          </div>

          {/* GRID INFORMASI AKADEMIK & ALAMAT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-left pt-2 border-t border-emerald-500/20 font-mono text-xs">
            <div className="flex items-center gap-2 bg-gray-950/60 p-1.5 px-2.5 rounded-xl border border-emerald-500/20">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[8.5px] text-gray-400 uppercase font-semibold">Kelas</p>
                <p className="font-bold text-gray-200 text-[10.5px] truncate uppercase">
                  {lastResult.kelasTingkatan || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-950/60 p-1.5 px-2.5 rounded-xl border border-emerald-500/20">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[8.5px] text-gray-400 uppercase font-semibold">Domisili</p>
                <p className="font-bold text-emerald-300 text-[10.5px] truncate">
                  {lastResult.domisili || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-950/60 p-1.5 px-2.5 rounded-xl border border-emerald-500/20 sm:col-span-2">
              <Home className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[8.5px] text-gray-400 uppercase font-semibold">Alamat</p>
                <p className="font-semibold text-gray-300 text-[10.5px] truncate" title={lastResult.alamat}>
                  {lastResult.alamat || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER TIMESTAMPS & PENERIMA */}
          <div className="text-[9.5px] font-mono text-emerald-400/80 pt-0.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
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
        <div className="w-full my-auto py-4 space-y-3 animate-in zoom-in-95 duration-150 flex flex-col items-center justify-center">
          <div className="p-2.5 bg-rose-500/20 rounded-full w-fit mx-auto border border-rose-500/30">
            <AlertTriangle className="w-9 h-9 text-rose-400 animate-bounce" />
          </div>

          <div className="space-y-2 w-full max-w-md mx-auto">
            <div className="flex items-center justify-center gap-1.5 bg-rose-500/20 py-1 px-3.5 rounded-full border border-rose-500/30 w-fit mx-auto text-rose-300 font-mono text-xs font-bold">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>TIDAK DAPAT MEMPROSES SETORAN</span>
            </div>

            <p className="text-xs font-mono font-bold text-white bg-rose-950/60 p-3.5 rounded-2xl border border-rose-500/40 shadow-lg leading-relaxed">
              {lastResult.message}
            </p>
          </div>
        </div>
      ) : (
        <div className="my-auto py-10 space-y-2 text-gray-500 flex flex-col items-center justify-center">
          <Scissors className="w-9 h-9 mx-auto stroke-1" />
          <p className="text-xs font-mono font-bold">
            Arahkan Kartu santri ke barcode scanner
          </p>
        </div>
      )}
    </div>
  );
};