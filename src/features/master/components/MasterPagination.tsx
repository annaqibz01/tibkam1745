// src/features/master/components/MasterPagination.tsx
import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface MasterPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (newPage: number) => void;
}

export const MasterPagination: React.FC<MasterPaginationProps> = ({
  page,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
}) => {
  if (totalItems === 0) return null;

  const startItem = Math.min((page - 1) * perPage + 1, totalItems);
  const endItem = Math.min(page * perPage, totalItems);

  // Algoritma penomoran halaman dengan elipsis (...)
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const siblingCount = 1;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 1;

    if (!showLeftEllipsis && showRightEllipsis) {
      const itemCount = 3 + 2 * siblingCount;
      for (let i = 1; i <= itemCount; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (showLeftEllipsis && !showRightEllipsis) {
      const itemCount = 3 + 2 * siblingCount;
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - itemCount + 1; i <= totalPages; i++) pages.push(i);
    } else if (showLeftEllipsis && showRightEllipsis) {
      pages.push(1);
      pages.push("...");
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  }, [page, totalPages]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900 p-2 px-3.5 shadow-sm font-sans select-none">
      {/* Keterangan Data */}
      <div className="text-xs text-zinc-400">
        Menampilkan{" "}
        <span className="font-mono font-bold text-zinc-200">
          {startItem}–{endItem}
        </span>{" "}
        dari{" "}
        <span className="font-mono font-bold text-zinc-200">
          {totalItems.toLocaleString("id-ID")}
        </span>{" "}
        data
      </div>

      {/* Kontrol Angka Halaman (Tinggi Standar h-7 / 28px) */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="inline-flex h-7 items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Sebelumnya</span>
        </button>

        <div className="flex items-center gap-1 mx-0.5">
          {pageNumbers.map((num, idx) => {
            if (num === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-xs text-zinc-600 font-mono">
                  ...
                </span>
              );
            }

            const isCurrent = num === page;
            return (
              <button
                type="button"
                key={`page-${num}`}
                onClick={() => onPageChange(num as number)}
                className={`h-7 min-w-[28px] px-1.5 rounded-md text-xs font-mono transition-colors ${
                  isCurrent
                    ? "bg-zinc-100 text-zinc-950 font-bold shadow-sm"
                    : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="inline-flex h-7 items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <span className="hidden sm:inline text-[11px]">Selanjutnya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default MasterPagination;