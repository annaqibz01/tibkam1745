// src/components/shared/NotificationToast.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  title?: string;
  message: string;
  type?: ToastType;
}

interface NotificationToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
  duration?: number;
}

export default function NotificationToast({
  toast,
  onClose,
  duration = 4000,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayToast, setDisplayToast] = useState<ToastMessage | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setDisplayToast(null);
      onClose();
    }, 150);
  }, [onClose]);

  useEffect(() => {
    if (toast) {
      setDisplayToast(toast);
      const animTimeout = setTimeout(() => setIsVisible(true), 20);

      const autoDismissTimeout = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearTimeout(animTimeout);
        clearTimeout(autoDismissTimeout);
      };
    } else {
      setIsVisible(false);
      const clearDelay = setTimeout(() => setDisplayToast(null), 150);
      return () => clearTimeout(clearDelay);
    }
  }, [toast, duration, handleClose]);

  if (!displayToast) return null;

  const currentType = displayToast.type || "success";

  const toastConfig = {
    success: {
      border: "border-emerald-500/30",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
      titleColor: "text-emerald-300",
    },
    error: {
      border: "border-rose-500/30",
      icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
      titleColor: "text-rose-300",
    },
    warning: {
      border: "border-amber-500/30",
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
      titleColor: "text-amber-300",
    },
    info: {
      border: "border-zinc-700",
      icon: <Info className="w-4 h-4 text-zinc-400 shrink-0" />,
      titleColor: "text-zinc-200",
    },
  }[currentType];

  return createPortal(
    <div className="fixed top-11 inset-x-0 z-[99999] flex justify-center px-4 pointer-events-none font-sans">
      <div
        className={`pointer-events-auto max-w-sm w-full rounded-lg border bg-zinc-900/98 p-3 shadow-xl transition-all duration-200 ease-out flex items-start gap-2.5 ${
          toastConfig.border
        } ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-2 opacity-0 scale-98"
        }`}
      >
        <div className="mt-0.5">{toastConfig.icon}</div>

        <div className="flex-1 space-y-0.5 min-w-0">
          {displayToast.title && (
            <h4 className={`font-semibold text-xs leading-tight ${toastConfig.titleColor}`}>
              {displayToast.title}
            </h4>
          )}
          {displayToast.message && (
            <p className="text-[11px] text-zinc-300 leading-normal">
              {displayToast.message}
            </p>
          )}
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
    </div>,
    document.body
  );
}