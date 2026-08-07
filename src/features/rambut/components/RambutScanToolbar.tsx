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
    <div className="space-y-3 w-full select-none">
      {/* BARIS 1: TAB NAVIGASI UTAMA & AKSI POS/GENERATE */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-3 border-b border-gray-800/80 w-full">
        {/* Tab Penukar Utama dengan SegmentedControl */}
        <SegmentedControl
          options={mainTabOptions}
          value={activeTab}
          onChange={onTabChange}
          layoutId="activeRambutMainTabPill"
        />

        {/* Akses Cepat & Badge Periode */}
        <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 px-3.5 h-12 rounded-2xl bg-gray-900/80 border border-gray-800/90 shadow-sm backdrop-blur-xl text-xs font-mono flex-1 min-w-0">
            <div className={`p-1 rounded-lg shrink-0 ${selectedPeriode ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
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
                  className="flex items-center justify-center gap-2 h-12 px-4 bg-gray-900/90 hover:bg-gray-800 text-purple-300 hover:text-white font-mono font-bold text-xs rounded-2xl border border-purple-500/30 transition-all shadow-sm active:scale-95 whitespace-nowrap shrink-0"
                >
                  {hasGeneratedQueue ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                      <span>Sync Antrean</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                      <span>Generate Antrean</span>
                    </>
                  )}
                </button>
              )}

              {onOpenPosModal && (
                <button
                  type="button"
                  onClick={onOpenPosModal}
                  className="flex items-center justify-center gap-1.5 h-12 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono text-xs font-bold shadow-sm shadow-indigo-600/20 active:scale-95 transition-all border border-indigo-400/30 whitespace-nowrap shrink-0"
                >
                  <ScanBarcode className="w-3.5 h-3.5 shrink-0 text-amber-300 animate-pulse" />
                  <span>POS Setoran Rambut</span>
                </button>
              )}
            </>
          )}

          {activeTab === "pengurus" && onOpenAddPengurusModal && (
            <button
              type="button"
              onClick={onOpenAddPengurusModal}
              className="flex items-center justify-center gap-1.5 h-12 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shadow-sm shadow-purple-600/20 active:scale-95 transition-all border border-purple-400/30 whitespace-nowrap shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
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