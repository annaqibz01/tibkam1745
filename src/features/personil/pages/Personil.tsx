// src/features/personil/pages/Personil.tsx
import { useState, useEffect } from "react";
import { usePersonil, usePersonilFilterOptions, type PersonilWithExpand } from "../hooks/usePersonil";
import { useAuth } from "@/features/auth";
import PersonilHeader from "../components/PersonilHeader";
import SyncReportBanner from "../components/SyncReportBanner";
import PersonilToolbar from "../components/PersonilToolbar";
import PersonilTable from "../components/PersonilTable";
import PersonilPagination from "../components/PersonilPagination";
import { ImportPersonilModal } from "../components/ImportPersonilModal";
import { PersonilDetailModal } from "../components/PersonilDetailModal";
import type { UsersResponse } from "@/types/pocketbase-types";
import type { PersonilSyncReport } from "../utils/importPersonilExcel";

const PER_PAGE = 15;

export default function PersonilPage() {
  const { user } = useAuth();
  const currentUser = user as UsersResponse | null;
  const isAdmin = Boolean(currentUser?.role?.startsWith("admin"));

  // State Filters (Default statusFilter = "all" agar tampilan dropdown seragam)
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "aktif" | "nonaktif">("all");
  const [jabatanFilter, setJabatanFilter] = useState("all");
  const [domisiliFilter, setDomisiliFilter] = useState("all");

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedPersonilDetail, setSelectedPersonilDetail] = useState<PersonilWithExpand | null>(null);
  const [syncReport, setSyncReport] = useState<PersonilSyncReport | null>(null);

  const { usePersonilList } = usePersonil();

  const { data: dynamicFilterOptions } = usePersonilFilterOptions({
    statusFilter,
    jabatanFilter,
    domisiliFilter,
  });

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
      jabatanFilter !== "all" &&
      dynamicFilterOptions?.jabatanOptions &&
      !dynamicFilterOptions.jabatanOptions.includes(jabatanFilter)
    ) {
      setJabatanFilter("all");
    }
  }, [dynamicFilterOptions?.jabatanOptions, jabatanFilter]);

  const {
    data: personilData,
    isLoading,
    isFetching,
    refetch,
  } = usePersonilList({
    page,
    perPage: PER_PAGE,
    search,
    statusFilter,
    jabatanFilter,
    domisiliFilter,
  });

  const items = personilData?.items ?? [];
  const totalItems = personilData?.totalItems ?? 0;
  const totalPages = personilData?.totalPages ?? 0;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val: "all" | "aktif" | "nonaktif") => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleJabatanFilterChange = (val: string) => {
    setJabatanFilter(val);
    setPage(1);
  };

  const handleDomisiliFilterChange = (val: string) => {
    setDomisiliFilter(val);
    setPage(1);
  };

  const handleImportSuccess = (report: PersonilSyncReport) => {
    setSyncReport(report);
    refetch();
  };

  return (
    <div className="bg-gray-950 min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      {/* 1. Header Hero Banner */}
      <PersonilHeader
        onOpenImportModal={() => setIsImportModalOpen(true)}
        isAdmin={isAdmin}
      />

      {/* 2. Banner Hasil Laporan Sinkronisasi */}
      <SyncReportBanner
        report={syncReport}
        onClose={() => setSyncReport(null)}
      />

      {/* 3. Search & Multi-Dropdown Filter Toolbar */}
      <PersonilToolbar
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        jabatanFilter={jabatanFilter}
        onJabatanFilterChange={handleJabatanFilterChange}
        domisiliFilter={domisiliFilter}
        onDomisiliFilterChange={handleDomisiliFilterChange}
        jabatanOptions={dynamicFilterOptions?.jabatanOptions}
        domisiliOptions={dynamicFilterOptions?.domisiliOptions}
        onRefresh={refetch}
        isListLoading={isLoading || isFetching}
      />

      {/* 4. Tabel Data Personil */}
      <PersonilTable
        items={items}
        isLoading={isLoading}
        isFetching={isFetching}
        page={page}
        perPage={PER_PAGE}
        onSelectPersonil={(personil) => setSelectedPersonilDetail(personil)}
      />

      {/* 5. Pagination Navigasi Data */}
      <PersonilPagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={PER_PAGE}
        onPageChange={setPage}
      />

      {/* 6. Modals */}
      <ImportPersonilModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />

      <PersonilDetailModal
        isOpen={!!selectedPersonilDetail}
        onClose={() => setSelectedPersonilDetail(null)}
        personil={selectedPersonilDetail}
      />
    </div>
  );
}