// src/features/rambut/components/toolbars/QueueToolbar.tsx
import React from "react";
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
      {/* Pills Status (h-9, rounded-lg, zinc) */}
      <div className="flex items-center gap-0.5 h-9 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
        {(["all", "belum", "sudah", "dispensasi"] as const).map((st) => {
          const isActive = statusFilter === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => onStatusFilterChange(st)}
              className={`relative h-full px-3 rounded-md text-xs font-medium capitalize transition-colors ${
                isActive ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {st === "all" ? "Semua Status" : st}
            </button>
          );
        })}
      </div>
    </BaseToolbar>
  );
};