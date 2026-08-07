// src/features/profile/components/ProfileHeroHeader.tsx
import React from "react";
import { UserCog, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared";

export const ProfileHeroHeader: React.FC = () => {
  const securityWidget = (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-800/90 bg-gray-950/60 shadow-xl backdrop-blur-md select-none">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
        <ShieldCheck className="w-5 h-5" />
      </div>
      <div className="space-y-0.5">
        <span className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-500">
          Status Akses
        </span>
        <span className="block text-xs font-bold text-emerald-400 font-mono">
          Terproteksi & Aktif
        </span>
      </div>
    </div>
  );

  return (
    <PageHeader
      badgeIcon={<UserCog className="w-3.5 h-3.5" />}
      badgeLabel="Manajemen Kredensial"
      title={
        <>
          Pengaturan{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
            Profil
          </span>
        </>
      }
      description="Kelola informasi pribadi, foto profil, dan keamanan akun Anda dalam satu tempat terpadu."
      widget={securityWidget}
    />
  );
};