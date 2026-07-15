// src/components/rambut/RambutScanToolbar.tsx
import React from "react";
import { motion } from "framer-motion";
import {
  Scissors,
  UserCheck,
  History,
  Zap,
  UserPlus,
  RefreshCw,
  Sparkles,
  Moon,
} from "lucide-react";
import type { WajibSetorRambutStatusSetorOptions, PeriodeRambutResponse } from "../../types/pocketbase-types";
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
  availableHijriDateOptions: { value: string; label: React.ReactNode }[];

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
  return (
    <div className="space-y-3 w-full select-none">
      {/* 🌟 BARIS 1: TAB NAVIGASI, BADGE PERIODE TENGAH, & TOMBOL AKSI KANAN */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-gray-800/80">
        
        {/* KIRI: TAB NAVIGASI */}
        <div className="flex items-center bg-gray-900/90 border border-gray-800/90 p-1 rounded-2xl shadow-xl backdrop-blur-xl shrink-0 w-fit">
          <button
            type="button"
            onClick={() => onTabChange("queue")}
            className={`relative px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-colors duration-200 flex items-center gap-2 ${
              activeTab === "queue" ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {activeTab === "queue" && (
              <motion.div
                layoutId="activeMainTabPill"
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 rounded-xl shadow-lg border border-indigo-400/30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Scissors className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Antrean Wajib Setor</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("pengurus")}
            className={`relative px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-colors duration-200 flex items-center gap-2 ${
              activeTab === "pengurus" ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {activeTab === "pengurus" && (
              <motion.div
                layoutId="activeMainTabPill"
                className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 rounded-xl shadow-lg border border-purple-400/30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <UserCheck className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Kelola Pengurus & Petugas</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("audit")}
            className={`relative px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-colors duration-200 flex items-center gap-2 ${
              activeTab === "audit" ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {activeTab === "audit" && (
              <motion.div
                layoutId="activeMainTabPill"
                className="absolute inset-0 bg-gradient-to-r from-amber-600 via-amber-500 to-purple-600 rounded-xl shadow-lg border border-amber-400/30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <History className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Log Audit Trail</span>
          </button>
        </div>

        {/* 🌙 TENGAH: BADGE INFORMASI PERIODE (SELALU TAMPIL, TANPA TANGGAL, RINGKAS) */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gray-900/80 border border-gray-800/90 shadow-lg backdrop-blur-xl text-xs font-mono shrink-0">
          <div className={`p-1 rounded-lg ${selectedPeriode ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
            <Moon className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-medium">Periode:</span>
            {selectedPeriode ? (
              <span className="font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                {selectedPeriode.nama_periode}
              </span>
            ) : (
              <span className="font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-md border border-rose-500/20">
                Belum Ada Periode Ditinjau
              </span>
            )}
          </div>
        </div>

        {/* KANAN: TOMBOL GENERATE/SYNC + POS SETORAN CEPAT */}
        {activeTab === "queue" && (
          <div className="flex items-center gap-2 shrink-0">
            {/* ⚡ Tombol Generate / Sync Antrean (Selalu Tampil untuk Admin) */}
            {isAdmin && onOpenGenerateQueue && (
              <button
                type="button"
                onClick={onOpenGenerateQueue}
                className="px-3.5 py-2 bg-gray-900/90 hover:bg-gray-800 text-purple-300 hover:text-white font-mono font-bold text-xs rounded-2xl border border-purple-500/30 transition-all duration-200 shadow-md active:scale-95 flex items-center gap-1.5"
              >
                {hasGeneratedQueue ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                    <span>Sync Antrean</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Generate Antrean</span>
                  </>
                )}
              </button>
            )}

            {/* ⚡ Tombol POS Setoran Cepat */}
            {onOpenPosModal && (
              <button
                type="button"
                onClick={onOpenPosModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all border border-indigo-400/30"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>POS Setoran Cepat</span>
              </button>
            )}
          </div>
        )}

        {activeTab === "pengurus" && onOpenAddPengurusModal && (
          <button
            type="button"
            onClick={onOpenAddPengurusModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shadow-md shadow-purple-600/20 active:scale-95 transition-all border border-purple-400/30"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Pengurus</span>
          </button>
        )}
      </div>

      {/* 🔍 BARIS 2: SUB-TOOLBAR PER TAB */}
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