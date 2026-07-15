// src/components/users/UsersStats.tsx
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
      badge: "Sistem Terdaftar",
      gradientText: "from-indigo-200 via-indigo-300 to-purple-300",
      glowBg: "bg-indigo-600/15",
      topBorder: "via-indigo-500/50",
      iconBox: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
      dotColor: "bg-indigo-400",
    },
    {
      title: "Pengguna Aktif",
      value: stats.active,
      icon: UserCheck,
      badge: "Status Terverifikasi",
      gradientText: "from-emerald-200 via-emerald-300 to-teal-300",
      glowBg: "bg-emerald-600/15",
      topBorder: "via-emerald-500/50",
      iconBox: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      dotColor: "bg-emerald-400",
    },
    {
      title: "Administrator",
      value: stats.admin,
      icon: ShieldCheck,
      badge: "Akses Penuh",
      gradientText: "from-purple-200 via-purple-300 to-pink-300",
      glowBg: "bg-purple-600/15",
      topBorder: "via-purple-500/50",
      iconBox: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      dotColor: "bg-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="relative group overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-5 md:p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-gray-700/80 hover:-translate-y-1 hover:shadow-2xl"
          >
            {/* 🔮 Ambient Glow Mesh Per Kartu */}
            <div
              className={`absolute -top-20 -right-20 w-48 h-48 rounded-full ${card.glowBg} blur-[80px] pointer-events-none transition-all duration-500 group-hover:scale-125`}
            />

            {/* Garis Kilau Top-Border */}
            <div
              className={`absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent ${card.topBorder} to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
            />

            <div className="relative z-10 flex items-start justify-between gap-4">
              {/* Teks Angka & Judul */}
              <div className="space-y-1">
                <p className="text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <p
                  className={`text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${card.gradientText} tracking-tight`}
                >
                  {card.value}
                </p>
              </div>

              {/* Icon Container dengan Efek Glossy */}
              <div
                className={`p-3.5 rounded-2xl border ${card.iconBox} shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110 flex-shrink-0`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            {/* Footer Sub-Info */}
            <div className="relative z-10 mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between text-[11px] font-mono text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${card.dotColor} animate-pulse`}
                />
                {card.badge}
              </span>
              <span className="text-gray-500 group-hover:text-gray-400 transition-colors">
                Terhubung
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};