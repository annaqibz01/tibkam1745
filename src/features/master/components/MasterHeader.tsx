// src/features/master/components/MasterHeader.tsx
import React from "react";
import { UploadCloud, Database, Image } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface MasterHeaderProps {
  onOpenImportModal: () => void;
  onOpenSyncFotoModal: () => void;
  isAdmin?: boolean;
}

export default function MasterHeader({
  onOpenImportModal,
  onOpenSyncFotoModal,
  isAdmin = false,
}: MasterHeaderProps) {
  return (
    <PageHeader
      badgeIcon={<Database className="w-3.5 h-3.5" />}
      badgeLabel="Database Induk"
      title={
        <span className="font-sans font-bold text-white tracking-tight">
          Pusat Data Master Santri
        </span>
      }
      description="Manajemen database induk santri, sinkronisasi massal via berkas Excel, dan pembaruan foto santri terpadu."
      actions={
        isAdmin && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenSyncFotoModal}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-sans text-xs font-medium border border-zinc-800 hover:border-zinc-700 transition-colors active:scale-98 select-none"
            >
              <Image className="w-3.5 h-3.5 text-zinc-400" />
              <span>Sync Foto Santri</span>
            </button>

            <button
              type="button"
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold shadow-sm transition-colors active:scale-98 select-none"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Update DB via Excel</span>
            </button>
          </div>
        )
      }
    />
  );
}