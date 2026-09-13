// src/features/users/components/UsersStats.tsx
import React from "react";
import { Users, UserCheck, ShieldCheck } from "lucide-react";

interface UsersStatsProps {
  stats: {
    total: number;
    active: number;
    admin: number;
  };
}

export const UsersStats: React.FC<UsersStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: "Total Pengguna",
      value: stats.total,
      icon: Users,
      sub: "Sistem Terdaftar",
      iconBox: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
      dotColor: "bg-indigo-400",
    },
    {
      title: "Pengguna Aktif",
      value: stats.active,
      icon: UserCheck,
      sub: "Status Terverifikasi",
      iconBox: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      dotColor: "bg-emerald-400",
    },
    {
      title: "Administrator",
      value: stats.admin,
      icon: ShieldCheck,
      sub: "Akses Penuh",
      iconBox: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      dotColor: "bg-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-2xl font-extrabold text-white font-mono">
                  {card.value}
                </p>
              </div>
              <div className={`p-2 rounded-lg border ${card.iconBox}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center gap-2 text-[11px] font-sans text-zinc-400">
              <span className={`w-1.5 h-1.5 rounded-full ${card.dotColor} animate-pulse`} />
              <span>{card.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};