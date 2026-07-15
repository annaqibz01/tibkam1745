// src/components/rambut/toolbars/PengurusToolbar.tsx
import React, { useMemo } from "react";
import { Search, X, RefreshCw, MapPin } from "lucide-react";
import { CustomGlassDropdown } from "./CustomGlassDropdown";

interface PengurusToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  daerahFilter: string;
  onDaerahFilterChange: (val: string) => void;
  daerahOptions: string[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const PengurusToolbar: React.FC<PengurusToolbarProps> = ({
  search,
  onSearchChange,
  daerahFilter,
  onDaerahFilterChange,
  daerahOptions,
  onRefresh,
  isLoading,
}) => {
  const dropdownOptions = useMemo(() => {
    return daerahOptions.map((d) => ({
      value: d, // Nilai asli ("L") tetap dikirim untuk dicocokkan ke filter hook
      label: `Daerah ${d}`, // Teks label yang tampil di layar menjadi indah ("Daerah L")
    }));
  }, [daerahOptions]);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full">
      <div className="relative flex-1 group min-w-[200px]">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          placeholder="Cari pengurus berdasarkan ID PPS, Nama, atau Jabatan..."
          className="w-full pl-11 pr-10 py-3 bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 shadow-lg font-mono transition-all duration-200"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <CustomGlassDropdown
        value={daerahFilter}
        onChange={onDaerahFilterChange}
        options={dropdownOptions}
        defaultLabel="Semua Daerah"
        icon={<MapPin className="w-4 h-4 text-purple-400 shrink-0" />}
        activeColorClass="border-purple-500/60 text-purple-200 ring-purple-500/20"
        minWidthClass="min-w-[200px]"
      />

      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="p-3 rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 text-gray-300 hover:text-white hover:border-purple-500/40 active:scale-95 transition-all shadow-lg disabled:opacity-50"
        title="Segarkan Data Pengurus"
      >
        <RefreshCw
          className={`w-4 h-4 ${isLoading ? "animate-spin text-purple-400" : ""}`}
        />
      </button>
    </div>
  );
};
