// src/features/rambut/components/RambutStats.tsx
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
  const percentSudah = stats.total > 0 ? Math.round((stats.sudah / stats.total) * 100) : 0;

  const cards = [
    {
      title: "Total Wajib Setor",
      value: stats.total,
      sub: "Santri Aliyah, Syariah & Pengurus",
      icon: Users,
      iconBox: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
      dotColor: "bg-indigo-400",
    },
    {
      title: "Sudah Setor",
      value: stats.sudah,
      sub: `${percentSudah}% Tuntas terverifikasi`,
      icon: CheckCircle2,
      iconBox: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      dotColor: "bg-emerald-400",
    },
    {
      title: "Belum Setor",
      value: stats.belum,
      sub: "Antrean menunggu tindakan",
      icon: Clock,
      iconBox: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      dotColor: "bg-amber-400",
    },
    {
      title: "Dispensasi Khusus",
      value: stats.dispensasi,
      sub: "Izin berhalangan sementara",
      icon: ShieldAlert,
      iconBox: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      dotColor: "bg-purple-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`stat-skeleton-${idx}`}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 animate-pulse flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="h-3 w-28 rounded bg-zinc-800" />
                <div className="h-8 w-24 rounded bg-zinc-800" />
              </div>
              <div className="w-9 h-9 rounded-lg bg-zinc-800" />
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <div className="h-3 w-36 rounded bg-zinc-800/60" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {cards.map((card, idx) => {
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
                  {card.value.toLocaleString("id-ID")}
                </p>
              </div>
              <div className={`p-2 rounded-lg border ${card.iconBox}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center gap-2 text-[11px] font-sans text-zinc-400">
              <span className={`w-1.5 h-1.5 rounded-full ${card.dotColor} animate-pulse`} />
              <span className="truncate">{card.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};