// src/components/kalender/KalenderHeader.tsx
import React from "react";
import { CalendarDays, PlusCircle } from "lucide-react";

interface KalenderHeaderProps {
  onOpenGenerateModal: () => void;
  isAdmin?: boolean; // ✨ 1. Tambahkan prop penanda role admin
}

export const KalenderHeader: React.FC<KalenderHeaderProps> = ({ 
  onOpenGenerateModal,
  isAdmin = false,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-r from-gray-900/90 via-indigo-950/40 to-gray-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      {/* 🔮 EFEK AMBIENT GLOW MESH */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />

      {/* Garis Kilau Top-Border */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Sisi Kiri: Deskripsi & Badge */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-indigo-400 border border-indigo-500/20 shadow-sm uppercase tracking-wider">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
            <span>Kalender Pesantren</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Kalender{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
              Hijriyah
            </span>
          </h1>

          <p className="max-w-xl text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
            Sistem pemetaan konversi Kalender berbasis keputusan resmi Pondok Pesantren Sidogiri.
          </p>
        </div>

        {/* Sisi Kanan: Tombol Generate Bulan Baru (HANYA MUNCUL UNTUK ADMIN) */}
        {isAdmin && (
          <div className="flex-shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={onOpenGenerateModal}
              className="relative group overflow-hidden inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:via-indigo-400 hover:to-purple-500 text-white font-semibold text-sm rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-500/40 active:scale-[0.98] border border-indigo-400/30"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="relative flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-100 group-hover:scale-110 transition-transform duration-200" />
                <span>Generate Bulan Baru</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};