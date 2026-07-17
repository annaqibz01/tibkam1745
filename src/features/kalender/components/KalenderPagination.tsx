// src/components/kalender/KalenderPagination.tsx
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";

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
    <div className="relative overflow-hidden mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-4 sm:px-6 shadow-2xl backdrop-blur-xl">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      {/* Info Status Data */}
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
          hari
        </span>
      </div>

      {/* Kontrol Navigasi */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-900/80 px-3 text-xs font-mono font-medium text-gray-300 transition-all duration-200 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300 active:scale-95 disabled:pointer-events-none disabled:opacity-20 shadow-md"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        <span className="px-3 text-xs font-mono font-bold text-indigo-300">
          {page} / {totalPages || 1}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-900/80 px-3 text-xs font-mono font-medium text-gray-300 transition-all duration-200 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300 active:scale-95 disabled:pointer-events-none disabled:opacity-20 shadow-md"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};