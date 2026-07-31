// src/features/master/components/MasterToolbar.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCw,
  ChevronDown,
  Check,
  X,
  Filter,
  GraduationCap,
  BookOpen,
  Home,
  Building,
} from "lucide-react";

interface ExcelFilterDropdownProps {
  title: string;
  defaultLabel: string;
  icon: React.ReactNode;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  activeColorClass: string;
  iconColorClass: string;
}

const ExcelFilterDropdown: React.FC<ExcelFilterDropdownProps> = ({
  title,
  defaultLabel,
  icon,
  options,
  value,
  onChange,
  activeColorClass,
  iconColorClass,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSearch, setLocalInternalSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLocalInternalSearch("");
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!internalSearch.trim()) return options;
    return options.filter((opt) =>
      opt.toLowerCase().includes(internalSearch.trim().toLowerCase())
    );
  }, [options, internalSearch]);

  const isActive = value !== "all";

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* 🔒 TOMBOL DENGAN LEBAR TERKUNCI W-FULL DI DALAM GRID */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 flex items-center justify-between px-3 bg-gray-900/80 backdrop-blur-xl border rounded-2xl text-xs font-mono font-bold transition-all duration-200 shadow-lg active:scale-95 ${
          isActive || isOpen
            ? `${activeColorClass} ring-2`
            : "border-gray-800/80 text-gray-300 hover:border-gray-700 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-2 truncate min-w-0 flex-1">
          {icon}
          <span className="truncate">{value === "all" ? defaultLabel : value}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 shrink-0 ml-1 ${
            isOpen ? `rotate-180 ${iconColorClass}` : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 z-30 mt-2 w-56 bg-gray-900/98 backdrop-blur-2xl border border-gray-800 rounded-2xl shadow-2xl p-2 space-y-2 font-mono text-xs"
          >
            {/* 🔍 INTERNAL SEARCH BOX */}
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={internalSearch}
                onChange={(e) => setLocalInternalSearch(e.target.value)}
                placeholder={`Cari ${title.toLowerCase()}...`}
                className="w-full h-8 pl-8 pr-7 bg-gray-950/80 border border-gray-800 rounded-xl text-white text-[11px] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              />
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              {internalSearch && (
                <button
                  type="button"
                  onClick={() => setLocalInternalSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* 📊 OPTIONS LIST */}
            <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
              <button
                type="button"
                onClick={() => {
                  onChange("all");
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors ${
                  value === "all"
                    ? "bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30"
                    : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
                }`}
              >
                <span>(Tampilkan Semua)</span>
                {value === "all" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>

              {filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-[10px] text-gray-500">
                  Opsi tidak ditemukan
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = value === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onChange(opt);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors ${
                        isSelected
                          ? "bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30"
                          : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface MasterToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: "all" | "aktif" | "nonaktif";
  onStatusFilterChange: (val: "all" | "aktif" | "nonaktif") => void;
  tingkatanFilter: string;
  onTingkatanFilterChange: (val: string) => void;
  kelasFilter: string;
  onKelasFilterChange: (val: string) => void;
  statusDomisiliFilter: string;
  onStatusDomisiliFilterChange: (val: string) => void;
  domisiliFilter: string;
  onDomisiliFilterChange: (val: string) => void;
  tingkatanOptions?: string[];
  kelasOptions?: string[];
  statusDomisiliOptions?: string[];
  domisiliOptions?: string[];
  onRefresh: () => void;
  isListLoading: boolean;
}

export default function MasterToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  tingkatanFilter,
  onTingkatanFilterChange,
  kelasFilter,
  onKelasFilterChange,
  statusDomisiliFilter,
  onStatusDomisiliFilterChange,
  domisiliFilter,
  onDomisiliFilterChange,
  tingkatanOptions = [],
  kelasOptions = [],
  statusDomisiliOptions = [],
  domisiliOptions = [],
  onRefresh,
  isListLoading,
}: MasterToolbarProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearchChange(localSearch);
      setTimeout(() => {
        inputRef.current?.select();
      }, 0);
    }
  };

  const handleClear = () => {
    setLocalSearch("");
    onSearchChange("");
    inputRef.current?.focus();
  };

  return (
    <div className="mb-5 space-y-3 select-none">
      {/* 🟢 BARIS 1: SEARCH BAR (100% WIDE) & REFRESH BUTTON */}
      <div className="flex items-center gap-3 w-full">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full h-12 pl-11 pr-10 bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-2xl text-white text-xs font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 shadow-lg transition-all duration-200"
            placeholder="Cari nama atau ID PPS santri (Tekan Enter)..."
            onKeyDown={handleKeyDown}
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 🔄 Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isListLoading}
          className="h-12 px-4 rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 text-xs font-mono font-bold text-gray-300 hover:border-indigo-500/40 hover:text-white active:scale-95 transition-all shadow-lg shrink-0 disabled:opacity-50 flex items-center gap-2"
          title="Segarkan data"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              isListLoading ? "animate-spin text-indigo-400" : "text-gray-400"
            }`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* 🟢 BARIS 2: CSS GRID 5 KOLOM PRESISI & STABIL */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 w-full">
        {/* 1. Status Aktif */}
        <ExcelFilterDropdown
          title="Status Aktif"
          defaultLabel="Semua Status"
          icon={<Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
          options={["aktif", "nonaktif"]}
          value={statusFilter}
          onChange={(val) => onStatusFilterChange(val as any)}
          activeColorClass="border-indigo-500/50 text-indigo-300 ring-indigo-500/20"
          iconColorClass="text-indigo-400"
        />

        {/* 2. Tingkatan / Jenjang */}
        <ExcelFilterDropdown
          title="Tingkatan"
          defaultLabel="Semua Jenjang"
          icon={<GraduationCap className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
          options={tingkatanOptions}
          value={tingkatanFilter}
          onChange={onTingkatanFilterChange}
          activeColorClass="border-purple-500/50 text-purple-300 ring-purple-500/20"
          iconColorClass="text-purple-400"
        />

        {/* 3. Kelas */}
        <ExcelFilterDropdown
          title="Kelas"
          defaultLabel="Semua Kelas"
          icon={<BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
          options={kelasOptions}
          value={kelasFilter}
          onChange={onKelasFilterChange}
          activeColorClass="border-sky-500/50 text-sky-300 ring-sky-500/20"
          iconColorClass="text-sky-400"
        />

        {/* 4. Status Domisili (PPS / LPPS) */}
        <ExcelFilterDropdown
          title="Status Domisili"
          defaultLabel="Semua Status Domisili"
          icon={<Home className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          options={statusDomisiliOptions}
          value={statusDomisiliFilter}
          onChange={onStatusDomisiliFilterChange}
          activeColorClass="border-emerald-500/50 text-emerald-300 ring-emerald-500/20"
          iconColorClass="text-emerald-400"
        />

        {/* 5. Kompleks Domisili */}
        <ExcelFilterDropdown
          title="Kompleks Domisili"
          defaultLabel="Semua Kompleks"
          icon={<Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          options={domisiliOptions}
          value={domisiliFilter}
          onChange={onDomisiliFilterChange}
          activeColorClass="border-amber-500/50 text-amber-300 ring-amber-500/20"
          iconColorClass="text-amber-400"
        />
      </div>
    </div>
  );
}