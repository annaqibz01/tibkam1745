// src/features/laporan/pages/LaporanRambutPage.tsx
import React from "react";
import { useToast } from "@/context/ToastContext";

// Reuse Controls & Components
import { RambutStats } from "@/features/rambut";
import { MasterPagination } from "@/features/master";

import { useLaporanRambut } from "../hooks/useLaporanRambut";
import { exportRambutToExcel } from "../utils/exportRambutExcel";
import { LaporanHeader } from "../components/LaporanHeader";
import { LaporanToolbar } from "../components/LaporanToolbar";
import { LaporanTable } from "../components/LaporanTable";

export const LaporanRambutPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const {
    periodeList,
    selectedPeriode,
    setSelectedPeriode,
    reportType,
    setReportType,
    filterKategori,
    setFilterKategori,
    filterDaerah,
    setFilterDaerah,
    daerahOptions,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    PER_PAGE,
    totalItems,
    totalPages,
    stats,
    filteredQueueData,
    filteredAuditData,
    paginatedData,
    isLoading,
    onRefresh,
  } = useLaporanRambut();

  const handleExportExcel = () => {
    try {
      exportRambutToExcel({
        periode: selectedPeriode,
        queueData: filteredQueueData,
        riwayatData: filteredAuditData,
        stats,
      });
      showSuccess("File Excel laporan berhasil diunduh!", "Export Sukses");
    } catch (err: any) {
      showError("Gagal mengunduh Excel: " + err.message, "Export Gagal");
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      {/* 1. Header Banner Glassmorphism Shared */}
      <LaporanHeader
        selectedPeriode={selectedPeriode}
        onExportExcel={handleExportExcel}
      />

      {/* 2. Kartu Statistik Presisi */}
      <RambutStats stats={stats} isLoading={isLoading} />

      {/* 3. Toolbar Filter Glassmorphism Shared */}
      <LaporanToolbar
        periodeList={periodeList}
        selectedPeriode={selectedPeriode}
        onSelectPeriode={setSelectedPeriode}
        reportType={reportType}
        onChangeReportType={setReportType}
        filterKategori={filterKategori}
        onChangeFilterKategori={setFilterKategori}
        filterDaerah={filterDaerah}
        onChangeFilterDaerah={setFilterDaerah}
        daerahOptions={daerahOptions}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        onRefresh={onRefresh}
        isLoading={isLoading}
      />

      {/* 4. Tabel Preview Data */}
      <LaporanTable
        reportType={reportType}
        items={paginatedData}
        isLoading={isLoading}
        page={page}
        perPage={PER_PAGE}
      />

      {/* 5. Pagination Global */}
      {totalItems > 0 && (
        <MasterPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={PER_PAGE}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};