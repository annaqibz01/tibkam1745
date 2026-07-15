// src/components/shared/BaseToolbar.tsx
import React from "react";
import { Search, X, RefreshCw } from "lucide-react";

interface BaseToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  placeholder: string;
  onRefresh: () => void;
  isLoading: boolean;
  searchIconColorClass?: string;
  children?: React.ReactNode; // Slot khusus tempat masuknya filter unik per tab
}

export const BaseToolbar: React.FC<BaseToolbarProps> = ({
  search,
  onSearchChange,
  placeholder,
  onRefresh,
  isLoading,
  searchIconColorClass = "text-indigo-400",
  children,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full">
      {/* 🔍 Input Pencarian Universal */}
      <div className="relative flex-1 group min-w-[200px]">
        <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:${searchIconColorClass} transition-colors`}>
          <Search className={`w-4 h-4 sm:w-5 sm:h-5 ${searchIconColorClass}`} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-opacity-40 shadow-lg font-mono transition-all duration-200"
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

      {/* 🧩 SLOT FILTER DINAMIS */}
      {children}

      {/* 🔄 Tombol Refresh Universal */}
      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="p-3 rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 text-gray-300 hover:text-white transition-all shadow-lg disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
};