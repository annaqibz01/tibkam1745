// src/features/master/components/MasterHeader.tsx
import React from "react";
import { UploadCloud, Database } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface MasterHeaderProps {
  onOpenImportModal: () => void;
  isAdmin?: boolean;
}

export default function MasterHeader({
  onOpenImportModal,
  isAdmin = false,
}: MasterHeaderProps) {
  return (
    <PageHeader
      badgeIcon={<Database className="w-3.5 h-3.5" />}
      badgeLabel="Database Induk"
      title={
        <>
          Pusat Data{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
            Master Santri
          </span>
        </>
      }
      description="Manajemen Database Induk dan sinkronisasi data massal santri dalam satu tempat terpadu."
      actions={
        isAdmin && (
          <button
            type="button"
            onClick={onOpenImportModal}
            className="relative group overflow-hidden inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:via-indigo-400 hover:to-purple-500 text-white font-semibold text-sm rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-500/40 active:scale-[0.98] border border-indigo-400/30 select-none font-mono"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <div className="relative flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-100 group-hover:scale-110 transition-transform duration-200" />
              <span>Update DB via Excel</span>
            </div>
          </button>
        )
      }
    />
  );
}