// src/features/laporan/components/LaporanToolbar.tsx
import React from "react";
import { CalendarDays, FileText, Layers, MapPin } from "lucide-react";
import { BaseToolbar, GlassDropdown, type DropdownOption } from "@/components/shared";
import type { PeriodeRambutResponse } from "@/types/pocketbase-types";
import type { ReportType } from "../hooks/useLaporanRambut";

interface LaporanToolbarProps {
  periodeList: PeriodeRambutResponse[];
  selectedPeriode: PeriodeRambutResponse | null;
  onSelectPeriode: (periode: PeriodeRambutResponse) => void;
  reportType: ReportType;
  onChangeReportType: (type: ReportType) => void;
  filterKategori: string;
  onChangeFilterKategori: (kat: string) => void;
  filterDaerah: string;
  onChangeFilterDaerah: (daerah: string) => void;
  daerahOptions: string[];
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const LaporanToolbar: React.FC<LaporanToolbarProps> = ({
  periodeList,
  selectedPeriode,
  onSelectPeriode,
  reportType,
  onChangeReportType,
  filterKategori,
  onChangeFilterKategori,
  filterDaerah,
  onChangeFilterDaerah,
  daerahOptions,
  searchQuery,
  onChangeSearchQuery,
  onRefresh,
  isLoading,
}) => {
  const periodeOptions: DropdownOption[] = periodeList.map((p) => ({
    value: p.id,
    label: p.nama_periode,
  }));

  const reportOptions: DropdownOption[] = [
    { value: "all", label: "Semua Target Wajib Setor" },
    { value: "belum_setor", label: "Daftar Belum Setor" },
    { value: "sudah_setor", label: "Daftar Sudah Setor" },
    { value: "riwayat", label: "Log Riwayat Transaksi" },
  ];

  const kategoriOptions: DropdownOption[] = [
    { value: "all", label: "Semua Kategori" },
    { value: "aliyah", label: "Aliyah" },
    { value: "kuliah_syariah", label: "Kuliah Syariah" },
    { value: "pengurus_petugas", label: "Pengurus / Petugas" },
  ];

  const daerahDropdownOptions: DropdownOption[] = [
    { value: "all", label: "Semua Daerah" },
    ...daerahOptions.map((d) => ({ value: d, label: `Daerah ${d}` })),
  ];

  return (
    <BaseToolbar
      search={searchQuery}
      onSearchChange={onChangeSearchQuery}
      placeholder="Cari santri berdasarkan Nama atau ID PPS..."
      onRefresh={onRefresh}
      isLoading={isLoading}
      searchIconColorClass="text-indigo-400"
    >
      {/* 1. Dropdown Periode */}
      <GlassDropdown
        value={selectedPeriode?.id || "all"}
        onChange={(id) => {
          const match = periodeList.find((p) => p.id === id);
          if (match) onSelectPeriode(match);
        }}
        options={periodeOptions}
        defaultLabel="Pilih Periode"
        icon={<CalendarDays className="w-4 h-4 text-indigo-400" />}
        activeColorClass="border-indigo-500/60 text-white ring-indigo-500/20"
        minWidthClass="min-w-[200px]"
      />

      {/* 2. Dropdown Jenis Rekapitulasi */}
      <GlassDropdown
        value={reportType}
        onChange={(val) => onChangeReportType(val as ReportType)}
        options={reportOptions}
        defaultLabel="Semua Target Wajib Setor"
        icon={<FileText className="w-4 h-4 text-purple-400" />}
        activeColorClass="border-purple-500/60 text-purple-200 ring-purple-500/20"
        minWidthClass="min-w-[200px]"
      />

      {/* 3. Dropdown Kategori Wajib (Sembunyi jika mode riwayat) */}
      {reportType !== "riwayat" && (
        <GlassDropdown
          value={filterKategori}
          onChange={onChangeFilterKategori}
          options={kategoriOptions}
          defaultLabel="Semua Kategori"
          icon={<Layers className="w-4 h-4 text-amber-400" />}
          activeColorClass="border-amber-500/60 text-amber-200 ring-amber-500/20"
          minWidthClass="min-w-[180px]"
        />
      )}

      {/* 4. Dropdown Daerah Domisili */}
      <GlassDropdown
        value={filterDaerah}
        onChange={onChangeFilterDaerah}
        options={daerahDropdownOptions}
        defaultLabel="Semua Daerah"
        icon={<MapPin className="w-4 h-4 text-emerald-400" />}
        activeColorClass="border-emerald-500/60 text-emerald-200 ring-emerald-500/20"
        minWidthClass="min-w-[170px]"
      />
    </BaseToolbar>
  );
};