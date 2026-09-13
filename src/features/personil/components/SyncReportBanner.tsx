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
      const openTimeout = setTimeout(() => setIsVisible(true), 20);
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
    }, 150);
  };

  if (!localReport && !isVisible) return null;

  return (
    <div className="fixed top-11 inset-x-0 z-50 flex justify-center px-4 pointer-events-none font-sans select-none">
      <div
        className={`pointer-events-auto max-w-sm w-full rounded-lg border border-emerald-500/30 bg-zinc-900/98 p-3 shadow-xl transition-all duration-200 ease-out flex items-start gap-2.5 ${
          isVisible ? "translate-y-0 opacity-100 scale-100" : "-translate-y-2 opacity-0 scale-98"
        }`}
      >
        <div className="mt-0.5 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="flex-1 space-y-1.5 min-w-0">
          <div>
            <h4 className="font-semibold text-zinc-100 text-xs">Sinkronisasi Personil Selesai</h4>
            <p className="text-[11px] text-zinc-400">
              Database Personil Tibkam berhasil diperbarui via Excel.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 border-t border-zinc-800 pt-1.5 text-xs font-medium">
            <div className="flex items-center justify-between bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
              <span className="text-zinc-500 text-[10px]">Baru:</span>
              <span className="font-mono font-bold text-emerald-400 text-[11px]">{localReport?.inserted}</span>
            </div>
            <div className="flex items-center justify-between bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
              <span className="text-zinc-500 text-[10px]">Update:</span>
              <span className="font-mono font-bold text-amber-400 text-[11px]">{localReport?.updated}</span>
            </div>
            <div className="flex items-center justify-between bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
              <span className="text-zinc-500 text-[10px]">Nonaktif:</span>
              <span className="font-mono font-bold text-rose-400 text-[11px]">{localReport?.softDeleted}</span>
            </div>
            <div className="flex items-center justify-between bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
              <span className="text-zinc-500 text-[10px]">Lewat:</span>
              <span className="font-mono font-bold text-zinc-400 text-[11px]">{localReport?.skipped}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          tabIndex={-1}
          onClick={handleClose}
          className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 focus:outline-none shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}