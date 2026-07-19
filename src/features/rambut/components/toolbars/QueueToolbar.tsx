// src/components/rambut/toolbars/QueueToolbar.tsx
import React from "react";
import { motion } from "framer-motion";
import { BaseToolbar } from "../../../../components/shared/BaseToolbar";
import type { WajibSetorRambutStatusSetorOptions } from "../../../../types/pocketbase-types";

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
    <BaseToolbar
      search={search}
      onSearchChange={onSearchChange}
      placeholder="Cari wajib setor berdasarkan ID PPS atau Nama..."
      onRefresh={onRefresh}
      isLoading={isLoading}
      searchIconColorClass="text-indigo-400"
    >
      {/* Pills Status diselaraskan dengan h-12 dan rounded-2xl agar sejajar rata air */}
      <div className="flex items-center gap-1 bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 p-1 rounded-2xl shadow-lg h-12">
        {(["all", "belum", "sudah", "dispensasi"] as const).map((st) => {
          const isActive = statusFilter === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => onStatusFilterChange(st)}
              className={`relative px-4 h-full flex items-center rounded-xl text-xs font-sans font-bold capitalize transition-colors duration-200 select-none active:scale-95 ${
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
              <span className="relative z-10 whitespace-nowrap">
                {st === "all" ? "Semua Status" : st}
              </span>
            </button>
          );
        })}
      </div>
    </BaseToolbar>
  );
};