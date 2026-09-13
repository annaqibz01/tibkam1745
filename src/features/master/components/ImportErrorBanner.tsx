// src/features/master/components/ImportErrorBanner.tsx
import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";

interface ImportErrorBannerProps {
  message: string | null;
  onClose: () => void;
}

export default function ImportErrorBanner({ message, onClose }: ImportErrorBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  useEffect(() => {
    if (message) {
      setLocalMessage(message);
      const openTimeout = setTimeout(() => setIsVisible(true), 20);
      const closeTimeout = setTimeout(() => {
        handleClose();
      }, 7000);

      return () => {
        clearTimeout(openTimeout);
        clearTimeout(closeTimeout);
      };
    }
  }, [message]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setLocalMessage(null);
    }, 150);
  };

  if (!localMessage && !isVisible) return null;

  return (
    <div className="fixed top-11 inset-x-0 z-50 flex justify-center px-4 pointer-events-none font-sans">
      <div
        className={`pointer-events-auto max-w-sm w-full rounded-lg border border-rose-500/30 bg-zinc-900/98 p-3 shadow-xl transition-all duration-200 ease-out flex items-start gap-2.5 ${
          isVisible ? "translate-y-0 opacity-100 scale-100" : "-translate-y-2 opacity-0 scale-98"
        }`}
      >
        <div className="mt-0.5 shrink-0">
          <AlertCircle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="flex-1 space-y-0.5 min-w-0">
          <h4 className="font-semibold text-zinc-100 text-xs">Gagal Memproses Berkas</h4>
          <p className="text-[11px] text-zinc-400 leading-normal">
            {localMessage}
          </p>
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