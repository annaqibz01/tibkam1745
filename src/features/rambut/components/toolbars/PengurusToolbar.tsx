// src/features/rambut/components/toolbars/PengurusToolbar.tsx
import React, { useMemo } from "react";
import { MapPin } from "lucide-react";
import { BaseToolbar } from "@/components/shared/BaseToolbar";
import { GlassDropdown, type DropdownOption } from "@/components/shared";

interface PengurusToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  daerahFilter: string;
  onDaerahFilterChange: (val: string) => void;
  daerahOptions: string[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const PengurusToolbar: React.FC<PengurusToolbarProps> = ({
  search,
  onSearchChange,
  daerahFilter,
  onDaerahFilterChange,
  daerahOptions,
  onRefresh,
  isLoading,
}) => {
  const dropdownOptions: DropdownOption[] = useMemo(() => {
    return daerahOptions.map((d) => ({
      value: d,
      label: `Daerah ${d}`,
    }));
  }, [daerahOptions]);

  return (
    <BaseToolbar
      search={search}
      onSearchChange={onSearchChange}
      placeholder="Cari pengurus berdasarkan ID PPS, Nama, atau Jabatan..."
      onRefresh={onRefresh}
      isLoading={isLoading}
      searchIconColorClass="text-purple-400"
    >
      <GlassDropdown
        value={daerahFilter}
        onChange={onDaerahFilterChange}
        options={dropdownOptions}
        defaultLabel="Semua Daerah"
        icon={<MapPin className="w-3.5 h-3.5 text-purple-400" />}
        activeColorClass="border-purple-500/60 text-purple-200"
        minWidthClass="min-w-[200px]"
      />
    </BaseToolbar>
  );
};