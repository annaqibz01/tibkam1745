// src/components/shared/NotificationToast.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  title?: string;
  message: string;
  type?: ToastType;
}

interface NotificationToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
  duration?: number; // Durasi tampil dalam ms (default: 4000ms)
}

export default function NotificationToast({
  toast,
  onClose,
  duration = 4000,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayToast, setDisplayToast] = useState<ToastMessage | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handler penutupan dengan animasi smooth exit
  const handleClose = useCallback(() => {
    setIsVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Tunggu 300ms sampai animasi fade-out selesai baru bersihkan data & panggil onClose
    timerRef.current = setTimeout(() => {
      setDisplayToast(null);
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (toast) {
      setDisplayToast(toast);
      // Delay tipis agar transisi CSS fade-in terdeteksi browser
      const animTimeout = setTimeout(() => setIsVisible(true), 20);

      // Auto dismiss
      const autoDismissTimeout = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearTimeout(animTimeout);
        clearTimeout(autoDismissTimeout);
      };
    } else {
      // Jika toast di-reset dari luar (context)
      setIsVisible(false);
      const clearDelay = setTimeout(() => setDisplayToast(null), 300);
      return () => clearTimeout(clearDelay);
    }
  }, [toast, duration, handleClose]);

  // Jika data toast kosong, jangan render elemen HTML sama sekali
  if (!displayToast) return null;

  const currentType = displayToast.type || "success";

  // Config warna dan ikon berdasarkan tipe
  const toastConfig = {
    success: {
      border: "border-emerald-500/30",
      bgShadow: "shadow-emerald-950/50",
      icon: <CheckCircle2 size={20} className="text-emerald-400" />,
      titleColor: "text-emerald-300",
    },
    error: {
      border: "border-rose-500/30",
      bgShadow: "shadow-rose-950/50",
      icon: <AlertCircle size={20} className="text-rose-400" />,
      titleColor: "text-rose-300",
    },
    warning: {
      border: "border-amber-500/30",
      bgShadow: "shadow-amber-950/50",
      icon: <AlertTriangle size={20} className="text-amber-400" />,
      titleColor: "text-amber-300",
    },
    info: {
      border: "border-indigo-500/30",
      bgShadow: "shadow-indigo-950/50",
      icon: <Info size={20} className="text-indigo-400" />,
      titleColor: "text-indigo-300",
    },
  }[currentType];

  return (
    <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto max-w-md w-full rounded-2xl border bg-gray-900/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 ease-out flex gap-3 ${
          toastConfig.border
        } ${toastConfig.bgShadow} ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-8 opacity-0 scale-95"
        }`}
      >
        {/* Ikon Kiri */}
        <div className="flex-shrink-0 mt-0.5">{toastConfig.icon}</div>

        {/* Isi Teks / Pesan */}
        <div className="flex-1 space-y-0.5">
          {displayToast.title && (
            <h4 className={`font-semibold text-sm ${toastConfig.titleColor}`}>
              {displayToast.title}
            </h4>
          )}
          {displayToast.message && (
            <p className="text-xs text-gray-300 leading-relaxed">
              {displayToast.message}
            </p>
          )}
        </div>

        {/* Tombol Close Manual */}
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