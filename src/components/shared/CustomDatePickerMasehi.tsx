// src/components/shared/CustomDatePickerMasehi.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { pb } from "../../lib/pocketbase";
import type { KalenderHijriyahResponse } from "../../types/pocketbase-types";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Moon,
} from "lucide-react";

interface CustomDatePickerMasehiProps {
  value: string; // Format YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
}

const NAMA_HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const NAMA_BULAN_MASEHI = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// ✨ Helper parsing aman zona waktu (Local Midnight)
const parseLocalYMD = (ymd: string): Date | null => {
  if (!ymd) return null;
  const parts = ymd.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

export const CustomDatePickerMasehi: React.FC<CustomDatePickerMasehiProps> = ({
  value,
  onChange,
  placeholder = "Pilih Tanggal Masehi",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selectedDate = useMemo(() => parseLocalYMD(value), [value]);
  const [viewDate, setViewDate] = useState<Date>(selectedDate || new Date());

  // 1. 🔄 FIX SYNC EFFECT: Menjamin kalender otomatis reset ke bulan sekarang jika nilainya kosong (saat buat periode baru)
  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    } else if (!value) {
      setViewDate(new Date());
    }
  }, [selectedDate, value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthPadded = String(month + 1).padStart(2, "0");
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // 🔍 Query 1: Ambil record Hijriyah untuk bulan Masehi aktif
  const { data: monthHijriRecords } = useQuery<KalenderHijriyahResponse[]>({
    queryKey: ["datepicker-masehi-hijri-month", year, monthPadded],
    queryFn: async () => {
      try {
        return await pb.collection("kalender_hijriyah").getFullList<KalenderHijriyahResponse>({
          filter: `tanggal_masehi ~ "${year}-${monthPadded}-"`,
        });
      } catch {
        return [];
      }
    },
    enabled: isOpen,
    staleTime: 1000 * 60 * 30,
  });

  // 🔍 Query 2: Ambil record Hijriyah untuk tanggal terpilih di Trigger Button
  const { data: selectedHijriRecord } = useQuery<KalenderHijriyahResponse | null>({
    queryKey: ["datepicker-masehi-selected-hijri", value],
    queryFn: async () => {
      if (!value) return null;
      try {
        return await pb.collection("kalender_hijriyah").getFirstListItem<KalenderHijriyahResponse>(
          `tanggal_masehi ~ "${value}"`
        );
      } catch {
        return null;
      }
    },
    enabled: !!value,
    staleTime: 1000 * 60 * 30,
  });

  // 2. 🛡️ FIX MAP DAY ANTI-SHIFT: Ekstraksi string murni YYYY-MM-DD tanpa melalui engine Date JavaScript agar tidak bergeser hari
  const hijriDayMap = useMemo(() => {
    const map = new Map<number, KalenderHijriyahResponse>();
    if (!monthHijriRecords) return map;
    monthHijriRecords.forEach((rec) => {
      const cleanStr = rec.tanggal_masehi.split(" ")[0].split("T")[0]; // "YYYY-MM-DD"
      const parts = cleanStr.split("-").map(Number);
      if (parts.length === 3) {
        const dayNum = parts[2]; // Ambil porsi tanggalnya saja
        map.set(dayNum, rec);
      }
    });
    return map;
  }, [monthHijriRecords]);

  // Kalkulasi Posisi Popover
  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = 288;
      let left = rect.left;

      if (left + popoverWidth > window.innerWidth - 16) {
        left = window.innerWidth - popoverWidth - 16;
      }

      let top = rect.bottom + 6;
      if (top + 300 > window.innerHeight) {
        top = Math.max(16, rect.top - 300 - 6);
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

  const formattedMasehiDisplay = selectedDate
    ? selectedDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : placeholder;

  return (
    <div className="w-full">
      {/* TRIGGER BUTTON - [UBAH]: Disetarakan tinggi h-[42px] & layout shrink-0 agar sejajar sempurna */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!isOpen && selectedDate) setViewDate(selectedDate);
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
        <div className="flex items-center gap-2 truncate min-w-0 flex-1">
          <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="truncate font-bold text-xs">{formattedMasehiDisplay}</span>

          {selectedHijriRecord && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex-shrink-0 max-w-[120px] truncate">
              <Moon className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">{selectedHijriRecord.string_hijri}</span>
            </span>
          )}
        </div>

        {value ? (
          <X
            className="w-3.5 h-3.5 text-gray-500 hover:text-rose-400 transition-colors flex-shrink-0 ml-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          />
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-1.5 ${
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
                onClick={handlePrevMonth}
                className="p-1 rounded-xl bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs font-bold text-amber-300">
                {NAMA_BULAN_MASEHI[month]} {year}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
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

            <div className="grid grid-cols-7 gap-1 text-center font-mono">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const hijriRecord = hijriDayMap.get(dayNum);

                const isSelected =
                  selectedDate &&
                  selectedDate.getDate() === dayNum &&
                  selectedDate.getMonth() === month &&
                  selectedDate.getFullYear() === year;

                const isToday =
                  new Date().getDate() === dayNum &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;

                // Format string YYYY-MM-DD lokal untuk fungsi onChange
                const currentMasehiStr = `${year}-${monthPadded}-${String(dayNum).padStart(2, "0")}`;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => {
                      onChange(currentMasehiStr);
                      setIsOpen(false);
                    }}
                    title={hijriRecord ? hijriRecord.string_hijri : undefined}
                    className={`h-9 w-9 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? "bg-amber-500 text-gray-950 font-bold shadow-md shadow-amber-500/30 scale-105"
                        : isToday
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-bold leading-none">{dayNum}</span>
                    {hijriRecord && (
                      <span
                        className={`text-[8px] font-mono leading-none mt-0.5 ${
                          isSelected ? "text-gray-900 font-black" : "text-amber-400/80"
                        }`}
                      >
                        {hijriRecord.tanggal_hijri}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export { CustomDatePickerMasehi as CustomDatePicker };