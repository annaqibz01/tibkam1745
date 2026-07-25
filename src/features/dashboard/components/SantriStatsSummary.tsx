// src/components/shared/SantriStatsSummary.tsx
import React, { useMemo } from "react";
import {
  UserCheck,
  Building2,
  Home,
  GraduationCap,
  MapPin,
} from "lucide-react";

export interface SantriStatsData {
  totalSantriAktif: number;
  totalPps: number;
  totalLpps: number;
  tingkatanCounts: Record<string, number>;
  domisiliCounts: Record<string, number>;
}

interface SantriStatsSummaryProps {
  data?: SantriStatsData;
  isLoading?: boolean;
}

export default function SantriStatsSummary({
  data,
  isLoading = false,
}: SantriStatsSummaryProps) {
  // 🎓 Urutan Baku Tingkatan Pendidikan
  const TINGKATAN_ORDER = [
    "idadiyah",
    "ibtidaiyah",
    "tsanawiyah",
    "aliyah",
    "kuliah syariah",
  ];

  // Sort sebaran tingkatan berdasarkan hirarki pendidikan baku
  const tingkatanList = useMemo(() => {
    if (!data?.tingkatanCounts) return [];

    const getOrderIndex = (nama: string) => {
      const lower = nama.toLowerCase();
      const index = TINGKATAN_ORDER.findIndex((item) => lower.includes(item));
      return index !== -1 ? index : 999;
    };

    return Object.entries(data.tingkatanCounts)
      .map(([nama, jumlah]) => ({ nama, jumlah }))
      .sort((a, b) => {
        const indexA = getOrderIndex(a.nama);
        const indexB = getOrderIndex(b.nama);

        if (indexA !== indexB) {
          return indexA - indexB;
        }
        return b.jumlah - a.jumlah;
      });
  }, [data?.tingkatanCounts]);

  // Sort sebaran domisili secara alfabetis (A -> Z)
  const domisiliList = useMemo(() => {
    if (!data?.domisiliCounts) return [];
    return Object.entries(data.domisiliCounts)
      .map(([nama, jumlah]) => ({ nama, jumlah }))
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }, [data?.domisiliCounts]);

  // SKELETON LOADING STATE MODERN
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-5">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`stat-skeleton-${idx}`}
              className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gray-900/60 p-5 md:p-6 shadow-xl backdrop-blur-xl animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 rounded-lg bg-gray-800" />
                <div className="h-10 w-10 rounded-2xl bg-gray-800" />
              </div>
              <div className="mt-4 h-9 w-24 rounded-xl bg-gray-800" />
              <div className="mt-2 h-3 w-36 rounded bg-gray-800/60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = data ?? {
    totalSantriAktif: 0,
    totalPps: 0,
    totalLpps: 0,
    tingkatanCounts: {},
    domisiliCounts: {},
  };

  const topCards = [
    {
      title: "Total Santri Aktif",
      value: stats.totalSantriAktif,
      sub: "Seluruh santri berstatus aktif saat ini",
      icon: UserCheck,
      unit: "Santri",
      gradientText: "from-emerald-200 via-emerald-300 to-teal-300",
      glowBg: "bg-emerald-600/15",
      topBorder: "via-emerald-500/50",
      iconBox: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      dotColor: "bg-emerald-400",
    },
    {
      title: "Domisili PPS (Mukim)",
      value: stats.totalPps,
      sub: "Domisili A–T dan Z (Non DKS-K)",
      icon: Building2,
      unit: "Santri",
      gradientText: "from-indigo-200 via-indigo-300 to-purple-300",
      glowBg: "bg-indigo-600/15",
      topBorder: "via-indigo-500/50",
      iconBox: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
      dotColor: "bg-indigo-400",
    },
    {
      title: "Domisili LPPS (Luar PPS)",
      value: stats.totalLpps,
      sub: "Santri aktif berstatus domisili LPPS",
      icon: Home,
      unit: "Santri",
      gradientText: "from-purple-200 via-purple-300 to-pink-300",
      glowBg: "bg-purple-600/15",
      topBorder: "via-purple-500/50",
      iconBox: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      dotColor: "bg-purple-400",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* 🚀 PANEL UTAMA: 3 Stat Cards Ringkasan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-5">
        {topCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="relative group overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-5 md:p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-gray-700/80 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
            >
              {/* 🔮 Ambient Glow Mesh Per Kartu */}
              <div
                className={`absolute -top-20 -right-20 w-48 h-48 rounded-full ${card.glowBg} blur-[80px] pointer-events-none transition-all duration-500 group-hover:scale-125`}
              />

              {/* Garis Kilau Top-Border */}
              <div
                className={`absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent ${card.topBorder} to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-mono font-medium text-gray-400 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p
                      className={`text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${card.gradientText} tracking-tight font-mono`}
                    >
                      {card.value.toLocaleString("id-ID")}
                    </p>
                    <span className="text-xs font-mono text-gray-400">
                      {card.unit}
                    </span>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-2xl border ${card.iconBox} shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110 flex-shrink-0`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Footer Sub-Info */}
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

      {/* 🎓 PANEL KEDUA: Sebaran Per Tingkatan Pendidikan */}
      {tingkatanList.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
          {/* Garis Kilau Top-Border */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          {/* Header Panel */}
          <div className="mb-5 flex items-center justify-between border-b border-gray-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <GraduationCap className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-mono font-semibold text-gray-200 uppercase tracking-wider">
                Sebaran Tingkatan 
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono font-medium text-indigo-300">
              {tingkatanList.length} Jenjang Terdaftar
            </span>
          </div>

          {/* Grid Items */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {tingkatanList.map((item) => {
              const persentase =
                stats.totalSantriAktif > 0
                  ? Math.round((item.jumlah / stats.totalSantriAktif) * 100)
                  : 0;

              return (
                <div
                  key={item.nama}
                  className="group relative rounded-2xl border border-gray-800/80 bg-gray-950/60 p-3.5 transition-all duration-200 hover:border-indigo-500/30 hover:bg-gray-900/80 hover:-translate-y-0.5 shadow-md"
                >
                  <span
                    className="block truncate text-xs font-medium text-gray-400 group-hover:text-gray-200 transition-colors capitalize"
                    title={item.nama}
                  >
                    {item.nama}
                  </span>

                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="font-mono text-xl font-bold text-white">
                      {item.jumlah.toLocaleString("id-ID")}
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md border border-indigo-500/20">
                      {persentase}%
                    </span>
                  </div>

                  {/* Progress Bar Glowing */}
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-800/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${persentase}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 📍 PANEL KETIGA: Sebaran Per Kompleks (PPS) */}
      {domisiliList.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
          {/* Garis Kilau Top-Border */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

          {/* Header Panel */}
          <div className="mb-5 flex items-center justify-between border-b border-gray-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <MapPin className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-mono font-semibold text-gray-200 uppercase tracking-wider">
                Sebaran Domisili (PPS)
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-medium text-emerald-300">
              {domisiliList.length} Domisili Terdaftar
            </span>
          </div>

          {/* Grid Items */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {domisiliList.map((item) => {
              const persentase =
                stats.totalPps > 0
                  ? Math.round((item.jumlah / stats.totalPps) * 100)
                  : 0;

              return (
                <div
                  key={item.nama}
                  className="group relative rounded-2xl border border-gray-800/80 bg-gray-950/60 p-3 transition-all duration-200 hover:border-emerald-500/30 hover:bg-gray-900/80 hover:-translate-y-0.5 shadow-md"
                >
                  <span
                    className="block truncate text-xs font-semibold text-emerald-400/90 group-hover:text-emerald-300 transition-colors"
                    title={item.nama}
                  >
                    {item.nama}
                  </span>

                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="font-mono text-lg font-bold text-white">
                      {item.jumlah.toLocaleString("id-ID")}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400">
                      {persentase}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}