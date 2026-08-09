// src/features/personil/components/SyncReportBanner.tsx
import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import type { PersonilSyncReport } from "../utils/importPersonilExcel";

interface SyncReportBannerProps {
  report: PersonilSyncReport | null;
  onClose: () => void;
}

export default function SyncReportBanner({ report, onClose }: SyncReportBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [localReport, setLocalReport] = useState<PersonilSyncReport | null>(null);

  useEffect(() => {
    if (report) {
      setLocalReport(report);
      const openTimeout = setTimeout(() => setIsVisible(true), 50);
      const closeTimeout = setTimeout(() => {
        handleClose();
      }, 6000);

      return () => {
        clearTimeout(openTimeout);
        clearTimeout(closeTimeout);
      };
    }
  }, [report]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setLocalReport(null);
    }, 300);
  };

  if (!localReport && !isVisible) return null;

  return (
    <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none select-none">
      <div
        className={`pointer-events-auto max-w-md w-full rounded-2xl border border-emerald-500/30 bg-gray-900/95 p-4 text-emerald-300 shadow-2xl shadow-emerald-950/50 backdrop-blur-md transition-all duration-300 ease-out flex gap-3 ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-8 opacity-0 scale-95"
        }`}
      >
        <div className="flex-shrink-0 mt-0.5">
          <CheckCircle2 size={20} className="text-emerald-400" />
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <h4 className="font-semibold text-white text-sm font-sans">Sinkronisasi Personil Selesai</h4>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              Database Personil Tibkam berhasil diperbarui via Excel.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-gray-800 pt-2 text-xs font-mono font-medium">
            <div className="flex items-center justify-between bg-gray-950/40 px-2 py-1 rounded-lg border border-gray-800/30">
              <span className="text-gray-400">Baru:</span>
              <span className="font-bold text-emerald-400">{localReport?.inserted}</span>
            </div>
            <div className="flex items-center justify-between bg-gray-950/40 px-2 py-1 rounded-lg border border-gray-800/30">
              <span className="text-gray-400">Update:</span>
              <span className="font-bold text-amber-400">{localReport?.updated}</span>
            </div>
            <div className="flex items-center justify-between bg-gray-950/40 px-2 py-1 rounded-lg border border-gray-800/30">
              <span className="text-gray-400">Nonaktif:</span>
              <span className="font-bold text-rose-400">{localReport?.softDeleted}</span>
            </div>
            <div className="flex items-center justify-between bg-gray-950/40 px-2 py-1 rounded-lg border border-gray-800/30">
              <span className="text-gray-400">Lewat:</span>
              <span className="font-bold text-gray-400">{localReport?.skipped}</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-800 hover:text-gray-300 focus:outline-none"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}