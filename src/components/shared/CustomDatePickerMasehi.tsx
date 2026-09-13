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
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const NAMA_HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const NAMA_BULAN_MASEHI = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

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

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

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

  const hijriDayMap = useMemo(() => {
    const map = new Map<number, KalenderHijriyahResponse>();
    if (!monthHijriRecords) return map;
    monthHijriRecords.forEach((rec) => {
      const cleanStr = rec.tanggal_masehi.split(" ")[0].split("T")[0];
      const parts = cleanStr.split("-").map(Number);
      if (parts.length === 3) {
        map.set(parts[2], rec);
      }
    });
    return map;
  }, [monthHijriRecords]);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = 260;
      let left = rect.left;

      if (left + popoverWidth > window.innerWidth - 16) {
        left = window.innerWidth - popoverWidth - 16;
      }

      let top = rect.bottom + 4;
      if (top + 280 > window.innerHeight) {
        top = Math.max(16, rect.top - 280 - 4);
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
    <div className="w-full font-sans select-none">
      {/* Trigger Button: Tinggi Terkunci h-9 / 36px */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!isOpen && selectedDate) setViewDate(selectedDate);
          setIsOpen(!isOpen);
        }}
        className={`w-full h-9 flex items-center justify-between px-3 bg-zinc-900 border rounded-lg text-xs font-medium transition-colors shadow-sm ${
          isOpen
            ? "border-zinc-700 bg-zinc-800/80 text-white"
            : value
            ? "border-zinc-700 text-zinc-100 hover:border-zinc-600"
            : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
        }`}
      >
        <div className="flex items-center gap-2 truncate min-w-0 flex-1">
          <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="truncate">{formattedMasehiDisplay}</span>

          {selectedHijriRecord && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 shrink-0 max-w-[110px] truncate">
              <Moon className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              <span className="truncate">{selectedHijriRecord.string_hijri}</span>
            </span>
          )}
        </div>

        {value ? (
          <X
            className="w-3.5 h-3.5 text-zinc-500 hover:text-rose-400 transition-colors shrink-0 ml-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          />
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-150 shrink-0 ml-1.5 ${
              isOpen ? "rotate-180 text-zinc-200" : ""
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
            className="w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-3 space-y-2.5 animate-in fade-in duration-100 select-none font-sans"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <button
                type="button"
                tabIndex={-1}
                onClick={handlePrevMonth}
                className="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="text-xs font-semibold text-zinc-200">
                {NAMA_BULAN_MASEHI[month]} {year}
              </span>

              <button
                type="button"
                tabIndex={-1}
                onClick={handleNextMonth}
                className="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center font-mono text-[10px] text-zinc-500 font-medium">
              {NAMA_HARI.map((h) => (
                <div key={h}>{h}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5 text-center font-sans">
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
                    className={`h-7 w-7 rounded-md flex flex-col items-center justify-center transition-colors mx-auto ${
                      isSelected
                        ? "bg-indigo-600 text-white font-semibold shadow-sm"
                        : isToday
                        ? "bg-zinc-800 text-indigo-400 border border-zinc-700"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <span className="text-[11px] leading-none">{dayNum}</span>
                    {hijriRecord && (
                      <span
                        className={`text-[7px] font-mono leading-none mt-0.5 ${
                          isSelected ? "text-indigo-200" : "text-amber-400/80"
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