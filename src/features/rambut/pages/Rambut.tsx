// src/pages/Rambut.tsx
import React from "react";
import { useRambutPage } from "../hooks/useRambutPage";

import { RambutHeader } from "../components/RambutHeader";
import { RambutStats } from "../components/RambutStats";
import { RambutScanToolbar } from "../components/RambutScanToolbar";
import { RambutQueueTable } from "../components/RambutQueueTable";
import { RambutModals } from "../components/RambutModals";
import { MasterPagination } from "@/features/master";

export default function RambutPage() {
  const p = useRambutPage();

  return (
    <div className="bg-gray-950 min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      {/* 1. Header Banner */}
      <RambutHeader
        activePeriode={p.activePeriode || null}
        selectedPeriode={p.selectedPeriode}
        isAdmin={p.isAdmin}
        onOpenCreatePeriode={() => p.setActiveModal("CREATE_PERIODE")} // ✅ MODAL REGISTRY PATTERN
        onOpenManagePeriode={() => p.setActiveModal("MANAGE_PERIODE")} // ✅ MODAL REGISTRY PATTERN
      />

      {/* 2. Stats */}
      <RambutStats stats={p.stats} isLoading={p.isStatsLoading} />

      {/* 3. Toolbar */}
      <RambutScanToolbar
        activeTab={p.activeTab}
        onTabChange={(tab) => {
          p.setActiveTab(tab);
          p.setPage(1);
        }}
        selectedPeriode={p.selectedPeriode || p.activePeriode}
        hasGeneratedQueue={p.stats.total > 0}
        isAdmin={p.isAdmin}
        search={p.search}
        onSearchChange={(val) => {
          p.setSearch(val);
          p.setPage(1);
        }}
        statusFilter={p.statusFilter}
        onStatusFilterChange={(val) => {
          p.setStatusFilter(val);
          p.setPage(1);
        }}
        pengurusSearch={p.pengurusSearch}
        onPengurusSearchChange={p.setPengurusSearch}
        pengurusDaerahFilter={p.pengurusDaerahFilter}
        onPengurusDaerahFilterChange={p.setPengurusDaerahFilter}
        daerahOptions={p.daerahOptions}
        auditSearch={p.auditSearch}
        onAuditSearchChange={p.setAuditSearch}
        auditDateFilter={p.auditDateFilter}
        onAuditDateFilterChange={p.setAuditDateFilter}
        availableHijriDateOptions={p.availableHijriDateOptions}
        onRefresh={p.refetchAll}
        isLoading={p.isQueueLoading || p.isPengurusLoading}
        onOpenPosModal={() => p.setActiveModal("POS")} // ✅ MODAL REGISTRY PATTERN
        onOpenAddPengurusModal={() => p.setActiveModal("IMPORT_PENGURUS")} // ✅ MODAL REGISTRY PATTERN
        onOpenGenerateQueue={p.handleOpenGenerateQueue} 
      />

      {/* 4. Multi-SubTable Container */}
      <RambutQueueTable
        activeTab={p.activeTab}
        items={p.paginatedQueueItems}
        isLoading={p.isQueueLoading}
        page={p.page}
        perPage={p.PER_PAGE}
        pengurusItems={p.filteredPengurusData}
        isPengurusLoading={p.isPengurusLoading}
        onDeletePengurus={(item) => p.setSelectedDeletePengurus(item)}
        auditItems={p.filteredAuditItems}
        isAuditLoading={p.isHistoryLoading}
        onOpenExecuteModal={(item) => p.setSelectedExecuteItem(item)}
        onOpenDispensasiModal={(item) => p.setSelectedDispensasiItem(item)}
        canExecute={p.currentUser?.role === "admin" || p.currentUser?.role === "rambut"}
      />

      {/* 5. Pagination */}
      {p.activeTab === "queue" && p.totalItems > 0 && (
        <MasterPagination
          page={p.page}
          totalPages={p.totalPages}
          totalItems={p.totalItems}
          perPage={p.PER_PAGE}
          onPageChange={p.setPage}
        />
      )}

      {/* 6. Isolated Modal Container */}
      <RambutModals {...p} />
    </div>
  );
}