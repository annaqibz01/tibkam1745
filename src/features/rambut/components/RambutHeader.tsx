// src/components/rambut/RambutHeader.tsx
import React from "react";
import { Scissors, PlusCircle, CalendarDays } from "lucide-react";
import type { PeriodeRambutResponse } from "@/types/pocketbase-types";

interface RambutHeaderProps {
  activePeriode: PeriodeRambutResponse | null;
  selectedPeriode?: PeriodeRambutResponse | null;
  isAdmin?: boolean;
  onOpenCreatePeriode: () => void;
  onOpenManagePeriode: () => void;
}

export const RambutHeader: React.FC<RambutHeaderProps> = ({
  activePeriode,
  selectedPeriode,
  isAdmin = false,
  onOpenCreatePeriode,
  onOpenManagePeriode,
}) => {
  const displayedPeriode = selectedPeriode || activePeriode;
  const isViewingActive = displayedPeriode?.id === activePeriode?.id;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-r from-gray-900/90 via-indigo-950/40 to-gray-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      {/* Ambient Glow Effects */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Sisi Kiri Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-indigo-400 border border-indigo-500/20 shadow-sm uppercase tracking-wider">
              <Scissors className="w-3.5 h-3.5 text-indigo-400" />
              <span>Modul Layanan Rambut</span>
            </div>

            {displayedPeriode ? (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-semibold border shadow-sm ${
                  isViewingActive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isViewingActive ? "bg-emerald-400 animate-pulse" : "bg-indigo-400"
                  }`}
                />
                Periode Ditinjau: {displayedPeriode.nama_periode}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-rose-400 border border-rose-500/20 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Belum Ada Periode
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Layanan{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
              Rambut Santri
            </span>
          </h1>

          <p className="max-w-xl text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
            Sistem pemantauan setoran bulanan santri jenjang Aliyah, Kuliah Syariah, serta Petugas/Pengurus Pondok Pesantren Sidogiri.
          </p>
        </div>

        {/* Sisi Kanan (Aksi Admin) */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center flex-shrink-0">
            {/* Tombol Daftar Periode */}
            <button
              type="button"
              onClick={onOpenManagePeriode}
              className="px-4 py-3 bg-gray-900/90 hover:bg-gray-800 text-indigo-300 hover:text-white font-mono font-bold text-xs rounded-2xl border border-indigo-500/30 transition-all duration-200 shadow-lg active:scale-95 flex items-center gap-2"
            >
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              <span>Daftar Periode</span>
            </button>

            {/* Tombol Periode Baru */}
            <button
              type="button"
              onClick={onOpenCreatePeriode}
              className="relative group overflow-hidden inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono font-bold text-xs rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-600/25 active:scale-95 border border-indigo-400/30"
            >
              <PlusCircle className="w-4 h-4 text-indigo-100" />
              <span>Periode Baru</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};