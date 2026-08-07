// src/features/dashboard/components/WelcomeBanner.tsx
import React, { useState, useEffect, useMemo } from "react";
import { CalendarDays, Clock, Moon, ShieldCheck, User } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useWaktuIstiwa } from "@/hooks/useWaktuIstiwa";
import { useTodayHijri } from "@/features/kalender";

interface WelcomeBannerProps {
  user: { name: string; username: string; role: string };
  activeCount?: number;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ user }) => {
  const [time, setTime] = useState(new Date());
  const waktuWis = useWaktuIstiwa();
  const { data: todayHijri } = useTodayHijri();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sapaan Dinamis Berdasarkan Waktu Lokal
  const dynamicGreeting = useMemo(() => {
    const hour = time.getHours();
    if (hour >= 3 && hour < 11) return "Selamat pagi";
    if (hour >= 11 && hour < 15) return "Selamat siang";
    if (hour >= 15 && hour < 18) return "Selamat sore";
    return "Selamat malam";
  }, [time]);

  // Format Penanggalan Masehi
  const formattedGregorian = useMemo(() => {
    return time.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [time]);

  const motivationalText =
    user.role === "admin"
      ? "Kelola sistem, pantau performa, dan kendalikan seluruh layanan."
      : "Dashboard Layanan terpadu Tibkam1745";

  // Deretan Badge Meta (Role, Tanggal Masehi, Tanggal Hijriah)
  const statusBadges = (
    <div className="flex flex-wrap items-center gap-2.5 text-xs">
      {/* Badge User Role */}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-indigo-400 border border-indigo-500/20 shadow-sm uppercase tracking-wider">
        {user.role === "admin" ? (
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
        ) : (
          <User className="w-3.5 h-3.5 text-indigo-400" />
        )}
        {user.role}
      </span>

      <span className="text-gray-700 select-none">•</span>

      {/* Masehi */}
      <div className="flex items-center gap-1.5 text-gray-300 font-medium bg-gray-950/50 px-3 py-1 rounded-full border border-gray-800/80 shadow-inner font-mono">
        <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
        <span>{formattedGregorian}</span>
      </div>

      {/* Hijriah */}
      <div className="flex items-center gap-1.5 text-indigo-300 font-medium bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-800/40 shadow-inner font-mono">
        <Moon className="w-3.5 h-3.5 text-amber-300" />
        <span>{todayHijri?.string_hijri || "Memuat Tanggal..."}</span>
      </div>
    </div>
  );

  // Executive Live Clock Widget (Waktu Istiwa')
  const clockWidget = (
    <div className="relative group overflow-hidden rounded-2xl border border-indigo-500/30 bg-gray-950/70 p-4 sm:px-6 sm:py-4 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-indigo-500/60 select-none">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-center gap-4">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-inner">
          <Clock className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-gray-950" />
          </span>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-300">
              Waktu Istiwa'
            </span>
            <span className="text-[9px] font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shadow-sm">
              SIDOGIRI
            </span>
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-black tracking-wider text-white drop-shadow-md flex items-baseline gap-1.5">
            <span>
              {waktuWis.jam}:{waktuWis.menit}:{waktuWis.detik}
            </span>
            <span className="text-xs font-bold text-indigo-400">WIS</span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <PageHeader
      statusBadge={statusBadges}
      title={
        <span className="flex flex-wrap items-center gap-2">
          <span>{dynamicGreeting},</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
            {user.name || user.username}
          </span>
        </span>
      }
      description={motivationalText}
      widget={clockWidget}
    />
  );
};