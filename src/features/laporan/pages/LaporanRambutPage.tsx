// src/features/laporan/pages/LaporanRambutPage.tsx
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useToast } from "@/context/ToastContext";

// ✨ REUSE KONTROLS & COMPONENTS DARI PUBLIC API INDEX.TS
import { RambutStats } from "@/features/rambut";
import { MasterPagination } from "@/features/master";

import { useLaporanRambut } from "../hooks/useLaporanRambut";
import { exportRambutToExcel } from "../utils/exportRambutExcel";
import { LaporanHeader } from "../components/LaporanHeader";
import { LaporanToolbar } from "../components/LaporanToolbar";
import { LaporanTable } from "../components/LaporanTable";
import { RambutReportPrint } from "../components/RambutReportPrint";

export const LaporanRambutPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const printableRef = useRef<HTMLDivElement>(null);

  const {
    periodeList,
    selectedPeriode,
    setSelectedPeriode,
    reportType,
    setReportType,
    filterKategori,
    setFilterKategori,
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

  const handlePrint = useReactToPrint({
    contentRef: printableRef,
    documentTitle: `Laporan_Rambut_${selectedPeriode?.nama_periode || "PP_Sidogiri"}`,
    onAfterPrint: () => showSuccess("Laporan berhasil dicetak ke PDF!", "Cetak PDF"),
  });

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
      {/* 1. Header Banner Glassmorphism */}
      <LaporanHeader
        selectedPeriode={selectedPeriode}
        onExportExcel={handleExportExcel}
        onPrintPDF={() => handlePrint()}
      />

      {/* 2. REUSE: Kartu Statistik Presisi (100% Identik dengan Halaman Rambut) */}
      <RambutStats stats={stats} isLoading={isLoading} />

      {/* 3. Toolbar Filter Glassmorphism */}
      <LaporanToolbar
        periodeList={periodeList}
        selectedPeriode={selectedPeriode}
        onSelectPeriode={setSelectedPeriode}
        reportType={reportType}
        onChangeReportType={setReportType}
        filterKategori={filterKategori}
        onChangeFilterKategori={setFilterKategori}
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

      {/* 5. REUSE: Pagination Global */}
      {totalItems > 0 && (
        <MasterPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={PER_PAGE}
          onPageChange={setPage}
        />
      )}

      {/* 6. Layout Cetak Hidden */}
      <RambutReportPrint
        ref={printableRef}
        periode={selectedPeriode}
        queueData={filteredQueueData}
        riwayatData={filteredAuditData}
        stats={stats}
        reportType={reportType}
        filterKategori={filterKategori}
      />
    </div>
  );
};