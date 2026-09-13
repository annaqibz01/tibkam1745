// src/components/shared/BaseModal.tsx
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface BaseModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen = true,
  onClose = () => {},
  title,
  icon,
  children,
  maxWidth = "max-w-lg",
}) => {
  const [mounted, setMounted] = useState(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Simpan fokus saat modal terbuka & lepaskan fokus saat mulai menutup
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [isOpen]);

  if (!mounted) return null;

  // Fungsi fallback untuk mencari input teks yang terlihat di halaman utama
  const getFallbackFocus = (): HTMLElement | null => {
    const main = document.querySelector("main");
    if (!main) return null;

    // Cari input teks yang tidak disabled dan terlihat
    const inputs = Array.from(
      main.querySelectorAll<HTMLInputElement>('input[type="text"]:not([disabled])')
    );
    const visibleInput = inputs.find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && !el.closest('[aria-hidden="true"]');
    });
    if (visibleInput) return visibleInput;

    // Fallback ke button pertama yang terlihat
    const buttons = Array.from(main.querySelectorAll<HTMLButtonElement>("button"));
    const visibleButton = buttons.find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && !el.closest('[aria-hidden="true"]');
    });
    return visibleButton || null;
  };

  return createPortal(
    <AnimatePresence
      onExitComplete={() => {
        // 1. Coba kembalikan ke elemen sebelumnya jika masih terhubung
        const prev = previousFocusRef.current;
        if (prev && prev.isConnected) {
          prev.focus();
          return;
        }

        // 2. Jika gagal (misal tombol sudah berubah), cari input fallback
        const fallback = getFallbackFocus();
        if (fallback) {
          fallback.focus();
        }
      }}
    >
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className={`relative z-10 w-full ${maxWidth} max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-2xl flex flex-col overflow-hidden my-auto font-sans`}
          >
            {title && (
              <div className="shrink-0 flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  {icon && (
                    <div className="p-1.5 bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700/60 shrink-0">
                      {icon}
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-zinc-100 tracking-tight truncate">
                    {title}
                  </h3>
                </div>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800 transition-colors focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-left custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};