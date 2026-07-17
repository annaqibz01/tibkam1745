// src/components/rambut/RambutQueueTable.tsx
import React from "react";
import type { WajibSetorExpanded, RiwayatSetorExpanded } from "../hooks/useRambut";
import type { RambutTabType } from "./RambutScanToolbar";
import { RambutQueueSubTable } from "./subtables/RambutQueueSubTable";
import { RambutPengurusSubTable } from "./subtables/RambutPengurusSubTable";
import { RambutAuditSubTable } from "./subtables/RambutAuditSubTable";
export interface PengurusItem {
  id: string;
  id_pps: string;
  jabatan: string;
  status_aktif?: boolean;
  expand?: {
    santri?: {
      nama: string;
      tingkatan?: string;
      kelas?: string;
      domisili?: string;
      status_domisili?: string;
      desa?: string;
      kecamatan?: string;
      kabupaten?: string;
      provinsi?: string;
    };
  };
}

interface RambutQueueTableProps {
  activeTab?: RambutTabType;
  items: WajibSetorExpanded[];
  isLoading: boolean;
  page?: number;
  perPage?: number;
  onOpenExecuteModal: (item: WajibSetorExpanded) => void;
  onOpenDispensasiModal: (item: WajibSetorExpanded) => void;
  canExecute?: boolean;
  pengurusItems?: PengurusItem[];
  isPengurusLoading?: boolean;
  onDeletePengurus?: (item: PengurusItem) => void;
  auditItems?: RiwayatSetorExpanded[];
  isAuditLoading?: boolean;
}

export const RambutQueueTable: React.FC<RambutQueueTableProps> = ({
  activeTab = "queue",
  items,
  isLoading,
  page = 1,
  perPage = 15,
  onOpenExecuteModal,
  onOpenDispensasiModal,
  canExecute = true,
  pengurusItems = [],
  isPengurusLoading = false,
  onDeletePengurus,
  auditItems = [],
  isAuditLoading = false,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 shadow-2xl backdrop-blur-xl min-h-[480px]">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      <div className="overflow-x-auto">
        {activeTab === "queue" && (
          <RambutQueueSubTable
            items={items}
            isLoading={isLoading}
            page={page}
            perPage={perPage}
            canExecute={canExecute}
            onOpenExecuteModal={onOpenExecuteModal}
            onOpenDispensasiModal={onOpenDispensasiModal}
          />
        )}

        {activeTab === "pengurus" && (
          <RambutPengurusSubTable
            items={pengurusItems}
            isLoading={isPengurusLoading}
            onDeletePengurus={onDeletePengurus}
          />
        )}

        {activeTab === "audit" && (
          <RambutAuditSubTable
            items={auditItems}
            isLoading={isAuditLoading}
          />
        )}
      </div>
    </div>
  );
};