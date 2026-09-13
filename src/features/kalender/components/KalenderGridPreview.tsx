// src/features/kalender/components/KalenderGridPreview.tsx
import React, { useState, useEffect } from "react";
import { useAdminKalender, useTodayHijri } from "../hooks/useKalenderHijriyah";
import type { KalenderHijriyahBulanHijriNamaOptions } from "@/types/pocketbase-types";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
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
  const { data: todayHijri } = useTodayHijri();
  const { data: latestRecord } = useLatestKalender();

  const [selectedBulan, setSelectedBulan] = useState(1);
  const [selectedTahun, setSelectedTahun] = useState(1448);

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

  const handleJumpToToday = () => {
    if (todayHijri) {
      if (todayHijri.bulan_hijri_angka) setSelectedBulan(todayHijri.bulan_hijri_angka);
      if (todayHijri.tahun_hijri) setSelectedTahun(todayHijri.tahun_hijri);
    }
  };

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

  const firstRecord = daysData && daysData.length > 0 ? daysData[0] : null;
  const firstDayOffset = firstRecord
    ? new Date(firstRecord.tanggal_masehi).getDay()
    : 0;

  const getLocalDateStr = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getLocalDateStr(new Date());

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 shadow-sm space-y-4 font-sans select-none">
      {/* 1. Toolbar Header Kalender */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-amber-400">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-500">
              Penanggalan Aktif
            </span>
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span>{namaBulanAktif}</span>
              <span className="text-amber-400 font-mono">{selectedTahun} H</span>
            </h2>
          </div>
        </div>

        {/* Kontrol Navigasi Bulan */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {todayHijri && (
            <button
              type="button"
              onClick={handleJumpToToday}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-medium transition-colors active:scale-98 mr-1"
              title="Kembali ke Hari Ini"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Hari Ini</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2.5 h-8 flex items-center justify-center rounded-md bg-zinc-950 border border-zinc-800 text-xs font-mono font-medium text-zinc-300">
            {selectedBulan} / 12
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Bulan Selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Kisi Kalender */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-zinc-500">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <span className="text-xs">Menyusun kisi kalender...</span>
        </div>
      ) : !daysData || daysData.length === 0 ? (
        <div className="p-8 text-center space-y-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
          <AlertCircle className="w-6 h-6 text-zinc-500 mx-auto" />
          <p className="text-xs font-semibold text-zinc-300">
            Bulan {namaBulanAktif} {selectedTahun} H Belum Dipetakan
          </p>
          <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
            Gunakan tombol "Generate Bulan Baru" di pojok kanan atas untuk memetakan tanggal.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Header 7 Hari */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {NAMA_HARI_HEADER.map((hari) => (
              <div
                key={hari.id}
                className={`py-1.5 rounded-md text-[11px] font-medium uppercase tracking-wider ${
                  hari.isJumat
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-zinc-950 border border-zinc-800 text-zinc-400"
                }`}
              >
                {hari.label}
              </div>
            ))}
          </div>

          {/* Sel Hari Kalender */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Offset Blank Cells */}
            {Array.from({ length: firstDayOffset }).map((_, idx) => (
              <div
                key={`offset-${idx}`}
                className="min-h-[58px] sm:min-h-[68px] rounded-lg bg-zinc-950/30 border border-zinc-800/40"
              />
            ))}

            {/* Kotak Tanggal */}
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
                  className={`p-2 rounded-lg border flex flex-col justify-between transition-colors ${
                    isToday
                      ? "bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30"
                      : isJumat
                      ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50"
                      : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-lg sm:text-xl font-bold tracking-tight ${
                        isToday
                          ? "text-amber-300 font-black"
                          : isJumat
                          ? "text-emerald-400"
                          : "text-zinc-100"
                      }`}
                    >
                      {item.tanggal_hijri}
                    </span>

                    {isToday ? (
                      <span className="text-[9px] font-medium text-amber-300 bg-amber-500/20 px-1 py-0.2 rounded">
                        Hari Ini
                      </span>
                    ) : isJumat ? (
                      <span className="text-[9px] font-medium text-emerald-400">
                        Jum'at
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-1 pt-1 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>{formatMasehiSmall}</span>
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