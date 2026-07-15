// src/components/shared/BaseModal.tsx
import React, { useEffect, useState } from "react";
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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 sm:p-6">
          
          {/* 1. Backdrop Gelap */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "linear" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* 2. Modal Box dengan Max Height (Tinggi Maksimal 85vh) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ 
              duration: 0.15, 
              ease: [0.16, 1, 0.3, 1]
            }}
            className={`relative z-10 w-full ${maxWidth} max-h-[85vh] bg-gray-900 border border-gray-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col overflow-hidden my-auto`}
          >
            {/* Header Modal (Kunci: flex-shrink-0 agar tidak terdorong) */}
            {title && (
              <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-800/80 pb-3.5 mb-4">
                <div className="flex items-center gap-2.5">
                  {icon && (
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                      {icon}
                    </div>
                  )}
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content Body (Kunci: flex-1 overflow-y-auto agar bisa discroll internal) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="flex-1 overflow-y-auto pr-1 space-y-4 text-left custom-scrollbar"
            >
              {children}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};