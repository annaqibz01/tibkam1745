// src/features/laporan/rambut/components/LaporanToolbar.tsx
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
      searchIconColorClass="text-zinc-500"
    >
      {/* 1. Dropdown Periode (Tinggi h-9, Palet Netral Zinc) */}
      <GlassDropdown
        value={selectedPeriode?.id || "all"}
        onChange={(id) => {
          const match = periodeList.find((p) => p.id === id);
          if (match) onSelectPeriode(match);
        }}
        options={periodeOptions}
        defaultLabel="Pilih Periode"
        icon={<CalendarDays className="w-3.5 h-3.5 text-zinc-400" />}
        activeColorClass="border-zinc-700 bg-zinc-800 text-white"
        minWidthClass="min-w-[170px]"
      />

      {/* 2. Dropdown Jenis Rekapitulasi */}
      <GlassDropdown
        value={reportType}
        onChange={(val) => onChangeReportType(val as ReportType)}
        options={reportOptions}
        defaultLabel="Semua Target Wajib Setor"
        icon={<FileText className="w-3.5 h-3.5 text-zinc-400" />}
        activeColorClass="border-zinc-700 bg-zinc-800 text-white"
        minWidthClass="min-w-[190px]"
      />

      {/* 3. Dropdown Kategori (Sembunyi otomatis saat mode riwayat) */}
      {reportType !== "riwayat" && (
        <GlassDropdown
          value={filterKategori}
          onChange={onChangeFilterKategori}
          options={kategoriOptions}
          defaultLabel="Semua Kategori"
          icon={<Layers className="w-3.5 h-3.5 text-zinc-400" />}
          activeColorClass="border-zinc-700 bg-zinc-800 text-white"
          minWidthClass="min-w-[150px]"
        />
      )}

      {/* 4. Dropdown Daerah Asrama */}
      <GlassDropdown
        value={filterDaerah}
        onChange={onChangeFilterDaerah}
        options={daerahDropdownOptions}
        defaultLabel="Semua Daerah"
        icon={<MapPin className="w-3.5 h-3.5 text-zinc-400" />}
        activeColorClass="border-zinc-700 bg-zinc-800 text-white"
        minWidthClass="min-w-[140px]"
      />
    </BaseToolbar>
  );
};