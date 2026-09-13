// src/features/rambut/components/toolbars/AuditToolbar.tsx
import React from "react";
import { Moon } from "lucide-react";
import { BaseToolbar } from "@/components/shared/BaseToolbar";
import { GlassDropdown, type DropdownOption } from "@/components/shared";

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
      <GlassDropdown
        value={dateFilter}
        onChange={onDateFilterChange}
        options={availableHijriDateOptions}
        defaultLabel="Semua Tanggal Hijriyah"
        icon={<Moon className="w-3.5 h-3.5 text-amber-400" />}
        activeColorClass="border-amber-500/60 text-amber-200"
        minWidthClass="min-w-[220px]"
      />
    </BaseToolbar>
  );
};