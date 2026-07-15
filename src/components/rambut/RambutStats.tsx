// src/components/rambut/RambutStats.tsx
import React from "react";
import { Users, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

interface RambutStatsProps {
  stats: {
    total: number;
    sudah: number;
    belum: number;
    dispensasi: number;
  };
  isLoading?: boolean;
}

export const RambutStats: React.FC<RambutStatsProps> = ({
  stats,
  isLoading = false,
}) => {
  const percentSudah =
    stats.total > 0 ? Math.round((stats.sudah / stats.total) * 100) : 0;

  const cards = [
    {
      title: "Total Wajib Setor",
      value: stats.total,
      sub: "Santri Aliyah, Syariah & Pengurus",
      icon: Users,
      gradientText: "from-indigo-200 via-indigo-300 to-purple-300",
      glowBg: "bg-indigo-600/15",
      topBorder: "via-indigo-500/50",
      iconBox: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
      dotColor: "bg-indigo-400",
    },
    {
      title: "Sudah Perapian",
      value: stats.sudah,
      sub: `${percentSudah}% Tuntas terverifikasi`,
      icon: CheckCircle2,
      gradientText: "from-emerald-200 via-emerald-300 to-teal-300",
      glowBg: "bg-emerald-600/15",
      topBorder: "via-emerald-500/50",
      iconBox: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      dotColor: "bg-emerald-400",
    },
    {
      title: "Belum Setor",
      value: stats.belum,
      sub: "Antrean menunggu tindakan",
      icon: Clock,
      gradientText: "from-amber-200 via-amber-300 to-yellow-300",
      glowBg: "bg-amber-600/15",
      topBorder: "via-amber-500/50",
      iconBox: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      dotColor: "bg-amber-400",
    },
    {
      title: "Dispensasi Khusus",
      value: stats.dispensasi,
      sub: "Izin berhalangan sementara",
      icon: ShieldAlert,
      gradientText: "from-purple-200 via-purple-300 to-pink-300",
      glowBg: "bg-purple-600/15",
      topBorder: "via-purple-500/50",
      iconBox: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      dotColor: "bg-purple-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`stat-skeleton-${idx}`}
            className="rounded-3xl border border-gray-800/80 bg-gray-900/60 p-5 md:p-6 animate-pulse space-y-3"
          >
            <div className="h-3 w-28 rounded-lg bg-gray-800" />
            <div className="h-8 w-20 rounded-xl bg-gray-800" />
            <div className="h-3 w-32 rounded bg-gray-800/60" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 select-none">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="relative group overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-5 md:p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-gray-700/80 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
          >
            <div
              className={`absolute -top-20 -right-20 w-44 h-44 rounded-full ${card.glowBg} blur-[75px] pointer-events-none transition-all duration-500 group-hover:scale-125`}
            />
            <div
              className={`absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent ${card.topBorder} to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
            />

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-mono font-medium text-gray-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <p
                  className={`text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${card.gradientText} tracking-tight font-mono`}
                >
                  {card.value.toLocaleString("id-ID")}
                </p>
              </div>

              <div
                className={`p-3 rounded-2xl border ${card.iconBox} shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110 flex-shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="relative z-10 mt-4 pt-3 border-t border-gray-800/60 flex items-center gap-2 text-[11px] font-mono text-gray-400">
              <span
                className={`w-1.5 h-1.5 rounded-full ${card.dotColor} animate-pulse`}
              />
              <span className="truncate">{card.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};