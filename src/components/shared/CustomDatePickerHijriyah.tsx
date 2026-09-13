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
  value: string;
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

  const todayDateStr = useMemo(() => getLocalDateStr(new Date()), []);
  const [viewTahunHijri, setViewTahunHijri] = useState<number>(1448);
  const [viewBulanHijri, setViewBulanHijri] = useState<number>(2);

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
    staleTime: 1000 * 60 * 60 * 12,
  });

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

  useEffect(() => {
    if (selectedRecord) {
      if (selectedRecord.tahun_hijri) setViewTahunHijri(selectedRecord.tahun_hijri);
      if (selectedRecord.bulan_hijri_angka) setViewBulanHijri(selectedRecord.bulan_hijri_angka);
    } else if (!value && todayRecord) {
      if (todayRecord.tahun_hijri) setViewTahunHijri(todayRecord.tahun_hijri);
      if (todayRecord.bulan_hijri_angka) setViewBulanHijri(todayRecord.bulan_hijri_angka);
    }
  }, [selectedRecord, todayRecord, value]);

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
      const popoverWidth = 260;
      let left = rect.left;

      if (left + popoverWidth > window.innerWidth - 16) {
        left = window.innerWidth - popoverWidth - 16;
      }

      let top = rect.bottom + 4;
      if (top + 300 > window.innerHeight) {
        top = Math.max(16, rect.top - 300 - 4);
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
    <div className="w-full font-sans select-none">
      {/* Trigger Button: Tinggi h-9 / 36px */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          updatePosition();
          setIsOpen(!isOpen);
        }}
        className={`w-full h-9 flex items-center justify-between px-3 bg-zinc-900 border rounded-lg text-xs font-medium transition-colors shadow-sm ${
          isOpen
            ? "border-zinc-700 bg-zinc-800/80 text-white"
            : value
            ? "border-amber-500/40 text-amber-300 hover:border-amber-500/60"
            : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
        }`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          <Moon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {isSelectedLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          ) : (
            <span className="truncate font-mono text-xs">{displayText}</span>
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
            className="w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-3 space-y-2.5 animate-in fade-in duration-100 select-none font-sans"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <button
                type="button"
                tabIndex={-1}
                onClick={handlePrevHijriMonth}
                className="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="text-xs font-semibold text-amber-300 font-mono">
                {activeBulanObj.nama} {viewTahunHijri} H
              </span>

              <button
                type="button"
                tabIndex={-1}
                onClick={handleNextHijriMonth}
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

            {isMonthLoading ? (
              <div className="py-6 text-center text-xs text-amber-400/80 font-sans">
                Memuat kalender...
              </div>
            ) : !hijriMonthDays || hijriMonthDays.length === 0 ? (
              <div className="py-4 text-center text-[11px] text-zinc-500 bg-zinc-950/40 rounded-lg border border-zinc-800">
                Bulan {activeBulanObj.nama} belum terdaftar di database.
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-0.5 text-center font-mono">
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
                      className={`h-7 w-7 rounded-md flex flex-col items-center justify-center transition-colors mx-auto ${
                        isSelected
                          ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                          : isToday
                          ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                          : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      }`}
                    >
                      <span className="text-[11px] font-bold leading-none">{rec.tanggal_hijri}</span>
                      <span
                        className={`text-[7px] font-mono leading-none mt-0.5 ${
                          isSelected ? "text-zinc-950 font-black" : "text-zinc-500"
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