// src/features/laporan/components/LaporanHeader.tsx
import React from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import type { PeriodeRambutResponse } from "@/types/pocketbase-types";

interface LaporanHeaderProps {
  selectedPeriode: PeriodeRambutResponse | null;
  onExportExcel: () => void;
}

export const LaporanHeader: React.FC<LaporanHeaderProps> = ({
  selectedPeriode,
  onExportExcel,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-r from-gray-900/90 via-indigo-950/40 to-gray-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      {/* 🔮 AMBIENT GLOW MESH */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />

      {/* Garis Kilau Top-Border */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Sisi Kiri: Deskripsi & Badge */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-indigo-400 border border-indigo-500/20 shadow-sm uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Modul Laporan Khusus</span>
            </div>

            {selectedPeriode ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-400 border border-emerald-500/20 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Periode Ditinjau: {selectedPeriode.nama_periode}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-rose-400 border border-rose-500/20 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Belum Ada Periode
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Laporan & Export{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
              Rambut Santri
            </span>
          </h1>

          <p className="max-w-xl text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
            Pusat rekapitulasi data setoran rambut santri jenjang Aliyah, Kuliah Syariah, serta Petugas/Pengurus Pondok Pesantren Sidogiri.
          </p>
        </div>

        {/* Sisi Kanan: Action Button (Murni Export Excel) */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-center flex-shrink-0">
          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-2xl transition-all duration-200 shadow-xl shadow-emerald-600/20 active:scale-95 border border-emerald-400/30"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>
    </div>
  );
};