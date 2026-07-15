// src/components/rambut/toolbars/AuditToolbar.tsx
import React from "react";
import { Search, X, RefreshCw, Moon } from "lucide-react";
import { CustomGlassDropdown, type DropdownOption } from "./CustomGlassDropdown";

interface AuditToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  dateFilter: string;
  onDateFilterChange: (val: string) => void;
  availableHijriDateOptions: DropdownOption[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const AuditToolbar: React.FC<AuditToolbarProps> = ({
  search,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  availableHijriDateOptions,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full">
      <div className="relative flex-1 group min-w-[200px]">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-amber-400 transition-colors">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          placeholder="Cari log riwayat berdasarkan ID PPS, Nama, Petugas, atau Catatan..."
          className="w-full pl-11 pr-10 py-3 bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 shadow-lg font-mono transition-all duration-200"
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
        value={dateFilter}
        onChange={onDateFilterChange}
        options={availableHijriDateOptions}
        defaultLabel="Semua Tanggal Hijriyah"
        icon={<Moon className="w-4 h-4 text-amber-400 shrink-0" />}
        activeColorClass="border-amber-500/60 text-amber-200 ring-amber-500/20"
        minWidthClass="min-w-[220px]"
      />

      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="p-3 rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 text-gray-300 hover:text-white hover:border-amber-500/40 active:scale-95 transition-all shadow-lg disabled:opacity-50"
        title="Segarkan Log Audit"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
      </button>
    </div>
  );
};