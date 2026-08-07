// src/features/laporan/components/LaporanHeader.tsx
import React from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import type { PeriodeRambutResponse } from "@/types/pocketbase-types";
import { PageHeader, StatusBadge } from "@/components/shared";

interface LaporanHeaderProps {
  selectedPeriode: PeriodeRambutResponse | null;
  onExportExcel: () => void;
}

export const LaporanHeader: React.FC<LaporanHeaderProps> = ({
  selectedPeriode,
  onExportExcel,
}) => {
  return (
    <PageHeader
      badgeIcon={<FileText className="w-3.5 h-3.5" />}
      badgeLabel="Modul Laporan Khusus"
      statusBadge={
        selectedPeriode ? (
          <StatusBadge variant="success" dot>
            Periode Ditinjau: {selectedPeriode.nama_periode}
          </StatusBadge>
        ) : (
          <StatusBadge variant="danger" dot>
            Belum Ada Periode
          </StatusBadge>
        )
      }
      title={
        <>
          Laporan & Export{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
            Rambut Santri
          </span>
        </>
      }
      description="Pusat rekapitulasi data setoran rambut santri jenjang Aliyah, Kuliah Syariah, serta Petugas/Pengurus Pondok Pesantren Sidogiri."
      actions={
        <button
          type="button"
          onClick={onExportExcel}
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-2xl transition-all duration-200 shadow-xl shadow-emerald-600/20 active:scale-95 border border-emerald-400/30 select-none"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Excel (.xlsx)</span>
        </button>
      }
    />
  );
};