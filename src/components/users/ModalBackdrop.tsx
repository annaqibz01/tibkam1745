// src/components/users/ModalBackdrop.tsx
import React from "react";

interface ModalBackdropProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function ModalBackdrop({ children, onClose }: ModalBackdropProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Efek Gelap & Blur di Luar Modal */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Konten Modal */}
      <div className="relative z-10 w-full max-w-xl my-auto">
        {children}
      </div>
    </div>
  );
}