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

  const dynamicGreeting = useMemo(() => {
    const hour = time.getHours();
    if (hour >= 3 && hour < 11) return "Selamat pagi";
    if (hour >= 11 && hour < 15) return "Selamat siang";
    if (hour >= 15 && hour < 18) return "Selamat sore";
    return "Selamat malam";
  }, [time]);

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
      ? "Kelola sistem, pantau sebaran santri, dan kendalikan seluruh layanan terpadu."
      : "Portal terpadu operasional dan pemantauan santri Tibkam1745.";

  // Deretan status badge netral & ringkas
  const statusBadges = (
    <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
      {/* Badge Role */}
      <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-2.5 py-1 font-mono text-[10px] font-semibold text-zinc-300 border border-zinc-700 uppercase tracking-wider">
        {user.role === "admin" ? (
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
        ) : (
          <User className="w-3.5 h-3.5 text-indigo-400" />
        )}
        {user.role}
      </span>

      <span className="text-zinc-700 select-none">•</span>

      {/* Tanggal Masehi */}
      <div className="flex items-center gap-1.5 text-zinc-300 bg-zinc-950/80 px-2.5 py-1 rounded-md border border-zinc-800 font-mono text-xs">
        <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
        <span>{formattedGregorian}</span>
      </div>

      {/* Tanggal Hijriah */}
      <div className="flex items-center gap-1.5 text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 font-mono text-xs">
        <Moon className="w-3.5 h-3.5 text-amber-400" />
        <span>{todayHijri?.string_hijri || "Memuat..."}</span>
      </div>
    </div>
  );

  // Widget Live Jam Istiwa' (Rapi, Tegas, Tanpa Animasi Ping Berlebih)
  const clockWidget = (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/90 px-4 py-2.5 shadow-sm select-none flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 text-indigo-400 shrink-0">
        <Clock className="w-4 h-4" />
      </div>

      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
            Waktu Istiwa'
          </span>
          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded border border-emerald-500/20">
            SIDOGIRI
          </span>
        </div>
        <p className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-white flex items-baseline gap-1">
          <span>
            {waktuWis.jam}:{waktuWis.menit}:{waktuWis.detik}
          </span>
          <span className="text-[11px] font-semibold text-zinc-500">WIS</span>
        </p>
      </div>
    </div>
  );

  return (
    <PageHeader
      statusBadge={statusBadges}
      title={
        <span className="flex flex-wrap items-center gap-1.5 font-sans font-bold text-white tracking-tight">
          <span>{dynamicGreeting},</span>
          <span className="text-zinc-100">{user.name || user.username}</span>
        </span>
      }
      description={motivationalText}
      widget={clockWidget}
    />
  );
};