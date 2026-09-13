// src/features/kalender/components/KalenderPagination.tsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface KalenderPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (newPage: number) => void;
}

export const KalenderPagination: React.FC<KalenderPaginationProps> = ({
  page,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
}) => {
  if (totalItems === 0) return null;

  const startItem = Math.min((page - 1) * perPage + 1, totalItems);
  const endItem = Math.min(page * perPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 px-4 shadow-sm font-sans select-none">
      {/* Keterangan Data */}
      <div className="text-xs text-zinc-400">
        Menampilkan{" "}
        <span className="font-mono font-bold text-zinc-200">
          {startItem}–{endItem}
        </span>{" "}
        dari{" "}
        <span className="font-mono font-bold text-zinc-200">
          {totalItems}
        </span>{" "}
        hari
      </div>

      {/* Kontrol Navigasi (Tinggi Standar Compact Control h-7 / 28px) */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="inline-flex h-7 items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Sebelumnya</span>
        </button>

        <span className="px-2 font-mono text-xs font-medium text-zinc-400">
          {page} / {totalPages || 1}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="inline-flex h-7 items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};