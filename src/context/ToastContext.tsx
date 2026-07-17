// src/context/ToastContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import NotificationToast, { ToastMessage, ToastType } from "@/components/shared/NotificationToast";

interface ToastContextType {
  showToast: (toast: ToastMessage) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (toastData: ToastMessage) => {
    setToast(toastData);
  };

  // Helper cepat untuk Notifikasi Sukses
  const showSuccess = (message: string, title: string = "Berhasil!") => {
    setToast({ message, title, type: "success" });
  };

  // Helper cepat untuk Notifikasi Eror
  const showError = (message: string, title: string = "Terjadi Kesalahan") => {
    setToast({ message, title, type: "error" });
  };

  // Helper cepat untuk Notifikasi Peringatan
  const showWarning = (message: string, title: string = "Peringatan") => {
    setToast({ message, title, type: "warning" });
  };

  // Helper cepat untuk Notifikasi Informasi
  const showInfo = (message: string, title: string = "Informasi") => {
    setToast({ message, title, type: "info" });
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      
      {/* Pop Up Toast Render Otomatis di Level Teratas Aplikasi */}
      <NotificationToast toast={toast} onClose={() => setToast(null)} />
    </ToastContext.Provider>
  );
};

// Custom Hook agar mudah dipanggil di seluruh komponen
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus digunakan di dalam <ToastProvider>");
  }
  return context;
};