// src/components/rambut/toolbars/PengurusToolbar.tsx
import React, { useMemo } from "react";
import { MapPin } from "lucide-react";
import { BaseToolbar } from "../../shared/BaseToolbar";
import { CustomGlassDropdown } from "./CustomGlassDropdown";

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
  const dropdownOptions = useMemo(() => {
    return daerahOptions.map((d) => ({ 
      value: d, 
      label: `Daerah ${d}` 
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
      {/* Dropdown Kompleks Daerah dimasukkan sebagai children */}
      <CustomGlassDropdown
        value={daerahFilter}
        onChange={onDaerahFilterChange}
        options={dropdownOptions}
        defaultLabel="Semua Daerah"
        icon={<MapPin className="w-4 h-4 text-purple-400 shrink-0" />}
        activeColorClass="border-purple-500/60 text-purple-200 ring-purple-500/20"
        minWidthClass="min-w-[200px]"
      />
    </BaseToolbar>
  );
};