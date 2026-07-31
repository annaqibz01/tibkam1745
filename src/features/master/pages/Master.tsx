// src/features/master/pages/Master.tsx
import { useState, useEffect } from "react";
import { useMaster, useMasterFilterOptions } from "../hooks/useMaster";
import { useAuth } from "@/features/auth";
import MasterHeader from "../components/MasterHeader";
import SyncReportBanner from "../components/SyncReportBanner";
import MasterToolbar from "../components/MasterToolbar";
import MasterTable from "../components/MasterTable";
import MasterPagination from "../components/MasterPagination";
import { ImportMasterModal } from "../components/ImportMasterModal";
import { SantriDetailModal } from "../components/SantriDetailModal";
import type { UsersResponse, MasterResponse } from "@/types/pocketbase-types";

const PER_PAGE = 15;

export default function MasterPage() {
  const { user } = useAuth();
  const currentUser = user as UsersResponse | null;
  const isAdmin = Boolean(currentUser?.role?.startsWith("admin"));

  // State Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "aktif" | "nonaktif">("aktif");
  const [tingkatanFilter, setTingkatanFilter] = useState("all");
  const [kelasFilter, setKelasFilter] = useState("all");
  const [statusDomisiliFilter, setStatusDomisiliFilter] = useState("all");
  const [domisiliFilter, setDomisiliFilter] = useState("all");

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedSantriDetail, setSelectedSantriDetail] = useState<MasterResponse | null>(null);

  const [syncReport, setSyncReport] = useState<{
    inserted: number;
    updated: number;
    softDeleted: number;
    skipped: number;
  } | null>(null);

  const { useMasterList } = useMaster();

  // 🔄 KIRIM STATE FILTER AKTIF KE HOOK OPTIONS
  const { data: dynamicFilterOptions } = useMasterFilterOptions({
    statusFilter,
    tingkatanFilter,
    kelasFilter,
    statusDomisiliFilter,
    domisiliFilter,
  });

  // 🛡️ AUTO-RESET: Jika pilihan filter saat ini tidak ada di opsi baru yang tersedia, reset ke "all"
  useEffect(() => {
    if (
      domisiliFilter !== "all" &&
      dynamicFilterOptions?.domisiliOptions &&
      !dynamicFilterOptions.domisiliOptions.includes(domisiliFilter)
    ) {
      setDomisiliFilter("all");
    }
  }, [dynamicFilterOptions?.domisiliOptions, domisiliFilter]);

  useEffect(() => {
    if (
      kelasFilter !== "all" &&
      dynamicFilterOptions?.kelasOptions &&
      !dynamicFilterOptions.kelasOptions.includes(kelasFilter)
    ) {
      setKelasFilter("all");
    }
  }, [dynamicFilterOptions?.kelasOptions, kelasFilter]);

  useEffect(() => {
    if (
      tingkatanFilter !== "all" &&
      dynamicFilterOptions?.tingkatanOptions &&
      !dynamicFilterOptions.tingkatanOptions.includes(tingkatanFilter)
    ) {
      setTingkatanFilter("all");
    }
  }, [dynamicFilterOptions?.tingkatanOptions, tingkatanFilter]);

  const {
    data: masterData,
    isLoading,
    isFetching,
    refetch,
  } = useMasterList({
    page,
    perPage: PER_PAGE,
    search,
    statusFilter,
    tingkatanFilter,
    kelasFilter,
    statusDomisiliFilter,
    domisiliFilter,
  });

  const items = masterData?.items ?? [];
  const totalItems = masterData?.totalItems ?? 0;
  const totalPages = masterData?.totalPages ?? 0;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val: "all" | "aktif" | "nonaktif") => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleTingkatanFilterChange = (val: string) => {
    setTingkatanFilter(val);
    setPage(1);
  };

  const handleKelasFilterChange = (val: string) => {
    setKelasFilter(val);
    setPage(1);
  };

  const handleStatusDomisiliFilterChange = (val: string) => {
    setStatusDomisiliFilter(val);
    setPage(1);
  };

  const handleDomisiliFilterChange = (val: string) => {
    setDomisiliFilter(val);
    setPage(1);
  };

  const handleImportSuccess = (report: {
    inserted: number;
    updated: number;
    softDeleted: number;
    skipped: number;
  }) => {
    setSyncReport(report);
    refetch();
  };

  return (
    <div className="bg-gray-950 min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      <MasterHeader
        onOpenImportModal={() => setIsImportModalOpen(true)}
        isAdmin={isAdmin}
      />

      <SyncReportBanner
        report={syncReport}
        onClose={() => setSyncReport(null)}
      />

      <MasterToolbar
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        tingkatanFilter={tingkatanFilter}
        onTingkatanFilterChange={handleTingkatanFilterChange}
        kelasFilter={kelasFilter}
        onKelasFilterChange={handleKelasFilterChange}
        statusDomisiliFilter={statusDomisiliFilter}
        onStatusDomisiliFilterChange={handleStatusDomisiliFilterChange}
        domisiliFilter={domisiliFilter}
        onDomisiliFilterChange={handleDomisiliFilterChange}
        tingkatanOptions={dynamicFilterOptions?.tingkatanOptions}
        kelasOptions={dynamicFilterOptions?.kelasOptions}
        statusDomisiliOptions={dynamicFilterOptions?.statusDomisiliOptions}
        domisiliOptions={dynamicFilterOptions?.domisiliOptions}
        onRefresh={refetch}
        isListLoading={isLoading || isFetching}
      />

      <MasterTable
        items={items}
        isLoading={isLoading}
        isFetching={isFetching}
        page={page}
        perPage={PER_PAGE}
        onSelectSantri={(santri) => setSelectedSantriDetail(santri)}
      />

      <MasterPagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={PER_PAGE}
        onPageChange={setPage}
      />

      <ImportMasterModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />

      <SantriDetailModal
        isOpen={!!selectedSantriDetail}
        onClose={() => setSelectedSantriDetail(null)}
        santri={selectedSantriDetail}
      />
    </div>
  );
}