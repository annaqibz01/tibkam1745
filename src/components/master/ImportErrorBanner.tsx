// src/components/master/ImportErrorBanner.tsx
import { useEffect, useState } from "react";
import { XCircle, X } from "lucide-react";

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
      const openTimeout = setTimeout(() => setIsVisible(true), 50);
      
      // Otomatis menutup secara bersih setelah 7 detik
      const closeTimeout = setTimeout(() => {
        handleClose();
      }, 7000);

      return () => {
        clearTimeout(openTimeout);
        clearTimeout(closeTimeout);
      };
    }
  }, [message]);

  // ✨ KUNCI PERBAIKAN: Fungsi penutup yang membersihkan state komponen induk
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(); // Mengubah importError di Master.tsx menjadi null
      setLocalMessage(null);
    }, 300); // 300ms sesuai durasi transisi Tailwind animation
  };

  if (!localMessage && !isVisible) return null;

  return (
    <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto max-w-md w-full rounded-2xl border border-rose-500/30 bg-gray-900/95 p-4 text-rose-300 shadow-2xl shadow-rose-950/50 backdrop-blur-md transition-all duration-300 ease-out flex gap-3 ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-8 opacity-0 scale-95"
        }`}
      >
        <div className="flex-shrink-0 mt-0.5">
          <XCircle size={20} className="text-rose-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white text-sm">Gagal Proses Berkas</h4>
          <p className="text-xs text-gray-400 mt-1 whitespace-pre-line leading-relaxed">
            {localMessage}
          </p>
        </div>
        <div className="flex-shrink-0">
          {/* Ubah onClick menjadi handleClose */}
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