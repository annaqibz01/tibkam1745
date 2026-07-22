// src/features/laporan/components/LaporanToolbar.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Check,
  CalendarDays,
  FileText,
  Layers,
} from "lucide-react";
import { BaseToolbar } from "@/components/shared/BaseToolbar";
import type { PeriodeRambutResponse } from "@/types/pocketbase-types";
import type { ReportType } from "../hooks/useLaporanRambut";

interface LaporanToolbarProps {
  periodeList: PeriodeRambutResponse[];
  selectedPeriode: PeriodeRambutResponse | null;
  onSelectPeriode: (periode: PeriodeRambutResponse) => void;
  reportType: ReportType;
  onChangeReportType: (type: ReportType) => void;
  filterKategori: string;
  onChangeFilterKategori: (kat: string) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const LaporanToolbar: React.FC<LaporanToolbarProps> = ({
  periodeList,
  selectedPeriode,
  onSelectPeriode,
  reportType,
  onChangeReportType,
  filterKategori,
  onChangeFilterKategori,
  searchQuery,
  onChangeSearchQuery,
  onRefresh,
  isLoading,
}) => {
  // State untuk melacak dropdown mana yang sedang terbuka
  const [openDropdown, setOpenDropdown] = useState<"periode" | "report" | "kategori" | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // 🛡️ Auto Close Dropdown jika mengklik di luar area toolbar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (key: "periode" | "report" | "kategori") => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  // Opsi Jenis Rekapitulasi Laporan
  const reportOptions: { value: ReportType; label: string }[] = [
    { value: "all", label: "Semua Target Wajib Setor" },
    { value: "belum_setor", label: "Daftar Belum Setor" },
    { value: "sudah_setor", label: "Daftar Sudah Setor" },
    { value: "riwayat", label: "Log Riwayat Transaksi" },
  ];

  // Opsi Kategori Wajib Setor
  const kategoriOptions: { value: string; label: string }[] = [
    { value: "all", label: "Semua Kategori" },
    { value: "aliyah", label: "Aliyah" },
    { value: "kuliah_syariah", label: "Kuliah Syariah" },
    { value: "pengurus_petugas", label: "Pengurus / Petugas" },
  ];

  const currentReportLabel =
    reportOptions.find((r) => r.value === reportType)?.label || "Semua Target Wajib Setor";

  const currentKategoriLabel =
    kategoriOptions.find((k) => k.value === filterKategori)?.label || "Semua Kategori";

  return (
    <div ref={containerRef} className="space-y-4 select-none">
      <BaseToolbar
        search={searchQuery}
        onSearchChange={onChangeSearchQuery}
        placeholder="Cari santri berdasarkan Nama atau ID PPS..."
        onRefresh={onRefresh}
        isLoading={isLoading}
        searchIconColorClass="text-indigo-400"
      >
        {/* ========================================================= */}
        {/* 1. CUSTOM GLASS DROPDOWN: PILIH PERIODE                    */}
        {/* ========================================================= */}
        <div className="relative min-w-[210px] flex-1 sm:flex-initial">
          <button
            type="button"
            onClick={() => toggleDropdown("periode")}
            className={`w-full h-12 px-4 bg-gray-900/80 backdrop-blur-xl border rounded-2xl text-xs font-mono font-bold transition-all duration-200 shadow-lg flex items-center justify-between gap-2.5 ${
              openDropdown === "periode" || selectedPeriode
                ? "border-indigo-500/60 ring-2 ring-indigo-500/20 text-white"
                : "border-gray-800/80 text-gray-300 hover:border-gray-700 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2 truncate min-w-0">
              <CalendarDays className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="truncate">
                {selectedPeriode ? selectedPeriode.nama_periode : "Pilih Periode"}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                openDropdown === "periode" ? "rotate-180 text-indigo-400" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {openDropdown === "periode" && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 sm:right-0 z-30 mt-2 w-full min-w-[240px] max-h-60 overflow-y-auto bg-gray-900/98 backdrop-blur-2xl border border-gray-800/90 rounded-2xl shadow-2xl p-1.5 space-y-0.5 custom-scrollbar"
              >
                <div className="px-3 py-1.5 text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800/60 mb-1">
                  Pilih Periode Ditinjau
                </div>
                {periodeList.map((p) => {
                  const isSelected = selectedPeriode?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onSelectPeriode(p);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-mono transition-colors duration-150 ${
                        isSelected
                          ? "bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30"
                          : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <span className="truncate">{p.nama_periode}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                            p.status_periode === "aktif"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-gray-800 text-gray-400 border-gray-700"
                          }`}
                        >
                          {p.status_periode}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================= */}
        {/* 2. CUSTOM GLASS DROPDOWN: JENIS REKAPITULASI            */}
        {/* ========================================================= */}
        <div className="relative min-w-[210px] flex-1 sm:flex-initial">
          <button
            type="button"
            onClick={() => toggleDropdown("report")}
            className={`w-full h-12 px-4 bg-gray-900/80 backdrop-blur-xl border rounded-2xl text-xs font-mono font-bold transition-all duration-200 shadow-lg flex items-center justify-between gap-2.5 ${
              openDropdown === "report" || reportType !== "all"
                ? "border-purple-500/60 ring-2 ring-purple-500/20 text-white"
                : "border-gray-800/80 text-gray-300 hover:border-gray-700 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2 truncate min-w-0">
              <FileText className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="truncate">{currentReportLabel}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                openDropdown === "report" ? "rotate-180 text-purple-400" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {openDropdown === "report" && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 sm:right-0 z-30 mt-2 w-full min-w-[230px] max-h-60 overflow-y-auto bg-gray-900/98 backdrop-blur-2xl border border-gray-800/90 rounded-2xl shadow-2xl p-1.5 space-y-0.5 custom-scrollbar"
              >
                <div className="px-3 py-1.5 text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800/60 mb-1">
                  Jenis Rekapitulasi Laporan
                </div>
                {reportOptions.map((opt) => {
                  const isSelected = reportType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChangeReportType(opt.value);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-mono transition-colors duration-150 ${
                        isSelected
                          ? "bg-purple-600/20 text-purple-300 font-bold border border-purple-500/30"
                          : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================= */}
        {/* 3. CUSTOM GLASS DROPDOWN: KATEGORI WAJIB                */}
        {/* ========================================================= */}
        <div className="relative min-w-[190px] flex-1 sm:flex-initial">
          <button
            type="button"
            onClick={() => toggleDropdown("kategori")}
            className={`w-full h-12 px-4 bg-gray-900/80 backdrop-blur-xl border rounded-2xl text-xs font-mono font-bold transition-all duration-200 shadow-lg flex items-center justify-between gap-2.5 ${
              openDropdown === "kategori" || filterKategori !== "all"
                ? "border-amber-500/60 ring-2 ring-amber-500/20 text-amber-200"
                : "border-gray-800/80 text-gray-300 hover:border-gray-700 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2 truncate min-w-0">
              <Layers className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">{currentKategoriLabel}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                openDropdown === "kategori" ? "rotate-180 text-amber-400" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {openDropdown === "kategori" && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 z-30 mt-2 w-full min-w-[210px] max-h-60 overflow-y-auto bg-gray-900/98 backdrop-blur-2xl border border-gray-800/90 rounded-2xl shadow-2xl p-1.5 space-y-0.5 custom-scrollbar"
              >
                <div className="px-3 py-1.5 text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800/60 mb-1">
                  Filter Kategori Wajib
                </div>
                {kategoriOptions.map((opt) => {
                  const isSelected = filterKategori === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChangeFilterKategori(opt.value);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-mono transition-colors duration-150 ${
                        isSelected
                          ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                          : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </BaseToolbar>
    </div>
  );
};