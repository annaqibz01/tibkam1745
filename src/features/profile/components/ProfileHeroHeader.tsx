// src/features/profile/components/ProfileHeroHeader.tsx
import React from "react";
import { UserCog, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared";

export const ProfileHeroHeader: React.FC = () => {
  const securityWidget = (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-950/60 select-none">
      <div className="flex h-8 w-8 items-center justify-center shrink-0 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <ShieldCheck className="w-4 h-4" />
      </div>
      <div className="space-y-0.5">
        <span className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
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
        <span className="font-sans font-bold text-white tracking-tight">
          Pengaturan <span className="text-indigo-400">Profil</span>
        </span>
      }
      description="Kelola informasi pribadi, foto profil, dan keamanan akun Anda dalam satu tempat terpadu."
      widget={securityWidget}
    />
  );
};