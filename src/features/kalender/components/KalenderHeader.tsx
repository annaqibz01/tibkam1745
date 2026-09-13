// src/features/kalender/components/KalenderHeader.tsx
import React from "react";
import { CalendarDays, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface KalenderHeaderProps {
  onOpenGenerateModal: () => void;
  isAdmin?: boolean;
}

export const KalenderHeader: React.FC<KalenderHeaderProps> = ({
  onOpenGenerateModal,
  isAdmin = false,
}) => {
  return (
    <PageHeader
      badgeIcon={<CalendarDays className="w-3.5 h-3.5" />}
      badgeLabel="Kalender Pesantren"
      title={
        <span className="font-sans font-bold text-white tracking-tight">
          Kalender Hijriyah
        </span>
      }
      description="Sistem pemetaan konversi kalender berbasis keputusan hisab & rukyah resmi Pondok Pesantren Sidogiri."
      actions={
        isAdmin && (
          <button
            type="button"
            onClick={onOpenGenerateModal}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold shadow-sm transition-colors active:scale-98 select-none"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Bulan Baru</span>
          </button>
        )
      }
    />
  );
};