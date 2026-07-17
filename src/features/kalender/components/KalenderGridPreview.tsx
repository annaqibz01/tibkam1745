// src/components/kalender/KalenderGridPreview.tsx
import React, { useState, useEffect } from "react";
import { useAdminKalender, useTodayHijri } from "../hooks/useKalenderHijriyah";
import type { KalenderHijriyahBulanHijriNamaOptions } from "@/types/pocketbase-types";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Sparkles,
  Moon,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

const NAMA_HARI_HEADER = [
  { id: "Ahad", label: "Ahad", isJumat: false },
  { id: "Senin", label: "Senin", isJumat: false },
  { id: "Selasa", label: "Selasa", isJumat: false },
  { id: "Rabu", label: "Rabu", isJumat: false },
  { id: "Kamis", label: "Kamis", isJumat: false },
  { id: "Jumat", label: "Jum'at", isJumat: true },
  { id: "Sabtu", label: "Sabtu", isJumat: false },
];

const BULAN_LIST: { angka: number; nama: KalenderHijriyahBulanHijriNamaOptions }[] = [
  { angka: 1, nama: "Muharram" },
  { angka: 2, nama: "Safar" },
  { angka: 3, nama: "Rabi'ul Awal" },
  { angka: 4, nama: "Rabi'ul Akhir" },
  { angka: 5, nama: "Jumadil Ula" },
  { angka: 6, nama: "Jumadil Akhir" },
  { angka: 7, nama: "Rajab" },
  { angka: 8, nama: "Sya'ban" },
  { angka: 9, nama: "Ramadhan" },
  { angka: 10, nama: "Syawwal" },
  { angka: 11, nama: "Dzulqa'dah" },
  { angka: 12, nama: "Dzulhijjah" },
];

