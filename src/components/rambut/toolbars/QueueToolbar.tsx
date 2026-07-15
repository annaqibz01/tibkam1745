// src/components/rambut/toolbars/QueueToolbar.tsx
import React from "react";
import { motion } from "framer-motion";
import { Search, X, RefreshCw } from "lucide-react";
import type { WajibSetorRambutStatusSetorOptions } from "../../../types/pocketbase-types";

interface QueueToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: "all" | WajibSetorRambutStatusSetorOptions;
  onStatusFilterChange: (val: "all" | WajibSetorRambutStatusSetorOptions) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const QueueToolbar: React.FC<QueueToolbarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full">
      <div className="relative flex-1 group min-w-[200px]">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          placeholder="Cari wajib setor berdasarkan ID PPS atau Nama..."
          className="w-full pl-11 pr-10 py-3 bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 shadow-lg font-mono transition-all duration-200"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
            title="Reset pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 p-1 rounded-2xl shadow-lg">
        {(["all", "belum", "sudah", "dispensasi"] as const).map((st) => {
          const isActive = statusFilter === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => onStatusFilterChange(st)}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition-colors duration-200 select-none active:scale-95 ${
                isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeStatusFilterPill"
                  className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md border border-indigo-400/30"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                {st === "all" ? "Semua Status" : st}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="p-3 rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 text-gray-300 hover:text-white hover:border-indigo-500/40 active:scale-95 transition-all shadow-lg disabled:opacity-50"
        title="Segarkan Data"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
      </button>
    </div>
  );
};