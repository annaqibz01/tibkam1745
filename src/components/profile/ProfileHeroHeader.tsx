// src/components/profile/ProfileHeroHeader.tsx
import React from "react";
import { UserCog, ShieldCheck } from "lucide-react";

export const ProfileHeroHeader: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-r from-gray-900/90 via-indigo-950/40 to-gray-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      {/* 🔮 AMBIENT GLOW MESH */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />

      {/* Garis Kilau Top-Border */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Sisi Kiri: Deskripsi & Badge */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-indigo-400 border border-indigo-500/20 shadow-sm uppercase tracking-wider">
            <UserCog className="w-3.5 h-3.5 text-indigo-400" />
            <span>Manajemen Kredensial</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Pengaturan{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
              Profil
            </span>
          </h1>

          <p className="max-w-xl text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
            Kelola informasi pribadi, foto profil, dan keamanan akun Anda dalam satu tempat terpadu.
          </p>
        </div>

        {/* Sisi Kanan: Widget Status Keamanan */}
        <div className="flex-shrink-0 self-start md:self-center">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-800/90 bg-gray-950/60 shadow-xl backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-500">
                Status Akses
              </span>
              <span className="block text-xs font-bold text-emerald-400">
                Terproteksi & Aktif
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};