// src/features/laporan/rambut/components/LaporanHeader.tsx
import React from "react";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import type { PeriodeRambutResponse } from "@/types/pocketbase-types";
import { PageHeader, StatusBadge } from "@/components/shared";

interface LaporanHeaderProps {
  selectedPeriode: PeriodeRambutResponse | null;
  onExportExcel: () => void;
  isExporting?: boolean;
}

export const LaporanHeader: React.FC<LaporanHeaderProps> = ({
  selectedPeriode,
  onExportExcel,
  isExporting = false,
}) => {
  return (
    <PageHeader
      badgeIcon={<FileText className="w-3.5 h-3.5" />}
      badgeLabel="Rekapitulasi Laporan"
      statusBadge={
        selectedPeriode ? (
          <StatusBadge variant="success" dot>
            Periode: {selectedPeriode.nama_periode}
          </StatusBadge>
        ) : (
          <StatusBadge variant="danger" dot>
            Belum Ada Periode
          </StatusBadge>
        )
      }
      title={
        <span className="font-sans font-bold text-white tracking-tight">
          Laporan Setoran Rambut
        </span>
      }
      description="Pusat rekapitulasi data setoran bulanan santri Aliyah, Kuliah Syariah, dan Pengurus/Petugas Pondok Pesantren Sidogiri."
      actions={
        <button
          type="button"
          onClick={onExportExcel}
          disabled={isExporting}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold shadow-sm transition-colors active:scale-98 select-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Memproses Excel...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel (.xlsx)</span>
            </>
          )}
        </button>
      }
    />
  );
};