// src/features/rambut/components/RambutQueueTable.tsx
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
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm min-h-[480px]">
      <div className="overflow-x-auto custom-scrollbar">
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