export const KalenderGridPreview: React.FC = () => {
  const { useKalenderBulan, useLatestKalender } = useAdminKalender();
  const { data: todayHijri } = useTodayHijri(); // ✨ Fetch data Hijriyah hari ini
  const { data: latestRecord } = useLatestKalender();

  const [selectedBulan, setSelectedBulan] = useState(1);
  const [selectedTahun, setSelectedTahun] = useState(1448);

  // ✨ UTAMA: Defaultkan ke TANGGAL HARI INI dari Database jika tersedia!
  useEffect(() => {
    if (todayHijri) {
      if (todayHijri.bulan_hijri_angka) setSelectedBulan(todayHijri.bulan_hijri_angka);
      if (todayHijri.tahun_hijri) setSelectedTahun(todayHijri.tahun_hijri);
    } else if (latestRecord) {
      if (latestRecord.bulan_hijri_angka) setSelectedBulan(latestRecord.bulan_hijri_angka);
      if (latestRecord.tahun_hijri) setSelectedTahun(latestRecord.tahun_hijri);
    }
  }, [todayHijri, latestRecord]);

  const { data: daysData, isLoading } = useKalenderBulan(selectedTahun, selectedBulan);

  // Fungsi Lompat Cepat ke Bulan Hari Ini
  const handleJumpToToday = () => {
    if (todayHijri) {
      if (todayHijri.bulan_hijri_angka) setSelectedBulan(todayHijri.bulan_hijri_angka);
      if (todayHijri.tahun_hijri) setSelectedTahun(todayHijri.tahun_hijri);
    }
  };

  // Navigasi Bulan
  const handlePrevMonth = () => {
    if (selectedBulan === 1) {
      setSelectedBulan(12);
      setSelectedTahun((prev) => prev - 1);
    } else {
      setSelectedBulan((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedBulan === 12) {
      setSelectedBulan(1);
      setSelectedTahun((prev) => prev + 1);
    } else {
      setSelectedBulan((prev) => prev + 1);
    }
  };

  const namaBulanAktif = BULAN_LIST.find((b) => b.angka === selectedBulan)?.nama || "Muharram";

  // Hitung offset hari pertama
  const firstRecord = daysData && daysData.length > 0 ? daysData[0] : null;
  const firstDayOffset = firstRecord
    ? new Date(firstRecord.tanggal_masehi).getDay()
    : 0;

  // Helper Pembanding Tanggal Lokal (Format YYYY-MM-DD)
  const getLocalDateStr = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getLocalDateStr(new Date());

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
      {/* 🔮 Garis Kilau Top-Border */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      {/* 1. HEADER KALENDER GRID */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-inner">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Kalender Hijriyah
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-mono flex items-center gap-2">
              <span>{namaBulanAktif}</span>
              <span className="text-amber-300">{selectedTahun} H</span>
            </h2>
          </div>
        </div>

        {/* Tombol Navigasi & Pintasan Hari Ini */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {todayHijri && (
            <button
              type="button"
              onClick={handleJumpToToday}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold transition-all active:scale-95 shadow-sm mr-1"
              title="Kembali ke Bulan Hari Ini"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hari Ini</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-gray-950/80 border border-gray-800 text-gray-300 hover:text-white hover:border-amber-500/40 hover:bg-amber-500/10 active:scale-95 transition-all shadow-md"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3.5 py-1.5 rounded-xl bg-gray-950/60 border border-gray-800 text-xs font-mono font-bold text-gray-300">
            {selectedBulan} / 12
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-gray-950/80 border border-gray-800 text-gray-300 hover:text-white hover:border-amber-500/40 hover:bg-amber-500/10 active:scale-95 transition-all shadow-md"
            title="Bulan Selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. GRID KALENDER DINDING */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-gray-400 font-mono text-xs">Menyusun kisi kalender...</span>
        </div>
      ) : !daysData || daysData.length === 0 ? (
        <div className="p-12 text-center space-y-2.5 rounded-2xl bg-gray-950/40 border border-gray-800/80">
          <AlertCircle className="w-8 h-8 text-amber-400/60 mx-auto" />
          <p className="text-sm font-semibold text-gray-300">
            Bulan {namaBulanAktif} {selectedTahun} H Belum Dipetakan
          </p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Gunakan tombol "Generate Bulan Baru" di atas untuk memetakan tanggal Masehi ke Hijriyah.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header Nama Hari (7 Kolom) */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {NAMA_HARI_HEADER.map((hari) => (
              <div
                key={hari.id}
                className={`py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider ${
                  hari.isJumat
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-gray-950/60 border border-gray-800/60 text-gray-400"
                }`}
              >
                {hari.label}
              </div>
            ))}
          </div>

          {/* Body Grid Kotak Tanggal */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Blank Offset Hari Kosong */}
            {Array.from({ length: firstDayOffset }).map((_, idx) => (
              <div
                key={`offset-${idx}`}
                className="min-h-[75px] sm:min-h-[90px] rounded-2xl bg-gray-950/20 border border-gray-900/40"
              />
            ))}

            {/* Sel Hari Hijriyah */}
            {daysData.map((item) => {
              const dateMasehiObj = new Date(item.tanggal_masehi);
              const isJumat = dateMasehiObj.getDay() === 5;
              const isToday = getLocalDateStr(item.tanggal_masehi) === todayStr;

              const formatMasehiSmall = dateMasehiObj.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              });

              return (
                <div
                  key={item.id}
                  className={`group relative min-h-[75px] sm:min-h-[90px] p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                    isToday
                      ? "bg-gradient-to-br from-amber-500/20 via-amber-950/40 to-gray-950 border-amber-400 ring-2 ring-amber-500/40 shadow-xl shadow-amber-500/10 scale-[1.02]"
                      : isJumat
                      ? "bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-500/60"
                      : "bg-gray-950/60 border-gray-800/80 hover:border-indigo-500/40 hover:bg-gray-900/80"
                  }`}
                >
                  {/* ✨ PENANDA KHUSUS HARI INI (BADGE & PULSING DOT) */}
                  {isToday && (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                      <span className="text-[8px] font-mono font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40 shadow-sm hidden sm:inline-block">
                        Hari Ini
                      </span>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 border border-gray-950" />
                      </span>
                    </div>
                  )}

                  {/* 🟢 ANGKAH UTAMA: TANGGAL HIJRIYAH */}
                  <div className="flex items-baseline justify-between">
                    <span
                      className={`font-mono text-2xl sm:text-3xl font-extrabold tracking-tight ${
                        isToday
                          ? "text-amber-300 drop-shadow-md"
                          : isJumat
                          ? "text-emerald-300"
                          : "text-white group-hover:text-indigo-300"
                      }`}
                    >
                      {item.tanggal_hijri}
                    </span>
                    {isJumat && !isToday && (
                      <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded border border-emerald-500/20 hidden sm:inline-block">
                        Jum'at
                      </span>
                    )}
                  </div>

                  {/* ⚪ ANGKAH SUB: TANGGAL MASEHI */}
                  <div className="mt-1 flex items-center justify-between border-t border-gray-800/60 pt-1 text-[10px] font-mono">
                    <span
                      className={
                        isToday
                          ? "text-amber-200 font-bold"
                          : "text-gray-400 group-hover:text-gray-300 transition-colors"
                      }
                    >
                      {formatMasehiSmall}
                    </span>
                    <Calendar
                      className={`w-3 h-3 ${
                        isToday ? "text-amber-400" : "text-gray-500 group-hover:text-indigo-400"
                      } transition-colors`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};