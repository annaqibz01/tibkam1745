// src/pages/Kalender.tsx
import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useAuth } from "@/features/auth";
import { useAdminKalender } from "../hooks/useKalenderHijriyah";
import type { UsersResponse } from "../../../types/pocketbase-types";
import { KalenderHeader } from "../components/KalenderHeader";
import { KalenderGridPreview } from "../components/KalenderGridPreview";
import { KalenderTable } from "../components/KalenderTable";
import { KalenderPagination } from "../components/KalenderPagination";
import { GenerateKalenderModal } from "../components/GenerateKalenderModal";
import { LayoutGrid, Table } from "lucide-react";

const PER_PAGE = 15;

// ✨ 2. Beri tipe data ': Variants' agar TypeScript mengenalinya secara presisi
const transitionVariants: Variants = {
  initial: { opacity: 0, y: 8, scale: 0.995 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { 
    opacity: 0, 
    y: -8, 
    scale: 0.995,
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } 
  },
};

export default function KalenderPage() {
  const { user } = useAuth();
  const currentUser = user as UsersResponse | null;
  const isAdmin = currentUser?.role === "admin";

  // Mode Tampilan: 'grid' (Visual Kalender Dinding) | 'table' (Daftar Tabel)
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

  return (
    <div className="bg-gray-950 min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      {/* 1. Hero Header Banner */}
      <KalenderHeader
        isAdmin={isAdmin}
        onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
      />

      {/* 2. TAB VIEW SWITCHER DENGAN ANIMASI PILL */}
      <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
        <div className="flex items-center gap-1.5 bg-gray-900/80 p-1.5 rounded-2xl border border-gray-800/80 shadow-lg backdrop-blur-xl">
          {/* Tombol Grid Kalender */}
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-colors duration-200 active:scale-95 ${
              viewMode === "grid" ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {viewMode === "grid" && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl shadow-md shadow-amber-600/20"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              <span>Tampilan Kalender</span>
            </span>
          </button>

          {/* Tombol Tabel Data */}
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-colors duration-200 active:scale-95 ${
              viewMode === "table" ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {viewMode === "table" && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl shadow-md shadow-indigo-600/20"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Table className="w-4 h-4" />
              <span>Daftar Tabel Data</span>
            </span>
          </button>
        </div>

        <span className="hidden sm:inline-block text-xs font-mono text-gray-500">
          Pesantren Integrated Calendar System
        </span>
      </div>

      {/* 3. RENDER KONTEN BERTRANSISI HALUS DENGAN ANIMATE PRESENCE */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid-view"
            variants={transitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="transform-gpu"
          >
            <KalenderGridPreview />
          </motion.div>
        ) : (
          <motion.div
            key="table-view"
            variants={transitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6 transform-gpu"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

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