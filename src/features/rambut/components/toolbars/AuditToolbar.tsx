// src/components/rambut/toolbars/AuditToolbar.tsx
import React from "react";
import { Moon } from "lucide-react";
import { BaseToolbar } from "../../../../components/shared/BaseToolbar";
import { CustomGlassDropdown, type DropdownOption } from "./CustomGlassDropdown";

interface AuditToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  dateFilter: string;
  onDateFilterChange: (val: string) => void;
  availableHijriDateOptions: DropdownOption[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const AuditToolbar: React.FC<AuditToolbarProps> = ({
  search,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  availableHijriDateOptions,
  onRefresh,
  isLoading,
}) => {
  return (
    <BaseToolbar
      search={search}
      onSearchChange={onSearchChange}
      placeholder="Cari log riwayat berdasarkan ID PPS, Nama, Petugas, atau Catatan..."
      onRefresh={onRefresh}
      isLoading={isLoading}
      searchIconColorClass="text-amber-400"
    >
      {/* Dropdown Tanggal Hijriyah dimasukkan sebagai children */}
      <CustomGlassDropdown
        value={dateFilter}
        onChange={onDateFilterChange}
        options={availableHijriDateOptions}
        defaultLabel="Semua Tanggal Hijriyah"
        icon={<Moon className="w-4 h-4 text-amber-400 shrink-0" />}
        activeColorClass="border-amber-500/60 text-amber-200 ring-amber-500/20"
        minWidthClass="min-w-[220px]"
      />
    </BaseToolbar>
  );
};