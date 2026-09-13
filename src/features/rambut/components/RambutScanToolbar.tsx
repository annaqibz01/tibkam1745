// src/features/rambut/components/RambutScanToolbar.tsx
import React from "react";
import { Scissors, UserCheck, History, UserPlus, RefreshCw, Wand2, Moon, ScanBarcode } from "lucide-react";
import type { WajibSetorRambutStatusSetorOptions, PeriodeRambutResponse } from "@/types/pocketbase-types";
import { SegmentedControl, type SegmentOption, type DropdownOption } from "@/components/shared";
import { QueueToolbar } from "./toolbars/QueueToolbar";
import { PengurusToolbar } from "./toolbars/PengurusToolbar";
import { AuditToolbar } from "./toolbars/AuditToolbar";

export type RambutTabType = "queue" | "pengurus" | "audit";

interface RambutScanToolbarProps {
  activeTab: RambutTabType;
  onTabChange: (tab: RambutTabType) => void;
  selectedPeriode?: PeriodeRambutResponse | null;
  hasGeneratedQueue?: boolean;
  isAdmin?: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: "all" | WajibSetorRambutStatusSetorOptions;
  onStatusFilterChange: (val: "all" | WajibSetorRambutStatusSetorOptions) => void;
  pengurusSearch: string;
  onPengurusSearchChange: (val: string) => void;
  pengurusDaerahFilter: string;
  onPengurusDaerahFilterChange: (val: string) => void;
  daerahOptions: string[];
  auditSearch: string;
  onAuditSearchChange: (val: string) => void;
  auditDateFilter: string;
  onAuditDateFilterChange: (val: string) => void;
  availableHijriDateOptions: DropdownOption[];
  onRefresh: () => void;
  isLoading: boolean;
  onOpenPosModal?: () => void;
  onOpenAddPengurusModal?: () => void;
  onOpenGenerateQueue?: () => void;
}

export const RambutScanToolbar: React.FC<RambutScanToolbarProps> = ({
  activeTab,
  onTabChange,
  selectedPeriode,
  hasGeneratedQueue = false,
  isAdmin = false,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  pengurusSearch,
  onPengurusSearchChange,
  pengurusDaerahFilter,
  onPengurusDaerahFilterChange,
  daerahOptions,
  auditSearch,
  onAuditSearchChange,
  auditDateFilter,
  onAuditDateFilterChange,
  availableHijriDateOptions,
  onRefresh,
  isLoading,
  onOpenPosModal,
  onOpenAddPengurusModal,
  onOpenGenerateQueue,
}) => {
  const mainTabOptions: SegmentOption<RambutTabType>[] = [
    { value: "queue", label: "Antrean Wajib Setor", icon: <Scissors className="w-3.5 h-3.5" /> },
    { value: "pengurus", label: "Kelola Pengurus & Petugas", icon: <UserCheck className="w-3.5 h-3.5" /> },
    { value: "audit", label: "Log Audit Trail", icon: <History className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-3 w-full select-none font-sans">
      {/* BARIS 1: TAB NAVIGASI UTAMA & AKSI POS/GENERATE */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800 w-full">
        <SegmentedControl
          options={mainTabOptions}
          value={activeTab}
          onChange={onTabChange}
          layoutId="activeRambutMainTabPill"
        />

        <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-zinc-900 border border-zinc-800 shadow-sm text-xs flex-1 min-w-0">
            <div className={`p-1 rounded-md shrink-0 ${selectedPeriode ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
              <Moon className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {selectedPeriode ? (
                <span className="font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 truncate">
                  {selectedPeriode.nama_periode}
                </span>
              ) : (
                <span className="font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 truncate">
                  Belum Ada Periode Ditinjau
                </span>
              )}
            </div>
          </div>

          {activeTab === "queue" && (
            <>
              {isAdmin && onOpenGenerateQueue && (
                <button
                  type="button"
                  onClick={onOpenGenerateQueue}
                  className="h-9 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-purple-300 hover:text-white font-semibold text-xs border border-zinc-800 hover:border-purple-500/30 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
                >
                  {hasGeneratedQueue ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                      <span>Sync Antrean</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Generate Antrean</span>
                    </>
                  )}
                </button>
              )}

              {onOpenPosModal && (
                <button
                  type="button"
                  onClick={onOpenPosModal}
                  className="h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
                >
                  <ScanBarcode className="w-3.5 h-3.5 text-amber-300" />
                  <span>POS Setoran Rambut</span>
                </button>
              )}
            </>
          )}

          {activeTab === "pengurus" && onOpenAddPengurusModal && (
            <button
              type="button"
              onClick={onOpenAddPengurusModal}
              className="h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Import Pengurus</span>
            </button>
          )}
        </div>
      </div>

      {/* BARIS 2: SUB-TOOLBAR SESUAI TAB */}
      {activeTab === "queue" && (
        <QueueToolbar
          search={search}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          onRefresh={onRefresh}
          isLoading={isLoading}
        />
      )}

      {activeTab === "pengurus" && (
        <PengurusToolbar
          search={pengurusSearch}
          onSearchChange={onPengurusSearchChange}
          daerahFilter={pengurusDaerahFilter}
          onDaerahFilterChange={onPengurusDaerahFilterChange}
          daerahOptions={daerahOptions}
          onRefresh={onRefresh}
          isLoading={isLoading}
        />
      )}

      {activeTab === "audit" && (
        <AuditToolbar
          search={auditSearch}
          onSearchChange={onAuditSearchChange}
          dateFilter={auditDateFilter}
          onDateFilterChange={onAuditDateFilterChange}
          availableHijriDateOptions={availableHijriDateOptions}
          onRefresh={onRefresh}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};