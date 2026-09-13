// src/features/personil/components/PersonilHeader.tsx
import React from "react";
import { UploadCloud, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface PersonilHeaderProps {
  onOpenImportModal: () => void;
  isAdmin?: boolean;
}

export default function PersonilHeader({
  onOpenImportModal,
  isAdmin = false,
}: PersonilHeaderProps) {
  return (
    <PageHeader
      badgeIcon={<ShieldCheck className="w-3.5 h-3.5" />}
      badgeLabel="Keamanan & Ketertiban"
      title={
        <span className="font-sans font-bold text-white tracking-tight">
          Database Personil Tibkam
        </span>
      }
      description="Manajemen struktur keanggotaan petugas Tibkam berdomisili PPS terintegrasi langsung dengan database induk master santri."
      actions={
        isAdmin && (
          <button
            type="button"
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold shadow-sm transition-colors active:scale-98 select-none"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Update Personil via Excel</span>
          </button>
        )
      }
    />
  );
}