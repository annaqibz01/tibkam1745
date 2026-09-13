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
        <span className="font-sans font-bold text-white tracking-tight">
          Layanan <span className="text-indigo-400">Rambut Santri</span>
        </span>
      }
      description="Sistem pemantauan setoran bulanan santri jenjang Aliyah, Kuliah Syariah, serta Petugas/Pengurus Pondok Pesantren Sidogiri."
      actions={
        isAdmin && (
          <>
            <button
              type="button"
              onClick={onOpenManagePeriode}
              className="h-9 px-3.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-indigo-300 hover:text-white font-semibold text-xs border border-zinc-800 hover:border-indigo-500/30 transition-colors active:scale-[0.98] flex items-center gap-2 select-none"
            >
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              <span>Daftar Periode</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreatePeriode}
              className="h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-colors active:scale-[0.98] flex items-center gap-2 select-none"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Periode Baru</span>
            </button>
          </>
        )
      }
    />
  );
};