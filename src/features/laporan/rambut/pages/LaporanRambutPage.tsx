// src/features/laporan/rambut/pages/LaporanRambutPage.tsx
import React, { useState } from "react";
import { useToast } from "@/context/ToastContext";

import { RambutStats } from "@/features/rambut";
import { MasterPagination } from "@/features/master";

import { useLaporanRambut } from "../hooks/useLaporanRambut";
import { exportRambutToExcel } from "../utils/exportRambutExcel";
import { LaporanHeader } from "../components/LaporanHeader";
import { LaporanToolbar } from "../components/LaporanToolbar";
import { LaporanTable } from "../components/LaporanTable";

export const LaporanRambutPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      await exportRambutToExcel({
        periode: selectedPeriode,
        queueData: filteredQueueData,
        riwayatData: filteredAuditData,
        stats,
      });
      showSuccess("File Excel laporan berhasil diunduh!", "Export Sukses");
    } catch (err: any) {
      showError("Gagal mengunduh Excel: " + err.message, "Export Gagal");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen p-4 sm:p-5 lg:p-6 space-y-4 font-sans">
      {/* 1. Header Banner */}
      <LaporanHeader
        selectedPeriode={selectedPeriode}
        onExportExcel={handleExportExcel}
        isExporting={isExporting}
      />

      {/* 2. Kartu Statistik Kompak */}
      <RambutStats stats={stats} isLoading={isLoading} />

      {/* 3. Toolbar Filter (Tinggi h-9, Palet Netral Zinc) */}
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

      {/* 4. Tabel Preview Rekapitulasi Data */}
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