// src/components/master/MasterToolbar.tsx
import { useState, useRef, useEffect } from "react";
import { Search, RefreshCw, ChevronDown, Check, X, Filter } from "lucide-react";

interface MasterToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: "all" | "aktif" | "nonaktif";
  onStatusFilterChange: (val: "all" | "aktif" | "nonaktif") => void;
  onRefresh: () => void;
  isListLoading: boolean;
}

export default function MasterToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  isListLoading,
}: MasterToolbarProps) {
  // State untuk mengontrol buka/tutup menu dropdown kustom
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto Close Dropdown jika klik di luar area menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Struktur data opsi filter status
  const filterOptions = [
    { value: "aktif", label: "Status Aktif" },
    { value: "all", label: "Semua Status" },
    { value: "nonaktif", label: "Status Nonaktif" },
  ] as const;

  // Label teks dari status yang sedang aktif saat ini
  const currentLabel =
    filterOptions.find((opt) => opt.value === statusFilter)?.label ?? "Status Aktif";

  const isFilterActive = statusFilter !== "all";

  return (
    <div className="mb-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 md:gap-4">
      {/* 🔍 1. Input Pencarian dengan Clear Button & Glassmorphism */}
      <div className="relative flex-1 max-w-md group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama atau ID PPS santri..."
          className="w-full pl-11 pr-10 py-3 bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 shadow-lg transition-all duration-200"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
            title="Bersihkan pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ⚡ 2. Grup Filter Dropdown & Tombol Refresh */}
      <div className="flex items-center gap-3">
        {/* Dropdown Filter Status */}
        <div ref={dropdownRef} className="relative flex-1 sm:flex-initial">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full sm:w-48 flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur-xl border rounded-2xl text-sm font-medium transition-all duration-200 shadow-lg ${
              isOpen || isFilterActive
                ? "border-indigo-500/50 text-white ring-2 ring-indigo-500/20"
                : "border-gray-800/80 text-gray-300 hover:border-gray-700 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Filter
                className={`w-4 h-4 flex-shrink-0 ${
                  isFilterActive ? "text-indigo-400" : "text-gray-500"
                }`}
              />
              <span className="truncate">{currentLabel}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              {isFilterActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              )}
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                  isOpen ? "rotate-180 text-indigo-400" : ""
                }`}
              />
            </div>
          </button>

          {/* Panel List Pilihan Menu Dropdown */}
          {isOpen && (
            <div className="absolute right-0 z-30 mt-2 w-full sm:w-48 bg-gray-900/95 backdrop-blur-2xl border border-gray-800/90 rounded-2xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800/60 mb-1">
                Filter Status Santri
              </div>
              {filterOptions.map((option) => {
                const isSelected = statusFilter === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onStatusFilterChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-colors duration-150 ${
                      isSelected
                        ? "bg-indigo-600/20 text-indigo-400 font-semibold"
                        : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 🔄 3. Tombol Refresh */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isListLoading}
          className="inline-flex items-center gap-2 px-4.5 py-3 rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 text-xs font-mono font-semibold text-gray-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300 active:scale-95 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}