// src/features/rambut/components/RambutHeader.tsx
import React from "react";
import { Scissors, PlusCircle, CalendarDays } from "lucide-react";
import type { PeriodeRambutResponse } from "@/types/pocketbase-types";
import { PageHeader, StatusBadge } from "@/components/shared";

interface RambutHeaderProps {
  activePeriode: PeriodeRambutResponse | null;
  selectedPeriode?: PeriodeRambutResponse | null;
  isAdmin?: boolean;
  onOpenCreatePeriode: () => void;
  onOpenManagePeriode: () => void;
}

export const RambutHeader: React.FC<RambutHeaderProps> = ({
  activePeriode,
  selectedPeriode,
  isAdmin = false,
  onOpenCreatePeriode,
  onOpenManagePeriode,
}) => {
  const displayedPeriode = selectedPeriode || activePeriode;
  const isViewingActive = displayedPeriode?.id === activePeriode?.id;

  const statusBadge = displayedPeriode ? (
    <StatusBadge variant={isViewingActive ? "success" : "info"} dot={isViewingActive}>
      Periode Ditinjau: {displayedPeriode.nama_periode}
    </StatusBadge>
  ) : (
    <StatusBadge variant="danger" dot>
      Belum Ada Periode
    </StatusBadge>
  );

  return (
    <PageHeader
      badgeIcon={<Scissors className="w-3.5 h-3.5" />}
      badgeLabel="Modul Layanan Rambut"
      statusBadge={statusBadge}
      title={
        <>
          Layanan{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
            Rambut Santri
          </span>
        </>
      }
      description="Sistem pemantauan setoran bulanan santri jenjang Aliyah, Kuliah Syariah, serta Petugas/Pengurus Pondok Pesantren Sidogiri."
      actions={
        isAdmin && (
          <>
            <button
              type="button"
              onClick={onOpenManagePeriode}
              className="px-4 py-3 bg-gray-900/90 hover:bg-gray-800 text-indigo-300 hover:text-white font-mono font-bold text-xs rounded-2xl border border-indigo-500/30 transition-all duration-200 shadow-lg active:scale-95 flex items-center gap-2 select-none"
            >
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              <span>Daftar Periode</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreatePeriode}
              className="relative group overflow-hidden inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono font-bold text-xs rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-600/25 active:scale-95 border border-indigo-400/30 select-none"
            >
              <PlusCircle className="w-4 h-4 text-indigo-100" />
              <span>Periode Baru</span>
            </button>
          </>
        )
      }
    />
  );
};