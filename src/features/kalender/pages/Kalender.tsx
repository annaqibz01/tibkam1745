// src/features/kalender/pages/Kalender.tsx
import { useState } from "react";
import { useAuth } from "@/features/auth";
import { useAdminKalender } from "../hooks/useKalenderHijriyah";
import type { UsersResponse } from "@/types/pocketbase-types";
import { KalenderHeader } from "../components/KalenderHeader";
import { KalenderGridPreview } from "../components/KalenderGridPreview";
import { KalenderTable } from "../components/KalenderTable";
import { KalenderPagination } from "../components/KalenderPagination";
import { GenerateKalenderModal } from "../components/GenerateKalenderModal";
import { SegmentedControl } from "@/components/shared";
import { LayoutGrid, Table } from "lucide-react";

const PER_PAGE = 15;

export default function KalenderPage() {
  const { user } = useAuth();
  const currentUser = user as UsersResponse | null;
  const isAdmin = currentUser?.role === "admin";

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const { useKalenderList } = useAdminKalender();
  const { data: kalenderData, isLoading } = useKalenderList({
    page,
    perPage: PER_PAGE,
  });

  const items = kalenderData?.items ?? [];
  const totalItems = kalenderData?.totalItems ?? 0;
  const totalPages = kalenderData?.totalPages ?? 0;

  const viewOptions = [
    { value: "grid" as const, label: "Tampilan Kalender", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { value: "table" as const, label: "Daftar Tabel Data", icon: <Table className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="bg-zinc-950 min-h-screen p-4 sm:p-5 lg:p-6 space-y-4 font-sans">
      {/* 1. Header Banner */}
      <KalenderHeader
        isAdmin={isAdmin}
        onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
      />

      {/* 2. View Switcher (Menggunakan SegmentedControl Shared: h-9 / rounded-lg) */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 select-none">
        <SegmentedControl
          options={viewOptions}
          value={viewMode}
          onChange={(val) => setViewMode(val)}
          layoutId="activeKalenderViewPill"
        />

        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline-block">
          Sistem Hisab & Penanggalan
        </span>
      </div>

      {/* 3. Konten View */}
      {viewMode === "grid" ? (
        <KalenderGridPreview />
      ) : (
        <div className="space-y-3">
          <KalenderTable
            items={items}
            isLoading={isLoading}
            page={page}
            perPage={PER_PAGE}
          />
          <KalenderPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            perPage={PER_PAGE}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* 4. Modal Generate Titik Jepit */}
      {isAdmin && (
        <GenerateKalenderModal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
        />
      )}
    </div>
  );
}