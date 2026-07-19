// src/components/shared/CustomDatePickerHijriyah.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { pb } from "../../lib/pocketbase";
import type { KalenderHijriyahResponse, KalenderHijriyahBulanHijriNamaOptions } from "../../types/pocketbase-types";
import {
  Moon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";

interface CustomDatePickerHijriyahProps {
  value: string; // Format ISO YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
}

const NAMA_HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN_HIJRI_LIST: { angka: number; nama: KalenderHijriyahBulanHijriNamaOptions }[] = [
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

// 🛠️ Pindahkan fungsi helper ke luar agar bisa dipakai di level root komponen
const getLocalDateStr = (dInput: string | Date) => {
  const d = new Date(dInput);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const CustomDatePickerHijriyah: React.FC<CustomDatePickerHijriyahProps> = ({
  value,
  onChange,
  placeholder = "Pilih Tanggal Hijriyah",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // String masehi hari ini untuk pencarian fallback
  const todayDateStr = useMemo(() => getLocalDateStr(new Date()), []);

  // State tampilan bulan & tahun (default aman sebelum data termuat)
  const [viewTahunHijri, setViewTahunHijri] = useState<number>(1448);
  const [viewBulanHijri, setViewBulanHijri] = useState<number>(2); // Safar sebagai cadangan terdekat

  // 1. 🔍 QUERY BARU: Ambil data Hijriyah hari ini dari database untuk acuan default buka calendar
  const { data: todayRecord } = useQuery<KalenderHijriyahResponse | null>({
    queryKey: ["datepicker-hijri-today-record", todayDateStr],
    queryFn: async () => {
      try {
        return await pb.collection("kalender_hijriyah").getFirstListItem<KalenderHijriyahResponse>(
          `tanggal_masehi >= "${todayDateStr} 00:00:00" && tanggal_masehi <= "${todayDateStr} 23:59:59"`
        );
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 60 * 12, // Tahan 12 jam karena tanggal hari ini awet
  });

  // Query record Hijriyah dari nilai terpilih
  const { data: selectedRecord, isLoading: isSelectedLoading } = useQuery<KalenderHijriyahResponse | null>({
    queryKey: ["datepicker-hijri-selected-record", value],
    queryFn: async () => {
      if (!value) return null;
      try {
        return await pb.collection("kalender_hijriyah").getFirstListItem<KalenderHijriyahResponse>(
          `tanggal_masehi >= "${value} 00:00:00" && tanggal_masehi <= "${value} 23:59:59"`
        );
      } catch {
        return null;
      }
    },
    enabled: !!value,
    staleTime: 1000 * 60 * 30,
  });

  // 2. 🔄 FIX SYNC EFFECT: Cek record terpilih, jika kosong langsung pakai hari ini (Safar)
  useEffect(() => {
    if (selectedRecord) {
      if (selectedRecord.tahun_hijri) setViewTahunHijri(selectedRecord.tahun_hijri);
      if (selectedRecord.bulan_hijri_angka) setViewBulanHijri(selectedRecord.bulan_hijri_angka);
    } else if (!value && todayRecord) {
      // Jika user belum memilih tanggal apapun, langsung sinkronkan ke bulan sekarang
      if (todayRecord.tahun_hijri) setViewTahunHijri(todayRecord.tahun_hijri);
      if (todayRecord.bulan_hijri_angka) setViewBulanHijri(todayRecord.bulan_hijri_angka);
    }
  }, [selectedRecord, todayRecord, value]);

  // Query hari dalam bulan Hijriyah aktif
  const { data: hijriMonthDays, isLoading: isMonthLoading } = useQuery<KalenderHijriyahResponse[]>({
    queryKey: ["datepicker-hijri-grid-days", viewTahunHijri, viewBulanHijri],
    queryFn: async () => {
      if (!viewTahunHijri || !viewBulanHijri) return [];
      try {
        return await pb.collection("kalender_hijriyah").getFullList<KalenderHijriyahResponse>({
          filter: `tahun_hijri = ${viewTahunHijri} && bulan_hijri_angka = ${viewBulanHijri}`,
          sort: "tanggal_hijri",
        });
      } catch {
        return [];
      }
    },
    enabled: isOpen,
    staleTime: 1000 * 60 * 30,
  });

  const activeBulanObj = useMemo(() => {
    return BULAN_HIJRI_LIST.find((b) => b.angka === viewBulanHijri) || BULAN_HIJRI_LIST[0];
  }, [viewBulanHijri]);

  const firstDayOffset = useMemo(() => {
    if (!hijriMonthDays || hijriMonthDays.length === 0) return 0;
    const firstRecordDate = new Date(hijriMonthDays[0].tanggal_masehi);
    return firstRecordDate.getDay();
  }, [hijriMonthDays]);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = 288;
      let left = rect.left;

      if (left + popoverWidth > window.innerWidth - 16) {
        left = window.innerWidth - popoverWidth - 16;
      }

      let top = rect.bottom + 6;
      if (top + 320 > window.innerHeight) {
        top = Math.max(16, rect.top - 320 - 6);
      }

      setPopoverPos({ top, left });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
    }
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevHijriMonth = () => {
    if (viewBulanHijri === 1) {
      setViewBulanHijri(12);
      setViewTahunHijri((prev) => prev - 1);
    } else {
      setViewBulanHijri((prev) => prev - 1);
    }
  };

  const handleNextHijriMonth = () => {
    if (viewBulanHijri === 12) {
      setViewBulanHijri(1);
      setViewTahunHijri((prev) => prev + 1);
    } else {
      setViewBulanHijri((prev) => prev + 1);
    }
  };

  const selectedDateStr = value ? getLocalDateStr(value) : "";

  const displayText = selectedRecord
    ? `${selectedRecord.tanggal_hijri} ${selectedRecord.bulan_hijri_nama} ${selectedRecord.tahun_hijri} H`
    : placeholder;

  return (
    <div className="w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          updatePosition();
          setIsOpen(!isOpen);
        }}
        className={`w-full h-[42px] flex items-center justify-between px-3.5 bg-gray-950/90 border rounded-2xl font-mono text-xs transition-all duration-200 shadow-inner shrink-0 overflow-hidden ${
          isOpen
            ? "border-amber-400 ring-2 ring-amber-500/20 text-white"
            : value
            ? "border-amber-500/50 text-amber-200 hover:border-amber-400"
            : "border-amber-500/25 text-gray-400 hover:border-amber-500/40"
        }`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          <Moon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {isSelectedLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          ) : (
            <span className="truncate font-bold text-xs">{displayText}</span>
          )}
        </div>

        {value ? (
          <X
            className="w-3.5 h-3.5 text-gray-500 hover:text-rose-400 transition-colors shrink-0 ml-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          />
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 shrink-0 ml-1.5 ${
              isOpen ? "rotate-180 text-amber-400" : ""
            }`}
          />
        )}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
              zIndex: 99999,
            }}
            className="w-72 bg-gray-900/98 backdrop-blur-2xl border border-gray-800 rounded-3xl shadow-2xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150 select-none"
          >
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
              <button
                type="button"
                onClick={handlePrevHijriMonth}
                className="p-1 rounded-xl bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs font-extrabold text-amber-300">
                {activeBulanObj.nama} {viewTahunHijri} H
              </span>

              <button
                type="button"
                onClick={handleNextHijriMonth}
                className="p-1 rounded-xl bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center font-mono text-[10px] text-gray-500 font-semibold">
              {NAMA_HARI.map((h) => (
                <div key={h}>{h}</div>
              ))}
            </div>

            {isMonthLoading ? (
              <div className="py-8 text-center font-mono text-xs text-amber-400/80 animate-pulse">
                Memuat Kalender Hijriyah...
              </div>
            ) : !hijriMonthDays || hijriMonthDays.length === 0 ? (
              <div className="py-6 text-center font-mono text-[11px] text-gray-500 p-2 bg-gray-950/40 rounded-2xl border border-gray-800">
                Bulan {activeBulanObj.nama} {viewTahunHijri} H Belum Dipetakan di Database.
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 text-center font-mono">
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}

                {hijriMonthDays.map((rec) => {
                  const masehiDateObj = new Date(rec.tanggal_masehi);
                  const masehiDayNum = masehiDateObj.getDate();
                  const recDateStr = getLocalDateStr(rec.tanggal_masehi);

                  const isSelected = selectedDateStr === recDateStr;
                  const isToday = todayDateStr === recDateStr;

                  return (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => {
                        onChange(recDateStr);
                        setIsOpen(false);
                      }}
                      title={`${rec.string_hijri} (${masehiDateObj.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })})`}
                      className={`h-9 w-9 rounded-2xl flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? "bg-amber-500 text-gray-950 font-bold shadow-md shadow-amber-500/30 scale-105"
                          : isToday
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-bold leading-none">{rec.tanggal_hijri}</span>
                      <span
                        className={`text-[8px] font-mono leading-none mt-0.5 ${
                          isSelected ? "text-gray-900 font-black" : "text-gray-500"
                        }`}
                      >
                        {masehiDayNum}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};