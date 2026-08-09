// src/features/personil/components/PersonilPagination.tsx
import { useMemo } from "react";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";

interface PersonilPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (newPage: number) => void;
}

export default function PersonilPagination({
  page,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
}: PersonilPaginationProps) {
  if (totalItems === 0) return null;

  const startItem = Math.min((page - 1) * perPage + 1, totalItems);
  const endItem = Math.min(page * perPage, totalItems);

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
    <div className="relative overflow-hidden mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-4 sm:px-6 shadow-2xl backdrop-blur-xl select-none">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-gray-400">
        <Layers className="w-4 h-4 text-indigo-400 hidden sm:inline-block" />
        <span>
          Menampilkan{" "}
          <span className="font-bold text-gray-200 bg-gray-800/80 px-2 py-0.5 rounded-lg border border-gray-700/50">
            {startItem} – {endItem}
          </span>{" "}
          dari{" "}
          <span className="font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
            {totalItems}
          </span>{" "}
          personil
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-900/80 px-3 text-xs font-mono font-medium text-gray-300 transition-all duration-200 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300 active:scale-95 disabled:pointer-events-none disabled:opacity-20 shadow-md"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {pageNumbers.map((num, idx) => {
          if (num === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="inline-flex h-9 w-8 items-center justify-center text-gray-500 font-mono font-bold tracking-widest text-xs"
              >
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
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-mono font-bold transition-all duration-200 active:scale-95 ${
                isCurrent
                  ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/30 scale-105 border border-indigo-400/40 ring-2 ring-indigo-500/20"
                  : "border border-gray-800 bg-gray-900/60 text-gray-400 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300"
              }`}
            >
              {num}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-900/80 px-3 text-xs font-mono font-medium text-gray-300 transition-all duration-200 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300 active:scale-95 disabled:pointer-events-none disabled:opacity-20 shadow-md"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}