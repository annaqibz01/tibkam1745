// src/features/dashboard/components/SantriStatsSummary.tsx
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
  const TINGKATAN_ORDER = [
    "idadiyah",
    "ibtidaiyah",
    "tsanawiyah",
    "aliyah",
    "kuliah syariah",
  ];

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
        if (indexA !== indexB) return indexA - indexB;
        return b.jumlah - a.jumlah;
      });
  }, [data?.tingkatanCounts]);

  const domisiliList = useMemo(() => {
    if (!data?.domisiliCounts) return [];
    return Object.entries(data.domisiliCounts)
      .map(([nama, jumlah]) => ({ nama, jumlah }))
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }, [data?.domisiliCounts]);

  // Loading Skeleton Kompak
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`stat-skeleton-${idx}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 animate-pulse space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 rounded bg-zinc-800" />
                <div className="h-8 w-8 rounded-lg bg-zinc-800" />
              </div>
              <div className="h-8 w-20 rounded bg-zinc-800" />
              <div className="h-2.5 w-36 rounded bg-zinc-800/60" />
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
      sub: "Seluruh santri terdata aktif",
      icon: UserCheck,
      unit: "Santri",
      iconColor: "text-emerald-400",
      dotColor: "bg-emerald-400",
    },
    {
      title: "Domisili PPS (Mukim)",
      value: stats.totalPps,
      sub: "Kompleks A–T & Z (Non DKS-K)",
      icon: Building2,
      unit: "Santri",
      iconColor: "text-indigo-400",
      dotColor: "bg-indigo-400",
    },
    {
      title: "Domisili LPPS (Luar PPS)",
      value: stats.totalLpps,
      sub: "Santri non-mukim di luar asrama",
      icon: Home,
      unit: "Santri",
      iconColor: "text-purple-400",
      dotColor: "bg-purple-400",
    },
  ];

  return (
    <div className="space-y-4 font-sans select-none">
      {/* 1. Panel 3 Kartu Ringkasan Utama */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        {topCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-2xl sm:text-3xl font-bold text-zinc-100 font-mono tracking-tight">
                      {card.value.toLocaleString("id-ID")}
                    </p>
                    <span className="text-xs text-zinc-500 font-sans">
                      {card.unit}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 shrink-0">
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center gap-1.5 text-[11px] text-zinc-400">
                <span className={`w-1.5 h-1.5 rounded-full ${card.dotColor}`} />
                <span className="truncate">{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Panel Sebaran Jenjang Pendidikan */}
      {tingkatanList.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-sm">
          <div className="mb-3.5 flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-zinc-800 text-zinc-300">
                <GraduationCap className="h-4 w-4 text-indigo-400" />
              </div>
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                Sebaran Tingkatan Pendidikan
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
              {tingkatanList.length} Jenjang
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {tingkatanList.map((item) => {
              const persentase =
                stats.totalSantriAktif > 0
                  ? Math.round((item.jumlah / stats.totalSantriAktif) * 100)
                  : 0;

              return (
                <div
                  key={item.nama}
                  className="rounded-lg border border-zinc-800/80 bg-zinc-950/70 p-3 hover:border-zinc-700 transition-colors"
                >
                  <span
                    className="block truncate text-xs font-medium text-zinc-400 capitalize"
                    title={item.nama}
                  >
                    {item.nama}
                  </span>

                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="font-mono text-lg font-bold text-zinc-100">
                      {item.jumlah.toLocaleString("id-ID")}
                    </span>
                    <span className="font-mono text-[10px] font-medium text-indigo-300 bg-indigo-500/10 px-1 py-0.2 rounded border border-indigo-500/20">
                      {persentase}%
                    </span>
                  </div>

                  {/* Progress Bar Netral & Padat */}
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${persentase}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Panel Sebaran Domisili Kompleks Asrama (PPS) */}
      {domisiliList.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-sm">
          <div className="mb-3.5 flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-zinc-800 text-zinc-300">
                <MapPin className="h-4 w-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                Sebaran Domisili Asrama (PPS)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
              {domisiliList.length} Daerah
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {domisiliList.map((item) => {
              const persentase =
                stats.totalPps > 0
                  ? Math.round((item.jumlah / stats.totalPps) * 100)
                  : 0;

              return (
                <div
                  key={item.nama}
                  className="rounded-lg border border-zinc-800/80 bg-zinc-950/70 p-2.5 hover:border-zinc-700 transition-colors"
                >
                  <span
                    className="block truncate text-xs font-medium text-emerald-400"
                    title={item.nama}
                  >
                    {item.nama}
                  </span>

                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-mono text-base font-bold text-zinc-100">
                      {item.jumlah.toLocaleString("id-ID")}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500">
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